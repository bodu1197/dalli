/**
 * 환불 상세 조회 및 재시도 API
 * GET /api/refunds/[refundId] - 환불 상세 조회
 * POST /api/refunds/[refundId] - 환불 재시도 (실패한 환불만)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processPGRefund } from '@/lib/services/pg-refund.service'
import type { Refund } from '@/types/order-cancellation.types'

interface RouteParams {
  params: Promise<{ refundId: string }>
}

const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_FOUND: '환불 정보를 찾을 수 없습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  ALREADY_COMPLETED: '이미 완료된 환불입니다.',
  NOT_RETRYABLE: '재시도할 수 없는 상태입니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

/**
 * 환불 상세 조회
 * GET /api/refunds/[refundId]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { refundId } = await params
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

    // 2. 환불 정보 조회
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .select('*, orders!inner(user_id)')
      .eq('id', refundId)
      .single()

    if (refundError || !refund) {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    // 3. 권한 확인 (본인 주문의 환불만)
    const orderUserId = (refund.orders as { user_id: string }).user_id
    if (orderUserId !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.FORBIDDEN },
        { status: 403 }
      )
    }

    // 4. 응답 반환 (orders 필드 제외)
    const { orders: _orders, ...refundData } = refund

    return NextResponse.json({
      success: true,
      data: transformRefund(refundData),
      error: null,
    })
  } catch (error) {
    console.error('[GET /api/refunds/[refundId]]', error)
    return NextResponse.json(
      { success: false, data: null, error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

/**
 * 환불 재시도
 * POST /api/refunds/[refundId]
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { refundId } = await params
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

    // 2. 환불 정보 조회
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .select('*, orders!inner(user_id)')
      .eq('id', refundId)
      .single()

    if (refundError || !refund) {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    // 3. 권한 확인
    const orderUserId = (refund.orders as { user_id: string }).user_id
    if (orderUserId !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.FORBIDDEN },
        { status: 403 }
      )
    }

    // 4. 재시도 가능한 상태인지 확인
    const refundStatus = (refund as unknown as { refund_status: string }).refund_status

    if (refundStatus === 'completed') {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.ALREADY_COMPLETED },
        { status: 400 }
      )
    }

    if (refundStatus === 'cancelled') {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.NOT_RETRYABLE },
        { status: 400 }
      )
    }

    // pending 또는 failed 상태만 재시도 가능
    if (!['pending', 'failed'].includes(refundStatus)) {
      return NextResponse.json(
        { success: false, data: null, error: ERROR_MESSAGES.NOT_RETRYABLE },
        { status: 400 }
      )
    }

    // 5. PG 환불 재시도
    const result = await processPGRefund(supabase, refundId)

    // 6. 업데이트된 환불 정보 조회
    const { data: updatedRefund } = await supabase
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single()

    return NextResponse.json({
      success: result.success,
      data: updatedRefund ? transformRefund(updatedRefund) : null,
      error: result.errorMessage,
      retryable: result.isRetryable,
    })
  } catch (error) {
    console.error('[POST /api/refunds/[refundId]]', error)
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
