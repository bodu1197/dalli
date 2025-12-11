/**
 * 취소 전용 알림 서비스
 * @description 주문 취소 프로세스에 특화된 알림 발송 서비스
 */

import type { NotificationData, NotificationChannel } from '@/types/notification.types'
import { dispatchNotification, dispatchUrgentNotification } from './notification-dispatch.service'

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 취소 알림 공통 파라미터
 */
interface CancellationNotificationParams {
  orderId: string
  cancellationId: string
  restaurantId: string
  restaurantName: string
}

/**
 * 취소 알림 발송 결과
 */
interface CancellationNotificationResult {
  success: boolean
  notificationId: string | null
  error?: string
}

// ============================================================================
// 고객용 취소 알림
// ============================================================================

/**
 * 취소 요청 접수 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param params 알림 파라미터
 * @returns 발송 결과
 */
export async function notifyCustomerCancellationRequested(
  userId: string,
  params: CancellationNotificationParams
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  const result = await dispatchNotification(
    userId,
    'cancellation_requested_customer',
    { restaurantName },
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      action: `/orders/${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 즉시 취소 완료 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param params 알림 파라미터
 * @param refundAmount 환불 금액
 * @returns 발송 결과
 */
export async function notifyCustomerInstantCancellation(
  userId: string,
  params: CancellationNotificationParams,
  refundAmount: number
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  const result = await dispatchNotification(
    userId,
    'cancellation_instant_completed',
    { restaurantName, refundAmount },
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      refundAmount,
      action: `/orders/${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 취소 승인 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param params 알림 파라미터
 * @param refundAmount 환불 금액
 * @returns 발송 결과
 */
export async function notifyCustomerCancellationApproved(
  userId: string,
  params: CancellationNotificationParams,
  refundAmount: number
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  const result = await dispatchNotification(
    userId,
    'cancellation_approved',
    { restaurantName, refundAmount },
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      refundAmount,
      action: `/orders/${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 취소 거절 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param params 알림 파라미터
 * @param rejectionReason 거절 사유
 * @returns 발송 결과
 */
export async function notifyCustomerCancellationRejected(
  userId: string,
  params: CancellationNotificationParams,
  rejectionReason: string
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  const result = await dispatchNotification(
    userId,
    'cancellation_rejected',
    { restaurantName, rejectionReason },
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      rejectionReason,
      action: `/orders/${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 자동 승인 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param params 알림 파라미터
 * @param refundAmount 환불 금액
 * @returns 발송 결과
 */
export async function notifyCustomerAutoApproved(
  userId: string,
  params: CancellationNotificationParams,
  refundAmount: number
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  const result = await dispatchNotification(
    userId,
    'cancellation_auto_approved',
    { refundAmount },
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      refundAmount,
      action: `/orders/${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

// ============================================================================
// 점주용 취소 알림
// ============================================================================

/**
 * 취소 요청 도착 알림 (점주에게) - 긴급
 *
 * @param ownerId 점주 ID
 * @param params 알림 파라미터
 * @param customerName 고객 이름
 * @param deadlineMinutes 응답 데드라인 (분)
 * @returns 발송 결과
 */
export async function notifyOwnerCancellationRequested(
  ownerId: string,
  params: CancellationNotificationParams,
  customerName: string,
  deadlineMinutes: number = 30
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  // 점주에게는 긴급 알림으로 발송 (방해 금지 무시)
  const result = await dispatchUrgentNotification(
    ownerId,
    'cancellation_requested_owner',
    { customerName, deadlineMinutes },
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      action: `/owner/orders/${orderId}/cancel`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 취소 요청 철회 알림 (점주에게)
 *
 * @param ownerId 점주 ID
 * @param params 알림 파라미터
 * @returns 발송 결과
 */
export async function notifyOwnerCancellationWithdrawn(
  ownerId: string,
  params: CancellationNotificationParams
): Promise<CancellationNotificationResult> {
  const { orderId, cancellationId, restaurantId, restaurantName } = params

  const result = await dispatchNotification(
    ownerId,
    'cancellation_withdrawn',
    {},
    {
      orderId,
      cancellationId,
      restaurantId,
      restaurantName,
      action: `/owner/orders/${orderId}`,
    } as NotificationData,
    ['in_app'] // 점주에게는 인앱 알림만
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

// ============================================================================
// 환불 관련 알림
// ============================================================================

/**
 * 환불 진행 중 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param orderId 주문 ID
 * @param refundAmount 환불 금액
 * @returns 발송 결과
 */
export async function notifyRefundProcessing(
  userId: string,
  orderId: string,
  refundAmount: number
): Promise<CancellationNotificationResult> {
  const result = await dispatchNotification(
    userId,
    'refund_processing',
    { refundAmount },
    {
      orderId,
      refundAmount,
      action: `/orders/${orderId}`,
    } as NotificationData,
    ['in_app'] // 환불 진행 중은 인앱만
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 환불 완료 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param orderId 주문 ID
 * @param refundAmount 환불 금액
 * @returns 발송 결과
 */
export async function notifyRefundCompleted(
  userId: string,
  orderId: string,
  refundAmount: number
): Promise<CancellationNotificationResult> {
  const result = await dispatchNotification(
    userId,
    'refund_completed',
    { refundAmount },
    {
      orderId,
      refundAmount,
      action: `/orders/${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 환불 실패 알림 (고객에게) - 긴급
 *
 * @param userId 고객 ID
 * @param orderId 주문 ID
 * @returns 발송 결과
 */
export async function notifyRefundFailed(
  userId: string,
  orderId: string
): Promise<CancellationNotificationResult> {
  // 환불 실패는 긴급 알림
  const result = await dispatchUrgentNotification(
    userId,
    'refund_failed',
    {},
    {
      orderId,
      action: `/support/inquiry?orderId=${orderId}`,
    } as NotificationData
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

// ============================================================================
// 포인트/쿠폰 복구 알림
// ============================================================================

/**
 * 포인트 복구 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param orderId 주문 ID
 * @param pointsAmount 복구된 포인트
 * @returns 발송 결과
 */
export async function notifyPointsRefunded(
  userId: string,
  orderId: string,
  pointsAmount: number
): Promise<CancellationNotificationResult> {
  const result = await dispatchNotification(
    userId,
    'points_refunded',
    { pointsAmount },
    {
      orderId,
      action: `/my/points`,
    } as NotificationData,
    ['in_app'] // 포인트 복구는 인앱만
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

/**
 * 쿠폰 복구 알림 (고객에게)
 *
 * @param userId 고객 ID
 * @param orderId 주문 ID
 * @param couponName 쿠폰 이름
 * @returns 발송 결과
 */
export async function notifyCouponRestored(
  userId: string,
  orderId: string,
  couponName: string
): Promise<CancellationNotificationResult> {
  const result = await dispatchNotification(
    userId,
    'coupon_restored',
    { couponName },
    {
      orderId,
      action: `/my/coupons`,
    } as NotificationData,
    ['in_app'] // 쿠폰 복구는 인앱만
  )

  return {
    success: result.success,
    notificationId: result.notificationId,
    error: result.success ? undefined : '알림 발송 실패',
  }
}

// ============================================================================
// 통합 취소 알림 발송
// ============================================================================

/**
 * 취소 프로세스별 통합 알림 발송
 *
 * @description 취소 상태에 따라 적절한 알림을 고객과 점주에게 발송
 */
export async function sendCancellationNotifications(
  status:
    | 'requested'
    | 'instant_completed'
    | 'approved'
    | 'rejected'
    | 'auto_approved'
    | 'withdrawn',
  params: {
    customerId: string
    ownerId?: string
    orderId: string
    cancellationId: string
    restaurantId: string
    restaurantName: string
    customerName?: string
    refundAmount?: number
    rejectionReason?: string
    deadlineMinutes?: number
  }
): Promise<{
  customerNotification: CancellationNotificationResult | null
  ownerNotification: CancellationNotificationResult | null
}> {
  const {
    customerId,
    ownerId,
    orderId,
    cancellationId,
    restaurantId,
    restaurantName,
    customerName,
    refundAmount,
    rejectionReason,
    deadlineMinutes,
  } = params

  const baseParams: CancellationNotificationParams = {
    orderId,
    cancellationId,
    restaurantId,
    restaurantName,
  }

  let customerNotification: CancellationNotificationResult | null = null
  let ownerNotification: CancellationNotificationResult | null = null

  switch (status) {
    case 'requested':
      // 고객에게 취소 요청 접수 알림
      customerNotification = await notifyCustomerCancellationRequested(customerId, baseParams)

      // 점주에게 취소 요청 도착 알림 (긴급)
      if (ownerId && customerName) {
        ownerNotification = await notifyOwnerCancellationRequested(
          ownerId,
          baseParams,
          customerName,
          deadlineMinutes
        )
      }
      break

    case 'instant_completed':
      // 즉시 취소 완료 알림 (고객에게만)
      if (refundAmount !== undefined) {
        customerNotification = await notifyCustomerInstantCancellation(
          customerId,
          baseParams,
          refundAmount
        )
      }
      break

    case 'approved':
      // 취소 승인 알림 (고객에게)
      if (refundAmount !== undefined) {
        customerNotification = await notifyCustomerCancellationApproved(
          customerId,
          baseParams,
          refundAmount
        )
      }
      break

    case 'rejected':
      // 취소 거절 알림 (고객에게)
      if (rejectionReason) {
        customerNotification = await notifyCustomerCancellationRejected(
          customerId,
          baseParams,
          rejectionReason
        )
      }
      break

    case 'auto_approved':
      // 자동 승인 알림 (고객에게)
      if (refundAmount !== undefined) {
        customerNotification = await notifyCustomerAutoApproved(
          customerId,
          baseParams,
          refundAmount
        )
      }
      break

    case 'withdrawn':
      // 취소 철회 알림 (점주에게만)
      if (ownerId) {
        ownerNotification = await notifyOwnerCancellationWithdrawn(ownerId, baseParams)
      }
      break
  }

  return {
    customerNotification,
    ownerNotification,
  }
}
