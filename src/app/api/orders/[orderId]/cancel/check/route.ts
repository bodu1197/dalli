/**
 * 주문 취소 가능 여부 체크 API
 * GET /api/orders/[orderId]/cancel/check
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCancellationPolicy,
  calculateRefundAmount,
  CANCEL_ERROR_MESSAGES,
} from '@/lib/constants/order-cancellation'
import type { CancelabilityCheck } from '@/types/order-cancellation.types'
import type { OrderStatus } from '@/types/order.types'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { orderId } = await params
    const supabase = await createClient()

    // 1. 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // 2. 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, total_amount, delivery_fee')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    // 3. 권한 확인 (본인 주문만 취소 가능)
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.UNAUTHORIZED },
        { status: 403 }
      )
    }

    // 4. 이미 취소 요청이 있는지 확인
    const { data: existingCancellation } = await supabase
      .from('order_cancellations')
      .select('id, status')
      .eq('order_id', orderId)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (existingCancellation) {
      const cancelability: CancelabilityCheck = {
        canCancel: false,
        cancelType: null,
        refundRate: 0,
        refundAmount: 0,
        canRefundCoupon: false,
        canRefundPoints: false,
        reason: 'pending_cancel',
        message: CANCEL_ERROR_MESSAGES.PENDING_CANCEL,
      }
      return NextResponse.json({ success: true, data: cancelability, error: null })
    }

    // 5. 취소 정책 조회
    const policy = getCancellationPolicy(order.status as OrderStatus)

    // 6. 환불 금액 계산
    const refundAmount = policy.canCancel
      ? calculateRefundAmount(order.total_amount, order.delivery_fee ?? 0, policy.refundRate)
      : 0

    // 7. 응답 생성
    const cancelability: CancelabilityCheck = {
      canCancel: policy.canCancel,
      cancelType: policy.cancelType,
      refundRate: policy.refundRate,
      refundAmount,
      canRefundCoupon: policy.canRefundCoupon,
      canRefundPoints: policy.canRefundPoints,
      reason: policy.canCancel ? null : 'status_not_allowed',
      message: policy.message,
    }

    return NextResponse.json({ success: true, data: cancelability, error: null })
  } catch (error) {
    console.error('[GET /api/orders/[orderId]/cancel/check]', error)
    return NextResponse.json(
      { success: false, data: null, error: CANCEL_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
