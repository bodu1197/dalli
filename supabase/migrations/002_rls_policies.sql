-- DALLIGO Row Level Security (RLS) 정책
-- 실행 순서: 001_initial_schema.sql 실행 후 이 파일 실행
--
-- 성능 최적화: auth.uid() 대신 (select auth.uid()) 사용
-- PostgreSQL은 (select auth.uid())를 서브쿼리로 처리하여 initplan으로 한 번만 실행
-- auth.uid()를 직접 사용하면 각 행마다 함수가 실행되어 성능 저하

-- ================================================
-- RLS 활성화
-- ================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ================================================
-- users 테이블 정책
-- ================================================

-- 자신의 프로필 조회
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING ((select auth.uid()) = id);

-- 자신의 프로필 수정
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING ((select auth.uid()) = id);

-- 회원가입 시 프로필 생성
CREATE POLICY "Users can create own profile"
ON users FOR INSERT
WITH CHECK ((select auth.uid()) = id);

-- ================================================
-- addresses 테이블 정책
-- 통합: SELECT와 ALL 정책 중복 제거 -> ALL만 사용
-- ================================================

-- 자신의 주소 전체 관리 (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
USING ((select auth.uid()) = user_id);

-- ================================================
-- categories 테이블 정책
-- ================================================

-- 누구나 카테고리 조회 가능
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- ================================================
-- restaurants 테이블 정책
-- 통합: 공개 조회와 점주 관리 분리
-- ================================================

-- 누구나 식당 조회 가능
CREATE POLICY "Anyone can view restaurants"
ON restaurants FOR SELECT
USING (true);

-- 점주만 자신의 식당 INSERT/UPDATE/DELETE
CREATE POLICY "Owners can manage own restaurant"
ON restaurants FOR INSERT
WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can update own restaurant"
ON restaurants FOR UPDATE
USING ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can delete own restaurant"
ON restaurants FOR DELETE
USING ((select auth.uid()) = owner_id);

-- ================================================
-- menus 테이블 정책
-- 통합: 공개 조회와 점주 관리 분리
-- ================================================

-- 누구나 메뉴 조회 가능
CREATE POLICY "Anyone can view menus"
ON menus FOR SELECT
USING (true);

-- 점주만 자신의 메뉴 INSERT/UPDATE/DELETE
CREATE POLICY "Owners can insert menus"
ON menus FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = menus.restaurant_id
    )
);

CREATE POLICY "Owners can update menus"
ON menus FOR UPDATE
USING (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = menus.restaurant_id
    )
);

CREATE POLICY "Owners can delete menus"
ON menus FOR DELETE
USING (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = menus.restaurant_id
    )
);

-- ================================================
-- menu_option_groups 테이블 정책
-- ================================================

-- 누구나 옵션 그룹 조회 가능
CREATE POLICY "Anyone can view menu option groups"
ON menu_option_groups FOR SELECT
USING (true);

-- 점주만 옵션 그룹 INSERT/UPDATE/DELETE
CREATE POLICY "Owners can insert menu option groups"
ON menu_option_groups FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT r.owner_id
        FROM restaurants r
        JOIN menus m ON m.restaurant_id = r.id
        WHERE m.id = menu_option_groups.menu_id
    )
);

CREATE POLICY "Owners can update menu option groups"
ON menu_option_groups FOR UPDATE
USING (
    (select auth.uid()) IN (
        SELECT r.owner_id
        FROM restaurants r
        JOIN menus m ON m.restaurant_id = r.id
        WHERE m.id = menu_option_groups.menu_id
    )
);

CREATE POLICY "Owners can delete menu option groups"
ON menu_option_groups FOR DELETE
USING (
    (select auth.uid()) IN (
        SELECT r.owner_id
        FROM restaurants r
        JOIN menus m ON m.restaurant_id = r.id
        WHERE m.id = menu_option_groups.menu_id
    )
);

-- ================================================
-- menu_options 테이블 정책
-- ================================================

-- 누구나 옵션 조회 가능
CREATE POLICY "Anyone can view menu options"
ON menu_options FOR SELECT
USING (true);

-- 점주만 옵션 INSERT/UPDATE/DELETE
CREATE POLICY "Owners can insert menu options"
ON menu_options FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT r.owner_id
        FROM restaurants r
        JOIN menus m ON m.restaurant_id = r.id
        JOIN menu_option_groups og ON og.menu_id = m.id
        WHERE og.id = menu_options.option_group_id
    )
);

CREATE POLICY "Owners can update menu options"
ON menu_options FOR UPDATE
USING (
    (select auth.uid()) IN (
        SELECT r.owner_id
        FROM restaurants r
        JOIN menus m ON m.restaurant_id = r.id
        JOIN menu_option_groups og ON og.menu_id = m.id
        WHERE og.id = menu_options.option_group_id
    )
);

CREATE POLICY "Owners can delete menu options"
ON menu_options FOR DELETE
USING (
    (select auth.uid()) IN (
        SELECT r.owner_id
        FROM restaurants r
        JOIN menus m ON m.restaurant_id = r.id
        JOIN menu_option_groups og ON og.menu_id = m.id
        WHERE og.id = menu_options.option_group_id
    )
);

-- ================================================
-- riders 테이블 정책
-- ================================================

-- 자신의 라이더 정보 조회
CREATE POLICY "Riders can view own info"
ON riders FOR SELECT
USING ((select auth.uid()) = user_id);

-- 자신의 라이더 정보 수정
CREATE POLICY "Riders can update own info"
ON riders FOR UPDATE
USING ((select auth.uid()) = user_id);

-- 라이더 등록
CREATE POLICY "Users can register as rider"
ON riders FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- ================================================
-- orders 테이블 정책
-- 통합: 여러 SELECT 정책을 하나로 합침
-- ================================================

-- 주문 조회: 고객/점주/라이더 통합
CREATE POLICY "Related users can view orders"
ON orders FOR SELECT
USING (
    (select auth.uid()) = user_id
    OR (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = orders.restaurant_id
    )
    OR (select auth.uid()) IN (
        SELECT user_id FROM riders WHERE id = orders.rider_id
    )
);

-- 고객: 주문 생성
CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- 주문 업데이트: 고객(취소)/점주/라이더
CREATE POLICY "Related users can update orders"
ON orders FOR UPDATE
USING (
    (select auth.uid()) = user_id
    OR (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = orders.restaurant_id
    )
    OR (select auth.uid()) IN (
        SELECT user_id FROM riders WHERE id = orders.rider_id
    )
);

-- ================================================
-- order_items 테이블 정책
-- ================================================

-- 주문 관련자만 조회
CREATE POLICY "Related users can view order items"
ON order_items FOR SELECT
USING (
    (select auth.uid()) IN (
        SELECT user_id FROM orders WHERE id = order_items.order_id
    )
    OR (select auth.uid()) IN (
        SELECT r.owner_id FROM restaurants r
        JOIN orders o ON o.restaurant_id = r.id
        WHERE o.id = order_items.order_id
    )
);

-- 주문 생성 시 항목 추가
CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT user_id FROM orders WHERE id = order_items.order_id
    )
);

-- ================================================
-- reviews 테이블 정책
-- ================================================

-- 누구나 리뷰 조회 가능
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- 자신의 리뷰만 작성
CREATE POLICY "Users can create own reviews"
ON reviews FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- 리뷰 수정: 작성자 또는 점주(답글)
CREATE POLICY "Users and owners can update reviews"
ON reviews FOR UPDATE
USING (
    (select auth.uid()) = user_id
    OR (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = reviews.restaurant_id
    )
);

-- 자신의 리뷰만 삭제
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING ((select auth.uid()) = user_id);

-- ================================================
-- advertisements 테이블 정책
-- ================================================

-- 점주: 자신의 광고만 조회
CREATE POLICY "Owners can view own ads"
ON advertisements FOR SELECT
USING (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = advertisements.restaurant_id
    )
);

-- 점주: 광고 생성
CREATE POLICY "Owners can create ads"
ON advertisements FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = advertisements.restaurant_id
    )
);

-- ================================================
-- settlements 테이블 정책
-- ================================================

-- 점주/라이더: 자신의 정산만 조회
CREATE POLICY "Related users can view settlements"
ON settlements FOR SELECT
USING (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = settlements.restaurant_id
    )
    OR (select auth.uid()) IN (
        SELECT user_id FROM riders WHERE id = settlements.rider_id
    )
);

-- ================================================
-- coupons 테이블 정책
-- ================================================

-- 누구나 활성 쿠폰 조회 가능
CREATE POLICY "Anyone can view active coupons"
ON coupons FOR SELECT
USING (is_active = true AND end_date > NOW());

-- 점주: 자신의 가게 쿠폰 INSERT/UPDATE/DELETE
CREATE POLICY "Owners can insert coupons"
ON coupons FOR INSERT
WITH CHECK (
    restaurant_id IS NOT NULL AND
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = coupons.restaurant_id
    )
);

CREATE POLICY "Owners can update coupons"
ON coupons FOR UPDATE
USING (
    restaurant_id IS NOT NULL AND
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = coupons.restaurant_id
    )
);

CREATE POLICY "Owners can delete coupons"
ON coupons FOR DELETE
USING (
    restaurant_id IS NOT NULL AND
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = coupons.restaurant_id
    )
);

-- ================================================
-- user_coupons 테이블 정책
-- ================================================

-- 자신의 쿠폰만 조회
CREATE POLICY "Users can view own coupons"
ON user_coupons FOR SELECT
USING ((select auth.uid()) = user_id);

-- 자신의 쿠폰 다운로드
CREATE POLICY "Users can download coupons"
ON user_coupons FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- ================================================
-- favorites 테이블 정책
-- ================================================

-- 자신의 찜 목록만 조회/관리
CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
USING ((select auth.uid()) = user_id);

-- ================================================
-- notifications 테이블 정책
-- ================================================

-- 자신의 알림만 조회/관리
CREATE POLICY "Users can manage own notifications"
ON notifications FOR ALL
USING ((select auth.uid()) = user_id);

-- ================================================
-- chat_rooms 테이블 정책
-- ================================================

-- 참여한 채팅방만 조회
CREATE POLICY "Users can view joined chat rooms"
ON chat_rooms FOR SELECT
USING (
    id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

-- ================================================
-- chat_participants 테이블 정책
-- ================================================

-- 자신이 참여한 채팅방 참여자 정보 조회
CREATE POLICY "Users can view chat participants"
ON chat_participants FOR SELECT
USING (
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

-- ================================================
-- chat_messages 테이블 정책
-- ================================================

-- 참여한 채팅방의 메시지만 조회
CREATE POLICY "Users can view chat messages"
ON chat_messages FOR SELECT
USING (
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

-- 참여한 채팅방에만 메시지 전송
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (
    (select auth.uid()) = sender_id AND
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

-- ================================================
-- 완료 메시지
-- ================================================
SELECT 'DALLIGO RLS 정책 설정 완료! (성능 최적화 적용)' as message;
