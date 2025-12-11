/**
 * Services 모듈 통합 Export
 * @description 주문 취소 관련 모든 서비스를 통합 관리합니다.
 */

// ============================================================================
// Phase 2: PG 환불 서비스
// ============================================================================

// Refund Service
export {
  RefundService,
  createRefundRequest,
  calculateRefundableAmount,
  isPartialRefund,
  validateRefundAmount,
} from './refund.service'

// PG Refund Service
export {
  processPGRefund,
  processPGRefundBatch,
  processPendingRefunds,
} from './pg-refund.service'

export type { ProcessPGRefundResult } from './pg-refund.service'

// ============================================================================
// Phase 3: 쿠폰/포인트 복구 서비스
// ============================================================================

// Coupon Recovery Service
export {
  recoverCoupon,
  recoverCouponFromOrder,
  canRecoverCoupon,
} from './coupon-recovery.service'

// Point Recovery Service
export {
  recoverPoints,
  recoverPointsFromOrder,
  getUserPointBalance,
  canRecoverPoints,
  getPointTransactions,
} from './point-recovery.service'

// Cancellation Recovery Service (통합 서비스)
export {
  processCancellationRecovery,
  getRecoveryStatus,
  processPendingCancellations,
  retryCancellationRecovery,
} from './cancellation-recovery.service'

// ============================================================================
// Phase 4: 점주 승인 필요 취소 시스템
// ============================================================================

// Cancellation Policy Service (취소 정책)
export {
  getCancellationPolicy,
  getAllCancellationPolicies,
  canCancelOrder,
  getCancellationTypeLabel,
  getRefundRateDescription,
  validateCancellationPolicy,
} from './cancellation-policy.service'

// Cancellation Request Service (취소 요청)
export {
  createCancellationRequest,
  getCancellation,
  getCancellationByOrderId,
  getCancellationWithDetails,
  getCustomerCancellations,
  withdrawCancellationRequest,
  getRemainingMinutes,
  isExpired,
} from './cancellation-request.service'

// Cancellation Approval Service (점주 승인/거절)
export {
  getPendingApprovalsForOwner,
  approveCancellation,
  rejectCancellation,
  processAutoApprovals,
  getCancellationStats,
  getPendingApprovalCount,
} from './cancellation-approval.service'
