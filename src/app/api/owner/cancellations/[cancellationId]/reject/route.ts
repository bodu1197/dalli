/**
 * 점주 취소 요청 거절 API 라우트
 * @description 점주가 고객의 취소 요청을 거절
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rejectCancellation } from '@/lib/services/cancellation-approval.service'
import { notifyCancellationRejected } from '@/lib/services/order-notification.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  CANCELLATION_NOT_FOUND: '취소 요청을 찾을 수 없습니다.',
  REJECTION_REASON_REQUIRED: '거절 사유를 입력해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// 요청 본문 타입
interface RejectRequestBody {
  rejectionReason: string
}

// ============================================================================
// POST /api/owner/cancellations/[cancellationId]/reject - 취소 거절
// ============================================================================

interface RouteParams {
  params: Promise<{ cancellationId: string }>
}

export async function POST(
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

    // 2. 요청 본문 파싱
    const body: RejectRequestBody = await request.json()
    const { rejectionReason } = body

    // 거절 사유 필수 확인
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.REJECTION_REASON_REQUIRED },
        { status: 400 }
      )
    }

    // 3. 점주의 식당 조회
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

    // 4. 취소 요청이 해당 점주의 식당 주문인지 확인
    const { data: cancellation, error: cancellationError } = await supabase
      .from('order_cancellations')
      .select(`
        id,
        order_id,
        status,
        orders!inner (
          id,
          restaurant_id,
          user_id
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

    // 식당 소유권 확인
    const orderData = cancellation.orders as { restaurant_id: string; user_id: string }
    if (orderData.restaurant_id !== restaurant.id) {
      return NextResponse.json(
        { error: '해당 주문에 대한 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 처리된 요청인지 확인
    if (cancellation.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 취소 요청입니다.' },
        { status: 400 }
      )
    }

    // 5. 거절 처리
    const result = await rejectCancellation(
      supabase,
      cancellationId,
      user.id,
      rejectionReason.trim()
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.errorMessage ?? result.message },
        { status: 400 }
      )
    }

    // 6. 고객에게 거절 알림 발송 (비동기)
    notifyCancellationRejected(
      cancellationId,
      orderData.user_id,
      rejectionReason.trim()
    ).catch((error) => {
      console.error('[POST /api/owner/cancellations/[cancellationId]/reject] 알림 발송 실패:', error)
    })

    // 7. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        cancellationId: result.cancellationId,
        orderId: result.orderId,
      },
      message: result.message,
    })
  } catch (error) {
    console.error('[POST /api/owner/cancellations/[cancellationId]/reject]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
