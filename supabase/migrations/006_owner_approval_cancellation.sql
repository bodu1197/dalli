-- ============================================
-- Phase 4: 점주 승인 필요 취소 시스템 마이그레이션
-- 작성일: 2024-12-11
-- 설명: 점주 승인 프로세스 및 자동 승인 시스템
-- ============================================

-- ============================================
-- 1. order_cancellations 테이블 확장
-- ============================================

-- 점주 액션 관련 컬럼 추가
ALTER TABLE order_cancellations
ADD COLUMN IF NOT EXISTS owner_action TEXT CHECK (owner_action IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS owner_action_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS owner_action_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS owner_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approval_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS owner_notified BOOLEAN DEFAULT FALSE;

-- owner_action 기본값 설정 (기존 데이터용)
UPDATE order_cancellations
SET owner_action = CASE
  WHEN status = 'pending' THEN 'pending'
  WHEN status IN ('approved', 'completed') THEN 'approved'
  WHEN status = 'rejected' THEN 'rejected'
  ELSE 'pending'
END
WHERE owner_action IS NULL;

-- 새 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_order_cancellations_owner_action
  ON order_cancellations(owner_action);
CREATE INDEX IF NOT EXISTS idx_order_cancellations_approval_deadline
  ON order_cancellations(approval_deadline)
  WHERE status = 'pending' AND owner_action = 'pending';


-- ============================================
-- 2. 취소 정책 테이블 (cancellation_policies)
-- ============================================
CREATE TABLE IF NOT EXISTS cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 정책 조건
  order_status TEXT NOT NULL,

  -- 취소 유형 및 환불 정보
  cancellation_type TEXT NOT NULL CHECK (cancellation_type IN ('instant', 'approval_required', 'not_allowed')),
  refund_rate INTEGER NOT NULL DEFAULT 100 CHECK (refund_rate >= 0 AND refund_rate <= 100),
  can_refund_coupon BOOLEAN DEFAULT TRUE,
  can_refund_points BOOLEAN DEFAULT TRUE,

  -- 승인 관련
  approval_timeout_minutes INTEGER DEFAULT 30,

  -- 정책 정보
  description TEXT,
  message_for_customer TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 고유 제약
  CONSTRAINT unique_policy_per_status UNIQUE (order_status) WHERE is_active = TRUE
);

-- 정책 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_cancellation_policies_order_status
  ON cancellation_policies(order_status)
  WHERE is_active = TRUE;

-- 정책 테이블 updated_at 트리거
CREATE OR REPLACE FUNCTION update_cancellation_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cancellation_policies_updated_at ON cancellation_policies;
CREATE TRIGGER trigger_cancellation_policies_updated_at
  BEFORE UPDATE ON cancellation_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_cancellation_policies_updated_at();


-- ============================================
-- 3. 취소 상태 이력 테이블 (cancellation_status_history)
-- ============================================
CREATE TABLE IF NOT EXISTS cancellation_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  cancellation_id UUID NOT NULL REFERENCES order_cancellations(id) ON DELETE CASCADE,

  -- 상태 변경 정보
  previous_status TEXT,
  new_status TEXT NOT NULL,
  previous_owner_action TEXT,
  new_owner_action TEXT,

  -- 변경 정보
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  is_auto_change BOOLEAN DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이력 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_cancellation_status_history_cancellation_id
  ON cancellation_status_history(cancellation_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_status_history_created_at
  ON cancellation_status_history(created_at DESC);


-- ============================================
-- 4. 초기 정책 데이터 삽입
-- ============================================
INSERT INTO cancellation_policies (
  order_status, cancellation_type, refund_rate,
  can_refund_coupon, can_refund_points, approval_timeout_minutes,
  description, message_for_customer
) VALUES
  -- pending: 즉시 취소, 100% 환불
  ('pending', 'instant', 100, TRUE, TRUE, 0,
   '주문 접수 대기 중 - 즉시 취소 가능',
   '주문이 아직 접수되지 않아 즉시 취소됩니다. 전액 환불됩니다.'),

  -- confirmed: 점주 승인 필요, 100% 환불
  ('confirmed', 'approval_required', 100, TRUE, TRUE, 30,
   '주문 접수됨 - 점주 승인 필요',
   '점주님의 승인이 필요합니다. 승인 시 전액 환불됩니다.'),

  -- preparing: 점주 승인 필요, 70% 환불, 쿠폰 환불 불가
  ('preparing', 'approval_required', 70, FALSE, TRUE, 30,
   '조리 중 - 점주 승인 필요, 70% 환불',
   '조리가 시작되어 점주님의 승인이 필요합니다. 승인 시 70% 환불됩니다.'),

  -- ready: 취소 불가
  ('ready', 'not_allowed', 0, FALSE, FALSE, 0,
   '조리 완료 - 취소 불가',
   '음식 조리가 완료되어 취소할 수 없습니다. 고객센터로 문의해주세요.'),

  -- picked_up: 취소 불가
  ('picked_up', 'not_allowed', 0, FALSE, FALSE, 0,
   '라이더 픽업 완료 - 취소 불가',
   '라이더가 음식을 픽업했습니다. 취소할 수 없습니다.'),

  -- delivering: 취소 불가
  ('delivering', 'not_allowed', 0, FALSE, FALSE, 0,
   '배달 중 - 취소 불가',
   '배달 중인 주문은 취소할 수 없습니다.'),

  -- delivered: 취소 불가
  ('delivered', 'not_allowed', 0, FALSE, FALSE, 0,
   '배달 완료 - 취소 불가',
   '이미 배달 완료된 주문입니다. 환불은 고객센터로 문의해주세요.'),

  -- cancelled: 이미 취소됨
  ('cancelled', 'not_allowed', 0, FALSE, FALSE, 0,
   '이미 취소된 주문',
   '이미 취소된 주문입니다.')
ON CONFLICT DO NOTHING;


-- ============================================
-- 5. 자동 상태 이력 기록 트리거
-- ============================================
CREATE OR REPLACE FUNCTION record_cancellation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태 변경이 있을 때만 이력 기록
  IF (TG_OP = 'UPDATE' AND
      (OLD.status IS DISTINCT FROM NEW.status OR
       OLD.owner_action IS DISTINCT FROM NEW.owner_action)) THEN
    INSERT INTO cancellation_status_history (
      cancellation_id,
      previous_status,
      new_status,
      previous_owner_action,
      new_owner_action,
      changed_by,
      is_auto_change
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      OLD.owner_action,
      NEW.owner_action,
      NEW.approved_by,
      NEW.auto_approved
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_record_cancellation_status_change ON order_cancellations;
CREATE TRIGGER trigger_record_cancellation_status_change
  AFTER UPDATE ON order_cancellations
  FOR EACH ROW
  EXECUTE FUNCTION record_cancellation_status_change();


-- ============================================
-- 6. 취소 정책 조회 함수
-- ============================================
CREATE OR REPLACE FUNCTION get_cancellation_policy(p_order_status TEXT)
RETURNS JSON AS $$
DECLARE
  v_policy RECORD;
BEGIN
  SELECT * INTO v_policy
  FROM cancellation_policies
  WHERE order_status = p_order_status
    AND is_active = TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    -- 정책이 없는 경우 기본적으로 취소 불가
    RETURN json_build_object(
      'cancellationType', 'not_allowed',
      'refundRate', 0,
      'canRefundCoupon', false,
      'canRefundPoints', false,
      'approvalTimeoutMinutes', 0,
      'description', '취소 정책이 정의되지 않았습니다.',
      'messageForCustomer', '취소할 수 없는 상태입니다. 고객센터로 문의해주세요.'
    );
  END IF;

  RETURN json_build_object(
    'cancellationType', v_policy.cancellation_type,
    'refundRate', v_policy.refund_rate,
    'canRefundCoupon', v_policy.can_refund_coupon,
    'canRefundPoints', v_policy.can_refund_points,
    'approvalTimeoutMinutes', v_policy.approval_timeout_minutes,
    'description', v_policy.description,
    'messageForCustomer', v_policy.message_for_customer
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ============================================
-- 7. 점주 취소 승인 함수
-- ============================================
CREATE OR REPLACE FUNCTION approve_cancellation(
  p_cancellation_id UUID,
  p_owner_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_cancellation RECORD;
  v_order RECORD;
  v_restaurant RECORD;
BEGIN
  -- 취소 정보 조회
  SELECT * INTO v_cancellation
  FROM order_cancellations
  WHERE id = p_cancellation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '취소 요청을 찾을 수 없습니다.');
  END IF;

  -- 이미 처리된 경우
  IF v_cancellation.status != 'pending' OR v_cancellation.owner_action != 'pending' THEN
    RETURN json_build_object('success', false, 'error', '이미 처리된 취소 요청입니다.');
  END IF;

  -- 주문 및 가게 조회
  SELECT o.*, r.owner_id INTO v_order
  FROM orders o
  JOIN restaurants r ON o.restaurant_id = r.id
  WHERE o.id = v_cancellation.order_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '주문 정보를 찾을 수 없습니다.');
  END IF;

  -- 점주 권한 확인
  IF v_order.owner_id != p_owner_id THEN
    RETURN json_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  -- 취소 승인 처리
  UPDATE order_cancellations SET
    status = 'approved',
    owner_action = 'approved',
    owner_action_at = NOW(),
    owner_action_by = p_owner_id,
    approved_by = p_owner_id,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_cancellation_id;

  -- 주문 상태 업데이트
  UPDATE orders SET
    status = 'cancelled',
    cancelled_reason = v_cancellation.reason,
    cancelled_at = NOW(),
    refunded_amount = v_cancellation.refund_amount,
    updated_at = NOW()
  WHERE id = v_cancellation.order_id;

  RETURN json_build_object(
    'success', true,
    'cancellationId', p_cancellation_id,
    'orderId', v_cancellation.order_id,
    'message', '취소가 승인되었습니다.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 8. 점주 취소 거절 함수
-- ============================================
CREATE OR REPLACE FUNCTION reject_cancellation(
  p_cancellation_id UUID,
  p_owner_id UUID,
  p_rejection_reason TEXT
)
RETURNS JSON AS $$
DECLARE
  v_cancellation RECORD;
  v_order RECORD;
BEGIN
  -- 취소 정보 조회
  SELECT * INTO v_cancellation
  FROM order_cancellations
  WHERE id = p_cancellation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '취소 요청을 찾을 수 없습니다.');
  END IF;

  -- 이미 처리된 경우
  IF v_cancellation.status != 'pending' OR v_cancellation.owner_action != 'pending' THEN
    RETURN json_build_object('success', false, 'error', '이미 처리된 취소 요청입니다.');
  END IF;

  -- 주문 및 가게 조회
  SELECT o.*, r.owner_id INTO v_order
  FROM orders o
  JOIN restaurants r ON o.restaurant_id = r.id
  WHERE o.id = v_cancellation.order_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '주문 정보를 찾을 수 없습니다.');
  END IF;

  -- 점주 권한 확인
  IF v_order.owner_id != p_owner_id THEN
    RETURN json_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  -- 거절 사유 필수
  IF p_rejection_reason IS NULL OR LENGTH(TRIM(p_rejection_reason)) = 0 THEN
    RETURN json_build_object('success', false, 'error', '거절 사유를 입력해주세요.');
  END IF;

  -- 취소 거절 처리
  UPDATE order_cancellations SET
    status = 'rejected',
    owner_action = 'rejected',
    owner_action_at = NOW(),
    owner_action_by = p_owner_id,
    owner_rejection_reason = p_rejection_reason,
    rejected_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_cancellation_id;

  -- 주문의 취소 요청 시간 초기화
  UPDATE orders SET
    cancel_requested_at = NULL,
    updated_at = NOW()
  WHERE id = v_cancellation.order_id;

  RETURN json_build_object(
    'success', true,
    'cancellationId', p_cancellation_id,
    'orderId', v_cancellation.order_id,
    'message', '취소 요청이 거절되었습니다.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 9. 자동 승인 처리 함수 (배치용)
-- ============================================
CREATE OR REPLACE FUNCTION process_auto_approvals()
RETURNS JSON AS $$
DECLARE
  v_cancellation RECORD;
  v_processed INTEGER := 0;
  v_auto_approved INTEGER := 0;
  v_failed INTEGER := 0;
  v_results JSON[] := '{}';
BEGIN
  -- 승인 기한이 지난 대기 중 취소 건 조회
  FOR v_cancellation IN
    SELECT oc.*
    FROM order_cancellations oc
    WHERE oc.status = 'pending'
      AND oc.owner_action = 'pending'
      AND oc.approval_deadline IS NOT NULL
      AND oc.approval_deadline < NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    v_processed := v_processed + 1;

    BEGIN
      -- 자동 승인 처리
      UPDATE order_cancellations SET
        status = 'approved',
        owner_action = 'approved',
        owner_action_at = NOW(),
        auto_approved = TRUE,
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = v_cancellation.id;

      -- 주문 상태 업데이트
      UPDATE orders SET
        status = 'cancelled',
        cancelled_reason = '자동 승인: ' || v_cancellation.reason,
        cancelled_at = NOW(),
        refunded_amount = v_cancellation.refund_amount,
        updated_at = NOW()
      WHERE id = v_cancellation.order_id;

      v_auto_approved := v_auto_approved + 1;
      v_results := array_append(v_results, json_build_object(
        'cancellationId', v_cancellation.id,
        'success', true
      ));

    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      v_results := array_append(v_results, json_build_object(
        'cancellationId', v_cancellation.id,
        'success', false,
        'error', SQLERRM
      ));
    END;
  END LOOP;

  RETURN json_build_object(
    'processed', v_processed,
    'autoApproved', v_auto_approved,
    'failed', v_failed,
    'results', to_json(v_results)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 10. 취소 요청 생성 함수 (점주 승인 버전)
-- ============================================
CREATE OR REPLACE FUNCTION create_cancellation_request(
  p_order_id UUID,
  p_user_id UUID,
  p_reason TEXT,
  p_reason_detail TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_policy RECORD;
  v_cancellation_id UUID;
  v_refund_amount INTEGER;
  v_menu_refund INTEGER;
  v_delivery_refund INTEGER;
  v_approval_deadline TIMESTAMPTZ;
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

  -- 이미 취소 요청 있는지 확인
  IF EXISTS (
    SELECT 1 FROM order_cancellations
    WHERE order_id = p_order_id
      AND status IN ('pending', 'approved')
  ) THEN
    RETURN json_build_object('success', false, 'error', '이미 취소 요청이 존재합니다.');
  END IF;

  -- 취소 정책 조회
  SELECT * INTO v_policy
  FROM cancellation_policies
  WHERE order_status = v_order.status AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '취소 정책을 찾을 수 없습니다.');
  END IF;

  -- 취소 불가 상태
  IF v_policy.cancellation_type = 'not_allowed' THEN
    RETURN json_build_object(
      'success', false,
      'error', v_policy.message_for_customer,
      'cancellationType', 'not_allowed'
    );
  END IF;

  -- 환불 금액 계산
  v_menu_refund := FLOOR(v_order.total_amount * v_policy.refund_rate / 100);
  v_delivery_refund := v_order.delivery_fee;
  v_refund_amount := v_menu_refund + v_delivery_refund;

  -- 승인 기한 계산 (approval_required인 경우)
  IF v_policy.cancellation_type = 'approval_required' AND v_policy.approval_timeout_minutes > 0 THEN
    v_approval_deadline := NOW() + (v_policy.approval_timeout_minutes || ' minutes')::INTERVAL;
  END IF;

  -- 즉시 취소인 경우
  IF v_policy.cancellation_type = 'instant' THEN
    INSERT INTO order_cancellations (
      order_id, requested_by, cancel_type, status,
      reason, reason_detail,
      refund_amount, refund_rate, menu_refund_amount, delivery_refund_amount,
      can_refund_coupon, can_refund_points,
      owner_action, approved_at, completed_at
    ) VALUES (
      p_order_id, p_user_id, 'instant', 'approved',
      p_reason, p_reason_detail,
      v_refund_amount, v_policy.refund_rate::NUMERIC / 100, v_menu_refund, v_delivery_refund,
      v_policy.can_refund_coupon, v_policy.can_refund_points,
      'approved', NOW(), NULL
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
      'cancellationId', v_cancellation_id,
      'cancellationType', 'instant',
      'refundAmount', v_refund_amount,
      'refundRate', v_policy.refund_rate,
      'message', '주문이 취소되었습니다.'
    );

  ELSE
    -- 점주 승인 필요
    INSERT INTO order_cancellations (
      order_id, requested_by, cancel_type, status,
      reason, reason_detail,
      refund_amount, refund_rate, menu_refund_amount, delivery_refund_amount,
      can_refund_coupon, can_refund_points,
      owner_action, approval_deadline
    ) VALUES (
      p_order_id, p_user_id, 'request', 'pending',
      p_reason, p_reason_detail,
      v_refund_amount, v_policy.refund_rate::NUMERIC / 100, v_menu_refund, v_delivery_refund,
      v_policy.can_refund_coupon, v_policy.can_refund_points,
      'pending', v_approval_deadline
    ) RETURNING id INTO v_cancellation_id;

    -- 주문에 취소 요청 시간 기록
    UPDATE orders SET
      cancel_requested_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN json_build_object(
      'success', true,
      'cancellationId', v_cancellation_id,
      'cancellationType', 'approval_required',
      'refundAmount', v_refund_amount,
      'refundRate', v_policy.refund_rate,
      'approvalDeadline', v_approval_deadline,
      'requiresApproval', true,
      'message', v_policy.message_for_customer
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 11. 점주 대기 중 취소 요청 조회 함수
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_cancellations_for_owner(p_owner_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO v_result
  FROM (
    SELECT
      oc.id AS "cancellationId",
      oc.order_id AS "orderId",
      o.id AS "orderNumber",
      u.name AS "customerName",
      u.phone AS "customerPhone",
      o.total_amount AS "orderAmount",
      oc.refund_amount AS "refundAmount",
      oc.refund_rate AS "refundRate",
      oc.reason,
      oc.reason_detail AS "detailedReason",
      oc.created_at AS "requestedAt",
      oc.approval_deadline AS "approvalDeadline",
      EXTRACT(EPOCH FROM (oc.approval_deadline - NOW())) / 60 AS "remainingMinutes"
    FROM order_cancellations oc
    JOIN orders o ON oc.order_id = o.id
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.user_id = u.id
    WHERE r.owner_id = p_owner_id
      AND oc.status = 'pending'
      AND oc.owner_action = 'pending'
    ORDER BY oc.created_at ASC
  ) t;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ============================================
-- 12. RLS 정책 추가
-- ============================================

-- cancellation_policies RLS (읽기 전용, 모든 인증 사용자)
ALTER TABLE cancellation_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view cancellation policies" ON cancellation_policies
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- cancellation_status_history RLS
ALTER TABLE cancellation_status_history ENABLE ROW LEVEL SECURITY;

-- 자신의 취소 이력 조회
CREATE POLICY "Users can view own cancellation history" ON cancellation_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_cancellations oc
      WHERE oc.id = cancellation_id
        AND oc.requested_by = auth.uid()
    )
  );

-- 점주 가게 취소 이력 조회
CREATE POLICY "Owners can view store cancellation history" ON cancellation_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_cancellations oc
      JOIN orders o ON oc.order_id = o.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE oc.id = cancellation_id
        AND r.owner_id = auth.uid()
    )
  );

-- 시스템 역할 전체 접근
CREATE POLICY "Service role can manage cancellation history" ON cancellation_status_history
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================
-- 완료
-- ============================================
