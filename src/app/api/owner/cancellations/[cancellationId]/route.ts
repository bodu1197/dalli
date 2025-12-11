/**
 * 점주 취소 요청 상세 API 라우트
 * @description 점주가 특정 취소 요청의 상세 정보 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  CANCELLATION_NOT_FOUND: '취소 요청을 찾을 수 없습니다.',
  NOT_AUTHORIZED: '해당 취소 요청에 접근할 권한이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// GET /api/owner/cancellations/[cancellationId] - 취소 요청 상세 조회
// ============================================================================

interface RouteParams {
  params: Promise<{ cancellationId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { cancellationId } = await params

    // 1. 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // 2. 점주의 식당 조회
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_RESTAURANT },
        { status: 404 }
      )
    }

    // 3. 취소 요청 상세 조회
    const { data: cancellation, error: cancellationError } = await supabase
      .from('order_cancellations')
      .select(`
        id,
        order_id,
        requested_by,
        cancel_type,
        status,
        reason,
        reason_detail,
        refund_amount,
        refund_rate,
        owner_action,
        owner_action_at,
        owner_action_by,
        owner_rejection_reason,
        approval_deadline,
        auto_approved,
        can_refund_coupon,
        can_refund_points,
        coupon_refunded,
        points_refunded,
        created_at,
        updated_at,
        orders!inner (
          id,
          total_amount,
          delivery_fee,
          status,
          restaurant_id,
          user_id,
          created_at,
          users!orders_user_id_fkey (
            id,
            name,
            phone
          ),
          order_items (
            id,
            menu_name,
            quantity,
            price,
            options
          )
        )
      `)
      .eq('id', cancellationId)
      .single()

    if (cancellationError || !cancellation) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CANCELLATION_NOT_FOUND },
        { status: 404 }
      )
    }

    // 4. 권한 확인 (해당 점주의 식당 주문인지)
    const order = cancellation.orders
    const orderUsers = order?.users as { id: string; name: string; phone: string } | null

    if (order?.restaurant_id !== restaurant.id) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_AUTHORIZED },
        { status: 403 }
      )
    }

    // 5. 승인 기한까지 남은 시간 계산
    let remainingMinutes = null
    if (cancellation.approval_deadline && cancellation.status === 'pending') {
      const deadline = new Date(cancellation.approval_deadline)
      remainingMinutes = Math.max(
        0,
        Math.floor((deadline.getTime() - Date.now()) / (1000 * 60))
      )
    }

    // 6. 상태 변경 이력 조회
    const { data: statusHistory } = await supabase
      .from('cancellation_status_history')
      .select('id, previous_status, new_status, previous_owner_action, new_owner_action, changed_by, change_reason, is_auto_change, created_at')
      .eq('cancellation_id', cancellationId)
      .order('created_at', { ascending: false })
      .limit(20)

    // order_number 생성 (id의 처음 8자리 사용)
    const orderNumber = order?.id?.slice(0, 8).toUpperCase() ?? null

    // 7. 응답 데이터 구성
    const responseData = {
      id: cancellation.id,
      orderId: cancellation.order_id,
      orderNumber,
      cancelType: cancellation.cancel_type,
      status: cancellation.status,
      reason: cancellation.reason,
      reasonDetail: cancellation.reason_detail,
      refundAmount: cancellation.refund_amount,
      refundRate: cancellation.refund_rate,
      ownerAction: cancellation.owner_action,
      ownerActionAt: cancellation.owner_action_at,
      ownerRejectionReason: cancellation.owner_rejection_reason,
      approvalDeadline: cancellation.approval_deadline,
      autoApproved: cancellation.auto_approved,
      remainingMinutes,
      canRefundCoupon: cancellation.can_refund_coupon,
      canRefundPoints: cancellation.can_refund_points,
      couponRefunded: cancellation.coupon_refunded,
      pointsRefunded: cancellation.points_refunded,
      customer: orderUsers
        ? {
            id: orderUsers.id,
            name: orderUsers.name,
            phone: orderUsers.phone,
          }
        : null,
      order: order
        ? {
            id: order.id,
            orderNumber,
            totalAmount: order.total_amount,
            deliveryFee: order.delivery_fee,
            status: order.status,
            createdAt: order.created_at,
            items: order.order_items.map((item) => ({
              id: item.id,
              menuName: item.menu_name,
              quantity: item.quantity,
              price: item.price,
              options: item.options,
            })),
          }
        : null,
      statusHistory: (statusHistory ?? []).map((history) => ({
        id: history.id,
        previousStatus: history.previous_status,
        newStatus: history.new_status,
        previousOwnerAction: history.previous_owner_action,
        newOwnerAction: history.new_owner_action,
        changedBy: history.changed_by,
        changeReason: history.change_reason,
        isAutoChange: history.is_auto_change,
        createdAt: history.created_at,
      })),
      createdAt: cancellation.created_at,
      updatedAt: cancellation.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('[GET /api/owner/cancellations/[cancellationId]]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
