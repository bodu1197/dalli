/**
 * 주문 취소 API
 * POST /api/orders/[orderId]/cancel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCancellationPolicy,
  calculateRefundAmount,
  CANCEL_ERROR_MESSAGES,
} from '@/lib/constants/order-cancellation'
import {
  cancelOrderSchema,
  validateCancelReasonForRequester,
  safeParseWithErrors,
} from '@/lib/validations/order-cancel'
import { processPGRefund } from '@/lib/services/pg-refund.service'
import type {
  OrderCancellation,
  Refund,
  CancelOrderResponse,
} from '@/types/order-cancellation.types'
import type { OrderStatus } from '@/types/order.types'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

/**
 * 주문 취소 실행
 * POST /api/orders/[orderId]/cancel
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<CancelOrderResponse>> {
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

    // 2. 요청 본문 파싱 및 검증
    const body = await request.json()
    const parseResult = safeParseWithErrors(cancelOrderSchema, { ...body, orderId })

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, data: null, error: parseResult.errors.join(', ') },
        { status: 400 }
      )
    }

    const { reasonCategory, reasonDetail } = parseResult.data

    // 3. 취소 사유 검증 (고객용 사유인지 확인)
    if (!validateCancelReasonForRequester(reasonCategory, 'customer')) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.INVALID_REASON },
        { status: 400 }
      )
    }

    // 4. 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    // 5. 권한 확인 (본인 주문만)
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.UNAUTHORIZED },
        { status: 403 }
      )
    }

    // 6. 이미 취소된 주문인지 확인
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.ALREADY_CANCELLED },
        { status: 400 }
      )
    }

    // 7. 진행 중인 취소 요청이 있는지 확인
    const { data: existingCancellation } = await supabase
      .from('order_cancellations')
      .select('id')
      .eq('order_id', orderId)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (existingCancellation) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.PENDING_CANCEL },
        { status: 400 }
      )
    }

    // 8. 취소 정책 확인
    const policy = getCancellationPolicy(order.status as OrderStatus)

    if (!policy.canCancel || !policy.cancelType) {
      return NextResponse.json(
        { success: false, data: null, error: policy.message },
        { status: 400 }
      )
    }

    // 9. 환불 금액 계산
    const deliveryFee = order.delivery_fee ?? 0
    const refundAmount = calculateRefundAmount(
      order.total_amount,
      deliveryFee,
      policy.refundRate
    )
    const menuRefundAmount = Math.floor(order.total_amount * (policy.refundRate / 100))
    const deliveryRefundAmount = deliveryFee

    // 10. 트랜잭션 시작 - 취소 유형에 따라 처리
    const cancelType = policy.cancelType
    const isInstantCancel = cancelType === 'instant'

    // 10-1. 취소 레코드 생성
    const { data: cancellation, error: cancellationError } = await supabase
      .from('order_cancellations')
      .insert({
        order_id: orderId,
        requested_by: user.id,
        cancel_type: cancelType,
        status: isInstantCancel ? 'completed' : 'pending',
        reason: reasonCategory,
        reason_detail: reasonDetail ?? null,
        refund_amount: refundAmount,
        refund_rate: policy.refundRate / 100, // 0.00 - 1.00 형식으로 저장
        menu_refund_amount: menuRefundAmount,
        delivery_refund_amount: deliveryRefundAmount,
        can_refund_coupon: policy.canRefundCoupon,
        can_refund_points: policy.canRefundPoints,
        coupon_refunded: false,
        points_refunded: false,
        approved_by: isInstantCancel ? user.id : null,
        approved_at: isInstantCancel ? new Date().toISOString() : null,
        completed_at: isInstantCancel ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (cancellationError || !cancellation) {
      console.error('Failed to create cancellation:', cancellationError)
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.SERVER_ERROR },
        { status: 500 }
      )
    }

    let refund: Refund | null = null

    // 10-2. 즉시 취소인 경우 주문 상태 업데이트 및 환불 레코드 생성
    if (isInstantCancel) {
      // 주문 상태를 'cancelled'로 업데이트
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_reason: reasonCategory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Failed to update order status:', updateError)
        // 취소 레코드는 이미 생성되었으므로 롤백 필요
        await supabase
          .from('order_cancellations')
          .delete()
          .eq('id', cancellation.id)

        return NextResponse.json(
          { success: false, data: null, error: CANCEL_ERROR_MESSAGES.SERVER_ERROR },
          { status: 500 }
        )
      }

      // 환불 레코드 생성 (환불 금액이 있는 경우만)
      if (refundAmount > 0) {
        const { data: refundData, error: refundError } = await supabase
          .from('refunds')
          .insert({
            order_id: orderId,
            cancellation_id: cancellation.id,
            user_id: user.id,
            amount: refundAmount,
            original_amount: order.total_amount + deliveryFee,
            refund_rate: policy.refundRate / 100,
            payment_method: order.payment_method ?? 'card',
            payment_key: order.payment_key ?? null,
            refund_status: 'pending',
            retry_count: 0,
          })
          .select()
          .single()

        if (refundError) {
          console.error('Failed to create refund record:', refundError)
          // 환불 레코드 생성 실패해도 취소는 진행됨
        } else {
          // PG 환불 처리 실행
          const pgRefundResult = await processPGRefund(supabase, refundData.id)

          // 환불 결과에 따라 환불 레코드 다시 조회
          const { data: updatedRefund } = await supabase
            .from('refunds')
            .select('*')
            .eq('id', refundData.id)
            .single()

          if (updatedRefund) {
            refund = transformRefund(updatedRefund)
          } else {
            refund = transformRefund(refundData)
          }

          // PG 환불 실패 시 로그 기록 (취소 자체는 성공으로 처리)
          if (!pgRefundResult.success) {
            console.error(
              'PG refund failed, will retry later:',
              pgRefundResult.errorMessage
            )
          }
        }
      }
    }

    // 11. 응답 반환
    const response: CancelOrderResponse = {
      success: true,
      data: {
        cancellation: transformCancellation(cancellation),
        refund,
      },
      error: null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[POST /api/orders/[orderId]/cancel]', error)
    return NextResponse.json(
      { success: false, data: null, error: CANCEL_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

/**
 * 취소 내역 조회
 * GET /api/orders/[orderId]/cancel
 */
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

    // 2. 주문 조회 (권한 확인용)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    // 3. 권한 확인
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.UNAUTHORIZED },
        { status: 403 }
      )
    }

    // 4. 취소 내역 조회
    const { data: cancellations, error: cancellationsError } = await supabase
      .from('order_cancellations')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (cancellationsError) {
      console.error('Failed to fetch cancellations:', cancellationsError)
      return NextResponse.json(
        { success: false, data: null, error: CANCEL_ERROR_MESSAGES.SERVER_ERROR },
        { status: 500 }
      )
    }

    // 5. 환불 내역 조회
    const { data: refunds, error: refundsError } = await supabase
      .from('refunds')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (refundsError) {
      console.error('Failed to fetch refunds:', refundsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        cancellations: cancellations?.map(transformCancellation) ?? [],
        refunds: refunds?.map(transformRefund) ?? [],
      },
      error: null,
    })
  } catch (error) {
    console.error('[GET /api/orders/[orderId]/cancel]', error)
    return NextResponse.json(
      { success: false, data: null, error: CANCEL_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * DB 취소 레코드를 응답 형식으로 변환
 */
function transformCancellation(data: Record<string, unknown>): OrderCancellation {
  return {
    id: data.id as string,
    orderId: data.order_id as string,
    requestedBy: data.requested_by as string,
    requestedByType: 'customer', // DB에는 없으므로 기본값
    cancelType: data.cancel_type as OrderCancellation['cancelType'],
    status: data.status as OrderCancellation['status'],
    reason: data.reason as OrderCancellation['reason'],
    reasonDetail: data.reason_detail as string | null,
    refundAmount: data.refund_amount as number,
    refundRate: data.refund_rate as number,
    canRefundCoupon: data.can_refund_coupon as boolean,
    canRefundPoints: data.can_refund_points as boolean,
    couponRefunded: data.coupon_refunded as boolean,
    pointsRefunded: data.points_refunded as boolean,
    rejectedReason: data.rejected_reason as string | null,
    processedBy: data.approved_by as string | null,
    processedAt: data.approved_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

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
    pgTransactionId: data.pg_tid as string | null,
    failedReason: data.error_message as string | null,
    retryCount: (data.retry_count as number) ?? 0,
    lastRetryAt: data.next_retry_at as string | null,
    completedAt: data.completed_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
