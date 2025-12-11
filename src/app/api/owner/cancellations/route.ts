/**
 * 점주 취소 요청 목록 API 라우트
 * @description 점주가 대기 중인 취소 요청 목록을 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NO_RESTAURANT: '등록된 식당이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// GET /api/owner/cancellations - 취소 요청 목록 조회
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
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_RESTAURANT },
        { status: 404 }
      )
    }

    // 3. 쿼리 파라미터 확인
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? 'pending' // pending, approved, rejected, completed, all
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset = (page - 1) * limit

    // 4. 취소 요청 조회 쿼리 생성
    let query = supabase
      .from('order_cancellations')
      .select(`
        id,
        order_id,
        requested_by,
        cancel_type,
        status,
        reason,
        reason_detail,
        refund_amount,
        refund_rate,
        owner_action,
        owner_action_at,
        owner_rejection_reason,
        approval_deadline,
        auto_approved,
        created_at,
        updated_at,
        orders!inner (
          id,
          total_amount,
          delivery_fee,
          status,
          restaurant_id,
          user_id,
          created_at,
          users!orders_user_id_fkey (
            id,
            name,
            phone
          )
        )
      `, { count: 'exact' })
      .eq('orders.restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })

    // 상태 필터링
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1)

    const { data: cancellations, error: cancellationsError, count } = await query

    if (cancellationsError) {
      throw cancellationsError
    }

    // 5. 응답 데이터 변환
    const responseData = (cancellations ?? []).map((cancellation) => {
      const order = cancellation.orders
      const orderUsers = order?.users as { id: string; name: string; phone: string } | null

      // 승인 기한까지 남은 시간 계산
      let remainingMinutes = null
      if (cancellation.approval_deadline && cancellation.status === 'pending') {
        const deadline = new Date(cancellation.approval_deadline)
        remainingMinutes = Math.max(
          0,
          Math.floor((deadline.getTime() - Date.now()) / (1000 * 60))
        )
      }

      // order_number 생성 (없으면 id의 처음 8자리 사용)
      const orderNumber = order?.id?.slice(0, 8).toUpperCase() ?? null

      return {
        id: cancellation.id,
        orderId: cancellation.order_id,
        orderNumber,
        cancelType: cancellation.cancel_type,
        status: cancellation.status,
        reason: cancellation.reason,
        reasonDetail: cancellation.reason_detail,
        refundAmount: cancellation.refund_amount,
        refundRate: cancellation.refund_rate,
        ownerAction: cancellation.owner_action,
        ownerActionAt: cancellation.owner_action_at,
        ownerRejectionReason: cancellation.owner_rejection_reason,
        approvalDeadline: cancellation.approval_deadline,
        autoApproved: cancellation.auto_approved,
        remainingMinutes,
        customer: orderUsers
          ? {
              id: orderUsers.id,
              name: orderUsers.name,
              phone: orderUsers.phone,
            }
          : null,
        order: order
          ? {
              id: order.id,
              orderNumber,
              totalAmount: order.total_amount,
              deliveryFee: order.delivery_fee,
              status: order.status,
              createdAt: order.created_at,
            }
          : null,
        createdAt: cancellation.created_at,
        updatedAt: cancellation.updated_at,
      }
    })

    // 6. 대기 중인 요청 수 조회 (배지 표시용)
    const { count: pendingCount } = await supabase
      .from('order_cancellations')
      .select('id, orders!inner(restaurant_id)', { count: 'exact', head: true })
      .eq('orders.restaurant_id', restaurant.id)
      .eq('status', 'pending')

    return NextResponse.json({
      success: true,
      data: responseData,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        hasMore: (cancellations ?? []).length === limit,
      },
      pendingCount: pendingCount ?? 0,
    })
  } catch (error) {
    console.error('[GET /api/owner/cancellations]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
