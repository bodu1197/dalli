/**
 * 점주 주문 접수 API 라우트
 * @description 점주가 새 주문을 접수하고 예상 조리 시간을 설정
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmOrder } from '@/lib/services/order-status.service'
import { notifyOrderConfirmed } from '@/lib/services/order-notification.service'
import { confirmOrderSchema, safeParseWithErrors } from '@/lib/validations/order'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  INVALID_REQUEST: '요청 데이터가 유효하지 않습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// POST /api/owner/orders/[orderId]/confirm - 주문 접수
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

    // 3. 요청 본문 검증
    const body = await request.json()
    const parseResult = safeParseWithErrors(confirmOrderSchema, body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    const { estimatedPrepTime } = parseResult.data

    // 4. 주문 접수 처리
    const result = await confirmOrder(orderId, user.id, estimatedPrepTime)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 5. 고객에게 접수 완료 알림 발송 (비동기)
    notifyOrderConfirmed(orderId, estimatedPrepTime).catch((error) => {
      console.error('[POST /api/owner/orders/[orderId]/confirm] 알림 발송 실패:', error)
    })

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      data: result.order,
      message: '주문이 접수되었습니다.',
    })
  } catch (error) {
    console.error('[POST /api/owner/orders/[orderId]/confirm]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
