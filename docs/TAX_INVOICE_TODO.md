# 세금계산서 시스템 - 남은 작업 (TODO)

## 완료된 작업 ✅
- [x] `tax-invoice.service.ts` - 프로덕션 서비스 레이어 (CRUD + 집계)
- [x] `AdminTaxInvoicesClient.tsx` - 관리자 UI (목록/상세/발급)
- [x] `admin/tax-invoices/page.tsx` - Server Component
- [x] `admin/tax-invoices/actions.ts` - Server Actions (발급/생성)
- [x] Dashboard에 세금계산서 메뉴 링크 추가
- [x] SQL 마이그레이션 파일 작성 (`supabase/migrations/20241212_create_tax_invoices.sql`)
- [x] Git Push 완료 (commit: `3f423ea`)

---

## 남은 작업 🔧

### 1. 데이터베이스 마이그레이션 실행 (필수)
Supabase Dashboard → SQL Editor에서 아래 파일 내용 실행:
```
supabase/migrations/20241212_create_tax_invoices.sql
```

**실행할 SQL 요약:**
- `tax_invoices` 테이블 생성
- `restaurants` 테이블에 `business_number` 컬럼 추가
- 인덱스 및 RLS 정책 설정

---

### 2. 가게 사업자등록번호 입력 UI (선택)
- 점주가 가게 등록 시 `business_number` 입력 필드 추가
- 또는 Admin이 가게 상세에서 수동 입력

**관련 파일:**
- `src/app/owner/store/page.tsx` (점주 가게 관리)
- `src/components/features/admin/AdminStoreDetailClient.tsx` (Admin 가게 상세)

---

### 3. 국세청 ASP 연동 (선택 - 실제 운영 시)
현재는 발급 시뮬레이션 상태. 실제 연동 시:

**추천 ASP:**
- 팝빌 (Popbill) - https://www.popbill.com
- 바로빌 - https://www.barobill.co.kr

**연동 위치:**
- `src/lib/services/tax-invoice.service.ts` → `issueInvoices()` 함수

**필요 작업:**
```typescript
// 현재 (시뮬레이션)
const issueId = `${now.getFullYear()}${...}` // 가짜 승인번호

// 실제 연동 시
const popbill = new PopbillClient(apiKey)
const result = await popbill.TaxInvoice.registIssue(invoiceData)
const issueId = result.ntsConfirmNum // 국세청 승인번호
```

---

### 4. 정산 수수료 계산 로직 확인
`generateMonthlyInvoices()`에서 `settlements` 테이블의 `fee` 컬럼을 합산.

**확인 필요:**
- `settlements.fee`가 플랫폼 수수료인지 확인
- 수수료 계산 기준 (주문금액의 몇 %?)

---

### 5. 이메일 자동 발송 (선택)
세금계산서 발급 후 가게 이메일로 자동 발송

**옵션:**
- Supabase Edge Functions + Resend/SendGrid
- 또는 ASP 자체 이메일 발송 기능 사용

---

## 테스트 방법
1. DB 마이그레이션 실행
2. `/admin/tax-invoices` 접속
3. "월간 집계" 클릭 → Draft 생성 확인
4. 체크박스 선택 → "발급" 클릭 → 상태 변경 확인
5. 상세보기 → 세금계산서 양식 확인

---

## 관련 파일 목록
```
src/
├── app/admin/tax-invoices/
│   ├── page.tsx          # Server Component
│   └── actions.ts        # Server Actions
├── components/features/admin/
│   └── AdminTaxInvoicesClient.tsx  # Client Component
├── lib/services/
│   └── tax-invoice.service.ts      # Business Logic
supabase/
└── migrations/
    └── 20241212_create_tax_invoices.sql  # DB Schema
```
