/**
 * 점주 조리 시작 API 라우트
 * @description 점주가 조리를 시작했음을 표시
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startPreparing } from '@/lib/services/order-status.service'
import { notifyPreparingStarted } from '@/lib/services/order-notification.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// POST /api/owner/orders/[orderId]/preparing - 조리 시작
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

    // 3. 조리 시작 처리
    const result = await startPreparing(orderId, user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 4. 고객에게 조리 시작 알림 발송 (비동기)
    notifyPreparingStarted(orderId).catch((error) => {
      console.error('[POST /api/owner/orders/[orderId]/preparing] 알림 발송 실패:', error)
    })

    // 5. 성공 응답
    return NextResponse.json({
      success: true,
      data: result.order,
      message: '조리가 시작되었습니다.',
    })
  } catch (error) {
    console.error('[POST /api/owner/orders/[orderId]/preparing]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
