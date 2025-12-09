-- DALLIGO RLS 정책 성능 최적화 마이그레이션
-- 실행: Supabase Dashboard > SQL Editor에서 실행
--
-- 변경 사항:
-- 1. auth.uid() → (select auth.uid()) 변경 (성능 최적화)
-- 2. 중복된 permissive 정책 통합 (addresses, menus, orders, restaurants, reviews)

-- ================================================
-- 기존 정책 삭제
-- ================================================

-- users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- restaurants
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Owners can manage own restaurant" ON restaurants;

-- menus
DROP POLICY IF EXISTS "Anyone can view menus" ON menus;
DROP POLICY IF EXISTS "Owners can manage menus" ON menus;

-- menu_option_groups
DROP POLICY IF EXISTS "Anyone can view menu option groups" ON menu_option_groups;
DROP POLICY IF EXISTS "Owners can manage menu option groups" ON menu_option_groups;

-- menu_options
DROP POLICY IF EXISTS "Anyone can view menu options" ON menu_options;
DROP POLICY IF EXISTS "Owners can manage menu options" ON menu_options;

-- riders
DROP POLICY IF EXISTS "Riders can view own info" ON riders;
DROP POLICY IF EXISTS "Riders can update own info" ON riders;
DROP POLICY IF EXISTS "Users can register as rider" ON riders;

-- orders
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Owners can view restaurant orders" ON orders;
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Owners and riders can update orders" ON orders;

-- order_items
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

-- reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Owners can reply to reviews" ON reviews;

-- advertisements
DROP POLICY IF EXISTS "Owners can view own ads" ON advertisements;
DROP POLICY IF EXISTS "Owners can create ads" ON advertisements;

-- settlements
DROP POLICY IF EXISTS "Users can view own settlements" ON settlements;

-- coupons
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Owners can manage own coupons" ON coupons;

-- user_coupons
DROP POLICY IF EXISTS "Users can view own coupons" ON user_coupons;
DROP POLICY IF EXISTS "Users can download coupons" ON user_coupons;

-- favorites
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;

-- chat_rooms
DROP POLICY IF EXISTS "Users can view joined chat rooms" ON chat_rooms;

-- chat_participants
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;

-- chat_messages
DROP POLICY IF EXISTS "Users can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;

-- ================================================
-- 새 정책 생성 (성능 최적화)
-- ================================================

-- users 테이블
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING ((select auth.uid()) = id);

CREATE POLICY "Users can create own profile"
ON users FOR INSERT
WITH CHECK ((select auth.uid()) = id);

-- addresses 테이블 (통합)
CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
USING ((select auth.uid()) = user_id);

-- restaurants 테이블 (분리)
CREATE POLICY "Anyone can view restaurants"
ON restaurants FOR SELECT
USING (true);

CREATE POLICY "Owners can insert restaurant"
ON restaurants FOR INSERT
WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can update own restaurant"
ON restaurants FOR UPDATE
USING ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can delete own restaurant"
ON restaurants FOR DELETE
USING ((select auth.uid()) = owner_id);

-- menus 테이블 (분리)
CREATE POLICY "Anyone can view menus"
ON menus FOR SELECT
USING (true);

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

-- menu_option_groups 테이블
CREATE POLICY "Anyone can view menu option groups"
ON menu_option_groups FOR SELECT
USING (true);

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

-- menu_options 테이블
CREATE POLICY "Anyone can view menu options"
ON menu_options FOR SELECT
USING (true);

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

-- riders 테이블
CREATE POLICY "Riders can view own info"
ON riders FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Riders can update own info"
ON riders FOR UPDATE
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can register as rider"
ON riders FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- orders 테이블 (통합)
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

CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

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

-- order_items 테이블
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

CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT user_id FROM orders WHERE id = order_items.order_id
    )
);

-- reviews 테이블 (통합)
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create own reviews"
ON reviews FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users and owners can update reviews"
ON reviews FOR UPDATE
USING (
    (select auth.uid()) = user_id
    OR (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = reviews.restaurant_id
    )
);

CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING ((select auth.uid()) = user_id);

-- advertisements 테이블
CREATE POLICY "Owners can view own ads"
ON advertisements FOR SELECT
USING (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = advertisements.restaurant_id
    )
);

CREATE POLICY "Owners can create ads"
ON advertisements FOR INSERT
WITH CHECK (
    (select auth.uid()) IN (
        SELECT owner_id FROM restaurants WHERE id = advertisements.restaurant_id
    )
);

-- settlements 테이블
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

-- coupons 테이블
CREATE POLICY "Anyone can view active coupons"
ON coupons FOR SELECT
USING (is_active = true AND end_date > NOW());

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

-- user_coupons 테이블
CREATE POLICY "Users can view own coupons"
ON user_coupons FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can download coupons"
ON user_coupons FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- favorites 테이블
CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
USING ((select auth.uid()) = user_id);

-- notifications 테이블
CREATE POLICY "Users can manage own notifications"
ON notifications FOR ALL
USING ((select auth.uid()) = user_id);

-- chat_rooms 테이블
CREATE POLICY "Users can view joined chat rooms"
ON chat_rooms FOR SELECT
USING (
    id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

-- chat_participants 테이블
CREATE POLICY "Users can view chat participants"
ON chat_participants FOR SELECT
USING (
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

-- chat_messages 테이블
CREATE POLICY "Users can view chat messages"
ON chat_messages FOR SELECT
USING (
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = (select auth.uid())
    )
);

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
SELECT 'RLS 정책 성능 최적화 완료!' as message;
