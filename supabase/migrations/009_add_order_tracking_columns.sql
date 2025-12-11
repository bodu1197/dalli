-- 주문 추적 관련 컬럼 추가 마이그레이션
-- 009_add_order_tracking_columns.sql

-- ================================================
-- orders 테이블에 추적/타임스탬프 컬럼 추가
-- ================================================

-- 1. order_number: 주문 번호 (사용자 친화적 표시용)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- 2. 주문 진행 타임스탬프들
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;        -- 점주 확인 시간
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMPTZ;         -- 조리 완료 시간
ALTER TABLE orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;        -- 라이더 픽업 시간
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_assigned_at TIMESTAMPTZ;   -- 라이더 배정 시간

-- 3. 배달 요청사항 (special_instructions와 별개로 배달 관련 요청)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

-- ================================================
-- order_number 자동 생성 트리거
-- ================================================

-- 주문 번호 생성 함수: YYYYMMDD-XXXXX 형식
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_date TEXT;
  daily_count INTEGER;
  new_order_number TEXT;
BEGIN
  -- 오늘 날짜 (YYYYMMDD)
  today_date := TO_CHAR(NOW(), 'YYYYMMDD');

  -- 오늘 주문 수 카운트
  SELECT COUNT(*) + 1 INTO daily_count
  FROM orders
  WHERE DATE(created_at) = DATE(NOW())
    AND order_number IS NOT NULL;

  -- 주문 번호 생성 (YYYYMMDD-00001 형식)
  new_order_number := today_date || '-' || LPAD(daily_count::TEXT, 5, '0');

  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- ================================================
-- 기존 주문에 order_number 부여 (백필)
-- ================================================

-- 기존 주문들에 대해 order_number 생성
UPDATE orders
SET order_number = TO_CHAR(created_at, 'YYYYMMDD') || '-' ||
  LPAD(
    (ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at))::TEXT,
    5,
    '0'
  )
WHERE order_number IS NULL;

-- ================================================
-- 주문 상태 변경 시 타임스탬프 자동 업데이트 트리거
-- ================================================

CREATE OR REPLACE FUNCTION update_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 변경되었을 때만 처리
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      -- 점주가 주문 확인
      WHEN 'confirmed' THEN
        NEW.confirmed_at := COALESCE(NEW.confirmed_at, NOW());

      -- 조리 완료 (ready)
      WHEN 'ready' THEN
        NEW.prepared_at := COALESCE(NEW.prepared_at, NOW());

      -- 라이더 픽업
      WHEN 'picked_up' THEN
        NEW.picked_up_at := COALESCE(NEW.picked_up_at, NOW());

      -- 배달 완료
      WHEN 'delivered' THEN
        NEW.actual_delivery_time := COALESCE(NEW.actual_delivery_time, NOW());

      ELSE
        -- 다른 상태는 무시
        NULL;
    END CASE;
  END IF;

  -- rider_id가 새로 배정되었을 때
  IF OLD.rider_id IS NULL AND NEW.rider_id IS NOT NULL THEN
    NEW.rider_assigned_at := COALESCE(NEW.rider_assigned_at, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS update_order_timestamps ON orders;
CREATE TRIGGER update_order_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_timestamps();

-- ================================================
-- 인덱스 추가
-- ================================================

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_confirmed_at ON orders(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_orders_rider_assigned_at ON orders(rider_assigned_at);

-- ================================================
-- 완료 메시지
-- ================================================

SELECT '주문 추적 컬럼 추가 완료!' as message;
