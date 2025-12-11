-- 포인트 시스템 마이그레이션
-- 010_point_system.sql

-- ================================================
-- 1. users 테이블에 point_balance 컬럼 추가
-- ================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS point_balance INTEGER DEFAULT 0;

-- ================================================
-- 2. point_transactions 테이블 생성
-- ================================================

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- 거래 타입
  -- earn: 적립, use: 사용, expire: 만료, admin_add: 관리자 지급, admin_deduct: 관리자 차감
  type TEXT NOT NULL CHECK (type IN ('earn', 'use', 'expire', 'admin_add', 'admin_deduct')),

  -- 금액 (양수: 적립/지급/환불, 음수: 사용/차감/만료)
  amount INTEGER NOT NULL,

  -- 거래 후 잔액
  balance_after INTEGER NOT NULL,

  -- 설명
  description TEXT,

  -- 만료일 (적립 포인트에만 적용)
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 인덱스 생성
-- ================================================

CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_order ON point_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_expires ON point_transactions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON point_transactions(created_at DESC);

-- 복합 인덱스: 사용자별 타입별 조회
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_type ON point_transactions(user_id, type);

-- ================================================
-- RLS 정책
-- ================================================

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 포인트 내역만 조회 가능
CREATE POLICY "Users can view own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템만 포인트 내역 생성 가능 (서비스 역할 키 사용)
CREATE POLICY "Service role can insert point transactions" ON point_transactions
  FOR INSERT WITH CHECK (true);

-- ================================================
-- 포인트 잔액 동기화 트리거
-- ================================================

-- 포인트 거래 시 users.point_balance 자동 업데이트
CREATE OR REPLACE FUNCTION sync_point_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 거래 추가 시 잔액 업데이트
  UPDATE users
  SET point_balance = NEW.balance_after
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_point_balance ON point_transactions;
CREATE TRIGGER sync_user_point_balance
  AFTER INSERT ON point_transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_point_balance();

-- ================================================
-- 포인트 만료 처리 함수 (크론 잡으로 실행)
-- ================================================

CREATE OR REPLACE FUNCTION expire_points()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  user_record RECORD;
  expired_amount INTEGER;
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 만료된 적립 포인트가 있는 사용자 조회
  FOR user_record IN
    SELECT DISTINCT pt.user_id
    FROM point_transactions pt
    WHERE pt.type = 'earn'
      AND pt.expires_at IS NOT NULL
      AND pt.expires_at < NOW()
      AND NOT EXISTS (
        -- 이미 만료 처리된 포인트는 제외
        SELECT 1 FROM point_transactions expire_tx
        WHERE expire_tx.order_id = pt.id::TEXT::UUID  -- 원본 적립 ID를 참조
          AND expire_tx.type = 'expire'
      )
  LOOP
    -- 해당 사용자의 만료 포인트 합계 계산
    SELECT COALESCE(SUM(pt.amount), 0)
    INTO expired_amount
    FROM point_transactions pt
    WHERE pt.user_id = user_record.user_id
      AND pt.type = 'earn'
      AND pt.expires_at IS NOT NULL
      AND pt.expires_at < NOW();

    IF expired_amount > 0 THEN
      -- 현재 잔액 조회
      SELECT point_balance INTO current_balance
      FROM users
      WHERE id = user_record.user_id;

      -- 만료 금액은 현재 잔액을 초과할 수 없음
      expired_amount := LEAST(expired_amount, current_balance);
      new_balance := current_balance - expired_amount;

      -- 만료 거래 기록 추가
      INSERT INTO point_transactions (
        user_id,
        type,
        amount,
        balance_after,
        description
      ) VALUES (
        user_record.user_id,
        'expire',
        -expired_amount,
        new_balance,
        '포인트 유효기간 만료'
      );

      expired_count := expired_count + 1;
    END IF;
  END LOOP;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 완료 메시지
-- ================================================

SELECT '포인트 시스템 테이블 생성 완료!' as message;
