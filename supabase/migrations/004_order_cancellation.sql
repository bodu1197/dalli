-- ============================================
-- 주문 취소 시스템 마이그레이션
-- 작성일: 2024-12-11
-- 설명: 프로덕션 수준의 주문 취소/환불 시스템
-- ============================================

-- ============================================
-- 1. 취소 요청 테이블 (order_cancellations)
-- ============================================
CREATE TABLE IF NOT EXISTS order_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 취소 유형
  cancel_type TEXT NOT NULL CHECK (cancel_type IN ('instant', 'request')),

  -- 상태 관리
  status TEXT NOT NULL CHECK (status IN (
    'pending',    -- 대기 중 (점주 승인 필요)
    'approved',   -- 승인됨
    'rejected',   -- 거절됨
    'completed'   -- 완료됨 (환불까지 완료)
  )) DEFAULT 'pending',

  -- 취소 사유
  reason TEXT NOT NULL,
  reason_detail TEXT,
  rejected_reason TEXT,

  -- 환불 정보
  refund_amount INTEGER NOT NULL DEFAULT 0,
  refund_rate NUMERIC(3,2) NOT NULL DEFAULT 0,
  menu_refund_amount INTEGER NOT NULL DEFAULT 0,
  delivery_refund_amount INTEGER NOT NULL DEFAULT 0,

  -- 복구 정보
  can_refund_coupon BOOLEAN DEFAULT false,
  can_refund_points BOOLEAN DEFAULT false,
  coupon_refunded BOOLEAN DEFAULT false,
  points_refunded BOOLEAN DEFAULT false,

  -- 승인 정보
  approved_at TIMESTAMPTZ,

  -- 타임스탬프
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 취소 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_order_cancellations_order_id
  ON order_cancellations(order_id);
CREATE INDEX IF NOT EXISTS idx_order_cancellations_status
  ON order_cancellations(status);
CREATE INDEX IF NOT EXISTS idx_order_cancellations_requested_by
  ON order_cancellations(requested_by);
CREATE INDEX IF NOT EXISTS idx_order_cancellations_created_at
  ON order_cancellations(created_at DESC);

-- 취소 테이블 updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_order_cancellations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_cancellations_updated_at ON order_cancellations;
CREATE TRIGGER trigger_order_cancellations_updated_at
  BEFORE UPDATE ON order_cancellations
  FOR EACH ROW
  EXECUTE FUNCTION update_order_cancellations_updated_at();


-- ============================================
-- 2. 환불 테이블 (refunds)
-- ============================================
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cancellation_id UUID REFERENCES order_cancellations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 금액 정보
  amount INTEGER NOT NULL,
  original_amount INTEGER NOT NULL,
  refund_rate NUMERIC(3,2) NOT NULL DEFAULT 1.0,

  -- 결제 정보
  payment_method TEXT NOT NULL, -- 'card', 'kakao', 'naver', 'toss', 'inicis'
  payment_key TEXT,             -- PG사 거래 키

  -- 환불 상태
  refund_status TEXT NOT NULL CHECK (refund_status IN (
    'pending',     -- 대기 중
    'processing',  -- 처리 중
    'completed',   -- 완료
    'failed',      -- 실패
    'cancelled'    -- 취소됨
  )) DEFAULT 'pending',

  -- PG사 응답
  pg_tid TEXT,                  -- PG사 거래 ID
  pg_response JSONB,            -- PG사 전체 응답

  -- 에러 정보
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retry_count INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- 타임스탬프
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 환불 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_refunds_order_id
  ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id
  ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_refund_status
  ON refunds(refund_status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_key
  ON refunds(payment_key);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at
  ON refunds(created_at DESC);

-- 환불 테이블 updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_refunds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refunds_updated_at ON refunds;
CREATE TRIGGER trigger_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_refunds_updated_at();


-- ============================================
-- 3. orders 테이블 확장
-- ============================================
-- 환불 관련 필드 추가 (이미 없는 경우에만)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
    ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancel_requested_at') THEN
    ALTER TABLE orders ADD COLUMN cancel_requested_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'refunded_amount') THEN
    ALTER TABLE orders ADD COLUMN refunded_amount INTEGER DEFAULT 0;
  END IF;
END $$;


-- ============================================
-- 4. RLS 정책
-- ============================================

-- order_cancellations RLS
ALTER TABLE order_cancellations ENABLE ROW LEVEL SECURITY;

-- 고객: 자신의 취소 요청만 조회
CREATE POLICY "Users can view own cancellations" ON order_cancellations
  FOR SELECT
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- 고객: 취소 요청 생성
CREATE POLICY "Users can create cancellations for own orders" ON order_cancellations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- 점주: 자신의 가게 주문 취소 조회/승인
CREATE POLICY "Owners can view and manage store cancellations" ON order_cancellations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = order_id AND r.owner_id = auth.uid()
    )
  );

-- refunds RLS
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- 고객: 자신의 환불만 조회
CREATE POLICY "Users can view own refunds" ON refunds
  FOR SELECT
  USING (user_id = auth.uid());

-- 점주: 자신의 가게 환불 조회
CREATE POLICY "Owners can view store refunds" ON refunds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = order_id AND r.owner_id = auth.uid()
    )
  );

-- 시스템 (서비스 역할): 환불 생성/수정
CREATE POLICY "System can manage refunds" ON refunds
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================
-- 5. 유틸리티 함수
-- ============================================

-- 주문 취소 처리 함수 (트랜잭션)
CREATE OR REPLACE FUNCTION process_order_cancellation(
  p_order_id UUID,
  p_user_id UUID,
  p_reason TEXT,
  p_reason_detail TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_cancellation_id UUID;
  v_refund_rate NUMERIC(3,2);
  v_refund_amount INTEGER;
  v_menu_refund INTEGER;
  v_delivery_refund INTEGER;
  v_can_cancel BOOLEAN;
  v_cancel_type TEXT;
  v_can_refund_coupon BOOLEAN;
  v_can_refund_points BOOLEAN;
BEGIN
  -- 주문 조회
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '주문을 찾을 수 없습니다.');
  END IF;

  -- 주문 소유자 확인
  IF v_order.user_id != p_user_id THEN
    RETURN json_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  -- 취소 가능 여부 확인
  CASE v_order.status
    WHEN 'pending' THEN
      v_can_cancel := true;
      v_cancel_type := 'instant';
      v_refund_rate := 1.0;
      v_can_refund_coupon := true;
      v_can_refund_points := true;
    WHEN 'confirmed' THEN
      v_can_cancel := true;
      v_cancel_type := 'request';
      v_refund_rate := 1.0;
      v_can_refund_coupon := false;
      v_can_refund_points := false;
    WHEN 'preparing' THEN
      v_can_cancel := true;
      v_cancel_type := 'request';
      v_refund_rate := 0.7;
      v_can_refund_coupon := false;
      v_can_refund_points := false;
    ELSE
      v_can_cancel := false;
  END CASE;

  IF NOT v_can_cancel THEN
    RETURN json_build_object('success', false, 'error', '취소할 수 없는 상태입니다.');
  END IF;

  -- 환불 금액 계산
  v_menu_refund := FLOOR(v_order.total_amount * v_refund_rate);
  v_delivery_refund := v_order.delivery_fee;
  v_refund_amount := v_menu_refund + v_delivery_refund;

  -- 즉시 취소인 경우
  IF v_cancel_type = 'instant' THEN
    -- 취소 기록 생성
    INSERT INTO order_cancellations (
      order_id, requested_by, cancel_type, status,
      reason, reason_detail,
      refund_amount, refund_rate, menu_refund_amount, delivery_refund_amount,
      can_refund_coupon, can_refund_points,
      approved_at, completed_at
    ) VALUES (
      p_order_id, p_user_id, v_cancel_type, 'completed',
      p_reason, p_reason_detail,
      v_refund_amount, v_refund_rate, v_menu_refund, v_delivery_refund,
      v_can_refund_coupon, v_can_refund_points,
      NOW(), NOW()
    ) RETURNING id INTO v_cancellation_id;

    -- 주문 상태 업데이트
    UPDATE orders SET
      status = 'cancelled',
      cancelled_reason = COALESCE(p_reason_detail, p_reason),
      cancelled_at = NOW(),
      refunded_amount = v_refund_amount,
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN json_build_object(
      'success', true,
      'cancelType', v_cancel_type,
      'cancellationId', v_cancellation_id,
      'refundAmount', v_refund_amount,
      'refundRate', v_refund_rate,
      'message', '주문이 취소되었습니다.'
    );
  ELSE
    -- 점주 승인 필요한 경우
    INSERT INTO order_cancellations (
      order_id, requested_by, cancel_type, status,
      reason, reason_detail,
      refund_amount, refund_rate, menu_refund_amount, delivery_refund_amount,
      can_refund_coupon, can_refund_points
    ) VALUES (
      p_order_id, p_user_id, v_cancel_type, 'pending',
      p_reason, p_reason_detail,
      v_refund_amount, v_refund_rate, v_menu_refund, v_delivery_refund,
      v_can_refund_coupon, v_can_refund_points
    ) RETURNING id INTO v_cancellation_id;

    -- 주문에 취소 요청 시간 기록
    UPDATE orders SET
      cancel_requested_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN json_build_object(
      'success', true,
      'cancelType', v_cancel_type,
      'cancellationId', v_cancellation_id,
      'refundAmount', v_refund_amount,
      'refundRate', v_refund_rate,
      'requiresApproval', true,
      'message', '취소 요청이 접수되었습니다. 점주 승인을 기다려주세요.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 취소 가능 여부 확인 함수
CREATE OR REPLACE FUNCTION check_order_cancelability(p_order_id UUID)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_can_cancel BOOLEAN;
  v_cancel_type TEXT;
  v_requires_approval BOOLEAN;
  v_refund_rate NUMERIC(3,2);
  v_refund_amount INTEGER;
  v_menu_refund INTEGER;
  v_delivery_refund INTEGER;
  v_can_refund_coupon BOOLEAN;
  v_can_refund_points BOOLEAN;
  v_message TEXT;
BEGIN
  -- 주문 조회
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'canCancel', false,
      'message', '주문을 찾을 수 없습니다.'
    );
  END IF;

  -- 상태별 처리
  CASE v_order.status
    WHEN 'pending' THEN
      v_can_cancel := true;
      v_cancel_type := 'instant';
      v_requires_approval := false;
      v_refund_rate := 1.0;
      v_can_refund_coupon := true;
      v_can_refund_points := true;
      v_message := '주문이 아직 접수되지 않아 즉시 취소됩니다. 전액 환불됩니다.';
    WHEN 'confirmed' THEN
      v_can_cancel := true;
      v_cancel_type := 'request';
      v_requires_approval := true;
      v_refund_rate := 1.0;
      v_can_refund_coupon := false;
      v_can_refund_points := false;
      v_message := '점주님의 승인이 필요합니다. 승인 시 전액 환불됩니다.';
    WHEN 'preparing' THEN
      v_can_cancel := true;
      v_cancel_type := 'request';
      v_requires_approval := true;
      v_refund_rate := 0.7;
      v_can_refund_coupon := false;
      v_can_refund_points := false;
      v_message := '조리가 시작되어 점주님의 승인이 필요합니다. 승인 시 70% 환불됩니다.';
    WHEN 'ready' THEN
      v_can_cancel := false;
      v_cancel_type := 'none';
      v_requires_approval := false;
      v_refund_rate := 0;
      v_message := '음식 조리가 완료되어 취소할 수 없습니다. 고객센터로 문의해주세요.';
    WHEN 'picked_up' THEN
      v_can_cancel := false;
      v_cancel_type := 'none';
      v_requires_approval := false;
      v_refund_rate := 0;
      v_message := '라이더가 음식을 픽업했습니다. 취소할 수 없습니다.';
    WHEN 'delivering' THEN
      v_can_cancel := false;
      v_cancel_type := 'none';
      v_requires_approval := false;
      v_refund_rate := 0;
      v_message := '배달 중인 주문은 취소할 수 없습니다.';
    WHEN 'delivered' THEN
      v_can_cancel := false;
      v_cancel_type := 'none';
      v_requires_approval := false;
      v_refund_rate := 0;
      v_message := '이미 배달 완료된 주문입니다. 환불은 고객센터로 문의해주세요.';
    WHEN 'cancelled' THEN
      v_can_cancel := false;
      v_cancel_type := 'none';
      v_requires_approval := false;
      v_refund_rate := 0;
      v_message := '이미 취소된 주문입니다.';
    ELSE
      v_can_cancel := false;
      v_cancel_type := 'none';
      v_requires_approval := false;
      v_refund_rate := 0;
      v_message := '취소할 수 없는 상태입니다.';
  END CASE;

  -- 환불 금액 계산
  IF v_can_cancel THEN
    v_menu_refund := FLOOR(v_order.total_amount * v_refund_rate);
    v_delivery_refund := v_order.delivery_fee;
    v_refund_amount := v_menu_refund + v_delivery_refund;
  ELSE
    v_menu_refund := 0;
    v_delivery_refund := 0;
    v_refund_amount := 0;
    v_can_refund_coupon := false;
    v_can_refund_points := false;
  END IF;

  RETURN json_build_object(
    'orderId', p_order_id,
    'status', v_order.status,
    'canCancel', v_can_cancel,
    'cancelType', v_cancel_type,
    'requiresApproval', COALESCE(v_requires_approval, false),
    'refundRate', v_refund_rate,
    'estimatedRefundAmount', v_refund_amount,
    'menuRefundAmount', v_menu_refund,
    'deliveryRefundAmount', v_delivery_refund,
    'canRefundCoupon', COALESCE(v_can_refund_coupon, false),
    'canRefundPoints', COALESCE(v_can_refund_points, false),
    'message', v_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 완료
-- ============================================
