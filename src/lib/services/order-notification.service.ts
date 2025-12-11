/**
 * 주문 알림 서비스
 * @description 주문 상태 변경 시 관련자에게 알림 발송
 */

import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/order.types'
import type { NotificationType, NotificationData } from '@/types/notification.types'
import { dispatchNotification } from './notification-dispatch.service'
import { getOrderById } from './order.service'

// ============================================================================
// 타입 정의
// ============================================================================

type NotificationTarget = 'customer' | 'owner' | 'rider'

interface OrderNotificationContext {
  orderId: string
  orderNumber: string
  restaurantName: string
  totalAmount: number
  menuSummary: string
  estimatedTime?: string
  previousStatus?: OrderStatus
  changedBy?: string
}

// ============================================================================
// 상태별 알림 타입 매핑
// ============================================================================

const STATUS_TO_NOTIFICATION_TYPE: Record<OrderStatus, NotificationType | null> = {
  pending: 'order_new',
  confirmed: 'order_confirmed',
  rejected: 'order_rejected',
  preparing: 'order_preparing',
  ready: 'order_ready',
  picked_up: 'order_picked_up',
  delivering: 'order_delivering',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
}

// ============================================================================
// 주문 알림 발송
// ============================================================================

/**
 * 주문 상태 변경 알림 발송
 * @param orderId 주문 ID
 * @param newStatus 새 상태
 * @param targets 알림 대상 배열
 * @param metadata 추가 메타데이터
 */
export async function dispatchOrderNotification(
  orderId: string,
  newStatus: OrderStatus,
  targets: NotificationTarget[],
  metadata?: {
    previousStatus?: OrderStatus
    changedBy?: string
  }
): Promise<void> {
  const supabase = await createClient()

  // 주문 정보 조회
  const order = await getOrderById(orderId)
  if (!order) {
    return
  }

  // 알림 타입 결정
  const notificationType = STATUS_TO_NOTIFICATION_TYPE[newStatus]
  if (!notificationType) {
    return
  }

  // 메뉴 요약 생성
  const menuSummary =
    order.items.length > 1
      ? `${order.items[0].menuName} 외 ${order.items.length - 1}개`
      : order.items[0]?.menuName ?? ''

  // 알림 컨텍스트
  const context: OrderNotificationContext = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    restaurantName: order.restaurantName,
    totalAmount: order.totalAmount,
    menuSummary,
    estimatedTime: order.estimatedDeliveryTime ?? undefined,
    previousStatus: metadata?.previousStatus,
    changedBy: metadata?.changedBy,
  }

  // 각 대상에게 알림 발송
  for (const target of targets) {
    await sendNotificationToTarget(target, notificationType, context, order)
  }
}

/**
 * 특정 대상에게 알림 발송
 */
async function sendNotificationToTarget(
  target: NotificationTarget,
  type: NotificationType,
  context: OrderNotificationContext,
  order: Awaited<ReturnType<typeof getOrderById>>
): Promise<void> {
  if (!order) return

  const supabase = await createClient()

  // 대상별 사용자 ID 결정
  let targetUserId: string | null = null

  switch (target) {
    case 'customer':
      targetUserId = order.userId
      break

    case 'owner': {
      // 식당 점주 ID 조회
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('owner_id')
        .eq('id', order.restaurantId)
        .single()
      targetUserId = restaurant?.owner_id ?? null
      break
    }

    case 'rider':
      targetUserId = order.riderId
      break
  }

  if (!targetUserId) {
    return
  }

  // 템플릿 변수 준비
  const variables: Record<string, string | number | undefined> = {
    orderNumber: context.orderNumber,
    restaurantName: context.restaurantName,
    menuSummary: context.menuSummary,
    totalAmount: context.totalAmount,
    estimatedTime: context.estimatedTime,
  }

  // 알림 데이터
  const data: NotificationData = {
    orderId: context.orderId,
    orderNumber: context.orderNumber,
    restaurantId: order.restaurantId,
    status: order.status,
    actionUrl: getActionUrl(target, context.orderId),
  }

  // 알림 발송
  await dispatchNotification(targetUserId, type, variables, data)
}

/**
 * 대상별 액션 URL 생성
 */
function getActionUrl(target: NotificationTarget, orderId: string): string {
  switch (target) {
    case 'customer':
      return `/orders/${orderId}`
    case 'owner':
      return `/owner/orders/${orderId}`
    case 'rider':
      return `/rider/delivery/${orderId}`
  }
}

// ============================================================================
// 특정 상황별 알림 함수
// ============================================================================

/**
 * 새 주문 알림 발송 (점주에게)
 * @param orderId 주문 ID
 */
export async function notifyNewOrder(orderId: string): Promise<void> {
  await dispatchOrderNotification(orderId, 'pending', ['owner'])
}

/**
 * 주문 접수 완료 알림 (고객에게)
 * @param orderId 주문 ID
 * @param estimatedPrepTime 예상 조리 시간
 */
export async function notifyOrderConfirmed(
  orderId: string,
  estimatedPrepTime: number
): Promise<void> {
  const supabase = await createClient()
  const order = await getOrderById(orderId)

  if (!order) return

  // 예상 배달 시간 계산
  const estimatedTime = new Date()
  estimatedTime.setMinutes(estimatedTime.getMinutes() + estimatedPrepTime + 30)

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    restaurantName: order.restaurantName,
    estimatedMinutes: estimatedPrepTime + 30,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    estimatedDeliveryTime: estimatedTime.toISOString(),
    actionUrl: `/orders/${orderId}/tracking`,
  }

  await dispatchNotification(order.userId, 'order_confirmed', variables, data)
}

/**
 * 주문 거절 알림 (고객에게)
 * @param orderId 주문 ID
 * @param reason 거절 사유
 * @param detail 상세 사유
 */
export async function notifyOrderRejected(
  orderId: string,
  reason: string,
  detail?: string
): Promise<void> {
  const order = await getOrderById(orderId)

  if (!order) return

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    restaurantName: order.restaurantName,
    rejectionReason: reason,
    rejectionDetail: detail,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    rejectionReason: reason,
    actionUrl: `/orders/${orderId}`,
  }

  await dispatchNotification(order.userId, 'order_rejected', variables, data)
}

/**
 * 조리 시작 알림 (고객에게)
 * @param orderId 주문 ID
 */
export async function notifyPreparingStarted(orderId: string): Promise<void> {
  await dispatchOrderNotification(orderId, 'preparing', ['customer'])
}

/**
 * 조리 완료 알림 (고객, 라이더에게)
 * @param orderId 주문 ID
 */
export async function notifyOrderReady(orderId: string): Promise<void> {
  await dispatchOrderNotification(orderId, 'ready', ['customer', 'rider'])
}

/**
 * 픽업 완료 알림 (고객에게)
 * @param orderId 주문 ID
 * @param riderName 라이더 이름
 */
export async function notifyPickedUp(
  orderId: string,
  riderName: string
): Promise<void> {
  const order = await getOrderById(orderId)

  if (!order) return

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    restaurantName: order.restaurantName,
    riderName,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    riderName,
    actionUrl: `/orders/${orderId}/tracking`,
  }

  await dispatchNotification(order.userId, 'order_picked_up', variables, data)
}

/**
 * 배달 시작 알림 (고객에게)
 * @param orderId 주문 ID
 */
export async function notifyDeliveringStarted(orderId: string): Promise<void> {
  await dispatchOrderNotification(orderId, 'delivering', ['customer'])
}

/**
 * 배달 완료 알림 (고객, 점주에게)
 * @param orderId 주문 ID
 */
export async function notifyDelivered(orderId: string): Promise<void> {
  await dispatchOrderNotification(orderId, 'delivered', ['customer', 'owner'])
}

/**
 * 주문 취소 알림
 * @param orderId 주문 ID
 * @param cancelledBy 취소자
 * @param reason 취소 사유
 */
export async function notifyCancelled(
  orderId: string,
  cancelledBy: 'customer' | 'owner' | 'system',
  reason: string
): Promise<void> {
  const order = await getOrderById(orderId)

  if (!order) return

  // 취소자에 따른 알림 대상 결정
  const targets: NotificationTarget[] = []

  if (cancelledBy === 'customer') {
    targets.push('owner')
    if (order.riderId) targets.push('rider')
  } else if (cancelledBy === 'owner') {
    targets.push('customer')
    if (order.riderId) targets.push('rider')
  } else {
    // 시스템 취소
    targets.push('customer', 'owner')
    if (order.riderId) targets.push('rider')
  }

  // 각 대상에게 취소 알림 발송
  for (const target of targets) {
    await sendCancellationNotification(target, order, cancelledBy, reason)
  }
}

/**
 * 취소 알림 발송
 */
async function sendCancellationNotification(
  target: NotificationTarget,
  order: NonNullable<Awaited<ReturnType<typeof getOrderById>>>,
  cancelledBy: string,
  reason: string
): Promise<void> {
  const supabase = await createClient()

  let targetUserId: string | null = null

  switch (target) {
    case 'customer':
      targetUserId = order.userId
      break
    case 'owner': {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('owner_id')
        .eq('id', order.restaurantId)
        .single()
      targetUserId = restaurant?.owner_id ?? null
      break
    }
    case 'rider':
      targetUserId = order.riderId
      break
  }

  if (!targetUserId) return

  const cancelledByLabel =
    cancelledBy === 'customer'
      ? '고객'
      : cancelledBy === 'owner'
        ? '점주'
        : '시스템'

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    restaurantName: order.restaurantName,
    cancelledBy: cancelledByLabel,
    cancellationReason: reason,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    cancelledBy,
    cancellationReason: reason,
    actionUrl: getActionUrl(target, order.id),
  }

  await dispatchNotification(targetUserId, 'order_cancelled', variables, data)
}

// ============================================================================
// 리마인더 알림
// ============================================================================

/**
 * 신규 주문 리마인더 (점주에게)
 * 점주가 일정 시간 내 응답하지 않을 경우
 */
export async function sendNewOrderReminder(orderId: string): Promise<void> {
  const supabase = await createClient()
  const order = await getOrderById(orderId)

  if (!order || order.status !== 'pending') return

  // 점주 ID 조회
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('owner_id')
    .eq('id', order.restaurantId)
    .single()

  if (!restaurant?.owner_id) return

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    minutesWaiting: 5,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    actionUrl: `/owner/orders/${orderId}`,
    isUrgent: true,
  }

  await dispatchNotification(restaurant.owner_id, 'order_reminder', variables, data, [
    'in_app',
    'push',
  ])
}

/**
 * 조리 완료 리마인더 (라이더에게)
 * 라이더 배정 후 일정 시간 내 픽업하지 않을 경우
 */
export async function sendPickupReminder(orderId: string): Promise<void> {
  const order = await getOrderById(orderId)

  if (!order || order.status !== 'ready' || !order.riderId) return

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    restaurantName: order.restaurantName,
    minutesWaiting: 10,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    actionUrl: `/rider/delivery/${orderId}`,
    isUrgent: true,
  }

  await dispatchNotification(order.riderId, 'pickup_reminder', variables, data, [
    'in_app',
    'push',
  ])
}

// ============================================================================
// 배달 진행 상황 알림
// ============================================================================

/**
 * 예상 도착 시간 업데이트 알림
 * @param orderId 주문 ID
 * @param newETA 새로운 예상 도착 시간
 * @param reason 변경 사유 (선택)
 */
export async function notifyETAUpdate(
  orderId: string,
  newETA: Date,
  reason?: string
): Promise<void> {
  const order = await getOrderById(orderId)

  if (!order || !['delivering', 'picked_up'].includes(order.status)) return

  const remainingMinutes = Math.round(
    (newETA.getTime() - Date.now()) / (1000 * 60)
  )

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    remainingMinutes,
    updateReason: reason,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    estimatedDeliveryTime: newETA.toISOString(),
    actionUrl: `/orders/${orderId}/tracking`,
  }

  await dispatchNotification(order.userId, 'delivery_eta_update', variables, data)
}

/**
 * 라이더 근처 도착 알림
 * @param orderId 주문 ID
 * @param remainingMinutes 남은 시간 (분)
 */
export async function notifyRiderNearby(
  orderId: string,
  remainingMinutes: number
): Promise<void> {
  const order = await getOrderById(orderId)

  if (!order || order.status !== 'delivering') return

  const variables: Record<string, string | number | undefined> = {
    orderNumber: order.orderNumber,
    remainingMinutes,
  }

  const data: NotificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    actionUrl: `/orders/${orderId}/tracking`,
  }

  await dispatchNotification(order.userId, 'rider_nearby', variables, data)
}

// ============================================================================
// 취소 승인/거절 알림
// ============================================================================

/**
 * 취소 요청 승인 알림 (고객에게)
 * @param cancellationId 취소 ID
 * @param customerId 고객 ID
 */
export async function notifyCancellationApproved(
  cancellationId: string,
  customerId: string
): Promise<void> {
  const supabase = await createClient()

  // 취소 정보 조회
  const { data: cancellation } = await supabase
    .from('order_cancellations')
    .select(`
      id,
      order_id,
      refund_amount,
      orders (
        order_number,
        restaurants (
          name
        )
      )
    `)
    .eq('id', cancellationId)
    .single()

  if (!cancellation) return

  const orderData = cancellation.orders as {
    order_number: string
    restaurants: { name: string } | null
  } | null

  const variables: Record<string, string | number | undefined> = {
    orderNumber: orderData?.order_number ?? '',
    restaurantName: orderData?.restaurants?.name ?? '',
    refundAmount: cancellation.refund_amount ?? 0,
  }

  const data: NotificationData = {
    orderId: cancellation.order_id,
    orderNumber: orderData?.order_number ?? '',
    cancellationId: cancellation.id,
    actionUrl: `/orders/${cancellation.order_id}`,
  }

  await dispatchNotification(customerId, 'cancellation_approved', variables, data)
}

/**
 * 취소 요청 거절 알림 (고객에게)
 * @param cancellationId 취소 ID
 * @param customerId 고객 ID
 * @param rejectionReason 거절 사유
 */
export async function notifyCancellationRejected(
  cancellationId: string,
  customerId: string,
  rejectionReason: string
): Promise<void> {
  const supabase = await createClient()

  // 취소 정보 조회
  const { data: cancellation } = await supabase
    .from('order_cancellations')
    .select(`
      id,
      order_id,
      orders (
        order_number,
        restaurants (
          name
        )
      )
    `)
    .eq('id', cancellationId)
    .single()

  if (!cancellation) return

  const orderData = cancellation.orders as {
    order_number: string
    restaurants: { name: string } | null
  } | null

  const variables: Record<string, string | number | undefined> = {
    orderNumber: orderData?.order_number ?? '',
    restaurantName: orderData?.restaurants?.name ?? '',
    rejectionReason,
  }

  const data: NotificationData = {
    orderId: cancellation.order_id,
    orderNumber: orderData?.order_number ?? '',
    cancellationId: cancellation.id,
    rejectionReason,
    actionUrl: `/orders/${cancellation.order_id}`,
  }

  await dispatchNotification(customerId, 'cancellation_rejected', variables, data)
}

/**
 * 신규 취소 요청 알림 (점주에게)
 * @param cancellationId 취소 ID
 * @param ownerId 점주 ID
 */
export async function notifyNewCancellationRequest(
  cancellationId: string,
  ownerId: string
): Promise<void> {
  const supabase = await createClient()

  // 취소 정보 조회
  const { data: cancellation } = await supabase
    .from('order_cancellations')
    .select(`
      id,
      order_id,
      reason,
      refund_amount,
      approval_deadline,
      orders (
        order_number,
        total_amount,
        users!orders_user_id_fkey (
          name
        )
      )
    `)
    .eq('id', cancellationId)
    .single()

  if (!cancellation) return

  const orderData = cancellation.orders as {
    order_number: string
    total_amount: number
    users: { name: string } | null
  } | null

  // 남은 시간 계산
  const deadline = cancellation.approval_deadline
    ? new Date(cancellation.approval_deadline)
    : null
  const remainingMinutes = deadline
    ? Math.floor((deadline.getTime() - Date.now()) / (1000 * 60))
    : null

  const variables: Record<string, string | number | undefined> = {
    orderNumber: orderData?.order_number ?? '',
    customerName: orderData?.users?.name ?? '고객',
    orderAmount: orderData?.total_amount ?? 0,
    refundAmount: cancellation.refund_amount ?? 0,
    cancellationReason: cancellation.reason,
    remainingMinutes: remainingMinutes ?? undefined,
  }

  const data: NotificationData = {
    orderId: cancellation.order_id,
    orderNumber: orderData?.order_number ?? '',
    cancellationId: cancellation.id,
    isUrgent: true,
    actionUrl: `/owner/cancellations`,
  }

  // 점주에게 푸시 포함 긴급 알림
  await dispatchNotification(ownerId, 'cancellation_request', variables, data, [
    'in_app',
    'push',
  ])
}
