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

// ============================================================================
// Phase 5: 알림 시스템
// ============================================================================

// Notification Template Service (알림 템플릿)
export {
  getTemplate,
  getAllTemplates,
  renderTemplate,
  renderNotificationMessage,
  validateTemplateData,
  getDefaultPriority,
  getDefaultChannels,
  renderCancellationMessage,
  renderRefundMessage,
  renderPointsCouponMessage,
} from './notification-template.service'

// Notification Settings Service (알림 설정)
export {
  getNotificationSettings,
  initNotificationSettings,
  updateNotificationSettings,
  setQuietHours,
  isQuietHours,
  canSendNotification,
  toggleChannelNotification,
  toggleCategoryNotification,
  disableAllNotifications,
  resetNotificationSettings,
  getDefaultSettings,
} from './notification-settings.service'

// Push Token Service (푸시 토큰)
export {
  registerPushToken,
  getActiveTokens,
  getTokensByPlatform,
  getTokenByValue,
  deactivateToken,
  deactivateTokenByValue,
  deactivateAllUserTokens,
  deleteToken,
  deleteTokenByValue,
  updateTokenLastUsed,
  updateTokensLastUsed,
  getActiveTokenCount,
  cleanupInactiveTokens,
  cleanupUnusedTokens,
  getTokenByDeviceId,
  getTokensForUsers,
  isValidFCMToken,
} from './push-token.service'

// Notification Service (핵심 알림)
export {
  createNotification,
  createNotificationFromTemplate,
  getNotification,
  getNotifications,
  getUnreadCount,
  getRecentNotifications,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteReadNotifications,
  cleanupExpiredNotifications,
  cleanupOldNotifications,
  getNotificationsByType,
  getNotificationsByPriority,
  getUrgentNotifications,
  getNotificationStats,
} from './notification.service'

// Notification Dispatch Service (알림 발송)
export {
  dispatchNotification,
  dispatchBulkNotification,
  dispatchUrgentNotification,
  retryFailedNotification,
  retryAllFailedNotifications,
} from './notification-dispatch.service'

// Cancellation Notification Service (취소 전용 알림)
export {
  notifyCustomerCancellationRequested,
  notifyCustomerInstantCancellation,
  notifyCustomerCancellationApproved,
  notifyCustomerCancellationRejected,
  notifyCustomerAutoApproved,
  notifyOwnerCancellationRequested,
  notifyOwnerCancellationWithdrawn,
  notifyRefundProcessing,
  notifyRefundCompleted,
  notifyRefundFailed,
  notifyPointsRefunded,
  notifyCouponRestored,
  sendCancellationNotifications,
} from './cancellation-notification.service'
