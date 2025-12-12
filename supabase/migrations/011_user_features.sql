-- ================================================
-- DALLIGO 사용자 기능 확장 스키마
-- 최근 본 가게, 결제 수단, 고객센터 (FAQ, 문의)
-- ================================================

-- ================================================
-- 1. 최근 본 가게 테이블 (recent_views)
-- ================================================
CREATE TABLE IF NOT EXISTS recent_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 1,

  -- 동일 사용자-식당 조합은 유일해야 함 (업데이트 방식)
  UNIQUE(user_id, restaurant_id)
);

-- 인덱스: 사용자별 최근 조회 정렬
CREATE INDEX IF NOT EXISTS idx_recent_views_user_time
  ON recent_views(user_id, viewed_at DESC);

-- 인덱스: 오래된 데이터 정리용
CREATE INDEX IF NOT EXISTS idx_recent_views_viewed_at
  ON recent_views(viewed_at);

-- 최근 본 가게 기록/업데이트 함수 (UPSERT)
CREATE OR REPLACE FUNCTION upsert_recent_view(
  p_user_id UUID,
  p_restaurant_id UUID
)
RETURNS recent_views AS $$
DECLARE
  v_result recent_views;
BEGIN
  INSERT INTO recent_views (user_id, restaurant_id, viewed_at, view_count)
  VALUES (p_user_id, p_restaurant_id, NOW(), 1)
  ON CONFLICT (user_id, restaurant_id)
  DO UPDATE SET
    viewed_at = NOW(),
    view_count = recent_views.view_count + 1
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 오래된 최근 본 기록 정리 함수 (30일 이상)
CREATE OR REPLACE FUNCTION cleanup_old_recent_views()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM recent_views
    WHERE viewed_at < NOW() - INTERVAL '30 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 2. 결제 수단 테이블 (payment_methods)
-- ================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 결제 수단 타입
  type TEXT NOT NULL CHECK (type IN ('card', 'kakaopay', 'naverpay', 'tosspay', 'payco', 'samsungpay', 'applepay')),

  -- 카드 정보 (카드 타입일 경우)
  card_company TEXT, -- 신한, 삼성, 현대, KB국민, 롯데, 하나, 우리, NH농협, BC, 씨티
  card_type TEXT CHECK (card_type IN ('credit', 'debit', 'prepaid')), -- 신용, 체크, 선불
  card_number_last4 TEXT, -- 마지막 4자리
  card_holder_name TEXT, -- 카드 소유자명

  -- 간편결제 정보
  easy_pay_account TEXT, -- 간편결제 연결 계정 (마스킹)

  -- 빌링키 (실제 결제용 - 암호화 저장)
  billing_key TEXT, -- PG사에서 발급받은 빌링키
  pg_provider TEXT, -- 토스페이먼츠, KG이니시스 등

  -- 상태
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- 메타데이터
  nickname TEXT, -- 사용자 지정 별칭
  color TEXT DEFAULT '#1a1a1a', -- 카드 색상 (UI용)

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  -- 만료일 (카드)
  expires_at DATE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_payment_methods_user
  ON payment_methods(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default
  ON payment_methods(user_id, is_default) WHERE is_default = true;

-- 기본 결제 수단 설정 함수 (다른 것들은 false로)
CREATE OR REPLACE FUNCTION set_default_payment_method(
  p_user_id UUID,
  p_payment_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 모든 결제 수단 is_default를 false로
  UPDATE payment_methods
  SET is_default = false, updated_at = NOW()
  WHERE user_id = p_user_id AND is_default = true;

  -- 선택한 결제 수단만 true로
  UPDATE payment_methods
  SET is_default = true, updated_at = NOW()
  WHERE id = p_payment_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 결제 수단 사용 기록 업데이트 함수
CREATE OR REPLACE FUNCTION update_payment_method_usage(p_payment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE payment_methods
  SET last_used_at = NOW(), updated_at = NOW()
  WHERE id = p_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 3. FAQ 카테고리 테이블 (faq_categories)
-- ================================================
CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 FAQ 카테고리 삽입
INSERT INTO faq_categories (name, slug, icon, sort_order) VALUES
  ('주문/결제', 'order-payment', '💳', 1),
  ('배달', 'delivery', '🛵', 2),
  ('포인트/쿠폰', 'point-coupon', '🎁', 3),
  ('계정', 'account', '👤', 4),
  ('환불/취소', 'refund', '↩️', 5),
  ('기타', 'etc', '❓', 99)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- 4. FAQ 테이블 (faqs)
-- ================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,

  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- 검색 최적화
  search_keywords TEXT[], -- 검색 키워드 배열

  -- 통계
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- 상태
  is_pinned BOOLEAN DEFAULT false, -- 상단 고정
  is_active BOOLEAN DEFAULT true,

  -- 정렬
  sort_order INTEGER DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_faqs_category
  ON faqs(category_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_search
  ON faqs USING gin(search_keywords);
CREATE INDEX IF NOT EXISTS idx_faqs_pinned
  ON faqs(is_pinned DESC, sort_order) WHERE is_active = true;

-- 전문 검색 인덱스 (한글 지원)
CREATE INDEX IF NOT EXISTS idx_faqs_question_search
  ON faqs USING gin(to_tsvector('simple', question));
CREATE INDEX IF NOT EXISTS idx_faqs_answer_search
  ON faqs USING gin(to_tsvector('simple', answer));

-- FAQ 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_faq_view(p_faq_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE faqs SET view_count = view_count + 1 WHERE id = p_faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FAQ 도움됨/안됨 피드백 함수
CREATE OR REPLACE FUNCTION faq_feedback(
  p_faq_id UUID,
  p_helpful BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF p_helpful THEN
    UPDATE faqs SET helpful_count = helpful_count + 1 WHERE id = p_faq_id;
  ELSE
    UPDATE faqs SET not_helpful_count = not_helpful_count + 1 WHERE id = p_faq_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기본 FAQ 데이터 삽입
INSERT INTO faqs (category_id, question, answer, search_keywords, sort_order) VALUES
-- 주문/결제
((SELECT id FROM faq_categories WHERE slug = 'order-payment'),
 '주문 취소는 어떻게 하나요?',
 '주문 취소는 가게에서 주문을 접수하기 전까지 가능합니다.\n\n📱 취소 방법:\n1. 주문내역에서 해당 주문을 선택합니다\n2. ''주문 취소'' 버튼을 누릅니다\n3. 취소 사유를 선택하고 확인합니다\n\n⚠️ 주의사항:\n- 가게에서 조리를 시작한 경우 취소가 불가능할 수 있습니다\n- 취소된 결제 금액은 결제 수단에 따라 3~5 영업일 내 환불됩니다',
 ARRAY['주문취소', '취소', '환불', '주문', '취소방법'],
 1),

((SELECT id FROM faq_categories WHERE slug = 'order-payment'),
 '결제 수단을 변경하고 싶어요',
 '결제 수단은 마이페이지에서 관리할 수 있습니다.\n\n📱 변경 방법:\n1. 마이페이지 > 결제 수단 관리로 이동합니다\n2. 새로운 카드를 등록하거나 간편결제를 연동합니다\n3. 기본 결제 수단으로 설정하려면 ''기본으로 설정''을 누릅니다\n\n💳 지원 결제 수단:\n- 신용/체크카드\n- 카카오페이, 네이버페이, 토스페이\n- 삼성페이, 애플페이',
 ARRAY['결제수단', '카드등록', '결제', '카드변경', '간편결제'],
 2),

((SELECT id FROM faq_categories WHERE slug = 'order-payment'),
 '주문 금액이 다르게 결제됐어요',
 '결제 금액이 예상과 다른 경우 아래 사항을 확인해 주세요.\n\n🔍 확인 사항:\n1. 쿠폰/포인트 적용 여부\n2. 배달팁 변동 (거리, 날씨, 시간대에 따라 달라질 수 있음)\n3. 메뉴 옵션 추가 금액\n4. 최소 주문 금액 미달 시 추가 배달비\n\n📞 금액 오류가 확실한 경우:\n고객센터(1600-0000)로 문의해 주시면 확인 후 차액을 환불해 드립니다.',
 ARRAY['결제금액', '금액오류', '결제차이', '환불'],
 3),

-- 배달
((SELECT id FROM faq_categories WHERE slug = 'delivery'),
 '배달이 늦어지면 어떻게 하나요?',
 '예상 배달 시간보다 늦어지는 경우 다음과 같이 확인해 주세요.\n\n📍 실시간 확인:\n- 주문 상세 페이지에서 라이더 위치를 실시간으로 확인할 수 있습니다\n- 예상 도착 시간도 실시간으로 업데이트됩니다\n\n⏰ 30분 이상 지연 시:\n1. 앱 내 채팅으로 라이더에게 문의\n2. 고객센터(1600-0000)로 연락\n\n🎁 지연 보상:\n- 예상 시간 대비 30분 이상 지연 시 포인트 보상이 제공될 수 있습니다',
 ARRAY['배달지연', '늦음', '배달시간', '지연'],
 1),

((SELECT id FROM faq_categories WHERE slug = 'delivery'),
 '배달 주소를 잘못 입력했어요',
 '주문 후 배달 주소 변경은 아래와 같이 처리됩니다.\n\n⚡ 빠른 조치:\n1. 즉시 가게에 연락 (주문 상세 > 가게 전화)\n2. 또는 고객센터(1600-0000) 연락\n\n⚠️ 주의사항:\n- 조리 시작 전: 주소 변경 가능\n- 조리 중/배달 중: 추가 배달비 발생 가능\n- 배달 완료 후: 변경 불가\n\n💡 팁:\n마이페이지 > 주소 관리에서 자주 쓰는 주소를 미리 등록해두세요!',
 ARRAY['주소변경', '주소오류', '배달주소', '잘못입력'],
 2),

-- 포인트/쿠폰
((SELECT id FROM faq_categories WHERE slug = 'point-coupon'),
 '포인트는 어떻게 사용하나요?',
 '포인트는 주문 시 현금처럼 사용할 수 있습니다.\n\n💰 사용 조건:\n- 최소 1,000포인트 이상부터 사용 가능\n- 결제 금액의 최대 30%까지 사용 가능\n- 1포인트 = 1원\n\n📱 사용 방법:\n1. 결제 단계에서 ''포인트 사용'' 클릭\n2. 사용할 포인트 입력 (또는 전액 사용)\n3. 결제 진행\n\n⚠️ 유의사항:\n- 포인트는 적립일로부터 1년간 유효합니다\n- 주문 취소 시 사용한 포인트는 즉시 복구됩니다',
 ARRAY['포인트사용', '포인트', '적립금', '사용방법'],
 1),

((SELECT id FROM faq_categories WHERE slug = 'point-coupon'),
 '쿠폰 사용 조건이 궁금해요',
 '쿠폰마다 사용 조건이 다릅니다.\n\n📋 확인 방법:\n마이페이지 > 쿠폰함에서 쿠폰 클릭 시 상세 조건 확인 가능\n\n🎫 일반적인 조건:\n- 최소 주문금액: 쿠폰별로 다름 (예: 15,000원 이상)\n- 사용 가능 가게: 전체 또는 특정 가게\n- 유효기간: 발급일로부터 정해진 기간\n- 중복 사용: 대부분 불가 (1주문 1쿠폰)\n\n💡 팁:\n- 쿠폰은 유효기간 임박순으로 자동 정렬됩니다\n- 사용 가능한 쿠폰은 결제 시 자동으로 추천됩니다',
 ARRAY['쿠폰조건', '쿠폰사용', '쿠폰', '할인쿠폰'],
 2),

-- 계정
((SELECT id FROM faq_categories WHERE slug = 'account'),
 '비밀번호를 잊어버렸어요',
 '비밀번호 재설정은 간단하게 할 수 있습니다.\n\n🔐 재설정 방법:\n1. 로그인 화면에서 ''비밀번호 찾기'' 클릭\n2. 가입한 이메일 주소 입력\n3. 이메일로 전송된 링크 클릭\n4. 새 비밀번호 설정\n\n📧 이메일이 안 오나요?\n- 스팸함을 확인해 주세요\n- 5분 후에도 안 오면 ''재전송'' 버튼 클릭\n- 가입한 이메일이 맞는지 확인해 주세요\n\n📱 소셜 로그인 사용자:\n카카오/네이버/구글 로그인 사용자는 해당 서비스에서 비밀번호를 변경해 주세요.',
 ARRAY['비밀번호', '비번찾기', '로그인', '비밀번호재설정'],
 1),

((SELECT id FROM faq_categories WHERE slug = 'account'),
 '회원 탈퇴는 어떻게 하나요?',
 '회원 탈퇴는 설정에서 직접 진행할 수 있습니다.\n\n📱 탈퇴 방법:\n1. 마이페이지 > 설정\n2. 회원탈퇴 메뉴 선택\n3. 탈퇴 사유 선택\n4. 본인 확인 후 탈퇴 완료\n\n⚠️ 탈퇴 시 삭제되는 정보:\n- 보유 포인트 (전액 소멸)\n- 보유 쿠폰 (전액 소멸)\n- 주문 내역\n- 리뷰 및 찜 목록\n- 결제 수단 정보\n\n❗ 중요:\n- 삭제된 정보는 복구가 불가능합니다\n- 진행 중인 주문이 있으면 탈퇴할 수 없습니다\n- 동일 이메일로 재가입 시 기존 정보는 복원되지 않습니다',
 ARRAY['회원탈퇴', '탈퇴', '계정삭제', '탈퇴방법'],
 2),

-- 환불/취소
((SELECT id FROM faq_categories WHERE slug = 'refund'),
 '환불은 언제 되나요?',
 '환불 소요 시간은 결제 수단에 따라 다릅니다.\n\n💳 결제 수단별 환불 기간:\n\n• 신용카드: 3~5 영업일\n  - 카드사 승인 취소 후 청구서에서 차감\n\n• 체크카드: 3~5 영업일\n  - 계좌로 직접 환불\n\n• 카카오페이/네이버페이: 즉시~1영업일\n  - 해당 페이 잔액으로 환불\n\n• 토스페이: 즉시~1영업일\n  - 토스머니로 환불\n\n• 포인트 사용분: 즉시\n  - 포인트로 즉시 복구\n\n📞 환불이 지연되는 경우:\n고객센터(1600-0000)로 문의해 주세요.',
 ARRAY['환불', '환불기간', '환불시간', '취소환불'],
 1)

ON CONFLICT DO NOTHING;

-- ================================================
-- 5. 고객 문의 테이블 (inquiries)
-- ================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 문의 분류
  category TEXT NOT NULL CHECK (category IN (
    'order', 'delivery', 'payment', 'refund', 'account', 'suggestion', 'complaint', 'etc'
  )),

  -- 관련 주문 (선택)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- 문의 내용
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- 첨부 이미지 (최대 5개)
  images TEXT[] DEFAULT '{}',

  -- 상태
  status TEXT NOT NULL CHECK (status IN (
    'pending',      -- 답변 대기
    'in_progress',  -- 처리 중
    'answered',     -- 답변 완료
    'closed'        -- 종료
  )) DEFAULT 'pending',

  -- 답변
  answer TEXT,
  answered_by UUID REFERENCES users(id),
  answered_at TIMESTAMPTZ,

  -- 만족도 평가
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_comment TEXT,

  -- 우선순위 (관리자용)
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_inquiries_user
  ON inquiries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status
  ON inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_order
  ON inquiries(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_priority
  ON inquiries(priority, status, created_at) WHERE status IN ('pending', 'in_progress');

-- 문의 답변 함수
CREATE OR REPLACE FUNCTION answer_inquiry(
  p_inquiry_id UUID,
  p_answer TEXT,
  p_admin_id UUID
)
RETURNS inquiries AS $$
DECLARE
  v_result inquiries;
BEGIN
  UPDATE inquiries SET
    answer = p_answer,
    answered_by = p_admin_id,
    answered_at = NOW(),
    status = 'answered',
    updated_at = NOW()
  WHERE id = p_inquiry_id
  RETURNING * INTO v_result;

  -- 알림 생성 (notifications 테이블 사용)
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT
    v_result.user_id,
    'inquiry_answered',
    '문의 답변 완료',
    '고객님의 문의에 답변이 등록되었습니다.',
    jsonb_build_object('inquiry_id', p_inquiry_id);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 6. RLS 정책
-- ================================================

-- recent_views RLS
ALTER TABLE recent_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recent views" ON recent_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recent views" ON recent_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recent views" ON recent_views
  FOR DELETE USING (auth.uid() = user_id);

-- payment_methods RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- faq_categories RLS (공개 읽기)
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active faq categories" ON faq_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage faq categories" ON faq_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- faqs RLS (공개 읽기)
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active faqs" ON faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage faqs" ON faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- inquiries RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update inquiries" ON inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 7. 트리거
-- ================================================

-- payment_methods 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

-- inquiries 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- faqs 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faqs_updated_at();
