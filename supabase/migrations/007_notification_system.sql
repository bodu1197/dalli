-- ============================================================================
-- Migration: 007_notification_system.sql
-- Description: 프로덕션급 알림 시스템 구축
-- Phase 5: 주문 취소 알림 시스템
-- ============================================================================

-- ============================================================================
-- 1. ENUM 타입 생성
-- ============================================================================

-- 알림 타입
CREATE TYPE notification_type AS ENUM (
  -- 주문 관련
  'order_created',
  'order_confirmed',
  'order_preparing',
  'order_ready',
  'order_picked_up',
  'order_delivered',
  'order_cancelled',
  -- 취소 관련
  'cancellation_requested_customer',
  'cancellation_requested_owner',
  'cancellation_instant_completed',
  'cancellation_approved',
  'cancellation_rejected',
  'cancellation_auto_approved',
  'cancellation_withdrawn',
  -- 환불 관련
  'refund_processing',
  'refund_completed',
  'refund_failed',
  -- 포인트/쿠폰
  'points_earned',
  'points_refunded',
  'coupon_restored',
  'coupon_expiring',
  -- 프로모션
  'promotion_new',
  -- 시스템
  'system_notice',
  'review_reminder'
);

-- 알림 채널
CREATE TYPE notification_channel AS ENUM (
  'in_app',
  'push',
  'email',
  'sms'
);

-- 발송 상태
CREATE TYPE notification_send_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'delivered',
  'read'
);

-- 플랫폼 타입
CREATE TYPE device_platform AS ENUM (
  'ios',
  'android',
  'web'
);

-- 알림 우선순위
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- ============================================================================
-- 2. notifications 테이블 (인앱 알림)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 수신자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 알림 내용
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  -- 추가 데이터 (order_id, cancellation_id 등)
  data JSONB NOT NULL DEFAULT '{}',

  -- 상태
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  -- 우선순위
  priority notification_priority NOT NULL DEFAULT 'normal',

  -- 만료 시간 (선택적)
  expires_at TIMESTAMPTZ,

  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Realtime을 위한 REPLICA IDENTITY 설정
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- ============================================================================
-- 3. notification_settings 테이블 (사용자별 알림 설정)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 사용자 (1:1 관계)
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- 채널별 활성화
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,

  -- 알림 종류별 활성화
  order_updates BOOLEAN NOT NULL DEFAULT true,
  cancellation_updates BOOLEAN NOT NULL DEFAULT true,
  promotion_updates BOOLEAN NOT NULL DEFAULT true,
  review_reminders BOOLEAN NOT NULL DEFAULT true,

  -- 방해 금지 시간 설정
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',

  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- ============================================================================
-- 4. push_tokens 테이블 (푸시 토큰 관리)
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 사용자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 토큰 정보
  token TEXT NOT NULL,
  platform device_platform NOT NULL,
  device_id TEXT,
  device_name TEXT,

  -- 상태
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- 사용 이력
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 동일 토큰 중복 방지
  CONSTRAINT unique_push_token UNIQUE (token)
);

-- 인덱스
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(user_id) WHERE is_active = true;
CREATE INDEX idx_push_tokens_platform ON push_tokens(platform);

-- ============================================================================
-- 5. notification_logs 테이블 (발송 이력)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 알림 참조
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,

  -- 발송 정보
  channel notification_channel NOT NULL,
  status notification_send_status NOT NULL DEFAULT 'pending',

  -- 외부 서비스 응답
  provider_response JSONB,
  error_message TEXT,

  -- 시간 기록
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- 재시도 정보
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX idx_notification_logs_retry ON notification_logs(next_retry_at)
  WHERE status = 'failed' AND retry_count < 3;

-- ============================================================================
-- 6. 트리거 함수: updated_at 자동 갱신
-- ============================================================================

-- notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- notification_settings
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- push_tokens
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. RLS (Row Level Security) 정책
-- ============================================================================

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- notification_logs (관리자만 조회 가능)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage logs"
  ON notification_logs FOR ALL
  USING (true);

-- ============================================================================
-- 8. 함수: 알림 생성
-- ============================================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}',
  p_priority notification_priority DEFAULT 'normal',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data,
    priority,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_data,
    p_priority,
    p_expires_at
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- ============================================================================
-- 9. 함수: 알림 읽음 처리
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET
    is_read = true,
    read_at = now()
  WHERE id = p_notification_id
    AND user_id = p_user_id
    AND is_read = false;

  RETURN FOUND;
END;
$$;

-- ============================================================================
-- 10. 함수: 모든 알림 읽음 처리
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET
    is_read = true,
    read_at = now()
  WHERE user_id = p_user_id
    AND is_read = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- 11. 함수: 읽지 않은 알림 수 조회
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > now());

  RETURN v_count;
END;
$$;

-- ============================================================================
-- 12. 함수: 알림 설정 초기화 (신규 사용자)
-- ============================================================================

CREATE OR REPLACE FUNCTION init_notification_settings(
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_settings_id;

  -- 이미 존재하면 기존 ID 반환
  IF v_settings_id IS NULL THEN
    SELECT id INTO v_settings_id
    FROM notification_settings
    WHERE user_id = p_user_id;
  END IF;

  RETURN v_settings_id;
END;
$$;

-- ============================================================================
-- 13. 함수: 알림 발송 가능 여부 확인
-- ============================================================================

CREATE OR REPLACE FUNCTION can_send_notification(
  p_user_id UUID,
  p_notification_type notification_type,
  p_channel notification_channel
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings notification_settings%ROWTYPE;
  v_current_time TIME;
  v_in_quiet_hours BOOLEAN;
BEGIN
  -- 설정 조회
  SELECT * INTO v_settings
  FROM notification_settings
  WHERE user_id = p_user_id;

  -- 설정이 없으면 기본값으로 허용
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- 채널별 활성화 확인
  IF p_channel = 'push' AND NOT v_settings.push_enabled THEN
    RETURN false;
  END IF;

  IF p_channel = 'email' AND NOT v_settings.email_enabled THEN
    RETURN false;
  END IF;

  IF p_channel = 'sms' AND NOT v_settings.sms_enabled THEN
    RETURN false;
  END IF;

  -- 알림 종류별 활성화 확인
  IF p_notification_type IN (
    'order_created', 'order_confirmed', 'order_preparing',
    'order_ready', 'order_picked_up', 'order_delivered', 'order_cancelled'
  ) AND NOT v_settings.order_updates THEN
    RETURN false;
  END IF;

  IF p_notification_type IN (
    'cancellation_requested_customer', 'cancellation_requested_owner',
    'cancellation_instant_completed', 'cancellation_approved',
    'cancellation_rejected', 'cancellation_auto_approved',
    'cancellation_withdrawn', 'refund_processing',
    'refund_completed', 'refund_failed'
  ) AND NOT v_settings.cancellation_updates THEN
    RETURN false;
  END IF;

  IF p_notification_type IN ('promotion_new', 'coupon_expiring')
    AND NOT v_settings.promotion_updates THEN
    RETURN false;
  END IF;

  IF p_notification_type = 'review_reminder'
    AND NOT v_settings.review_reminders THEN
    RETURN false;
  END IF;

  -- 방해 금지 시간 확인 (push만)
  IF p_channel = 'push' AND v_settings.quiet_hours_enabled THEN
    v_current_time := LOCALTIME;

    -- 시작 시간이 종료 시간보다 큰 경우 (예: 22:00 ~ 08:00)
    IF v_settings.quiet_hours_start > v_settings.quiet_hours_end THEN
      v_in_quiet_hours := v_current_time >= v_settings.quiet_hours_start
                          OR v_current_time < v_settings.quiet_hours_end;
    ELSE
      v_in_quiet_hours := v_current_time >= v_settings.quiet_hours_start
                          AND v_current_time < v_settings.quiet_hours_end;
    END IF;

    -- 긴급 알림은 방해 금지 시간에도 발송
    IF v_in_quiet_hours AND p_notification_type NOT IN (
      'cancellation_requested_owner',  -- 점주에게 오는 취소 요청
      'refund_failed'                  -- 환불 실패
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

-- ============================================================================
-- 14. 함수: 푸시 토큰 등록/갱신
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_push_token(
  p_user_id UUID,
  p_token TEXT,
  p_platform device_platform,
  p_device_id TEXT DEFAULT NULL,
  p_device_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_id UUID;
BEGIN
  -- 기존 토큰이 다른 사용자에게 등록되어 있으면 비활성화
  UPDATE push_tokens
  SET is_active = false
  WHERE token = p_token
    AND user_id != p_user_id;

  -- Upsert
  INSERT INTO push_tokens (
    user_id,
    token,
    platform,
    device_id,
    device_name,
    is_active,
    last_used_at
  ) VALUES (
    p_user_id,
    p_token,
    p_platform,
    p_device_id,
    p_device_name,
    true,
    now()
  )
  ON CONFLICT (token) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    platform = EXCLUDED.platform,
    device_id = EXCLUDED.device_id,
    device_name = EXCLUDED.device_name,
    is_active = true,
    last_used_at = now(),
    updated_at = now()
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;

-- ============================================================================
-- 15. 함수: 만료된 알림 정리 (스케줄러용)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 16. 함수: 오래된 알림 정리 (30일 이상)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < now() - (p_days || ' days')::INTERVAL
    AND is_read = true;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 17. 함수: 취소 관련 알림 일괄 생성
-- ============================================================================

CREATE OR REPLACE FUNCTION create_cancellation_notification(
  p_user_id UUID,
  p_notification_type notification_type,
  p_order_id UUID,
  p_cancellation_id UUID,
  p_restaurant_name TEXT,
  p_refund_amount INTEGER DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_data JSONB;
  v_priority notification_priority;
  v_notification_id UUID;
BEGIN
  -- 알림 타입별 제목/본문 설정
  CASE p_notification_type
    WHEN 'cancellation_requested_customer' THEN
      v_title := '취소 요청이 접수되었습니다';
      v_body := p_restaurant_name || ' 주문 취소 요청이 접수되었습니다. 점주님 승인 후 환불이 진행됩니다.';
      v_priority := 'normal';

    WHEN 'cancellation_requested_owner' THEN
      v_title := '🔔 취소 요청이 도착했습니다';
      v_body := '고객님이 주문 취소를 요청했습니다. 30분 내 응답이 필요합니다.';
      v_priority := 'urgent';

    WHEN 'cancellation_instant_completed' THEN
      v_title := '주문이 취소되었습니다';
      v_body := p_restaurant_name || ' 주문이 취소되었습니다. ' ||
                COALESCE(p_refund_amount::TEXT || '원이 환불 처리됩니다.', '');
      v_priority := 'high';

    WHEN 'cancellation_approved' THEN
      v_title := '취소가 승인되었습니다';
      v_body := p_restaurant_name || ' 주문 취소가 승인되었습니다. ' ||
                COALESCE(p_refund_amount::TEXT || '원이 환불 처리됩니다.', '');
      v_priority := 'high';

    WHEN 'cancellation_rejected' THEN
      v_title := '취소가 거절되었습니다';
      v_body := p_restaurant_name || '에서 취소 요청을 거절했습니다.' ||
                CASE WHEN p_rejection_reason IS NOT NULL
                     THEN ' 사유: ' || p_rejection_reason
                     ELSE '' END;
      v_priority := 'high';

    WHEN 'cancellation_auto_approved' THEN
      v_title := '취소가 자동 승인되었습니다';
      v_body := '미응답으로 취소가 자동 승인 처리되었습니다. ' ||
                COALESCE(p_refund_amount::TEXT || '원이 환불 처리됩니다.', '');
      v_priority := 'high';

    WHEN 'refund_completed' THEN
      v_title := '환불이 완료되었습니다';
      v_body := COALESCE(p_refund_amount::TEXT, '0') || '원이 환불되었습니다. ' ||
                '카드사에 따라 2-3일 소요될 수 있습니다.';
      v_priority := 'normal';

    WHEN 'refund_failed' THEN
      v_title := '환불 처리 중 문제가 발생했습니다';
      v_body := '환불 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.';
      v_priority := 'urgent';

    ELSE
      v_title := '알림';
      v_body := '새로운 알림이 있습니다.';
      v_priority := 'normal';
  END CASE;

  -- 데이터 구성
  v_data := jsonb_build_object(
    'orderId', p_order_id,
    'cancellationId', p_cancellation_id,
    'restaurantName', p_restaurant_name,
    'refundAmount', p_refund_amount,
    'rejectionReason', p_rejection_reason,
    'action', 'dalligo://orders/' || p_order_id::TEXT
  );

  -- 알림 생성
  v_notification_id := create_notification(
    p_user_id,
    p_notification_type,
    v_title,
    v_body,
    v_data,
    v_priority
  );

  RETURN v_notification_id;
END;
$$;

-- ============================================================================
-- 18. 뷰: 사용자별 최근 알림 (최근 50개)
-- ============================================================================

CREATE OR REPLACE VIEW v_user_notifications AS
SELECT
  n.id,
  n.user_id,
  n.type,
  n.title,
  n.body,
  n.data,
  n.is_read,
  n.read_at,
  n.priority,
  n.created_at,
  -- 읽지 않은 시간 (분)
  CASE WHEN n.is_read = false
       THEN EXTRACT(EPOCH FROM (now() - n.created_at)) / 60
       ELSE NULL END AS unread_minutes
FROM notifications n
WHERE n.expires_at IS NULL OR n.expires_at > now()
ORDER BY n.created_at DESC;

-- ============================================================================
-- 19. 인덱스 최적화
-- ============================================================================

-- 복합 인덱스: 사용자별 타입별 알림
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);

-- 복합 인덱스: 발송 대기 로그
CREATE INDEX idx_notification_logs_pending ON notification_logs(status, next_retry_at)
  WHERE status IN ('pending', 'failed');

-- ============================================================================
-- 20. 코멘트 추가 (문서화)
-- ============================================================================

COMMENT ON TABLE notifications IS '인앱 알림 저장 테이블';
COMMENT ON TABLE notification_settings IS '사용자별 알림 설정';
COMMENT ON TABLE push_tokens IS 'FCM/APNs 푸시 토큰 관리';
COMMENT ON TABLE notification_logs IS '알림 발송 이력 (디버깅/분석용)';

COMMENT ON FUNCTION create_notification IS '새 알림을 생성합니다';
COMMENT ON FUNCTION mark_notification_read IS '특정 알림을 읽음 처리합니다';
COMMENT ON FUNCTION mark_all_notifications_read IS '모든 알림을 읽음 처리합니다';
COMMENT ON FUNCTION get_unread_notification_count IS '읽지 않은 알림 수를 반환합니다';
COMMENT ON FUNCTION can_send_notification IS '알림 발송 가능 여부를 확인합니다';
COMMENT ON FUNCTION create_cancellation_notification IS '취소 관련 알림을 생성합니다';
