-- ============================================
-- 쿠폰/포인트 복구 시스템 마이그레이션
-- 작성일: 2024-12-11
-- 설명: 주문 취소 시 쿠폰/포인트 복구를 위한 스키마 확장
-- ============================================

-- ============================================
-- 1. orders 테이블에 쿠폰/포인트 필드 추가
-- ============================================
DO $$
BEGIN
  -- 사용자 쿠폰 ID (user_coupons 테이블 참조)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_coupon_id') THEN
    ALTER TABLE orders ADD COLUMN user_coupon_id UUID REFERENCES user_coupons(id) ON DELETE SET NULL;
  END IF;

  -- 쿠폰 할인 금액
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_discount_amount') THEN
    ALTER TABLE orders ADD COLUMN coupon_discount_amount INTEGER DEFAULT 0;
  END IF;

  -- 사용된 포인트
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'used_points') THEN
    ALTER TABLE orders ADD COLUMN used_points INTEGER DEFAULT 0;
  END IF;

  -- 포인트 할인 금액 (보통 used_points와 동일하지만 분리 관리)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'points_discount_amount') THEN
    ALTER TABLE orders ADD COLUMN points_discount_amount INTEGER DEFAULT 0;
  END IF;
END $$;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_user_coupon_id ON orders(user_coupon_id);


-- ============================================
-- 2. user_points 테이블 생성 (사용자 포인트 잔액)
-- ============================================
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_points_user_id_unique UNIQUE(user_id)
);

-- user_id 인덱스
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_user_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_points_updated_at ON user_points;
CREATE TRIGGER trigger_user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW EXECUTE FUNCTION update_user_points_updated_at();


-- ============================================
-- 3. point_transactions 테이블 생성 (포인트 거래 내역)
-- ============================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  cancellation_id UUID REFERENCES order_cancellations(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'use', 'refund', 'expire', 'admin_adjust')),
  amount INTEGER NOT NULL, -- 양수: 적립/환불, 음수: 사용
  balance_after INTEGER NOT NULL,
  description TEXT,
  expires_at TIMESTAMPTZ, -- 포인트 만료일 (적립 시에만 사용)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_order_id ON point_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_cancellation_id ON point_transactions(cancellation_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);


-- ============================================
-- 4. RLS 정책
-- ============================================

-- user_points RLS 활성화
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- user_points: 본인만 조회
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

-- user_points: 서비스 롤만 수정
DROP POLICY IF EXISTS "Service role can manage points" ON user_points;
CREATE POLICY "Service role can manage points" ON user_points
  FOR ALL USING (auth.role() = 'service_role');

-- point_transactions RLS 활성화
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- point_transactions: 본인만 조회
DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
CREATE POLICY "Users can view own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- point_transactions: 서비스 롤만 생성
DROP POLICY IF EXISTS "Service role can manage point transactions" ON point_transactions;
CREATE POLICY "Service role can manage point transactions" ON point_transactions
  FOR ALL USING (auth.role() = 'service_role');


-- ============================================
-- 5. 쿠폰 사용량 감소 함수 (원자적 연산)
-- ============================================
CREATE OR REPLACE FUNCTION decrement_coupon_used_quantity(p_coupon_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated_rows INTEGER;
BEGIN
  UPDATE coupons
  SET used_quantity = GREATEST(used_quantity - 1, 0)
  WHERE id = p_coupon_id;

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  RETURN v_updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 6. 포인트 환불 함수 (원자적 연산)
-- ============================================
CREATE OR REPLACE FUNCTION refund_user_points(
  p_user_id UUID,
  p_order_id UUID,
  p_cancellation_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS TABLE(
  new_balance INTEGER,
  transaction_id UUID
) AS $$
DECLARE
  v_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- 사용자 포인트 행 락
  SELECT balance INTO v_balance
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 포인트 레코드가 없으면 생성
  IF v_balance IS NULL THEN
    INSERT INTO user_points (user_id, balance, total_earned, total_used)
    VALUES (p_user_id, p_amount, 0, 0)
    RETURNING balance INTO v_balance;
  ELSE
    -- 잔액 업데이트
    UPDATE user_points
    SET
      balance = balance + p_amount,
      total_used = GREATEST(total_used - p_amount, 0),
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_balance;
  END IF;

  -- 거래 내역 생성
  INSERT INTO point_transactions (
    user_id, order_id, cancellation_id, type, amount, balance_after, description
  )
  VALUES (
    p_user_id, p_order_id, p_cancellation_id, 'refund', p_amount, v_balance, p_description
  )
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT v_balance, v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 7. 포인트 사용 함수 (주문 시 호출)
-- ============================================
CREATE OR REPLACE FUNCTION use_user_points(
  p_user_id UUID,
  p_order_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT '주문 결제 시 포인트 사용'
) RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  transaction_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- 사용자 포인트 행 락
  SELECT balance INTO v_balance
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 포인트 레코드가 없거나 잔액 부족
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      COALESCE(v_balance, 0)::INTEGER,
      NULL::UUID,
      '포인트 잔액이 부족합니다.'::TEXT;
    RETURN;
  END IF;

  -- 잔액 차감
  UPDATE user_points
  SET
    balance = balance - p_amount,
    total_used = total_used + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_balance;

  -- 거래 내역 생성 (음수로 기록)
  INSERT INTO point_transactions (
    user_id, order_id, type, amount, balance_after, description
  )
  VALUES (
    p_user_id, p_order_id, 'use', -p_amount, v_balance, p_description
  )
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT true::BOOLEAN, v_balance, v_transaction_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 8. 포인트 적립 함수 (주문 완료 시 호출)
-- ============================================
CREATE OR REPLACE FUNCTION earn_user_points(
  p_user_id UUID,
  p_order_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT '주문 완료 포인트 적립',
  p_expires_at TIMESTAMPTZ DEFAULT NULL -- NULL이면 만료 없음
) RETURNS TABLE(
  new_balance INTEGER,
  transaction_id UUID
) AS $$
DECLARE
  v_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- 사용자 포인트 행 락 또는 생성
  SELECT balance INTO v_balance
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    INSERT INTO user_points (user_id, balance, total_earned, total_used)
    VALUES (p_user_id, p_amount, p_amount, 0)
    RETURNING balance INTO v_balance;
  ELSE
    UPDATE user_points
    SET
      balance = balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_balance;
  END IF;

  -- 거래 내역 생성
  INSERT INTO point_transactions (
    user_id, order_id, type, amount, balance_after, description, expires_at
  )
  VALUES (
    p_user_id, p_order_id, 'earn', p_amount, v_balance, p_description, p_expires_at
  )
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT v_balance, v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 9. 쿠폰 복구 함수
-- ============================================
CREATE OR REPLACE FUNCTION recover_user_coupon(
  p_user_coupon_id UUID,
  p_order_id UUID
) RETURNS TABLE(
  success BOOLEAN,
  coupon_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_user_coupon RECORD;
  v_coupon_id UUID;
BEGIN
  -- 사용자 쿠폰 조회
  SELECT uc.*, c.id as master_coupon_id
  INTO v_user_coupon
  FROM user_coupons uc
  JOIN coupons c ON c.id = uc.coupon_id
  WHERE uc.id = p_user_coupon_id
  FOR UPDATE OF uc;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, '쿠폰을 찾을 수 없습니다.'::TEXT;
    RETURN;
  END IF;

  -- 이미 복구된 쿠폰인지 확인 (used_at이 NULL이면 이미 복구됨)
  IF v_user_coupon.used_at IS NULL THEN
    RETURN QUERY SELECT true::BOOLEAN, v_user_coupon.master_coupon_id, '이미 복구된 쿠폰입니다.'::TEXT;
    RETURN;
  END IF;

  -- 쿠폰 복구: used_at, order_id를 NULL로 설정
  UPDATE user_coupons
  SET
    used_at = NULL,
    order_id = NULL
  WHERE id = p_user_coupon_id;

  -- 마스터 쿠폰 사용량 감소
  PERFORM decrement_coupon_used_quantity(v_user_coupon.master_coupon_id);

  RETURN QUERY SELECT true::BOOLEAN, v_user_coupon.master_coupon_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 완료
-- ============================================
SELECT '쿠폰/포인트 복구 시스템 마이그레이션 완료!' as message;
