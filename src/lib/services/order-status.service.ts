/**
 * 주문 상태 변경 서비스
 * @description 역할 기반 주문 상태 전환 및 관련 비즈니스 로직
 */

import { createClient } from '@/lib/supabase/server'
import type { OrderStatus, Order } from '@/types/order.types'
import type { OrderStatusChangeRole } from '@/types/order-status.types'
import {
  canTransitionStatus,
  isFinalStatus,
  STATUS_CHANGE_NOTIFICATION_TARGETS,
} from '@/types/order-status.types'
import { getOrderById } from './order.service'
import { dispatchOrderNotification } from './order-notification.service'

// ============================================================================
// 결과 타입
// ============================================================================

export interface StatusChangeResult {
  success: boolean
  order: Order | null
  error: string | null
}

// ============================================================================
// 상태 변경 공통 함수
// ============================================================================

/**
 * 주문 상태 변경 (공통)
 * @param orderId 주문 ID
 * @param newStatus 새 상태
 * @param role 변경자 역할
 * @param userId 변경자 ID
 * @param additionalData 추가 업데이트 데이터
 * @param note 상태 변경 메모
 */
async function changeOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  role: OrderStatusChangeRole,
  userId: string,
  additionalData?: Record<string, unknown>,
  note?: string
): Promise<StatusChangeResult> {
  const supabase = await createClient()

  try {
    // 1. 현재 주문 조회
    const order = await getOrderById(orderId)
    if (!order) {
      return {
        success: false,
        order: null,
        error: '주문을 찾을 수 없습니다',
      }
    }

    const currentStatus = order.status

    // 2. 이미 최종 상태인지 확인
    if (isFinalStatus(currentStatus)) {
      return {
        success: false,
        order: null,
        error: '이미 완료된 주문은 상태를 변경할 수 없습니다',
      }
    }

    // 3. 상태 전환 권한 확인
    if (!canTransitionStatus(currentStatus, newStatus, role)) {
      return {
        success: false,
        order: null,
        error: `${role} 역할은 ${currentStatus}에서 ${newStatus}로 변경할 수 없습니다`,
      }
    }

    // 4. 주문 상태 업데이트
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...additionalData,
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      return {
        success: false,
        order: null,
        error: `상태 변경 실패: ${updateError.message}`,
      }
    }

    // 5. 상태 이력 기록
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      note: note ?? getDefaultStatusNote(newStatus),
      changed_by: role,
      changed_by_user_id: userId,
    })

    // 6. 알림 발송
    const notificationTargets = STATUS_CHANGE_NOTIFICATION_TARGETS[newStatus]
    await dispatchOrderNotification(orderId, newStatus, notificationTargets, {
      previousStatus: currentStatus,
      changedBy: role,
    })

    // 7. 업데이트된 주문 반환
    const updatedOrder = await getOrderById(orderId)

    return {
      success: true,
      order: updatedOrder,
      error: null,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return {
      success: false,
      order: null,
      error: `상태 변경 실패: ${errorMessage}`,
    }
  }
}

/**
 * 기본 상태 변경 메모 생성
 */
function getDefaultStatusNote(status: OrderStatus): string {
  const notes: Record<OrderStatus, string> = {
    pending: '주문이 생성되었습니다',
    confirmed: '점주가 주문을 접수했습니다',
    rejected: '점주가 주문을 거절했습니다',
    preparing: '조리를 시작했습니다',
    ready: '조리가 완료되었습니다',
    picked_up: '라이더가 음식을 픽업했습니다',
    delivering: '배달을 시작했습니다',
    delivered: '배달이 완료되었습니다',
    cancelled: '주문이 취소되었습니다',
  }
  return notes[status]
}

// ============================================================================
// 점주 전용 상태 변경 함수
// ============================================================================

/**
 * 주문 접수 (점주)
 * @param orderId 주문 ID
 * @param ownerId 점주 ID
 * @param estimatedPrepTime 예상 조리 시간 (분)
 */
export async function confirmOrder(
  orderId: string,
  ownerId: string,
  estimatedPrepTime: number
): Promise<StatusChangeResult> {
  // 예상 배달 완료 시간 계산 (조리 시간 + 배달 시간 30분)
  const estimatedDeliveryTime = new Date()
  estimatedDeliveryTime.setMinutes(
    estimatedDeliveryTime.getMinutes() + estimatedPrepTime + 30
  )

  return changeOrderStatus(orderId, 'confirmed', 'owner', ownerId, {
    confirmed_at: new Date().toISOString(),
    estimated_prep_time: estimatedPrepTime,
    estimated_delivery_time: estimatedDeliveryTime.toISOString(),
  })
}

/**
 * 주문 거절 (점주)
 * @param orderId 주문 ID
 * @param ownerId 점주 ID
 * @param reason 거절 사유
 * @param detail 상세 사유
 */
export async function rejectOrder(
  orderId: string,
  ownerId: string,
  reason: string,
  detail?: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(
    orderId,
    'rejected',
    'owner',
    ownerId,
    {
      rejection_reason: reason,
      rejection_detail: detail ?? null,
    },
    `거절 사유: ${reason}`
  )
}

/**
 * 조리 시작 (점주)
 * @param orderId 주문 ID
 * @param ownerId 점주 ID
 */
export async function startPreparing(
  orderId: string,
  ownerId: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(orderId, 'preparing', 'owner', ownerId)
}

/**
 * 조리 완료 (점주)
 * @param orderId 주문 ID
 * @param ownerId 점주 ID
 */
export async function markReady(
  orderId: string,
  ownerId: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(orderId, 'ready', 'owner', ownerId, {
    prepared_at: new Date().toISOString(),
  })
}

// ============================================================================
// 라이더 전용 상태 변경 함수
// ============================================================================

/**
 * 픽업 완료 (라이더)
 * @param orderId 주문 ID
 * @param riderId 라이더 ID
 * @param riderName 라이더 이름
 * @param riderPhone 라이더 전화번호
 */
export async function markPickedUp(
  orderId: string,
  riderId: string,
  riderName: string,
  riderPhone: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(orderId, 'picked_up', 'rider', riderId, {
    rider_id: riderId,
    rider_name: riderName,
    rider_phone: riderPhone,
    picked_up_at: new Date().toISOString(),
  })
}

/**
 * 배달 시작 (라이더)
 * @param orderId 주문 ID
 * @param riderId 라이더 ID
 */
export async function startDelivering(
  orderId: string,
  riderId: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(orderId, 'delivering', 'rider', riderId)
}

/**
 * 배달 완료 (라이더)
 * @param orderId 주문 ID
 * @param riderId 라이더 ID
 */
export async function completeDelivery(
  orderId: string,
  riderId: string
): Promise<StatusChangeResult> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const result = await changeOrderStatus(orderId, 'delivered', 'rider', riderId, {
    delivered_at: now,
    actual_delivery_time: now,
  })

  if (result.success && result.order) {
    // 포인트 적립 처리 (주문 금액의 1%)
    const pointsToEarn = Math.floor(result.order.menuAmount * 0.01)
    if (pointsToEarn > 0) {
      await supabase.rpc('earn_points', {
        p_user_id: result.order.userId,
        p_amount: pointsToEarn,
        p_order_id: orderId,
        p_description: `주문 적립 (${result.order.orderNumber})`,
      })
    }

    // 라이더 배달 완료 수 증가
    await supabase.rpc('increment_rider_deliveries', {
      p_rider_id: riderId,
    })
  }

  return result
}

// ============================================================================
// 취소 관련 함수
// ============================================================================

/**
 * 고객 주문 취소 (pending 상태에서만)
 * @param orderId 주문 ID
 * @param customerId 고객 ID
 * @param reason 취소 사유
 */
export async function cancelOrderByCustomer(
  orderId: string,
  customerId: string,
  reason: string
): Promise<StatusChangeResult> {
  const order = await getOrderById(orderId)
  if (!order) {
    return {
      success: false,
      order: null,
      error: '주문을 찾을 수 없습니다',
    }
  }

  // 고객은 pending 상태에서만 즉시 취소 가능
  if (order.status !== 'pending') {
    return {
      success: false,
      order: null,
      error: '접수 완료된 주문은 즉시 취소할 수 없습니다. 취소 요청을 해주세요.',
    }
  }

  return changeOrderStatus(
    orderId,
    'cancelled',
    'customer',
    customerId,
    {
      cancelled_reason: reason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'customer',
    },
    `고객 취소: ${reason}`
  )
}

/**
 * 점주 주문 취소
 * @param orderId 주문 ID
 * @param ownerId 점주 ID
 * @param reason 취소 사유
 */
export async function cancelOrderByOwner(
  orderId: string,
  ownerId: string,
  reason: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(
    orderId,
    'cancelled',
    'owner',
    ownerId,
    {
      cancelled_reason: reason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'owner',
    },
    `점주 취소: ${reason}`
  )
}

/**
 * 시스템 주문 취소
 * @param orderId 주문 ID
 * @param reason 취소 사유
 */
export async function cancelOrderBySystem(
  orderId: string,
  reason: string
): Promise<StatusChangeResult> {
  return changeOrderStatus(
    orderId,
    'cancelled',
    'system',
    'system',
    {
      cancelled_reason: reason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'system',
    },
    `시스템 취소: ${reason}`
  )
}

// ============================================================================
// 상태 이력 조회
// ============================================================================

/**
 * 주문 상태 이력 조회
 * @param orderId 주문 ID
 */
export async function getOrderStatusHistory(orderId: string): Promise<
  Array<{
    id: string
    status: OrderStatus
    note: string | null
    changedBy: OrderStatusChangeRole
    changedByUserId: string | null
    createdAt: string
  }>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((record) => ({
    id: record.id,
    status: record.status as OrderStatus,
    note: record.note,
    changedBy: record.changed_by as OrderStatusChangeRole,
    changedByUserId: record.changed_by_user_id,
    createdAt: record.created_at,
  }))
}

// ============================================================================
// 점주용 주문 조회 (상세)
// ============================================================================

/**
 * 점주용 주문 상세 조회
 * @param orderId 주문 ID
 * @param restaurantId 식당 ID (권한 확인용)
 */
export async function getOrderForOwner(
  orderId: string,
  restaurantId: string
): Promise<Order | null> {
  const order = await getOrderById(orderId)

  if (!order || order.restaurantId !== restaurantId) {
    return null
  }

  return order
}

/**
 * 점주 대시보드용 실시간 주문 현황 조회
 * @param restaurantId 식당 ID
 */
export async function getOrderDashboard(restaurantId: string): Promise<{
  pending: number
  confirmed: number
  preparing: number
  ready: number
  todayOrders: number
  todayRevenue: number
}> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 상태별 주문 수
  const statusCounts = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'confirmed'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'preparing'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'ready'),
  ])

  // 오늘 주문 통계
  const { data: todayData, count: todayCount } = await supabase
    .from('orders')
    .select('total_amount', { count: 'exact' })
    .eq('restaurant_id', restaurantId)
    .gte('created_at', today.toISOString())
    .not('status', 'in', '("rejected","cancelled")')

  const todayRevenue = todayData?.reduce((sum, order) => sum + order.total_amount, 0) ?? 0

  return {
    pending: statusCounts[0].count ?? 0,
    confirmed: statusCounts[1].count ?? 0,
    preparing: statusCounts[2].count ?? 0,
    ready: statusCounts[3].count ?? 0,
    todayOrders: todayCount ?? 0,
    todayRevenue,
  }
}
