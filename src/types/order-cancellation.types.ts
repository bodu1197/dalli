/**
 * 주문 취소 시스템 타입 정의
 * @description 주문 취소, 환불 관련 모든 타입을 정의합니다.
 */

import type { OrderStatus } from './order.types'

// ============================================================================
// 취소 관련 타입
// ============================================================================

/**
 * 취소 유형
 * - instant: 즉시 취소 (pending 상태에서만 가능)
 * - request: 취소 요청 (점주 승인 필요)
 */
export type CancelType = 'instant' | 'request'

/**
 * 취소 요청 상태
 */
export type CancelStatus = 'pending' | 'approved' | 'rejected' | 'completed'

/**
 * 취소 사유 카테고리
 */
export type CancelReasonCategory =
  | 'customer_change_mind' // 고객 변심
  | 'customer_wrong_order' // 잘못 주문
  | 'customer_duplicate_order' // 중복 주문
  | 'restaurant_closed' // 가게 영업 종료
  | 'restaurant_out_of_stock' // 재료 소진
  | 'restaurant_too_busy' // 주문 폭주
  | 'delivery_issue' // 배달 문제
  | 'system_error' // 시스템 오류
  | 'other' // 기타

/**
 * 취소 요청자 유형
 */
export type CancelRequestedBy = 'customer' | 'owner' | 'rider' | 'admin' | 'system'

/**
 * 취소 가능 여부 체크 결과
 */
export interface CancelabilityCheck {
  /** 취소 가능 여부 */
  canCancel: boolean
  /** 취소 유형 (가능한 경우) */
  cancelType: CancelType | null
  /** 환불율 (0-100) */
  refundRate: number
  /** 환불 금액 */
  refundAmount: number
  /** 쿠폰 환불 가능 여부 */
  canRefundCoupon: boolean
  /** 포인트 환불 가능 여부 */
  canRefundPoints: boolean
  /** 취소 불가 사유 (불가능한 경우) */
  reason: string | null
  /** 상세 메시지 */
  message: string
}

/**
 * 주문 취소 요청 입력
 */
export interface CancelOrderInput {
  /** 주문 ID */
  orderId: string
  /** 취소 사유 카테고리 */
  reasonCategory: CancelReasonCategory
  /** 취소 상세 사유 */
  reasonDetail?: string
}

/**
 * 주문 취소 정보
 */
export interface OrderCancellation {
  /** 취소 ID */
  id: string
  /** 주문 ID */
  orderId: string
  /** 요청자 ID */
  requestedBy: string
  /** 요청자 유형 */
  requestedByType: CancelRequestedBy
  /** 취소 유형 */
  cancelType: CancelType
  /** 취소 상태 */
  status: CancelStatus
  /** 취소 사유 카테고리 */
  reason: CancelReasonCategory
  /** 취소 상세 사유 */
  reasonDetail: string | null
  /** 환불 금액 */
  refundAmount: number
  /** 환불율 (0.00 - 1.00) */
  refundRate: number
  /** 쿠폰 환불 가능 여부 */
  canRefundCoupon: boolean
  /** 포인트 환불 가능 여부 */
  canRefundPoints: boolean
  /** 쿠폰 환불 완료 여부 */
  couponRefunded: boolean
  /** 포인트 환불 완료 여부 */
  pointsRefunded: boolean
  /** 거절 사유 (거절된 경우) */
  rejectedReason: string | null
  /** 처리자 ID */
  processedBy: string | null
  /** 처리 시간 */
  processedAt: string | null
  /** 생성 시간 */
  createdAt: string
  /** 수정 시간 */
  updatedAt: string
}

// ============================================================================
// 환불 관련 타입
// ============================================================================

/**
 * 환불 상태
 */
export type RefundStatus =
  | 'pending' // 환불 대기
  | 'processing' // 환불 처리 중
  | 'completed' // 환불 완료
  | 'failed' // 환불 실패
  | 'cancelled' // 환불 취소

/**
 * 결제 수단
 */
export type PaymentMethod =
  | 'card' // 신용/체크카드
  | 'kakaopay' // 카카오페이
  | 'naverpay' // 네이버페이
  | 'tosspay' // 토스페이
  | 'samsungpay' // 삼성페이
  | 'payco' // 페이코
  | 'cash' // 현금 (만나서 결제)

/**
 * 환불 정보
 */
export interface Refund {
  /** 환불 ID */
  id: string
  /** 주문 ID */
  orderId: string
  /** 취소 ID */
  cancellationId: string | null
  /** 환불 금액 */
  amount: number
  /** 결제 수단 */
  paymentMethod: PaymentMethod
  /** 결제 키 (PG사 결제 식별자) */
  paymentKey: string | null
  /** 환불 상태 */
  refundStatus: RefundStatus
  /** PG사 응답 */
  pgResponse: Record<string, unknown> | null
  /** PG사 거래 ID */
  pgTransactionId: string | null
  /** 실패 사유 */
  failedReason: string | null
  /** 재시도 횟수 */
  retryCount: number
  /** 마지막 재시도 시간 */
  lastRetryAt: string | null
  /** 완료 시간 */
  completedAt: string | null
  /** 생성 시간 */
  createdAt: string
  /** 수정 시간 */
  updatedAt: string
}

/**
 * 환불 요청 입력
 */
export interface RefundInput {
  /** 주문 ID */
  orderId: string
  /** 환불 금액 */
  amount: number
  /** 결제 수단 */
  paymentMethod: PaymentMethod
  /** 결제 키 */
  paymentKey?: string
}

// ============================================================================
// API 응답 타입
// ============================================================================

/**
 * 취소 가능 여부 조회 API 응답
 */
export interface CheckCancelabilityResponse {
  success: boolean
  data: CancelabilityCheck | null
  error: string | null
}

/**
 * 주문 취소 API 응답
 */
export interface CancelOrderResponse {
  success: boolean
  data: {
    cancellation: OrderCancellation
    refund: Refund | null
  } | null
  error: string | null
}

/**
 * 취소 요청 처리 API 응답 (점주 승인/거절)
 */
export interface ProcessCancelRequestResponse {
  success: boolean
  data: {
    cancellation: OrderCancellation
    refund: Refund | null
  } | null
  error: string | null
}

// ============================================================================
// 취소 정책 타입
// ============================================================================

/**
 * 주문 상태별 취소 정책
 */
export interface CancellationPolicy {
  /** 취소 가능 여부 */
  canCancel: boolean
  /** 취소 유형 */
  cancelType: CancelType | null
  /** 환불율 (0-100) */
  refundRate: number
  /** 쿠폰 환불 가능 여부 */
  canRefundCoupon: boolean
  /** 포인트 환불 가능 여부 */
  canRefundPoints: boolean
  /** 설명 메시지 */
  message: string
}

/**
 * 취소 사유 옵션
 */
export interface CancelReasonOption {
  /** 사유 카테고리 */
  value: CancelReasonCategory
  /** 표시 라벨 */
  label: string
  /** 설명 */
  description: string
  /** 요청자 유형별 사용 가능 여부 */
  availableFor: CancelRequestedBy[]
}

// ============================================================================
// UI 컴포넌트 Props 타입
// ============================================================================

/**
 * 취소 버튼 Props
 */
export interface CancelButtonProps {
  /** 주문 ID */
  orderId: string
  /** 주문 상태 */
  orderStatus: OrderStatus
  /** 취소 완료 콜백 */
  onCancelComplete?: () => void
  /** 비활성화 여부 */
  disabled?: boolean
  /** 추가 클래스명 */
  className?: string
}

/**
 * 취소 모달 Props
 */
export interface CancelModalProps {
  /** 모달 열림 여부 */
  isOpen: boolean
  /** 모달 닫기 콜백 */
  onClose: () => void
  /** 주문 ID */
  orderId: string
  /** 취소 가능 여부 정보 */
  cancelability: CancelabilityCheck
  /** 취소 완료 콜백 */
  onCancelComplete?: () => void
}

/**
 * 취소 상태 뱃지 Props
 */
export interface CancelStatusBadgeProps {
  /** 취소 상태 */
  status: CancelStatus
  /** 추가 클래스명 */
  className?: string
}

/**
 * 환불 상태 뱃지 Props
 */
export interface RefundStatusBadgeProps {
  /** 환불 상태 */
  status: RefundStatus
  /** 추가 클래스명 */
  className?: string
}

// ============================================================================
// 쿠폰/포인트 복구 타입
// ============================================================================

/**
 * 쿠폰 복구 결과
 */
export interface CouponRecoveryResult {
  /** 성공 여부 */
  success: boolean
  /** 복구된 사용자 쿠폰 ID */
  userCouponId: string | null
  /** 마스터 쿠폰 ID */
  couponId: string | null
  /** 에러 메시지 (실패 시) */
  errorMessage: string | null
}

/**
 * 쿠폰 복구 파라미터
 */
export interface RecoverCouponParams {
  /** 주문 ID */
  orderId: string
  /** 취소 ID */
  cancellationId: string
  /** 사용자 쿠폰 ID */
  userCouponId: string
}

/**
 * 포인트 복구 결과
 */
export interface PointRecoveryResult {
  /** 성공 여부 */
  success: boolean
  /** 복구된 포인트 */
  recoveredPoints: number
  /** 새로운 잔액 */
  newBalance: number
  /** 거래 내역 ID */
  transactionId: string | null
  /** 에러 메시지 (실패 시) */
  errorMessage: string | null
}

/**
 * 포인트 복구 파라미터
 */
export interface RecoverPointsParams {
  /** 주문 ID */
  orderId: string
  /** 취소 ID */
  cancellationId: string
  /** 사용자 ID */
  userId: string
  /** 복구할 포인트 금액 */
  usedPoints: number
}

/**
 * 사용자 포인트 정보
 */
export interface UserPoints {
  /** 포인트 ID */
  id: string
  /** 사용자 ID */
  userId: string
  /** 현재 잔액 */
  balance: number
  /** 총 적립 금액 */
  totalEarned: number
  /** 총 사용 금액 */
  totalUsed: number
  /** 생성 시간 */
  createdAt: string
  /** 수정 시간 */
  updatedAt: string
}

/**
 * 포인트 거래 유형
 */
export type PointTransactionType =
  | 'earn' // 적립
  | 'use' // 사용
  | 'refund' // 환불
  | 'expire' // 만료
  | 'admin_adjust' // 관리자 조정

/**
 * 포인트 거래 내역
 */
export interface PointTransaction {
  /** 거래 ID */
  id: string
  /** 사용자 ID */
  userId: string
  /** 주문 ID (관련 주문이 있는 경우) */
  orderId: string | null
  /** 취소 ID (환불인 경우) */
  cancellationId: string | null
  /** 거래 유형 */
  type: PointTransactionType
  /** 금액 (양수: 적립/환불, 음수: 사용) */
  amount: number
  /** 거래 후 잔액 */
  balanceAfter: number
  /** 설명 */
  description: string | null
  /** 만료일 (적립 시에만 사용) */
  expiresAt: string | null
  /** 생성 시간 */
  createdAt: string
}

/**
 * 통합 복구 결과 (쿠폰 + 포인트)
 */
export interface RecoveryResult {
  /** 쿠폰 복구 결과 */
  coupon: CouponRecoveryResult
  /** 포인트 복구 결과 */
  points: PointRecoveryResult
}

/**
 * 취소 처리 전체 결과
 */
export interface CancellationProcessResult {
  /** 성공 여부 */
  success: boolean
  /** 취소 정보 */
  cancellation: OrderCancellation | null
  /** 환불 정보 */
  refund: Refund | null
  /** 쿠폰 복구 결과 */
  couponRecovery: CouponRecoveryResult | null
  /** 포인트 복구 결과 */
  pointsRecovery: PointRecoveryResult | null
  /** 에러 메시지 */
  errorMessage: string | null
}
