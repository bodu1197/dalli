/**
 * 라이더 배달 수락 API 라우트
 * @description 라이더가 배달 요청을 수락하여 주문에 배정
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyOrderReady } from '@/lib/services/order-notification.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_RIDER: '라이더 권한이 없습니다.',
  NOT_AVAILABLE: '현재 배달 가능 상태가 아닙니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  ALREADY_ASSIGNED: '이미 다른 라이더에게 배정된 주문입니다.',
  INVALID_STATUS: '수락할 수 없는 주문 상태입니다.',
  HAS_ACTIVE_DELIVERY: '현재 진행 중인 배달이 있습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// POST /api/rider/deliveries/[orderId]/accept - 배달 수락
// ============================================================================

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { orderId } = await params

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

    // 2. 라이더 정보 조회
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, user_id, is_available')
      .eq('user_id', user.id)
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_RIDER },
        { status: 403 }
      )
    }

    // 3. 라이더 배달 가능 상태 확인
    if (!rider.is_available) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_AVAILABLE },
        { status: 400 }
      )
    }

    // 4. 진행 중인 배달 확인 (한 번에 하나의 배달만 가능)
    const { count: activeDeliveryCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('rider_id', user.id)
      .in('status', ['picked_up', 'delivering'])

    if (activeDeliveryCount && activeDeliveryCount > 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.HAS_ACTIVE_DELIVERY },
        { status: 400 }
      )
    }

    // 5. 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        rider_id,
        restaurant_id,
        restaurants (
          id,
          name,
          address,
          lat,
          lng,
          phone
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ORDER_NOT_FOUND },
        { status: 404 }
      )
    }

    // 6. 주문 상태 확인 (ready 상태에서만 수락 가능)
    if (order.status !== 'ready') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_STATUS },
        { status: 400 }
      )
    }

    // 7. 이미 배정된 주문인지 확인
    if (order.rider_id) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ALREADY_ASSIGNED },
        { status: 409 }
      )
    }

    // 8. 라이더 정보 조회 (이름, 전화번호)
    const { data: userData } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', user.id)
      .single()

    const riderName = userData?.name ?? '라이더'
    const riderPhone = userData?.phone ?? ''

    // 9. 주문에 라이더 배정 (낙관적 잠금)
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        rider_id: user.id,
        rider_name: riderName,
        rider_phone: riderPhone,
        rider_assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .is('rider_id', null) // 동시성 제어: rider_id가 null일 때만 업데이트
      .select()
      .single()

    if (updateError || !updatedOrder) {
      // 동시성 충돌로 다른 라이더에게 배정됨
      return NextResponse.json(
        { error: ERROR_MESSAGES.ALREADY_ASSIGNED },
        { status: 409 }
      )
    }

    // 10. 라이더 상태 업데이트 (배달 수락으로 인해 일시적으로 unavailable)
    await supabase
      .from('riders')
      .update({ is_available: false })
      .eq('user_id', user.id)

    // 11. 배달 수락 기록
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: 'ready',
      note: `라이더 ${riderName}님이 배달을 수락했습니다`,
      changed_by: 'rider',
      changed_by_user_id: user.id,
    })

    // 12. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        restaurant: order.restaurants,
        assignedAt: updatedOrder.rider_assigned_at,
      },
      message: '배달을 수락했습니다. 식당으로 이동하여 픽업해주세요.',
    })
  } catch (error) {
    console.error('[POST /api/rider/deliveries/[orderId]/accept]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
