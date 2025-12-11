/**
 * 주문 취소 시스템 상수 정의
 * @description 취소 정책, 사유 옵션, 상태 라벨 등을 정의합니다.
 */

import type {
  CancellationPolicy,
  CancelReasonCategory,
  CancelReasonOption,
  CancelRequestedBy,
  CancelStatus,
  CancelType,
  RefundStatus,
  PaymentMethod,
} from '@/types/order-cancellation.types'
import type { OrderStatus } from '@/types/order.types'

// ============================================================================
// 취소 정책 상수
// ============================================================================

/**
 * 주문 상태별 취소 정책
 * @description 각 주문 상태에 따른 취소 가능 여부, 환불율 등을 정의
 */
export const CANCELLATION_POLICIES: Record<OrderStatus, CancellationPolicy> = {
  pending: {
    canCancel: true,
    cancelType: 'instant',
    refundRate: 100,
    canRefundCoupon: true,
    canRefundPoints: true,
    message: '주문이 접수되기 전이므로 즉시 취소가 가능합니다. 전액 환불됩니다.',
  },
  confirmed: {
    canCancel: true,
    cancelType: 'request',
    refundRate: 100,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '가게에서 주문을 접수했습니다. 점주 승인 후 취소가 진행됩니다.',
  },
  preparing: {
    canCancel: true,
    cancelType: 'request',
    refundRate: 70,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '조리가 시작되어 70% 환불됩니다. 점주 승인이 필요합니다.',
  },
  ready: {
    canCancel: false,
    cancelType: null,
    refundRate: 0,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '조리가 완료되어 취소가 불가능합니다.',
  },
  picked_up: {
    canCancel: false,
    cancelType: null,
    refundRate: 0,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '라이더가 픽업하여 취소가 불가능합니다.',
  },
  delivering: {
    canCancel: false,
    cancelType: null,
    refundRate: 0,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '배달 중이므로 취소가 불가능합니다.',
  },
  delivered: {
    canCancel: false,
    cancelType: null,
    refundRate: 0,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '배달이 완료되어 취소가 불가능합니다.',
  },
  cancelled: {
    canCancel: false,
    cancelType: null,
    refundRate: 0,
    canRefundCoupon: false,
    canRefundPoints: false,
    message: '이미 취소된 주문입니다.',
  },
} as const

// ============================================================================
// 취소 사유 상수
// ============================================================================

/**
 * 취소 사유 옵션 목록
 * @description 취소 요청 시 선택 가능한 사유 목록
 */
export const CANCEL_REASON_OPTIONS: CancelReasonOption[] = [
  {
    value: 'customer_change_mind',
    label: '단순 변심',
    description: '주문을 취소하고 싶습니다.',
    availableFor: ['customer'],
  },
  {
    value: 'customer_wrong_order',
    label: '잘못 주문함',
    description: '메뉴나 옵션을 잘못 선택했습니다.',
    availableFor: ['customer'],
  },
  {
    value: 'customer_duplicate_order',
    label: '중복 주문',
    description: '같은 주문이 중복으로 결제되었습니다.',
    availableFor: ['customer', 'admin', 'system'],
  },
  {
    value: 'restaurant_closed',
    label: '영업 종료',
    description: '가게가 영업을 종료했습니다.',
    availableFor: ['owner', 'admin', 'system'],
  },
  {
    value: 'restaurant_out_of_stock',
    label: '재료 소진',
    description: '주문하신 메뉴의 재료가 소진되었습니다.',
    availableFor: ['owner', 'admin'],
  },
  {
    value: 'restaurant_too_busy',
    label: '주문 폭주',
    description: '주문이 많아 조리가 어렵습니다.',
    availableFor: ['owner', 'admin'],
  },
  {
    value: 'delivery_issue',
    label: '배달 문제',
    description: '배달 관련 문제가 발생했습니다.',
    availableFor: ['rider', 'admin', 'system'],
  },
  {
    value: 'system_error',
    label: '시스템 오류',
    description: '시스템 오류로 인해 취소되었습니다.',
    availableFor: ['admin', 'system'],
  },
  {
    value: 'other',
    label: '기타',
    description: '기타 사유로 취소합니다.',
    availableFor: ['customer', 'owner', 'rider', 'admin'],
  },
] as const

/**
 * 취소 사유 라벨 맵
 */
export const CANCEL_REASON_LABELS: Record<CancelReasonCategory, string> = {
  customer_change_mind: '단순 변심',
  customer_wrong_order: '잘못 주문함',
  customer_duplicate_order: '중복 주문',
  restaurant_closed: '영업 종료',
  restaurant_out_of_stock: '재료 소진',
  restaurant_too_busy: '주문 폭주',
  delivery_issue: '배달 문제',
  system_error: '시스템 오류',
  other: '기타',
} as const

// ============================================================================
// 상태 라벨 상수
// ============================================================================

/**
 * 취소 상태 라벨
 */
export const CANCEL_STATUS_LABELS: Record<CancelStatus, string> = {
  pending: '처리 대기',
  approved: '승인됨',
  rejected: '거절됨',
  completed: '완료됨',
} as const

/**
 * 취소 상태 색상 (Tailwind CSS 클래스)
 */
export const CANCEL_STATUS_COLORS: Record<CancelStatus, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  approved: 'text-blue-600 bg-blue-50',
  rejected: 'text-red-600 bg-red-50',
  completed: 'text-green-600 bg-green-50',
} as const

/**
 * 환불 상태 라벨
 */
export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: '환불 대기',
  processing: '환불 처리 중',
  completed: '환불 완료',
  failed: '환불 실패',
  cancelled: '환불 취소',
} as const

/**
 * 환불 상태 색상 (Tailwind CSS 클래스)
 */
export const REFUND_STATUS_COLORS: Record<RefundStatus, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
  cancelled: 'text-neutral-600 bg-neutral-50',
} as const

/**
 * 취소 유형 라벨
 */
export const CANCEL_TYPE_LABELS: Record<CancelType, string> = {
  instant: '즉시 취소',
  request: '취소 요청',
} as const

/**
 * 요청자 유형 라벨
 */
export const REQUESTER_TYPE_LABELS: Record<CancelRequestedBy, string> = {
  customer: '고객',
  owner: '점주',
  rider: '라이더',
  admin: '관리자',
  system: '시스템',
} as const

// ============================================================================
// 결제 수단 상수
// ============================================================================

/**
 * 결제 수단 라벨
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: '신용/체크카드',
  kakaopay: '카카오페이',
  naverpay: '네이버페이',
  tosspay: '토스페이',
  samsungpay: '삼성페이',
  payco: '페이코',
  cash: '현금',
} as const

/**
 * 환불 가능한 결제 수단
 * @description PG사를 통해 자동 환불이 가능한 결제 수단 목록
 */
export const REFUNDABLE_PAYMENT_METHODS: PaymentMethod[] = [
  'card',
  'kakaopay',
  'naverpay',
  'tosspay',
  'samsungpay',
  'payco',
] as const

// ============================================================================
// 환불 관련 상수
// ============================================================================

/**
 * 환불 재시도 설정
 */
export const REFUND_RETRY_CONFIG = {
  /** 최대 재시도 횟수 */
  MAX_RETRY_COUNT: 3,
  /** 재시도 간격 (밀리초) */
  RETRY_INTERVAL_MS: 5000,
  /** 재시도 간격 증가 배수 (지수 백오프) */
  RETRY_BACKOFF_MULTIPLIER: 2,
} as const

/**
 * 환불 타임아웃 설정
 */
export const REFUND_TIMEOUT_CONFIG = {
  /** PG사 API 호출 타임아웃 (밀리초) */
  PG_API_TIMEOUT_MS: 30000,
  /** 환불 처리 대기 최대 시간 (밀리초) - 24시간 */
  MAX_PENDING_DURATION_MS: 24 * 60 * 60 * 1000,
} as const

// ============================================================================
// 에러 메시지 상수
// ============================================================================

/**
 * 취소 관련 에러 메시지
 */
export const CANCEL_ERROR_MESSAGES = {
  NOT_FOUND: '주문을 찾을 수 없습니다.',
  ALREADY_CANCELLED: '이미 취소된 주문입니다.',
  CANNOT_CANCEL: '현재 상태에서는 취소할 수 없습니다.',
  PENDING_CANCEL: '이미 취소 요청이 진행 중입니다.',
  UNAUTHORIZED: '취소 권한이 없습니다.',
  INVALID_REASON: '유효하지 않은 취소 사유입니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
} as const

/**
 * 환불 관련 에러 메시지
 */
export const REFUND_ERROR_MESSAGES = {
  NOT_FOUND: '환불 정보를 찾을 수 없습니다.',
  ALREADY_REFUNDED: '이미 환불이 완료되었습니다.',
  REFUND_FAILED: '환불 처리에 실패했습니다.',
  PG_ERROR: '결제사 연동 중 오류가 발생했습니다.',
  INVALID_AMOUNT: '환불 금액이 올바르지 않습니다.',
  MAX_RETRY_EXCEEDED: '최대 재시도 횟수를 초과했습니다.',
} as const

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 주문 상태에 따른 취소 정책 조회
 */
export function getCancellationPolicy(status: OrderStatus): CancellationPolicy {
  return CANCELLATION_POLICIES[status]
}

/**
 * 요청자 유형에 따른 취소 사유 옵션 필터링
 */
export function getAvailableCancelReasons(
  requestedByType: CancelRequestedBy
): CancelReasonOption[] {
  return CANCEL_REASON_OPTIONS.filter((option) =>
    option.availableFor.includes(requestedByType)
  )
}

/**
 * 환불 금액 계산
 * @param totalAmount 주문 총액
 * @param deliveryFee 배달비
 * @param refundRate 환불율 (0-100)
 * @returns 환불 금액
 */
export function calculateRefundAmount(
  totalAmount: number,
  deliveryFee: number,
  refundRate: number
): number {
  // 주문 금액에만 환불율 적용 (배달비는 전액 환불)
  const orderAmountRefund = Math.floor((totalAmount - deliveryFee) * (refundRate / 100))
  const deliveryFeeRefund = refundRate === 100 ? deliveryFee : 0
  return orderAmountRefund + deliveryFeeRefund
}

/**
 * 취소 가능 여부 확인
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return CANCELLATION_POLICIES[status].canCancel
}

/**
 * 결제 수단이 자동 환불 가능한지 확인
 */
export function isRefundablePaymentMethod(method: PaymentMethod): boolean {
  return REFUNDABLE_PAYMENT_METHODS.includes(method)
}
