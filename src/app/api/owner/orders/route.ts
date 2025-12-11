/**
 * 점주 주문 목록 API 라우트
 * @description 점주가 자신의 식당에 들어온 주문 목록을 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrdersByRestaurantId } from '@/lib/services/order.service'
import { getOrderDashboard } from '@/lib/services/order-status.service'
import { getOwnerOrdersQuerySchema, safeParseWithErrors } from '@/lib/validations/order'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '점주 권한이 없습니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  INVALID_REQUEST: '요청 데이터가 유효하지 않습니다.',
} as const

// ============================================================================
// GET /api/owner/orders - 점주 주문 목록 조회
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

    // 2. 점주의 식당 조회
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('owner_id', user.id)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_RESTAURANT },
        { status: 404 }
      )
    }

    // 3. 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') ?? undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '20',
    }

    const parseResult = safeParseWithErrors(getOwnerOrdersQuerySchema, queryParams)

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

    // 4. 대시보드 데이터 (status별 카운트) 포함 여부
    const includeDashboard = searchParams.get('includeDashboard') === 'true'

    // 5. 주문 목록 조회
    const offset = (page - 1) * limit
    const orders = await getOrdersByRestaurantId(restaurant.id, {
      status,
      limit,
      offset,
    })

    // 6. 대시보드 데이터 조회 (옵션)
    let dashboard = null
    if (includeDashboard) {
      dashboard = await getOrderDashboard(restaurant.id)
    }

    // 7. 응답
    return NextResponse.json({
      success: true,
      data: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
        },
        orders,
        dashboard,
      },
      pagination: {
        page,
        limit,
        hasMore: orders.length === limit,
      },
    })
  } catch (error) {
    console.error('[GET /api/owner/orders]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
