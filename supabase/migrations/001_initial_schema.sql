-- DALLIGO 초기 스키마
-- 실행 순서: 이 파일을 Supabase SQL Editor에서 실행

-- ================================================
-- 0. 확장 기능 활성화
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ================================================
-- 1. 사용자 테이블 (users)
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'owner', 'rider', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. 주소 테이블 (addresses)
-- ================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT, -- 집, 회사 등
  address TEXT NOT NULL,
  detail TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 3. 카테고리 테이블 (categories)
-- ================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (name, icon, sort_order) VALUES
  ('치킨', '🍗', 1),
  ('피자', '🍕', 2),
  ('중식', '🥡', 3),
  ('한식', '🍚', 4),
  ('일식·돈까스', '🍱', 5),
  ('족발·보쌈', '🐷', 6),
  ('야식', '🌙', 7),
  ('분식', '🍜', 8),
  ('카페·디저트', '☕', 9),
  ('패스트푸드', '🍔', 10),
  ('아시안', '🍛', 11),
  ('도시락', '🍙', 12)
ON CONFLICT DO NOTHING;

-- ================================================
-- 4. 식당 테이블 (restaurants)
-- ================================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  category_id UUID REFERENCES categories(id),
  min_order_amount INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  estimated_delivery_time INTEGER DEFAULT 30, -- 분
  business_hours JSONB DEFAULT '{}', -- {"mon": {"open": "09:00", "close": "22:00"}, ...}
  is_open BOOLEAN DEFAULT true,
  rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  -- 광고 관련
  is_advertised BOOLEAN DEFAULT false,
  ad_priority INTEGER DEFAULT 0,
  ad_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 5. 메뉴 테이블 (menus)
-- ================================================
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category TEXT, -- 메뉴 카테고리 (대표, 사이드, 음료 등)
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 6. 메뉴 옵션 그룹 테이블 (menu_option_groups)
-- ================================================
CREATE TABLE IF NOT EXISTS menu_option_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 사이즈 선택, 토핑 추가 등
  is_required BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1, -- 최대 선택 가능 개수
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 7. 메뉴 옵션 테이블 (menu_options)
-- ================================================
CREATE TABLE IF NOT EXISTS menu_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_group_id UUID NOT NULL REFERENCES menu_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 8. 라이더 테이블 (riders)
-- ================================================
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'motorcycle', 'car')),
  vehicle_number TEXT,
  license_number TEXT,
  current_lat FLOAT,
  current_lng FLOAT,
  is_available BOOLEAN DEFAULT false,
  total_deliveries INTEGER DEFAULT 0,
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 9. 주문 테이블 (orders)
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  rider_id UUID REFERENCES riders(id),
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'ready',
    'picked_up', 'delivering', 'delivered', 'cancelled'
  )) DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0, -- 플랫폼 수수료
  delivery_address TEXT NOT NULL,
  delivery_detail TEXT,
  delivery_lat FLOAT NOT NULL,
  delivery_lng FLOAT NOT NULL,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  cancelled_reason TEXT,
  payment_method TEXT, -- card, kakao, toss, naver 등
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 10. 주문 항목 테이블 (order_items)
-- ================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id),
  menu_name TEXT NOT NULL, -- 스냅샷
  menu_image TEXT,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- 스냅샷 (단가)
  options JSONB DEFAULT '[]', -- 선택한 옵션 스냅샷 [{id, name, price}]
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 11. 리뷰 테이블 (reviews)
-- ================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images TEXT[], -- 이미지 URL 배열
  owner_reply TEXT,
  owner_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 12. 광고 테이블 (advertisements)
-- ================================================
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'exclusive')),
  amount INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 13. 정산 테이블 (settlements)
-- ================================================
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id),
  rider_id UUID REFERENCES riders(id),
  order_id UUID REFERENCES orders(id),
  settlement_type TEXT CHECK (settlement_type IN ('restaurant', 'rider')) NOT NULL,
  amount INTEGER NOT NULL,
  fee INTEGER DEFAULT 0, -- 수수료
  net_amount INTEGER NOT NULL, -- 실수령액
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 14. 쿠폰 테이블 (coupons)
-- ================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')) NOT NULL,
  discount_value INTEGER NOT NULL, -- 고정 금액 or 퍼센트
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER, -- 최대 할인 금액 (percentage일 때)
  restaurant_id UUID REFERENCES restaurants(id), -- NULL이면 플랫폼 쿠폰
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_quantity INTEGER, -- NULL이면 무제한
  used_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 15. 사용자 쿠폰 테이블 (user_coupons)
-- ================================================
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- ================================================
-- 16. 찜 테이블 (favorites)
-- ================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- ================================================
-- 17. 알림 테이블 (notifications)
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('order', 'review', 'coupon', 'event', 'system')) NOT NULL,
  data JSONB DEFAULT '{}', -- 추가 데이터 (order_id 등)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 18. 채팅방 테이블 (chat_rooms)
-- ================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('order', 'support')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 19. 채팅 참여자 테이블 (chat_participants)
-- ================================================
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('customer', 'owner', 'rider', 'admin')) NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- ================================================
-- 20. 채팅 메시지 테이블 (chat_messages)
-- ================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'system')) DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 인덱스 생성
-- ================================================

-- 사용자 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 주소 인덱스
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- 식당 인덱스 (위치 기반 검색)
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_advertised ON restaurants(is_advertised, ad_priority DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

-- 메뉴 인덱스
CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_available ON menus(restaurant_id, is_available);

-- 주문 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 리뷰 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(restaurant_id, rating);

-- 알림 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 찜 인덱스
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- ================================================
-- 트리거 함수: updated_at 자동 업데이트
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 트리거 함수: 리뷰 작성 시 식당 평점 업데이트
-- ================================================
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants SET
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE restaurant_id = NEW.restaurant_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE restaurant_id = NEW.restaurant_id
        )
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurant_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- ================================================
-- 트리거 함수: 광고 결제 완료 시 식당 광고 상태 업데이트
-- ================================================
CREATE OR REPLACE FUNCTION update_restaurant_ad_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'paid' AND NEW.is_active = true THEN
        UPDATE restaurants SET
            is_advertised = true,
            ad_priority = CASE NEW.plan_type
                WHEN 'exclusive' THEN 1
                WHEN 'premium' THEN 2
                WHEN 'basic' THEN 3
                ELSE 0
            END,
            ad_expires_at = NEW.end_date
        WHERE id = NEW.restaurant_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_advertisement_paid
AFTER INSERT OR UPDATE ON advertisements
FOR EACH ROW EXECUTE FUNCTION update_restaurant_ad_status();

-- ================================================
-- 플랫폼 수수료 계산 함수
-- ================================================
CREATE OR REPLACE FUNCTION calculate_platform_fee(order_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- 1만원 미만: 수수료 0원
    -- 1만원 이상: 수수료 500원 (건당 고정)
    IF order_amount < 10000 THEN
        RETURN 0;
    ELSE
        RETURN 500;
    END IF;
END;
$$ language 'plpgsql' IMMUTABLE;

-- ================================================
-- 거리 계산 함수 (미터 단위)
-- ================================================
CREATE OR REPLACE FUNCTION get_distance_meters(
    lat1 FLOAT, lng1 FLOAT,
    lat2 FLOAT, lng2 FLOAT
) RETURNS FLOAT AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lng1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng2, lat2), 4326)::geography
    );
END;
$$ language 'plpgsql' IMMUTABLE;

-- ================================================
-- 반경 내 식당 검색 함수 (광고 우선 정렬)
-- ================================================
CREATE OR REPLACE FUNCTION search_restaurants_nearby(
    user_lat FLOAT,
    user_lng FLOAT,
    radius_meters INT DEFAULT 3000,
    limit_count INT DEFAULT 20,
    category_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    lat FLOAT,
    lng FLOAT,
    distance FLOAT,
    is_advertised BOOLEAN,
    ad_priority INT,
    rating FLOAT,
    review_count INT,
    delivery_fee INT,
    estimated_delivery_time INT,
    image_url TEXT,
    category_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.address,
        r.lat,
        r.lng,
        get_distance_meters(user_lat, user_lng, r.lat, r.lng) as distance,
        r.is_advertised,
        r.ad_priority,
        r.rating,
        r.review_count,
        r.delivery_fee,
        r.estimated_delivery_time,
        r.image_url,
        r.category_id
    FROM restaurants r
    WHERE
        r.is_open = true
        AND get_distance_meters(user_lat, user_lng, r.lat, r.lng) <= radius_meters
        AND (category_filter IS NULL OR r.category_id = category_filter)
    ORDER BY
        CASE WHEN r.is_advertised AND r.ad_expires_at > NOW() THEN 0 ELSE 1 END,
        r.ad_priority DESC,
        distance ASC
    LIMIT limit_count;
END;
$$ language 'plpgsql' STABLE;

-- ================================================
-- 완료 메시지
-- ================================================
SELECT 'DALLIGO 초기 스키마 생성 완료!' as message;
