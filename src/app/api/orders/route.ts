/**
 * 주문 API 라우트
 * @description 주문 생성 및 목록 조회 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrder, getOrdersByUserId } from '@/lib/services/order.service'
import { notifyNewOrder } from '@/lib/services/order-notification.service'
import {
  createOrderSchema,
  getOrdersQuerySchema,
  safeParseWithErrors,
} from '@/lib/validations/order'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  INVALID_REQUEST: '요청 데이터가 유효하지 않습니다.',
  ORDER_FAILED: '주문 생성에 실패했습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// POST /api/orders - 주문 생성
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

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

    // 2. 요청 본문 검증
    const body = await request.json()
    const parseResult = safeParseWithErrors(createOrderSchema, body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // 3. 주문 생성
    const result = await createOrder(user.id, input)

    if (!result.success || !result.order) {
      return NextResponse.json(
        { error: result.error ?? ERROR_MESSAGES.ORDER_FAILED },
        { status: 400 }
      )
    }

    // 4. 점주에게 새 주문 알림 발송 (비동기로 처리)
    notifyNewOrder(result.order.id).catch((error) => {
      // 알림 발송 실패해도 주문은 성공 처리
      console.error('[POST /api/orders] 알림 발송 실패:', error)
    })

    // 5. 성공 응답
    return NextResponse.json(
      {
        success: true,
        data: result.order,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/orders]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET /api/orders - 내 주문 목록 조회
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

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

    // 2. 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '10',
    }

    const parseResult = safeParseWithErrors(getOrdersQuerySchema, queryParams)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    const { status, page, limit } = parseResult.data

    // 3. 주문 목록 조회
    const offset = (page - 1) * limit
    const orders = await getOrdersByUserId(user.id, {
      status,
      limit,
      offset,
    })

    // 4. 응답
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        hasMore: orders.length === limit,
      },
    })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
