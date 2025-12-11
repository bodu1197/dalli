/**
 * Services 모듈 통합 Export
 */

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
