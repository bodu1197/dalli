-- ============================================================================
-- 008: 실시간 추적 시스템
-- @description 라이더 위치 추적 및 배달 근접 알림을 위한 테이블
-- ============================================================================

-- ============================================================================
-- 1. 라이더 위치 테이블 (rider_locations)
-- ============================================================================

-- 라이더 실시간 위치 저장 (upsert 방식으로 최신 위치만 유지)
CREATE TABLE IF NOT EXISTS rider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  heading FLOAT, -- 방향 (0-360도)
  speed FLOAT, -- 속도 (m/s)
  accuracy FLOAT, -- GPS 정확도 (미터)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 라이더당 하나의 위치 레코드만 유지
  CONSTRAINT rider_locations_rider_id_unique UNIQUE (rider_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_rider_locations_rider_id ON rider_locations(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_locations_updated_at ON rider_locations(updated_at);

-- ============================================================================
-- 2. 배달 알림 기록 테이블 (order_delivery_notifications)
-- ============================================================================

-- 배달 근접 알림 중복 발송 방지용 기록 테이블
CREATE TABLE IF NOT EXISTS order_delivery_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  notified_500m BOOLEAN NOT NULL DEFAULT false, -- 500m 이내 알림 발송 여부
  notified_100m BOOLEAN NOT NULL DEFAULT false, -- 100m 이내 알림 발송 여부
  notified_500m_at TIMESTAMPTZ, -- 500m 알림 발송 시간
  notified_100m_at TIMESTAMPTZ, -- 100m 알림 발송 시간
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 주문당 하나의 레코드만 유지
  CONSTRAINT order_delivery_notifications_order_id_unique UNIQUE (order_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_order_delivery_notifications_order_id
  ON order_delivery_notifications(order_id);

-- ============================================================================
-- 3. 주문 상태 히스토리 테이블 (order_status_history)
-- ============================================================================

-- 주문 상태 변경 이력 (이미 존재하지 않을 경우에만 생성)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at
  ON order_status_history(created_at);

-- ============================================================================
-- 4. RLS 정책 설정
-- ============================================================================

-- rider_locations RLS 활성화
ALTER TABLE rider_locations ENABLE ROW LEVEL SECURITY;

-- 라이더 본인만 자신의 위치 관리 가능
CREATE POLICY "Riders can manage own location" ON rider_locations
  FOR ALL USING (auth.uid() = rider_id);

-- 배달 중인 주문의 고객은 라이더 위치 조회 가능
CREATE POLICY "Customers can view rider location for their orders" ON rider_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.rider_id = rider_locations.rider_id
        AND o.user_id = auth.uid()
        AND o.status IN ('picked_up', 'delivering')
    )
  );

-- order_delivery_notifications RLS 활성화
ALTER TABLE order_delivery_notifications ENABLE ROW LEVEL SECURITY;

-- 시스템만 관리 가능 (서비스 역할 키로)
CREATE POLICY "System can manage delivery notifications" ON order_delivery_notifications
  FOR ALL USING (true);

-- order_status_history RLS 활성화
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 주문 관련자만 히스토리 조회 가능
CREATE POLICY "Order participants can view status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id
        AND (
          o.user_id = auth.uid()
          OR o.rider_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM restaurants r
            WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid()
          )
        )
    )
  );

-- ============================================================================
-- 5. 실시간 구독을 위한 Publication 설정
-- ============================================================================

-- 실시간 구독 대상 테이블들을 publication에 추가
-- (Supabase에서 자동으로 설정되지만 명시적으로 추가)
DO $$
BEGIN
  -- rider_locations를 realtime publication에 추가
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rider_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rider_locations;
  END IF;

  -- orders를 realtime publication에 추가
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;

-- ============================================================================
-- 6. 트리거: 주문 상태 변경 시 히스토리 자동 기록
-- ============================================================================

CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 변경된 경우에만 기록
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by,
      created_at
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하면 교체)
DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION record_order_status_change();

-- ============================================================================
-- 7. 함수: 배달 완료 시 알림 기록 정리
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_delivery_notification_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- 배달 완료 상태로 변경 시 알림 기록 삭제 (선택적)
  IF NEW.status = 'delivered' AND OLD.status = 'delivering' THEN
    DELETE FROM order_delivery_notifications WHERE order_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_delivery_complete ON orders;
CREATE TRIGGER on_delivery_complete
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_delivery_notification_on_complete();

-- ============================================================================
-- 8. riders 테이블에 current_lat, current_lng 컬럼 확인/추가
-- ============================================================================

DO $$
BEGIN
  -- current_lat 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'riders' AND column_name = 'current_lat'
  ) THEN
    ALTER TABLE riders ADD COLUMN current_lat FLOAT;
  END IF;

  -- current_lng 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'riders' AND column_name = 'current_lng'
  ) THEN
    ALTER TABLE riders ADD COLUMN current_lng FLOAT;
  END IF;
END $$;

COMMENT ON TABLE rider_locations IS '라이더 실시간 위치 정보 (최신 위치만 유지)';
COMMENT ON TABLE order_delivery_notifications IS '배달 근접 알림 발송 기록 (중복 방지용)';
COMMENT ON TABLE order_status_history IS '주문 상태 변경 이력';
