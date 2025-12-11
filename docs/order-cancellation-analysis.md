# 📊 달리고 플랫폼 - 주문 취소 로직 점검 보고서

> **작성일**: 2024-12-11
> **점검 대상**: 달리고 배달 플랫폼 주문 취소/환불 시스템
> **점검 결과**: ❌ **미구현 (구현률 0%)**

---

## 📋 목차

1. [점검 개요](#점검-개요)
2. [주문 취소 경우의 수](#주문-취소-경우의-수)
3. [현재 구현 상태](#현재-구현-상태)
4. [미구현 핵심 기능](#미구현-핵심-기능)
5. [구현 우선순위](#구현-우선순위)
6. [치명적인 문제점](#치명적인-문제점)
7. [즉시 구현 권장 사항](#즉시-구현-권장-사항)

---

## 점검 개요

### 점검 목적
음식 주문자가 결제 후 주문을 취소하는 경우, 시점과 상황에 따른 모든 케이스가 플랫폼에 구현되어 있는지 점검

### 점검 기준
- ✅ **구현됨**: 코드/DB/API가 모두 구현되어 동작 가능
- ⚠️ **부분 구현**: DB 스키마만 있거나 UI만 있는 경우
- ❌ **미구현**: 전혀 구현되지 않음

### 점검 결과 요약
| 항목 | 상태 | 비고 |
|------|------|------|
| DB 스키마 | ⚠️ 부분 | orders 테이블에 cancelled_reason 필드만 존재 |
| 취소 API | ❌ 없음 | /api/orders/[id]/cancel 엔드포인트 없음 |
| 환불 시스템 | ❌ 없음 | 토스페이먼츠 취소 API 연동 없음 |
| 쿠폰/포인트 복구 | ❌ 없음 | 쿠폰/포인트 테이블 자체가 없음 |
| UI 컴포넌트 | ❌ 없음 | 취소 버튼/모달 없음 |
| 알림 시스템 | ❌ 없음 | 취소 관련 알림 없음 |

---

## 주문 취소 경우의 수

### 핵심 기준: **가게가 주문을 접수했는지 여부**

---

### 1️⃣ 경우의 수 1: 가게가 주문을 접수하기 전 (`pending` 상태)

#### 📌 상황
- 고객이 결제 완료 후 아직 가게에서 주문을 확인(접수)하기 전
- 주문 상태: `pending`

#### ✅ 발생해야 하는 일

1. **즉시 자동 취소**
   - 사용자가 앱 내에서 '주문 취소' 버튼 클릭
   - 주문은 즉시 자동 취소 (`status: 'cancelled'`)
   - 취소 사유 기록 (`cancelled_reason`)

2. **결제 처리**
   - **신용카드/간편결제**:
     - 즉시 결제 승인 취소
     - 토스페이먼츠 API 호출: `POST /v1/payments/{paymentKey}/cancel`
     - 카드사 반영: 1~2일 소요 가능
   - **현금 결제**:
     - 결제 전이므로 취소 절차만 진행

3. **쿠폰 복구**
   - 사용한 쿠폰 → 사용 가능 상태로 복구
   - `coupon_usages.refunded_at = NOW()`

4. **포인트 복구**
   - 사용한 포인트 → 전액 복구
   - `point_transactions` 테이블에 `type: 'refund'` 기록

5. **가게 알림**
   - 점주에게 "주문이 취소되었습니다" 알림 발송
   - 음식 준비 중지

#### 💰 환불 금액
```typescript
환불 금액 = 주문 금액 + 배달비 + 플랫폼 수수료
         = 전액 환불 (100%)
```

---

### 2️⃣ 경우의 수 2: 가게가 주문을 접수한 후 (`confirmed`, `preparing` 상태)

#### 📌 상황
- 점주가 주문을 확인하고 접수 완료
- 조리 시작했거나 조리 중
- 주문 상태: `confirmed` 또는 `preparing`

#### ✅ 발생해야 하는 일

1. **점주 승인 필요**
   - 고객이 '취소 요청' 버튼 클릭
   - 점주에게 취소 요청 알림 발송
   - 점주가 승인/거절 선택 가능

2. **점주 승인 시**
   - 주문 취소 처리 (`status: 'cancelled'`)
   - **부분 환불** 처리:
     ```typescript
     환불율 = {
       'confirmed': 100%,  // 조리 전
       'preparing': 70%,   // 조리 중 (음식 비용 일부 차감)
     }

     환불 금액 = (주문 금액 × 환불율) + 배달비
     차감 금액 = 주문 금액 × (1 - 환불율)
     ```
   - 쿠폰/포인트: **복구 안됨** (점주가 이미 조리 시작)
   - 점주에게 차감 금액 보상

3. **점주 거절 시**
   - 주문 진행 계속
   - 고객에게 "취소 거절됨" 알림
   - 고객은 음식을 받아야 함

4. **고객 응답 없는 경우**
   - 일정 시간(예: 10분) 내 고객이 음식을 받지 않으면
   - 자동 취소 + 전액 청구 (고객 귀책)
   - 환불 없음

#### 💰 환불 금액
```typescript
// 조리 전 (confirmed)
환불 금액 = 100% (전액)

// 조리 중 (preparing)
환불 금액 = 70% (부분)
차감 금액 = 30% (점주 보상)
```

---

### 3️⃣ 경우의 수 3: 배달 라이더가 배정/픽업한 후 (`picked_up`, `delivering` 상태)

#### 📌 상황
- 라이더가 음식을 픽업하여 배달 중
- 주문 상태: `picked_up` 또는 `delivering`

#### ✅ 발생해야 하는 일

1. **취소 불가 원칙**
   - 원칙적으로 취소 불가
   - UI에서 '취소' 버튼 비활성화
   - "배달 중인 주문은 취소할 수 없습니다" 안내

2. **예외적 상황 (고객 귀책)**
   - 고객이 주소를 잘못 입력
   - 고객이 연락 두절
   - 고객이 음식 수령 거부

   → 이 경우:
   - 주문 취소 처리 가능 (`cancelled`)
   - **전액 고객에게 청구** (환불 없음)
   - 라이더에게 배달비 전액 지급
   - 점주에게 음식값 전액 지급

3. **플랫폼 귀책 사유**
   - 음식 유출/파손 (라이더 귀책)
   - 배달 지연 (플랫폼 귀책)

   → 이 경우:
   - 전액 환불 + 보상 쿠폰 지급
   - 라이더에게 패널티
   - 점주는 보호 (음식값 지급)

#### 💰 환불 금액
```typescript
// 정상 배달 중
환불 금액 = 0원 (취소 불가)

// 고객 귀책
환불 금액 = 0원 (전액 청구)
라이더 수입 = 배달비 전액
점주 수입 = 음식값 전액

// 플랫폼 귀책
환불 금액 = 100% + 보상 쿠폰
라이더 수입 = 0원 (패널티)
점주 수입 = 음식값 전액 (플랫폼 부담)
```

---

### 4️⃣ 경우의 수 4: 배달 완료 후 (`delivered` 상태)

#### 📌 상황
- 배달이 완료되어 고객이 음식을 수령
- 주문 상태: `delivered`

#### ✅ 발생해야 하는 일

1. **취소 불가**
   - 이미 음식을 받았으므로 취소 불가
   - UI에서 '취소' 버튼 표시 안됨

2. **환불 요청은 가능**
   - "고객센터 문의" 버튼 표시
   - 사유: 음식 문제, 이물질 발견 등
   - 관리자 검토 후 환불 여부 결정

3. **부분 환불 정책**
   - 음식 일부만 문제: 해당 메뉴만 환불
   - 전체 문제: 전액 환불
   - 악의적 요청: 환불 거절

#### 💰 환불 금액
```typescript
// 정상 배달
환불 금액 = 0원 (환불 불가)

// 음식 문제 (관리자 승인)
환불 금액 = 부분 또는 전액 (케이스별)
```

---

## 현재 구현 상태

### ✅ 구현된 부분 (DB 스키마 수준만)

#### 1. 주문 상태 정의
**파일**: `src/types/order.types.ts`

```typescript
export type OrderStatus =
  | 'pending'     // 주문 대기
  | 'confirmed'   // 주문 접수
  | 'preparing'   // 조리 중
  | 'ready'       // 조리 완료
  | 'picked_up'   // 픽업 완료
  | 'delivering'  // 배달 중
  | 'delivered'   // 배달 완료
  | 'cancelled'   // 취소됨
```

✅ **상태 타입은 정의되어 있음**
❌ **상태 전환 로직은 없음**

---

#### 2. DB 테이블 구조
**파일**: `supabase/migrations/001_initial_schema.sql`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  rider_id UUID REFERENCES riders(id),

  -- 주문 상태
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'ready',
    'picked_up', 'delivering', 'delivered', 'cancelled'
  )) DEFAULT 'pending',

  -- 금액
  total_amount INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,

  -- 취소 관련
  cancelled_reason TEXT,

  -- 결제 관련
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )) DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

✅ **취소 사유 필드 존재**: `cancelled_reason`
✅ **결제 상태 필드 존재**: `payment_status` (refunded 포함)
❌ **환불 금액 추적 없음**: 부분 환불 금액 저장 필드 없음
❌ **취소 시점 기록 없음**: `cancelled_at` 필드 없음

---

### ❌ 구현되지 않은 핵심 로직 (구현률 0%)

---

#### 1️⃣ 경우의 수 1: 가게 접수 전 취소 ❌ **미구현**

##### 필요한 API
```typescript
// ❌ 없음: POST /api/orders/[orderId]/cancel

interface CancelOrderRequest {
  orderId: string
  reason: string
}

interface CancelOrderResponse {
  success: boolean
  refundAmount: number
  refundMethod: string // 'card', 'kakao', 'toss'
  refundEta: string    // 환불 예상 시간
}
```

##### 필요한 기능
1. **취소 가능 여부 검증**
   ```typescript
   // ❌ 미구현
   function canCancelOrder(order: Order): boolean {
     return order.status === 'pending'
   }
   ```

2. **결제 취소 API 연동**
   ```typescript
   // ❌ 미구현: src/lib/payments/toss/cancelPayment.ts
   async function cancelTossPayment(
     paymentKey: string,
     cancelReason: string
   ): Promise<CancelResponse>
   ```

3. **쿠폰 복구**
   ```typescript
   // ❌ 미구현
   async function refundCoupon(orderId: string): Promise<void> {
     // coupon_usages 테이블 업데이트
     // refunded_at = NOW()
   }
   ```

4. **포인트 복구**
   ```typescript
   // ❌ 미구현
   async function refundPoints(orderId: string): Promise<void> {
     // point_transactions 테이블에 refund 기록
   }
   ```

5. **가게 알림**
   ```typescript
   // ❌ 미구현
   async function notifyOwnerOrderCancelled(
     restaurantId: string,
     orderId: string
   ): Promise<void>
   ```

##### 문제점
- ✗ 취소 가능 여부 검증 로직 없음
- ✗ 결제 취소 API 연동 없음
- ✗ 쿠폰/포인트 복구 로직 없음
- ✗ 쿠폰/포인트 테이블 자체가 없음
- ✗ 알림 시스템 없음

---

#### 2️⃣ 경우의 수 2: 가게 접수 후 취소 ❌ **미구현**

##### 필요한 API
```typescript
// ❌ 없음: POST /api/orders/[orderId]/request-cancel
// 고객이 취소 요청

interface RequestCancelInput {
  orderId: string
  reason: string
}

interface RequestCancelResponse {
  success: boolean
  requiresApproval: boolean
  estimatedRefund: number // 예상 환불 금액
}

// ❌ 없음: POST /api/orders/[orderId]/approve-cancel
// 점주가 취소 승인/거절

interface ApproveCancelInput {
  orderId: string
  approved: boolean
  ownerNote?: string
}
```

##### 필요한 기능
1. **취소 요청 프로세스**
   ```typescript
   // ❌ 미구현
   async function requestOrderCancel(
     orderId: string,
     reason: string
   ): Promise<void> {
     // 1. 주문 상태 확인 (confirmed, preparing만 허용)
     // 2. 취소 요청 테이블에 기록
     // 3. 점주에게 알림 발송
     // 4. 고객에게 "취소 요청됨" 알림
   }
   ```

2. **점주 승인/거절**
   ```typescript
   // ❌ 미구현
   async function approveOrderCancel(
     orderId: string,
     approved: boolean
   ): Promise<void> {
     if (approved) {
       // 1. 부분 환불 금액 계산
       // 2. 결제 취소 (부분)
       // 3. 주문 상태 cancelled로 변경
       // 4. 고객에게 "취소 승인됨" 알림
     } else {
       // 1. 취소 요청 거절
       // 2. 고객에게 "취소 거절됨" 알림
       // 3. 주문 진행 계속
     }
   }
   ```

3. **부분 환불 계산**
   ```typescript
   // ❌ 미구현
   function calculatePartialRefund(order: Order): number {
     const refundRate = {
       'confirmed': 1.0,   // 100%
       'preparing': 0.7,   // 70%
     }

     const rate = refundRate[order.status] || 0
     return Math.floor(order.total_amount * rate)
   }
   ```

4. **점주 보상 계산**
   ```typescript
   // ❌ 미구현
   function calculateOwnerCompensation(order: Order): number {
     // 차감 금액 = 주문 금액 × (1 - 환불율)
     const refundRate = 0.7 // preparing 기준
     return Math.floor(order.total_amount * (1 - refundRate))
   }
   ```

##### 문제점
- ✗ 취소 요청/승인 프로세스 전체 없음
- ✗ 부분 환불 계산 로직 없음
- ✗ 점주 대시보드에 취소 요청 UI 없음
- ✗ 쿠폰/포인트 복구 정책 구분 없음 (접수 전/후)

---

#### 3️⃣ 경우의 수 3: 배달 중 취소 ❌ **미구현**

##### 필요한 API
```typescript
// ❌ 없음: GET /api/orders/[orderId]/can-cancel

interface CanCancelResponse {
  canCancel: boolean
  reason: string // 취소 불가 사유
  status: OrderStatus
}
```

##### 필요한 기능
1. **취소 불가 상태 검증**
   ```typescript
   // ❌ 미구현
   function canCancelOrder(order: Order): {
     canCancel: boolean
     reason: string
   } {
     const nonCancellableStatuses = [
       'picked_up',
       'delivering',
       'delivered'
     ]

     if (nonCancellableStatuses.includes(order.status)) {
       return {
         canCancel: false,
         reason: '배달 중인 주문은 취소할 수 없습니다'
       }
     }

     return { canCancel: true, reason: '' }
   }
   ```

2. **고객 귀책 사유 처리**
   ```typescript
   // ❌ 미구현
   async function handleCustomerFault(
     orderId: string,
     faultType: 'wrong_address' | 'no_response' | 'refused'
   ): Promise<void> {
     // 1. 주문 취소 처리
     // 2. 전액 고객에게 청구 (환불 없음)
     // 3. 라이더에게 배달비 전액 지급
     // 4. 점주에게 음식값 전액 지급
     // 5. 고객에게 "귀책 사유로 취소됨" 알림
   }
   ```

##### 문제점
- ✗ 취소 불가 상태 검증 없음
- ✗ 고객 귀책 사유 처리 로직 없음
- ✗ UI에서 취소 버튼 비활성화 로직 없음
- ✗ 배달 중 예외 상황 처리 없음

---

#### 4️⃣ 결제 취소/환불 시스템 ❌ **미구현**

##### 필요한 구현
```typescript
// ❌ 없음: src/lib/payments/toss/cancelPayment.ts

interface CancelPaymentInput {
  orderId: string
  paymentKey: string
  cancelAmount: number      // 취소 금액
  cancelReason: string
  refundableAmount?: number // 환불 가능 금액
  taxFreeAmount?: number    // 면세 금액
}

interface CancelPaymentResponse {
  success: boolean
  cancelAmount: number
  refundMethod: string
  refundAt: string
  transactionKey: string
}

async function cancelTossPayment(
  input: CancelPaymentInput
): Promise<CancelPaymentResponse> {
  // 토스페이먼츠 API 호출
  // POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel

  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${input.paymentKey}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(process.env.TOSS_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason: input.cancelReason,
        cancelAmount: input.cancelAmount,
      }),
    }
  )

  return response.json()
}
```

##### 필요한 DB 테이블
```sql
-- ❌ 없음: 환불 내역 테이블
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  refund_amount INTEGER NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_method TEXT, -- 'card', 'kakao', 'toss', 'naver'
  refund_status TEXT CHECK (refund_status IN (
    'pending', 'processing', 'completed', 'failed'
  )) DEFAULT 'pending',
  transaction_key TEXT, -- PG사 거래 키
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 문제점
- ✗ 토스페이먼츠 결제 취소 API 연동 없음
- ✗ 부분 취소 로직 없음
- ✗ 환불 내역 테이블 없음 (`refunds` 테이블)
- ✗ 환불 상태 추적 불가
- ✗ 환불 실패 시 재시도 로직 없음

---

#### 5️⃣ 쿠폰/포인트 복구 로직 ❌ **미구현**

##### 필요한 DB 테이블
```sql
-- ❌ 없음: 쿠폰 테이블
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('fixed', 'percent')),
  discount_value INTEGER NOT NULL, -- 금액 또는 퍼센트
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER, -- 최대 할인 금액 (percent일 때)
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER, -- 전체 사용 제한
  usage_limit_per_user INTEGER, -- 사용자당 사용 제한
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ 없음: 쿠폰 사용 내역 테이블
CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  discount_amount INTEGER NOT NULL, -- 실제 할인된 금액
  used_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ, -- 취소 시 복구 시점
  is_refunded BOOLEAN DEFAULT false
);

-- ❌ 없음: 포인트 테이블
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  balance INTEGER DEFAULT 0, -- 현재 잔액
  total_earned INTEGER DEFAULT 0, -- 총 적립 금액
  total_used INTEGER DEFAULT 0, -- 총 사용 금액
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ 없음: 포인트 거래 내역 테이블
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  amount INTEGER NOT NULL, -- 적립: +, 사용: -
  type TEXT NOT NULL CHECK (type IN ('earn', 'use', 'refund', 'expire')),
  description TEXT,
  balance_after INTEGER NOT NULL, -- 거래 후 잔액
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 필요한 로직
```typescript
// ❌ 미구현: 쿠폰 복구
async function refundCoupon(orderId: string): Promise<void> {
  // 1. 해당 주문에서 사용한 쿠폰 찾기
  const usage = await db
    .from('coupon_usages')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (!usage) return

  // 2. 복구 가능 여부 확인 (주문 상태별)
  const order = await getOrder(orderId)
  const canRefund = order.status === 'pending'

  if (canRefund) {
    // 3. 쿠폰 사용 취소
    await db
      .from('coupon_usages')
      .update({
        refunded_at: new Date().toISOString(),
        is_refunded: true,
      })
      .eq('id', usage.id)
  }
}

// ❌ 미구현: 포인트 복구
async function refundPoints(orderId: string): Promise<void> {
  // 1. 해당 주문에서 사용한 포인트 찾기
  const usage = await db
    .from('point_transactions')
    .select('*')
    .eq('order_id', orderId)
    .eq('type', 'use')
    .single()

  if (!usage) return

  // 2. 포인트 복구 (환불 트랜잭션 생성)
  const refundAmount = Math.abs(usage.amount)

  await db.from('point_transactions').insert({
    user_id: usage.user_id,
    order_id: orderId,
    amount: refundAmount, // 양수 (복구)
    type: 'refund',
    description: `주문 취소로 인한 포인트 복구`,
  })

  // 3. 사용자 포인트 잔액 업데이트
  await db.rpc('update_user_points', {
    user_id: usage.user_id,
    amount: refundAmount,
  })
}
```

##### 문제점
- ✗ 쿠폰/포인트 테이블 자체가 없음
- ✗ 복구 로직 없음
- ✗ 거래 내역 추적 불가
- ✗ 복구 정책 구분 없음 (접수 전/후)

---

#### 6️⃣ 취소 정책 상수화 ❌ **미구현**

##### 필요한 파일
```typescript
// ❌ 없음: src/lib/constants/order-cancellation.ts

/**
 * 주문 취소 정책 상수
 */
export const ORDER_CANCELLATION_POLICY = {
  /**
   * 즉시 취소 가능 상태 (전액 환불)
   */
  INSTANT_CANCEL_STATUSES: ['pending'] as const,

  /**
   * 점주 승인 필요 상태 (부분 환불)
   */
  APPROVAL_REQUIRED_STATUSES: ['confirmed', 'preparing'] as const,

  /**
   * 취소 불가 상태
   */
  NON_CANCELLABLE_STATUSES: [
    'ready',
    'picked_up',
    'delivering',
    'delivered',
  ] as const,

  /**
   * 부분 환불 비율 (상태별)
   */
  PARTIAL_REFUND_RATE: {
    'confirmed': 1.0,   // 100% 환불 (조리 전)
    'preparing': 0.7,   // 70% 환불 (조리 중)
  } as const,

  /**
   * 쿠폰 복구 정책 (상태별)
   */
  COUPON_REFUND_POLICY: {
    'pending': true,      // 접수 전: 복구 O
    'confirmed': false,   // 접수 후: 복구 X
    'preparing': false,   // 조리 중: 복구 X
  } as const,

  /**
   * 포인트 복구 정책 (상태별)
   */
  POINT_REFUND_POLICY: {
    'pending': true,      // 접수 전: 복구 O
    'confirmed': false,   // 접수 후: 복구 X
    'preparing': false,   // 조리 중: 복구 X
  } as const,

  /**
   * 점주 승인 대기 시간 (분)
   */
  OWNER_APPROVAL_TIMEOUT: 10,

  /**
   * 배달 중 취소 불가 안내 메시지
   */
  NON_CANCELLABLE_MESSAGE: {
    'picked_up': '라이더가 음식을 픽업했습니다. 취소할 수 없습니다.',
    'delivering': '배달 중인 주문은 취소할 수 없습니다.',
    'delivered': '이미 배달 완료된 주문입니다. 환불은 고객센터로 문의해주세요.',
  } as const,
} as const

/**
 * 주문 취소 가능 여부 확인
 */
export function canCancelOrder(status: OrderStatus): {
  canCancel: boolean
  requiresApproval: boolean
  reason?: string
} {
  if (ORDER_CANCELLATION_POLICY.INSTANT_CANCEL_STATUSES.includes(status)) {
    return {
      canCancel: true,
      requiresApproval: false,
    }
  }

  if (ORDER_CANCELLATION_POLICY.APPROVAL_REQUIRED_STATUSES.includes(status)) {
    return {
      canCancel: true,
      requiresApproval: true,
    }
  }

  return {
    canCancel: false,
    requiresApproval: false,
    reason: ORDER_CANCELLATION_POLICY.NON_CANCELLABLE_MESSAGE[status] || '취소할 수 없는 상태입니다.',
  }
}

/**
 * 환불 금액 계산
 */
export function calculateRefundAmount(order: Order): {
  refundAmount: number
  refundRate: number
} {
  const rate = ORDER_CANCELLATION_POLICY.PARTIAL_REFUND_RATE[order.status] || 0
  const refundAmount = Math.floor(order.total_amount * rate)

  return {
    refundAmount,
    refundRate: rate,
  }
}
```

##### 문제점
- ✗ 취소 정책 상수가 없음
- ✗ 취소 가능 여부 판단 로직 없음
- ✗ 환불 금액 계산 로직 없음
- ✗ 복구 정책 정의 없음

---

#### 7️⃣ API 엔드포인트 ❌ **미구현**

##### 필요한 API 목록

```typescript
// ========================================
// 1. 즉시 취소 API (pending 상태)
// ========================================
// ❌ 없음: src/app/api/orders/[orderId]/cancel/route.ts
// POST /api/orders/[orderId]/cancel

/**
 * 주문 즉시 취소 (접수 전)
 * - 취소 가능 여부 검증
 * - 결제 취소 처리
 * - 쿠폰/포인트 복구
 * - 알림 발송
 */

// ========================================
// 2. 취소 요청 API (점주 승인 필요)
// ========================================
// ❌ 없음: src/app/api/orders/[orderId]/request-cancel/route.ts
// POST /api/orders/[orderId]/request-cancel

/**
 * 주문 취소 요청 (점주 승인 필요)
 * - 취소 요청 기록
 * - 점주에게 알림
 * - 예상 환불 금액 계산
 */

// ========================================
// 3. 취소 승인/거절 API (점주용)
// ========================================
// ❌ 없음: src/app/api/orders/[orderId]/approve-cancel/route.ts
// POST /api/orders/[orderId]/approve-cancel

/**
 * 점주가 취소 요청 승인/거절
 * - 승인: 부분 환불 처리
 * - 거절: 주문 계속 진행
 */

// ========================================
// 4. 취소 가능 여부 확인 API
// ========================================
// ❌ 없음: src/app/api/orders/[orderId]/can-cancel/route.ts
// GET /api/orders/[orderId]/can-cancel

/**
 * 주문 취소 가능 여부 확인
 * - 현재 상태 기반 취소 가능성
 * - 예상 환불 금액
 * - 필요한 승인 여부
 */

// ========================================
// 5. 환불 내역 조회 API
// ========================================
// ❌ 없음: src/app/api/orders/[orderId]/refund/route.ts
// GET /api/orders/[orderId]/refund

/**
 * 환불 내역 조회
 * - 환불 금액
 * - 환불 상태
 * - 환불 완료 시점
 */
```

##### 문제점
- ✗ 취소 관련 API 엔드포인트 전체 없음
- ✗ 점주용 승인/거절 API 없음
- ✗ 취소 가능 여부 확인 API 없음
- ✗ 환불 내역 조회 API 없음

---

#### 8️⃣ UI 컴포넌트 ❌ **미구현**

##### 필요한 컴포넌트

```typescript
// ========================================
// 1. 주문 취소 버튼
// ========================================
// ❌ 없음: src/components/features/order/OrderCancelButton.tsx

/**
 * 주문 상태별 취소 버튼
 * - pending: "주문 취소" 버튼 (빨간색)
 * - confirmed/preparing: "취소 요청" 버튼 (주황색)
 * - 나머지: 버튼 비활성화 또는 숨김
 */
interface OrderCancelButtonProps {
  order: Order
  onCancel: (orderId: string) => Promise<void>
}

// ========================================
// 2. 취소 확인 모달
// ========================================
// ❌ 없음: src/components/features/order/OrderCancelModal.tsx

/**
 * 취소 확인 모달
 * - 취소 정책 안내
 * - 환불 금액 표시
 * - 취소 사유 선택/입력
 * - 쿠폰/포인트 복구 안내
 */
interface OrderCancelModalProps {
  isOpen: boolean
  order: Order
  estimatedRefund: number
  canRefundCoupon: boolean
  canRefundPoints: boolean
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}

// ========================================
// 3. 취소 요청 대기 상태
// ========================================
// ❌ 없음: src/components/features/order/OrderCancelPending.tsx

/**
 * 점주 승인 대기 중 표시
 * - "취소 요청 중입니다" 안내
 * - 예상 환불 금액
 * - 점주 응답 대기 시간
 */

// ========================================
// 4. 점주용 취소 승인/거절 UI
// ========================================
// ❌ 없음: src/components/features/owner/OwnerCancelApprovalCard.tsx

/**
 * 점주 대시보드용 취소 승인/거절 UI
 * - 취소 요청 내역 표시
 * - 승인/거절 버튼
 * - 거절 사유 입력
 * - 예상 보상 금액 표시 (조리 중일 경우)
 */

// ========================================
// 5. 취소 불가 안내
// ========================================
// ❌ 없음: src/components/features/order/OrderNonCancellableNotice.tsx

/**
 * 취소 불가 상태 안내
 * - 배달 중: "배달 중인 주문은 취소할 수 없습니다"
 * - 배달 완료: "환불은 고객센터로 문의해주세요"
 */
```

##### 문제점
- ✗ 취소 버튼/모달 컴포넌트 없음
- ✗ 점주용 승인/거절 UI 없음
- ✗ 취소 불가 안내 UI 없음
- ✗ 환불 금액 계산 표시 없음

---

#### 9️⃣ 알림 시스템 ❌ **미구현**

##### 필요한 알림

```typescript
// ========================================
// 1. 고객 → 점주: 취소 요청 알림
// ========================================
// ❌ 미구현
interface CancelRequestNotification {
  type: 'order_cancel_request'
  recipient: 'owner'
  data: {
    orderId: string
    customerName: string
    reason: string
    requestedAt: string
  }
}

// ========================================
// 2. 점주 → 고객: 취소 승인 알림
// ========================================
// ❌ 미구현
interface CancelApprovedNotification {
  type: 'order_cancel_approved'
  recipient: 'customer'
  data: {
    orderId: string
    refundAmount: number
    refundMethod: string
    refundEta: string
  }
}

// ========================================
// 3. 점주 → 고객: 취소 거절 알림
// ========================================
// ❌ 미구현
interface CancelRejectedNotification {
  type: 'order_cancel_rejected'
  recipient: 'customer'
  data: {
    orderId: string
    ownerNote: string
    estimatedDeliveryTime: string
  }
}

// ========================================
// 4. 플랫폼 → 라이더: 주문 취소 알림
// ========================================
// ❌ 미구현
interface OrderCancelledForRiderNotification {
  type: 'order_cancelled_rider'
  recipient: 'rider'
  data: {
    orderId: string
    riderId: string
    cancelReason: string
  }
}

// ========================================
// 5. 플랫폼 → 고객: 환불 완료 알림
// ========================================
// ❌ 미구현
interface RefundCompletedNotification {
  type: 'refund_completed'
  recipient: 'customer'
  data: {
    orderId: string
    refundAmount: number
    refundMethod: string
    refundedAt: string
  }
}
```

##### 필요한 알림 채널
- ✗ **푸시 알림**: 없음
- ✗ **SMS 알림**: 없음
- ✗ **이메일 알림**: 없음
- ✗ **인앱 알림**: 없음

##### 문제점
- ✗ 알림 시스템 전체 없음
- ✗ 실시간 알림 (Supabase Realtime) 연동 없음
- ✗ 알림 템플릿 없음
- ✗ 알림 발송 로직 없음

---

## 구현 우선순위

### 🚀 Phase 1: 최소 기능 (MVP) - 즉시 구현 필수

| 순위 | 작업 | 난이도 | 예상 시간 | 설명 |
|------|------|--------|-----------|------|
| 1 | DB 스키마 추가 | 중 | 2h | 쿠폰/포인트/환불 테이블 생성 |
| 2 | 취소 정책 상수 정의 | 하 | 1h | `ORDER_CANCELLATION_POLICY` 상수 |
| 3 | 취소 가능 여부 검증 | 중 | 3h | `canCancelOrder()` 함수 |
| 4 | 즉시 취소 API (pending) | 중 | 4h | `POST /api/orders/[id]/cancel` |
| 5 | UI - 취소 버튼 (pending만) | 하 | 2h | 주문 상세 페이지에 취소 버튼 |
| 6 | UI - 취소 불가 안내 | 하 | 1h | 취소 불가 상태 안내 메시지 |

**Phase 1 총 예상 시간**: **13시간**

---

### 🔥 Phase 2: 결제 취소 연동

| 순위 | 작업 | 난이도 | 예상 시간 | 설명 |
|------|------|--------|-----------|------|
| 7 | 토스페이먼츠 취소 API | 상 | 5h | `cancelTossPayment()` 구현 |
| 8 | 환불 내역 테이블 | 중 | 1h | `refunds` 테이블 생성 |
| 9 | 환불 상태 추적 | 중 | 3h | 환불 성공/실패 처리 |
| 10 | 환불 재시도 로직 | 상 | 4h | 실패 시 자동 재시도 |

**Phase 2 총 예상 시간**: **13시간**

---

### 🎯 Phase 3: 쿠폰/포인트 복구

| 순위 | 작업 | 난이도 | 예상 시간 | 설명 |
|------|------|--------|-----------|------|
| 11 | 쿠폰 테이블 생성 | 중 | 2h | `coupons`, `coupon_usages` |
| 12 | 포인트 테이블 생성 | 중 | 2h | `user_points`, `point_transactions` |
| 13 | 쿠폰 복구 로직 | 중 | 3h | `refundCoupon()` |
| 14 | 포인트 복구 로직 | 중 | 3h | `refundPoints()` |

**Phase 3 총 예상 시간**: **10시간**

---

### 🤝 Phase 4: 점주 승인 필요 취소

| 순위 | 작업 | 난이도 | 예상 시간 | 설명 |
|------|------|--------|-----------|------|
| 15 | 취소 요청 API | 중 | 4h | `POST /api/orders/[id]/request-cancel` |
| 16 | 취소 승인/거절 API | 상 | 5h | `POST /api/orders/[id]/approve-cancel` |
| 17 | 부분 환불 계산 | 중 | 3h | `calculatePartialRefund()` |
| 18 | 점주 보상 계산 | 중 | 2h | `calculateOwnerCompensation()` |
| 19 | 점주 UI - 승인/거절 | 중 | 4h | 점주 대시보드 컴포넌트 |

**Phase 4 총 예상 시간**: **18시간**

---

### 🔔 Phase 5: 알림 시스템

| 순위 | 작업 | 난이도 | 예상 시간 | 설명 |
|------|------|--------|-----------|------|
| 20 | 알림 테이블 생성 | 중 | 2h | `notifications` 테이블 |
| 21 | 실시간 알림 (Supabase) | 상 | 4h | Realtime 구독 |
| 22 | 푸시 알림 연동 | 상 | 6h | FCM 또는 OneSignal |
| 23 | 알림 템플릿 | 중 | 2h | 취소/환불 알림 템플릿 |

**Phase 5 총 예상 시간**: **14시간**

---

### 📊 전체 구현 예상 시간

| Phase | 내용 | 예상 시간 |
|-------|------|-----------|
| Phase 1 | 최소 기능 (MVP) | **13시간** |
| Phase 2 | 결제 취소 연동 | **13시간** |
| Phase 3 | 쿠폰/포인트 복구 | **10시간** |
| Phase 4 | 점주 승인 필요 취소 | **18시간** |
| Phase 5 | 알림 시스템 | **14시간** |
| **합계** | | **68시간** |

---

## 치명적인 문제점

### 🚨 1. 법적 리스크

#### 전자상거래법 위반 가능성
```
전자상거래 등에서의 소비자보호에 관한 법률 제17조 (청약철회 등)

① 소비자는 다음 각 호의 어느 하나에 해당하는 경우를 제외하고는
   재화등을 배송받은 날부터 7일 이내에 청약철회를 할 수 있다.

② 사업자는 소비자의 청약철회로 인하여 재화등을 반환받은 경우에는
   3영업일 이내에 이미 지급받은 재화등의 대금을 환급하여야 한다.
```

**문제점**:
- ✗ 취소/환불 시스템 미구현 → 법 위반
- ✗ 소비자 피해 발생 → 법적 분쟁 가능
- ✗ 공정거래위원회 제재 가능

---

### 💸 2. 비즈니스 리스크

#### 고객 불만 폭증 예상
```
시나리오 1: 잘못된 주문
- 고객이 실수로 잘못된 메뉴 주문
- 취소 불가 → 고객 불만
- 앱 삭제, 부정적 리뷰

시나리오 2: 점주가 음식을 안 만드는 경우
- 점주가 주문 접수했지만 음식 안 만듦
- 고객은 결제했지만 음식 못 받음
- 환불 시스템 없음 → 고객 피해
```

**예상 피해**:
- 고객 이탈률 증가
- 부정적 리뷰 증가 (앱스토어 평점 하락)
- 경쟁사 대비 불리

---

### 💳 3. 결제 시스템 리스크

#### PG사 계약 위반 가능성
```
토스페이먼츠 이용약관 제00조 (환불 처리)

가맹점은 소비자의 정당한 환불 요청에 대해
적절한 환불 처리 시스템을 구축하고 운영해야 한다.
```

**문제점**:
- ✗ 결제만 되고 환불 불가 → PG사 계약 위반
- ✗ 토스페이먼츠 API 정책상 환불 기능 필수
- ✗ 계약 해지 가능성

---

### ⚖️ 4. 플랫폼 책임 문제

#### 3자 간 분쟁 시 중재 불가
```
케이스 1: 점주 vs 고객
- 점주: "음식 만들었는데 고객이 안 받음"
- 고객: "주문 안 했는데 결제됨"
- 플랫폼: 환불 시스템 없어서 중재 불가

케이스 2: 라이더 vs 고객
- 라이더: "배달 갔는데 고객 없음"
- 고객: "주문 취소했는데 음식 옴"
- 플랫폼: 취소 시스템 없어서 중재 불가
```

**문제점**:
- 플랫폼 신뢰도 하락
- 점주/라이더 이탈
- 고객 만족도 하락

---

## 즉시 구현 권장 사항

### ✅ 최소 기능 세트 (MVP)

#### 1️⃣ `pending` 상태 즉시 취소 (전액 환불)
```typescript
// 구현 우선순위: 최상
// 예상 시간: 6시간

기능:
1. 주문 상태가 'pending'일 때 '주문 취소' 버튼 표시
2. 버튼 클릭 시 확인 모달 표시
3. 확인 시:
   - 주문 상태 'cancelled'로 변경
   - 취소 사유 기록
   - 결제 취소 API 호출 (토스페이먼츠)
   - 점주에게 알림 발송
4. 환불 금액: 100% (전액)
```

---

#### 2️⃣ `confirmed`/`preparing` 상태 취소 불가 안내
```typescript
// 구현 우선순위: 높음
// 예상 시간: 2시간

기능:
1. 주문 상태가 'confirmed' 또는 'preparing'일 때
2. '주문 취소' 버튼 비활성화 또는 숨김
3. 안내 메시지 표시:
   "점주가 이미 주문을 접수하여 취소할 수 없습니다.
    문의사항은 고객센터로 연락해주세요."
```

---

#### 3️⃣ `picked_up` 이후 취소 불가 안내
```typescript
// 구현 우선순위: 높음
// 예상 시간: 1시간

기능:
1. 주문 상태가 'picked_up' 또는 'delivering'일 때
2. '주문 취소' 버튼 숨김
3. 안내 메시지 표시:
   "배달 중인 주문은 취소할 수 없습니다.
    음식 수령 후 문제가 있을 경우 고객센터로 문의해주세요."
```

---

### 📝 구현 체크리스트

#### Phase 1: MVP (13시간)
- [ ] `ORDER_CANCELLATION_POLICY` 상수 정의
- [ ] `canCancelOrder()` 함수 구현
- [ ] `POST /api/orders/[id]/cancel` API 구현
- [ ] 주문 상세 페이지에 취소 버튼 추가
- [ ] 취소 확인 모달 구현
- [ ] 취소 불가 안내 메시지 구현

#### Phase 2: 결제 취소 (13시간)
- [ ] 토스페이먼츠 취소 API 연동
- [ ] `refunds` 테이블 생성
- [ ] 환불 상태 추적 로직
- [ ] 환불 실패 시 재시도 로직

#### Phase 3: 쿠폰/포인트 (10시간)
- [ ] 쿠폰 테이블 생성
- [ ] 포인트 테이블 생성
- [ ] 쿠폰 복구 로직
- [ ] 포인트 복구 로직

#### Phase 4: 점주 승인 (18시간)
- [ ] 취소 요청 API
- [ ] 취소 승인/거절 API
- [ ] 부분 환불 계산
- [ ] 점주 UI

#### Phase 5: 알림 (14시간)
- [ ] 알림 테이블
- [ ] 실시간 알림
- [ ] 푸시 알림
- [ ] 알림 템플릿

---

## 결론

### 📊 현재 상태
- **구현률**: 0% (미구현)
- **DB 스키마**: 10% (기본 필드만)
- **API**: 0%
- **UI**: 0%
- **알림**: 0%

### 🚨 긴급도
- **법적 리스크**: ⚠️ 높음
- **비즈니스 리스크**: ⚠️ 매우 높음
- **기술적 난이도**: 중간
- **예상 구현 시간**: 68시간 (약 8.5일)

### ✅ 권장 사항
1. **Phase 1 (MVP)를 최우선으로 구현** (13시간)
   - `pending` 상태 즉시 취소
   - 취소 불가 상태 안내

2. **Phase 2 (결제 취소)를 조속히 구현** (13시간)
   - 토스페이먼츠 API 연동
   - 환불 처리

3. **Phase 3~5는 순차적으로 구현**
   - 쿠폰/포인트 복구
   - 점주 승인 필요 취소
   - 알림 시스템

---

**작성자**: Claude Code
**검토일**: 2024-12-11
**다음 검토 예정일**: 구현 완료 후
