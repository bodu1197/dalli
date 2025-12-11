/**
 * 라이더 픽업 완료 API 라우트
 * @description 라이더가 식당에서 음식을 픽업 완료했음을 표시
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markPickedUp } from '@/lib/services/order-status.service'
import { notifyPickedUp } from '@/lib/services/order-notification.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_RIDER: '라이더 권한이 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  INVALID_STATUS: '픽업할 수 없는 주문 상태입니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// POST /api/rider/deliveries/[orderId]/pickup - 픽업 완료
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
      .select('id, user_id')
      .eq('user_id', user.id)
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_RIDER },
        { status: 403 }
      )
    }

    // 3. 주문 정보 조회 및 권한 확인
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, rider_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ORDER_NOT_FOUND },
        { status: 404 }
      )
    }

    // 4. 주문 상태 확인 (ready 상태에서만 픽업 가능)
    if (order.status !== 'ready') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_STATUS },
        { status: 400 }
      )
    }

    // 5. 사용자 이름, 전화번호 조회
    const { data: userData } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', user.id)
      .single()

    const riderName = userData?.name ?? '라이더'
    const riderPhone = userData?.phone ?? ''

    // 6. 픽업 완료 처리
    const result = await markPickedUp(orderId, user.id, riderName, riderPhone)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 7. 고객에게 픽업 완료 알림 발송 (비동기)
    notifyPickedUp(orderId, riderName).catch((error) => {
      console.error('[POST /api/rider/deliveries/[orderId]/pickup] 알림 발송 실패:', error)
    })

    // 8. 성공 응답
    return NextResponse.json({
      success: true,
      data: result.order,
      message: '픽업이 완료되었습니다. 배달을 시작해주세요.',
    })
  } catch (error) {
    console.error('[POST /api/rider/deliveries/[orderId]/pickup]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
