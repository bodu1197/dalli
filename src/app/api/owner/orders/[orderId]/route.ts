/**
 * 점주 주문 상세 API 라우트
 * @description 점주가 주문 상세 조회 및 상태 변경을 수행
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrderForOwner, getOrderStatusHistory } from '@/lib/services/order-status.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// GET /api/owner/orders/[orderId] - 점주 주문 상세 조회
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

    // 3. 주문 조회 (해당 식당의 주문인지 확인)
    const order = await getOrderForOwner(orderId, restaurant.id)

    if (!order) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ORDER_NOT_FOUND },
        { status: 404 }
      )
    }

    // 4. 상태 이력 조회 (옵션)
    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('includeHistory') === 'true'

    let statusHistory = null
    if (includeHistory) {
      statusHistory = await getOrderStatusHistory(orderId)
    }

    // 5. 고객 정보 조회
    const { data: customer } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('id', order.userId)
      .single()

    // 6. 응답
    return NextResponse.json({
      success: true,
      data: {
        order,
        customer: customer ?? null,
        statusHistory,
      },
    })
  } catch (error) {
    console.error('[GET /api/owner/orders/[orderId]]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
