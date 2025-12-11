/**
 * 점주 주문 거절 API 라우트
 * @description 점주가 주문을 거절하고 사유를 기록
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rejectOrder } from '@/lib/services/order-status.service'
import { notifyOrderRejected } from '@/lib/services/order-notification.service'
import { rejectOrderSchema, safeParseWithErrors } from '@/lib/validations/order'
import { ORDER_REJECTION_REASON_LABELS } from '@/types/order.types'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  INVALID_REQUEST: '요청 데이터가 유효하지 않습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// POST /api/owner/orders/[orderId]/reject - 주문 거절
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
    const parseResult = safeParseWithErrors(rejectOrderSchema, body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    const { reason, detail } = parseResult.data

    // 4. 거절 사유 라벨 가져오기
    const reasonLabel = ORDER_REJECTION_REASON_LABELS[reason]

    // 5. 주문 거절 처리
    const result = await rejectOrder(orderId, user.id, reason, detail ?? undefined)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 6. 고객에게 거절 알림 발송 (비동기)
    notifyOrderRejected(orderId, reasonLabel, detail ?? undefined).catch((error) => {
      console.error('[POST /api/owner/orders/[orderId]/reject] 알림 발송 실패:', error)
    })

    // 7. 성공 응답
    return NextResponse.json({
      success: true,
      data: result.order,
      message: '주문이 거절되었습니다.',
    })
  } catch (error) {
    console.error('[POST /api/owner/orders/[orderId]/reject]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
