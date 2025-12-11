/**
 * 주문 상세 API 라우트
 * @description 주문 상세 조회 및 상태 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/services/order.service'
import { getOrderStatusHistory } from '@/lib/services/order-status.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// GET /api/orders/[orderId] - 주문 상세 조회
// ============================================================================

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function GET(
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

    // 2. 주문 조회
    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ORDER_NOT_FOUND },
        { status: 404 }
      )
    }

    // 3. 접근 권한 확인 (주문자 본인만)
    // 점주/라이더는 별도 API 사용
    if (order.userId !== user.id) {
      // 점주인지 확인
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('owner_id')
        .eq('id', order.restaurantId)
        .single()

      // 배정된 라이더인지 확인
      const isOwner = restaurant?.owner_id === user.id
      const isRider = order.riderId === user.id

      if (!isOwner && !isRider) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.FORBIDDEN },
          { status: 403 }
        )
      }
    }

    // 4. 상태 이력 조회 (옵션)
    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('includeHistory') === 'true'

    let statusHistory = null
    if (includeHistory) {
      statusHistory = await getOrderStatusHistory(orderId)
    }

    // 5. 응답
    return NextResponse.json({
      success: true,
      data: {
        order,
        statusHistory,
      },
    })
  } catch (error) {
    console.error('[GET /api/orders/[orderId]]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
