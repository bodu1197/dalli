/**
 * 환불 목록 조회 API
 * GET /api/refunds - 내 환불 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Refund, RefundStatus } from '@/types/order-cancellation.types'

const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

interface RefundListResponse {
  success: boolean
  data: {
    refunds: Refund[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  } | null
  error: string | null
}

/**
 * 내 환불 목록 조회
 * GET /api/refunds
 *
 * Query params:
 * - status: RefundStatus (optional) - 필터링할 환불 상태
 * - page: number (default: 1) - 페이지 번호
 * - limit: number (default: 10) - 페이지 당 개수
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<RefundListResponse>> {
  try {
    const supabase = await createClient()

    // 1. 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // 2. 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RefundStatus | null
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10')))

    // 3. 내 주문에 대한 환불 목록 조회
    let query = supabase
      .from('refunds')
      .select('*, orders!inner(user_id)', { count: 'exact' })
      .eq('orders.user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('refund_status', status)
    }

    const { data: refunds, error: refundsError, count } = await query

    if (refundsError) {
      console.error('Failed to fetch refunds:', refundsError)
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.SERVER_ERROR },
        { status: 500 }
      )
    }

    // 4. 응답 데이터 변환 (orders 필드 제외)
    const transformedRefunds =
      refunds?.map((refund) => {
        const { orders: _orders, ...refundData } = refund
        return transformRefund(refundData)
      }) ?? []

    return NextResponse.json({
      success: true,
      data: {
        refunds: transformedRefunds,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('[GET /api/refunds]', error)
    return NextResponse.json(
      { success: false, data: null, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * DB 환불 레코드를 응답 형식으로 변환
 */
function transformRefund(data: Record<string, unknown>): Refund {
  return {
    id: data.id as string,
    orderId: data.order_id as string,
    cancellationId: data.cancellation_id as string | null,
    amount: data.amount as number,
    paymentMethod: data.payment_method as Refund['paymentMethod'],
    paymentKey: data.payment_key as string | null,
    refundStatus: data.refund_status as Refund['refundStatus'],
    pgResponse: data.pg_response as Record<string, unknown> | null,
    pgTransactionId: data.pg_transaction_id as string | null,
    failedReason: data.failed_reason as string | null,
    retryCount: data.retry_count as number,
    lastRetryAt: data.last_retry_at as string | null,
    completedAt: data.completed_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
