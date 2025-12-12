# 달리고(Dalli) 플랫폼 프로덕션 준비 점검 보고서

## 📊 점검 결과 요약

| 구분 | 상태 | 세부 사항 |
|------|------|----------|
| 고객 앱 | ⚠️ 일부 미구현 | 6개 페이지 누락 |
| 점주 앱 | ⛔ Mock 데이터 | 전체 Mock 사용 |
| 라이더 앱 | ⛔ Mock 데이터 | 전체 Mock 사용 |
| 관리자 | ✅ 대부분 완료 | 일부 페이지 Mock |
| 결제 시스템 | ⛔ 미구현 | PG 연동 필요 |
| 푸시 알림 | ⚠️ 테이블만 존재 | 실제 전송 미구현 |

---

## 🔴 Critical: 배달앱 필수 기능 미구현

### 1. 결제 시스템 (PG 연동)
**현재 상태**: 결제 UI만 존재, 실제 PG 연동 없음

**필요 작업**:
- 토스페이먼츠/이니시스/카카오페이 연동
- 결제 승인/취소 API 구현
- 결제 실패 복구 로직
- `src/lib/services/payment.service.ts` 생성 필요

**관련 파일**:
- `src/app/(customer)/checkout/page.tsx` - 결제 페이지 (UI만)

---

### 2. 실시간 주문 상태 업데이트
**현재 상태**: Supabase Realtime 구독 코드 일부 존재

**필요 작업**:
- 주문 생성 → 가게 알림 → 라이더 매칭 플로우 완성
- WebSocket 기반 실시간 위치 추적
- 라이더 위치 공유 기능

---

### 3. 푸시 알림
**현재 상태**: `push_tokens` 테이블 존재, 전송 로직 없음

**필요 작업**:
- Firebase Cloud Messaging (FCM) 연동
- Edge Function으로 푸시 전송 구현
- 알림 유형별 템플릿

---

### 4. 라이더 매칭 시스템
**현재 상태**: 라이더 UI만 존재, 매칭 로직 없음

**필요 작업**:
- 주문 발생 시 인근 라이더 탐색
- 수락/거절 처리
- 배달료 자동 계산

---

## 🟡 Warning: 존재하지 않는 페이지 (링크만 있음)

### 마이페이지에서 연결된 미구현 페이지들:

| 링크 경로 | 설명 | 상태 |
|----------|------|------|
| `/my/recent` | 최근 본 가게 | ❌ 페이지 없음 |
| `/my/payments` | 결제 수단 관리 | ❌ 페이지 없음 |
| `/support` | 고객센터 | ❌ 페이지 없음 |
| `/settings/security` | 보안 설정 | ❌ 페이지 없음 |
| `/settings/withdraw` | 회원탈퇴 | ❌ 페이지 없음 |
| `/terms` | 이용약관 | ❌ 페이지 없음 |
| `/privacy` | 개인정보처리방침 | ❌ 페이지 없음 |

---

## 🟠 Mock 데이터 사용 중인 페이지 (실제 DB 연동 필요)

### 점주 앱 (Owner)
| 페이지 | 파일 | Mock 변수 |
|-------|------|----------|
| 대시보드 | `/owner/page.tsx` | `MOCK_STATS`, `MOCK_RECENT_ORDERS` |
| 가게 정보 | `/owner/store/page.tsx` | `MOCK_STORE` |
| 통계 | `/owner/stats/page.tsx` | `MOCK_TODAY`, `MOCK_WEEKLY`, `MOCK_POPULAR` |
| 리뷰 관리 | `/owner/reviews/page.tsx` | `MOCK_REVIEWS` |
| 주문 관리 | `/owner/orders/page.tsx` | (확인 필요) |
| 메뉴 관리 | `/owner/menus/page.tsx` | (확인 필요) |

### 라이더 앱 (Rider)
| 페이지 | 파일 | Mock 변수 |
|-------|------|----------|
| 대시보드 | `/rider/page.tsx` | `MOCK_TODAY`, `MOCK_REQUESTS` |
| 배달 요청 | `/rider/requests/page.tsx` | `MOCK_REQUESTS` |
| 요청 상세 | `/rider/requests/[id]/page.tsx` | `MOCK_REQUEST` |
| 배달 진행 | `/rider/delivery/[id]/page.tsx` | `MOCK_DELIVERY` |
| 수입 내역 | `/rider/earnings/page.tsx` | `MOCK_WEEKLY_STATS`, `MOCK_DAILY_EARNINGS` |
| 배달 이력 | `/rider/history/page.tsx` | `MOCK_HISTORY` |

### 고객 앱 (Customer)
| 페이지 | 파일 | Mock 변수 |
|-------|------|----------|
| 찜 목록 | `/my/favorites/page.tsx` | `MOCK_FAVORITES` |

### 관리자 (Admin)
| 페이지 | 파일 | Mock 변수 |
|-------|------|----------|
| 대시보드 활동 | `AdminDashboardClient.tsx` | `MOCK_ACTIVITIES` |
| 배너 관리 | `/admin/banners/page.tsx` | (확인 필요) |
| 이벤트 관리 | `/admin/events/page.tsx` | (확인 필요) |

---

## 🟢 구현 완료된 핵심 기능

### 고객 앱
- ✅ 회원가입/로그인 (Supabase Auth)
- ✅ 카테고리별 가게 목록
- ✅ 가게 상세 및 메뉴 보기
- ✅ 장바구니
- ✅ 주문 내역 조회
- ✅ 주소 관리
- ✅ 쿠폰함
- ✅ 포인트
- ✅ 알림 설정

### 관리자
- ✅ 대시보드 통계 (실제 DB)
- ✅ 회원 관리 (목록/상세)
- ✅ 가게 관리 (목록/상세)
- ✅ 주문 관리 (목록/상세/취소)
- ✅ 세금계산서 시스템 (DB 연동 필요)

---

## 📋 우선순위별 작업 목록

### Phase 1: 즉시 수정 (배포 전 필수)
1. [ ] 결제 시스템 PG 연동
2. [ ] 누락 페이지 생성 (terms, privacy, support 등)
3. [ ] 점주 앱 실제 DB 연동
4. [ ] 라이더 앱 실제 DB 연동

### Phase 2: 핵심 기능 (운영 필수)
1. [ ] 실시간 주문 알림 (FCM)
2. [ ] 라이더 매칭 시스템
3. [ ] 정산 시스템 완성
4. [ ] 리뷰 작성 기능

### Phase 3: 고도화
1. [ ] 라이더 실시간 위치 추적
2. [ ] 쿠폰/프로모션 시스템
3. [ ] 추천 알고리즘
4. [ ] A/B 테스트

---

## 🗄️ DB 스키마 보완 필요

| 테이블 | 필요 컬럼 | 용도 |
|--------|----------|------|
| `restaurants` | `business_number` | 세금계산서 발급 |
| `restaurants` | `status` | 가게 승인/거절 |
| `users` | `status` | 회원 정지/휴면 |
| `tax_invoices` | (전체) | 세금계산서 관리 |

---

## 📁 관련 파일 위치

```
docs/
├── TAX_INVOICE_TODO.md     # 세금계산서 작업 목록 (기존)
└── PRODUCTION_AUDIT.md     # 이 문서

supabase/
└── migrations/
    └── 20241212_create_tax_invoices.sql  # 실행 필요
```
