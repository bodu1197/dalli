/**
 * 취소 요청 서비스
 * @description 고객의 주문 취소 요청 생성 및 관리
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CancellationType,
  CreateCancellationRequestParams,
  CancellationRequestResult,
  OrderCancellationExtended,
  CancellationWithDetails,
} from '@/types/order-cancellation.types'
import { canCancelOrder } from './cancellation-policy.service'

// ============================================================================
// 상수 정의
// ============================================================================

const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  UNAUTHORIZED: '이 주문을 취소할 권한이 없습니다.',
  ALREADY_CANCELLED: '이미 취소된 주문입니다.',
  CANCELLATION_EXISTS: '이미 취소 요청이 존재합니다.',
  NOT_ALLOWED: '현재 상태에서는 취소할 수 없습니다.',
  POLICY_NOT_FOUND: '취소 정책을 찾을 수 없습니다.',
  CREATE_FAILED: '취소 요청 생성에 실패했습니다.',
  UNEXPECTED_ERROR: '예기치 않은 오류가 발생했습니다.',
} as const

// ============================================================================
// 취소 요청 서비스
// ============================================================================

/**
 * 취소 요청 생성
 *
 * @description 고객이 주문 취소를 요청합니다.
 * 주문 상태에 따라 즉시 취소 또는 점주 승인 대기 상태가 됩니다.
 *
 * @param supabase Supabase 클라이언트
 * @param userId 요청자 ID (현재 로그인 사용자)
 * @param params 취소 요청 파라미터
 * @returns 취소 요청 결과
 */
export async function createCancellationRequest(
  supabase: SupabaseClient,
  userId: string,
  params: CreateCancellationRequestParams
): Promise<CancellationRequestResult> {
  const { orderId, reason, detailedReason } = params

  try {
    // 1. 주문 정보 조회 및 권한 확인
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, total_amount, delivery_fee')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return {
        success: false,
        cancellationId: null,
        cancellationType: 'not_allowed',
        refundAmount: 0,
        refundRate: 0,
        approvalDeadline: null,
        requiresApproval: false,
        message: ERROR_MESSAGES.ORDER_NOT_FOUND,
        errorMessage: ERROR_MESSAGES.ORDER_NOT_FOUND,
      }
    }

    // 2. 권한 확인 (주문자만 취소 가능)
    if (order.user_id !== userId) {
      return {
        success: false,
        cancellationId: null,
        cancellationType: 'not_allowed',
        refundAmount: 0,
        refundRate: 0,
        approvalDeadline: null,
        requiresApproval: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        errorMessage: ERROR_MESSAGES.UNAUTHORIZED,
      }
    }

    // 3. 취소 가능 여부 확인
    const cancelability = await canCancelOrder(supabase, orderId)

    if (!cancelability.canCancel) {
      return {
        success: false,
        cancellationId: null,
        cancellationType: cancelability.policy.cancellationType,
        refundAmount: 0,
        refundRate: 0,
        approvalDeadline: null,
        requiresApproval: false,
        message: cancelability.policy.messageForCustomer,
        errorMessage: cancelability.policy.description,
      }
    }

    // 4. DB 함수를 통한 취소 요청 생성 시도
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_cancellation_request',
      {
        p_order_id: orderId,
        p_user_id: userId,
        p_reason: reason,
        p_reason_detail: detailedReason ?? null,
      }
    )

    // DB 함수가 있는 경우
    if (!rpcError && rpcResult) {
      const result = rpcResult as Record<string, unknown>

      if (!result.success) {
        return {
          success: false,
          cancellationId: null,
          cancellationType: (result.cancellationType as CancellationType) ?? 'not_allowed',
          refundAmount: 0,
          refundRate: 0,
          approvalDeadline: null,
          requiresApproval: false,
          message: result.error as string,
          errorMessage: result.error as string,
        }
      }

      return {
        success: true,
        cancellationId: result.cancellationId as string,
        cancellationType: result.cancellationType as CancellationType,
        refundAmount: result.refundAmount as number,
        refundRate: result.refundRate as number,
        approvalDeadline: result.approvalDeadline
          ? new Date(result.approvalDeadline as string)
          : null,
        requiresApproval: result.requiresApproval as boolean ?? false,
        message: result.message as string,
        errorMessage: null,
      }
    }

    // 5. DB 함수가 없는 경우 직접 처리
    return createCancellationRequestDirect(supabase, userId, params, cancelability)
  } catch (error) {
    console.error('[createCancellationRequest] unexpected error:', error)
    return {
      success: false,
      cancellationId: null,
      cancellationType: 'not_allowed',
      refundAmount: 0,
      refundRate: 0,
      approvalDeadline: null,
      requiresApproval: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      errorMessage: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR,
    }
  }
}

/**
 * 취소 요청 직접 생성 (DB 함수 없이)
 *
 * @description DB 함수가 없는 환경에서 취소 요청을 직접 생성합니다.
 */
async function createCancellationRequestDirect(
  supabase: SupabaseClient,
  userId: string,
  params: CreateCancellationRequestParams,
  cancelability: Awaited<ReturnType<typeof canCancelOrder>>
): Promise<CancellationRequestResult> {
  const { orderId, reason, detailedReason } = params
  const { policy, estimatedRefund } = cancelability

  try {
    // 승인 기한 계산
    let approvalDeadline: Date | null = null
    if (
      policy.cancellationType === 'approval_required' &&
      policy.approvalTimeoutMinutes > 0
    ) {
      approvalDeadline = new Date()
      approvalDeadline.setMinutes(
        approvalDeadline.getMinutes() + policy.approvalTimeoutMinutes
      )
    }

    const refundAmount = estimatedRefund?.amount ?? 0
    const menuRefundAmount = estimatedRefund?.menuRefundAmount ?? 0
    const deliveryRefundAmount = estimatedRefund?.deliveryRefundAmount ?? 0

    // 즉시 취소인 경우
    if (policy.cancellationType === 'instant') {
      // 취소 레코드 생성
      const { data: cancellation, error: createError } = await supabase
        .from('order_cancellations')
        .insert({
          order_id: orderId,
          requested_by: userId,
          cancel_type: 'instant',
          status: 'approved',
          reason,
          reason_detail: detailedReason,
          refund_amount: refundAmount,
          refund_rate: policy.refundRate / 100,
          menu_refund_amount: menuRefundAmount,
          delivery_refund_amount: deliveryRefundAmount,
          can_refund_coupon: policy.canRefundCoupon,
          can_refund_points: policy.canRefundPoints,
          owner_action: 'approved',
          approved_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError || !cancellation) {
        return {
          success: false,
          cancellationId: null,
          cancellationType: 'instant',
          refundAmount: 0,
          refundRate: 0,
          approvalDeadline: null,
          requiresApproval: false,
          message: ERROR_MESSAGES.CREATE_FAILED,
          errorMessage: createError?.message ?? ERROR_MESSAGES.CREATE_FAILED,
        }
      }

      // 주문 상태 업데이트
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_reason: detailedReason ?? reason,
          cancelled_at: new Date().toISOString(),
          refunded_amount: refundAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      return {
        success: true,
        cancellationId: cancellation.id,
        cancellationType: 'instant',
        refundAmount,
        refundRate: policy.refundRate,
        approvalDeadline: null,
        requiresApproval: false,
        message: '주문이 취소되었습니다.',
        errorMessage: null,
      }
    }

    // 점주 승인 필요인 경우
    const { data: cancellation, error: createError } = await supabase
      .from('order_cancellations')
      .insert({
        order_id: orderId,
        requested_by: userId,
        cancel_type: 'request',
        status: 'pending',
        reason,
        reason_detail: detailedReason,
        refund_amount: refundAmount,
        refund_rate: policy.refundRate / 100,
        menu_refund_amount: menuRefundAmount,
        delivery_refund_amount: deliveryRefundAmount,
        can_refund_coupon: policy.canRefundCoupon,
        can_refund_points: policy.canRefundPoints,
        owner_action: 'pending',
        approval_deadline: approvalDeadline?.toISOString(),
      })
      .select('id')
      .single()

    if (createError || !cancellation) {
      return {
        success: false,
        cancellationId: null,
        cancellationType: 'approval_required',
        refundAmount: 0,
        refundRate: 0,
        approvalDeadline: null,
        requiresApproval: true,
        message: ERROR_MESSAGES.CREATE_FAILED,
        errorMessage: createError?.message ?? ERROR_MESSAGES.CREATE_FAILED,
      }
    }

    // 주문에 취소 요청 시간 기록
    await supabase
      .from('orders')
      .update({
        cancel_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return {
      success: true,
      cancellationId: cancellation.id,
      cancellationType: 'approval_required',
      refundAmount,
      refundRate: policy.refundRate,
      approvalDeadline,
      requiresApproval: true,
      message: policy.messageForCustomer,
      errorMessage: null,
    }
  } catch (error) {
    console.error('[createCancellationRequestDirect] unexpected error:', error)
    return {
      success: false,
      cancellationId: null,
      cancellationType: 'not_allowed',
      refundAmount: 0,
      refundRate: 0,
      approvalDeadline: null,
      requiresApproval: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      errorMessage: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR,
    }
  }
}

/**
 * 취소 요청 조회
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @returns 취소 요청 상세 정보
 */
export async function getCancellation(
  supabase: SupabaseClient,
  cancellationId: string
): Promise<OrderCancellationExtended | null> {
  try {
    const { data, error } = await supabase
      .from('order_cancellations')
      .select('*')
      .eq('id', cancellationId)
      .single()

    if (error || !data) {
      return null
    }

    return data as OrderCancellationExtended
  } catch (error) {
    console.error('[getCancellation] unexpected error:', error)
    return null
  }
}

/**
 * 주문의 취소 요청 조회
 *
 * @param supabase Supabase 클라이언트
 * @param orderId 주문 ID
 * @returns 취소 요청 상세 정보
 */
export async function getCancellationByOrderId(
  supabase: SupabaseClient,
  orderId: string
): Promise<OrderCancellationExtended | null> {
  try {
    const { data, error } = await supabase
      .from('order_cancellations')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return data as OrderCancellationExtended
  } catch (error) {
    console.error('[getCancellationByOrderId] unexpected error:', error)
    return null
  }
}

/**
 * 취소 요청 상세 정보 조회 (조인 데이터 포함)
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @returns 취소 요청 상세 정보 (주문, 고객, 가게 정보 포함)
 */
export async function getCancellationWithDetails(
  supabase: SupabaseClient,
  cancellationId: string
): Promise<CancellationWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('order_cancellations')
      .select(`
        *,
        order:orders!inner(
          id,
          total_amount,
          delivery_fee,
          status,
          created_at,
          user:users!orders_user_id_fkey(
            id,
            name,
            phone
          ),
          restaurant:restaurants!orders_restaurant_id_fkey(
            id,
            name,
            owner_id
          )
        ),
        status_history:cancellation_status_history(*)
      `)
      .eq('id', cancellationId)
      .single()

    if (error || !data) {
      return null
    }

    // 데이터 변환
    const orderData = data.order as Record<string, unknown>
    const userData = orderData.user as Record<string, unknown> | null
    const restaurantData = orderData.restaurant as Record<string, unknown> | null

    return {
      ...data,
      order: {
        id: orderData.id as string,
        orderNumber: orderData.id as string, // order_number 필드가 있으면 교체
        totalAmount: orderData.total_amount as number,
        deliveryFee: orderData.delivery_fee as number,
        status: orderData.status as string,
        createdAt: orderData.created_at as string,
      },
      customer: userData
        ? {
            id: userData.id as string,
            name: userData.name as string,
            phone: userData.phone as string,
          }
        : null,
      restaurant: restaurantData
        ? {
            id: restaurantData.id as string,
            name: restaurantData.name as string,
            ownerId: restaurantData.owner_id as string,
          }
        : null,
      statusHistory: data.status_history ?? [],
    } as CancellationWithDetails
  } catch (error) {
    console.error('[getCancellationWithDetails] unexpected error:', error)
    return null
  }
}

/**
 * 고객의 취소 요청 목록 조회
 *
 * @param supabase Supabase 클라이언트
 * @param userId 고객 ID
 * @param options 조회 옵션
 * @returns 취소 요청 목록
 */
export async function getCustomerCancellations(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    status?: string
    limit?: number
    offset?: number
  }
): Promise<OrderCancellationExtended[]> {
  const { status, limit = 20, offset = 0 } = options ?? {}

  try {
    let query = supabase
      .from('order_cancellations')
      .select('*')
      .eq('requested_by', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    return data as OrderCancellationExtended[]
  } catch (error) {
    console.error('[getCustomerCancellations] unexpected error:', error)
    return []
  }
}

/**
 * 취소 요청 철회
 *
 * @description 고객이 아직 처리되지 않은 취소 요청을 철회합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @param userId 요청자 ID
 * @returns 철회 결과
 */
export async function withdrawCancellationRequest(
  supabase: SupabaseClient,
  cancellationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. 취소 요청 조회
    const { data: cancellation, error: fetchError } = await supabase
      .from('order_cancellations')
      .select('id, order_id, requested_by, status, owner_action')
      .eq('id', cancellationId)
      .single()

    if (fetchError || !cancellation) {
      return {
        success: false,
        message: '취소 요청을 찾을 수 없습니다.',
      }
    }

    // 2. 권한 확인
    if (cancellation.requested_by !== userId) {
      return {
        success: false,
        message: '이 취소 요청을 철회할 권한이 없습니다.',
      }
    }

    // 3. 철회 가능 상태 확인
    if (cancellation.status !== 'pending' || cancellation.owner_action !== 'pending') {
      return {
        success: false,
        message: '이미 처리된 취소 요청은 철회할 수 없습니다.',
      }
    }

    // 4. 취소 요청 상태 업데이트
    const { error: updateError } = await supabase
      .from('order_cancellations')
      .update({
        status: 'completed',
        owner_action: 'rejected',
        owner_rejection_reason: '고객 요청에 의한 철회',
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellationId)

    if (updateError) {
      return {
        success: false,
        message: '취소 요청 철회에 실패했습니다.',
      }
    }

    // 5. 주문의 취소 요청 시간 초기화
    await supabase
      .from('orders')
      .update({
        cancel_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellation.order_id)

    return {
      success: true,
      message: '취소 요청이 철회되었습니다.',
    }
  } catch (error) {
    console.error('[withdrawCancellationRequest] unexpected error:', error)
    return {
      success: false,
      message: '예기치 않은 오류가 발생했습니다.',
    }
  }
}

/**
 * 취소 요청 남은 시간 계산 (분)
 *
 * @param approvalDeadline 승인 기한
 * @returns 남은 시간 (분), 기한 지남 시 음수
 */
export function getRemainingMinutes(approvalDeadline: Date | string): number {
  const deadline =
    typeof approvalDeadline === 'string'
      ? new Date(approvalDeadline)
      : approvalDeadline
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.floor(diffMs / (1000 * 60))
}

/**
 * 취소 요청이 만료되었는지 확인
 *
 * @param approvalDeadline 승인 기한
 * @returns 만료 여부
 */
export function isExpired(approvalDeadline: Date | string): boolean {
  return getRemainingMinutes(approvalDeadline) < 0
}
