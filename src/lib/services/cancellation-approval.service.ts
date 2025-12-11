/**
 * 취소 승인 처리 서비스
 * @description 점주의 취소 요청 승인/거절 및 자동 승인 처리
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  PendingApproval,
  ApprovalActionResult,
  AutoApprovalResult,
} from '@/types/order-cancellation.types'
import { processCancellationRecovery } from './cancellation-recovery.service'

// ============================================================================
// 상수 정의
// ============================================================================

const ERROR_MESSAGES = {
  CANCELLATION_NOT_FOUND: '취소 요청을 찾을 수 없습니다.',
  ORDER_NOT_FOUND: '주문 정보를 찾을 수 없습니다.',
  UNAUTHORIZED: '이 취소 요청을 처리할 권한이 없습니다.',
  ALREADY_PROCESSED: '이미 처리된 취소 요청입니다.',
  REJECTION_REASON_REQUIRED: '거절 사유를 입력해주세요.',
  APPROVE_FAILED: '승인 처리에 실패했습니다.',
  REJECT_FAILED: '거절 처리에 실패했습니다.',
  UNEXPECTED_ERROR: '예기치 않은 오류가 발생했습니다.',
} as const

// ============================================================================
// 점주 취소 승인 서비스
// ============================================================================

/**
 * 점주의 대기 중인 취소 요청 목록 조회
 *
 * @description 점주가 승인/거절해야 할 취소 요청 목록을 조회합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param ownerId 점주 ID
 * @returns 대기 중인 취소 요청 목록
 */
export async function getPendingApprovalsForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<PendingApproval[]> {
  try {
    // DB 함수를 통한 조회 시도
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'get_pending_cancellations_for_owner',
      { p_owner_id: ownerId }
    )

    if (!rpcError && rpcResult) {
      return rpcResult as PendingApproval[]
    }

    // DB 함수가 없는 경우 직접 조회
    const { data, error } = await supabase
      .from('order_cancellations')
      .select(`
        id,
        order_id,
        reason,
        reason_detail,
        refund_amount,
        refund_rate,
        created_at,
        approval_deadline,
        order:orders!inner(
          id,
          total_amount,
          user:users!orders_user_id_fkey(
            name,
            phone
          ),
          restaurant:restaurants!orders_restaurant_id_fkey!inner(
            owner_id
          )
        )
      `)
      .eq('status', 'pending')
      .eq('owner_action', 'pending')
      .eq('order.restaurant.owner_id', ownerId)
      .order('created_at', { ascending: true })

    if (error || !data) {
      return []
    }

    // 중첩 관계 데이터 타입 정의
    interface OrderRelation {
      id: string
      total_amount: number
      user: Array<{ name: string; phone: string }> | null
      restaurant: Array<{ owner_id: string }> | null
    }

    // 데이터 변환
    return data.map((item) => {
      // Supabase의 중첩 쿼리 결과는 배열로 반환됨
      const orderData = item.order as unknown as OrderRelation
      const userData = orderData?.user?.[0] ?? null
      const now = new Date()
      const deadline = item.approval_deadline
        ? new Date(item.approval_deadline)
        : null
      const remainingMs = deadline ? deadline.getTime() - now.getTime() : 0

      return {
        cancellationId: item.id,
        orderId: item.order_id,
        orderNumber: orderData?.id ?? '',
        customerName: userData?.name ?? '알 수 없음',
        customerPhone: userData?.phone ?? '',
        orderAmount: orderData?.total_amount ?? 0,
        refundAmount: item.refund_amount,
        refundRate: item.refund_rate,
        reason: item.reason,
        detailedReason: item.reason_detail,
        requestedAt: item.created_at,
        approvalDeadline: item.approval_deadline ?? '',
        remainingMinutes: Math.floor(remainingMs / (1000 * 60)),
      } as PendingApproval
    })
  } catch (error) {
    console.error('[getPendingApprovalsForOwner] unexpected error:', error)
    return []
  }
}

/**
 * 취소 요청 승인
 *
 * @description 점주가 취소 요청을 승인합니다.
 * 승인 시 PG 환불, 쿠폰/포인트 복구가 진행됩니다.
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @param ownerId 점주 ID
 * @returns 승인 결과
 */
export async function approveCancellation(
  supabase: SupabaseClient,
  cancellationId: string,
  ownerId: string
): Promise<ApprovalActionResult> {
  try {
    // DB 함수를 통한 승인 시도
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'approve_cancellation',
      {
        p_cancellation_id: cancellationId,
        p_owner_id: ownerId,
      }
    )

    if (!rpcError && rpcResult) {
      const result = rpcResult as Record<string, unknown>

      if (!result.success) {
        return {
          success: false,
          cancellationId,
          orderId: null,
          message: result.error as string,
          errorMessage: result.error as string,
        }
      }

      // 승인 성공 시 복구 처리 (PG 환불, 쿠폰/포인트)
      await processCancellationRecovery(supabase, cancellationId)

      return {
        success: true,
        cancellationId: result.cancellationId as string,
        orderId: result.orderId as string,
        message: result.message as string,
        errorMessage: null,
      }
    }

    // DB 함수가 없는 경우 직접 처리
    return approveCancellationDirect(supabase, cancellationId, ownerId)
  } catch (error) {
    console.error('[approveCancellation] unexpected error:', error)
    return {
      success: false,
      cancellationId,
      orderId: null,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      errorMessage: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR,
    }
  }
}

/**
 * 취소 요청 직접 승인 (DB 함수 없이)
 */
async function approveCancellationDirect(
  supabase: SupabaseClient,
  cancellationId: string,
  ownerId: string
): Promise<ApprovalActionResult> {
  try {
    // 1. 취소 요청 조회
    const { data: cancellation, error: fetchError } = await supabase
      .from('order_cancellations')
      .select(`
        *,
        order:orders!inner(
          id,
          restaurant:restaurants!orders_restaurant_id_fkey(
            owner_id
          )
        )
      `)
      .eq('id', cancellationId)
      .single()

    if (fetchError || !cancellation) {
      return {
        success: false,
        cancellationId,
        orderId: null,
        message: ERROR_MESSAGES.CANCELLATION_NOT_FOUND,
        errorMessage: ERROR_MESSAGES.CANCELLATION_NOT_FOUND,
      }
    }

    // 2. 이미 처리된 경우
    if (cancellation.status !== 'pending' || cancellation.owner_action !== 'pending') {
      return {
        success: false,
        cancellationId,
        orderId: cancellation.order_id,
        message: ERROR_MESSAGES.ALREADY_PROCESSED,
        errorMessage: ERROR_MESSAGES.ALREADY_PROCESSED,
      }
    }

    // 3. 권한 확인
    const orderData = cancellation.order as Record<string, unknown>
    const restaurantData = orderData.restaurant as Record<string, unknown> | null

    if (!restaurantData || restaurantData.owner_id !== ownerId) {
      return {
        success: false,
        cancellationId,
        orderId: cancellation.order_id,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        errorMessage: ERROR_MESSAGES.UNAUTHORIZED,
      }
    }

    // 4. 승인 처리
    const { error: updateError } = await supabase
      .from('order_cancellations')
      .update({
        status: 'approved',
        owner_action: 'approved',
        owner_action_at: new Date().toISOString(),
        owner_action_by: ownerId,
        approved_by: ownerId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellationId)

    if (updateError) {
      return {
        success: false,
        cancellationId,
        orderId: cancellation.order_id,
        message: ERROR_MESSAGES.APPROVE_FAILED,
        errorMessage: updateError.message,
      }
    }

    // 5. 주문 상태 업데이트
    await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_reason: cancellation.reason,
        cancelled_at: new Date().toISOString(),
        refunded_amount: cancellation.refund_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellation.order_id)

    // 6. 복구 처리 (PG 환불, 쿠폰/포인트)
    await processCancellationRecovery(supabase, cancellationId)

    return {
      success: true,
      cancellationId,
      orderId: cancellation.order_id,
      message: '취소가 승인되었습니다.',
      errorMessage: null,
    }
  } catch (error) {
    console.error('[approveCancellationDirect] unexpected error:', error)
    return {
      success: false,
      cancellationId,
      orderId: null,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      errorMessage: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR,
    }
  }
}

/**
 * 취소 요청 거절
 *
 * @description 점주가 취소 요청을 거절합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @param ownerId 점주 ID
 * @param rejectionReason 거절 사유
 * @returns 거절 결과
 */
export async function rejectCancellation(
  supabase: SupabaseClient,
  cancellationId: string,
  ownerId: string,
  rejectionReason: string
): Promise<ApprovalActionResult> {
  // 거절 사유 필수 확인
  if (!rejectionReason || rejectionReason.trim().length === 0) {
    return {
      success: false,
      cancellationId,
      orderId: null,
      message: ERROR_MESSAGES.REJECTION_REASON_REQUIRED,
      errorMessage: ERROR_MESSAGES.REJECTION_REASON_REQUIRED,
    }
  }

  try {
    // DB 함수를 통한 거절 시도
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'reject_cancellation',
      {
        p_cancellation_id: cancellationId,
        p_owner_id: ownerId,
        p_rejection_reason: rejectionReason.trim(),
      }
    )

    if (!rpcError && rpcResult) {
      const result = rpcResult as Record<string, unknown>

      if (!result.success) {
        return {
          success: false,
          cancellationId,
          orderId: null,
          message: result.error as string,
          errorMessage: result.error as string,
        }
      }

      return {
        success: true,
        cancellationId: result.cancellationId as string,
        orderId: result.orderId as string,
        message: result.message as string,
        errorMessage: null,
      }
    }

    // DB 함수가 없는 경우 직접 처리
    return rejectCancellationDirect(supabase, cancellationId, ownerId, rejectionReason.trim())
  } catch (error) {
    console.error('[rejectCancellation] unexpected error:', error)
    return {
      success: false,
      cancellationId,
      orderId: null,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      errorMessage: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR,
    }
  }
}

/**
 * 취소 요청 직접 거절 (DB 함수 없이)
 */
async function rejectCancellationDirect(
  supabase: SupabaseClient,
  cancellationId: string,
  ownerId: string,
  rejectionReason: string
): Promise<ApprovalActionResult> {
  try {
    // 1. 취소 요청 조회
    const { data: cancellation, error: fetchError } = await supabase
      .from('order_cancellations')
      .select(`
        *,
        order:orders!inner(
          id,
          restaurant:restaurants!orders_restaurant_id_fkey(
            owner_id
          )
        )
      `)
      .eq('id', cancellationId)
      .single()

    if (fetchError || !cancellation) {
      return {
        success: false,
        cancellationId,
        orderId: null,
        message: ERROR_MESSAGES.CANCELLATION_NOT_FOUND,
        errorMessage: ERROR_MESSAGES.CANCELLATION_NOT_FOUND,
      }
    }

    // 2. 이미 처리된 경우
    if (cancellation.status !== 'pending' || cancellation.owner_action !== 'pending') {
      return {
        success: false,
        cancellationId,
        orderId: cancellation.order_id,
        message: ERROR_MESSAGES.ALREADY_PROCESSED,
        errorMessage: ERROR_MESSAGES.ALREADY_PROCESSED,
      }
    }

    // 3. 권한 확인
    const orderData = cancellation.order as Record<string, unknown>
    const restaurantData = orderData.restaurant as Record<string, unknown> | null

    if (!restaurantData || restaurantData.owner_id !== ownerId) {
      return {
        success: false,
        cancellationId,
        orderId: cancellation.order_id,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        errorMessage: ERROR_MESSAGES.UNAUTHORIZED,
      }
    }

    // 4. 거절 처리
    const { error: updateError } = await supabase
      .from('order_cancellations')
      .update({
        status: 'rejected',
        owner_action: 'rejected',
        owner_action_at: new Date().toISOString(),
        owner_action_by: ownerId,
        owner_rejection_reason: rejectionReason,
        rejected_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellationId)

    if (updateError) {
      return {
        success: false,
        cancellationId,
        orderId: cancellation.order_id,
        message: ERROR_MESSAGES.REJECT_FAILED,
        errorMessage: updateError.message,
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
      cancellationId,
      orderId: cancellation.order_id,
      message: '취소 요청이 거절되었습니다.',
      errorMessage: null,
    }
  } catch (error) {
    console.error('[rejectCancellationDirect] unexpected error:', error)
    return {
      success: false,
      cancellationId,
      orderId: null,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      errorMessage: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR,
    }
  }
}

/**
 * 자동 승인 처리 (배치용)
 *
 * @description 승인 기한이 지난 취소 요청을 자동으로 승인 처리합니다.
 * 주로 크론 작업에서 호출됩니다.
 *
 * @param supabase Supabase 클라이언트
 * @returns 자동 승인 결과
 */
export async function processAutoApprovals(
  supabase: SupabaseClient
): Promise<AutoApprovalResult> {
  try {
    // DB 함수를 통한 자동 승인 시도
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'process_auto_approvals'
    )

    if (!rpcError && rpcResult) {
      const result = rpcResult as Record<string, unknown>
      const individualResults = result.results as Array<Record<string, unknown>> ?? []

      // 자동 승인된 건들에 대해 복구 처리
      for (const item of individualResults) {
        if (item.success) {
          await processCancellationRecovery(supabase, item.cancellationId as string)
        }
      }

      return {
        processed: result.processed as number,
        autoApproved: result.autoApproved as number,
        failed: result.failed as number,
        results: individualResults.map((item) => ({
          cancellationId: item.cancellationId as string,
          success: item.success as boolean,
          errorMessage: item.error as string | undefined,
        })),
      }
    }

    // DB 함수가 없는 경우 직접 처리
    return processAutoApprovalsDirect(supabase)
  } catch (error) {
    console.error('[processAutoApprovals] unexpected error:', error)
    return {
      processed: 0,
      autoApproved: 0,
      failed: 0,
      results: [],
    }
  }
}

/**
 * 자동 승인 직접 처리 (DB 함수 없이)
 */
async function processAutoApprovalsDirect(
  supabase: SupabaseClient
): Promise<AutoApprovalResult> {
  const results: AutoApprovalResult['results'] = []
  let processed = 0
  let autoApproved = 0
  let failed = 0

  try {
    // 승인 기한이 지난 대기 중 취소 건 조회
    const now = new Date().toISOString()
    const { data: expiredCancellations, error: fetchError } = await supabase
      .from('order_cancellations')
      .select('id, order_id, reason, refund_amount')
      .eq('status', 'pending')
      .eq('owner_action', 'pending')
      .not('approval_deadline', 'is', null)
      .lt('approval_deadline', now)
      .limit(50)

    if (fetchError || !expiredCancellations || expiredCancellations.length === 0) {
      return { processed: 0, autoApproved: 0, failed: 0, results: [] }
    }

    for (const cancellation of expiredCancellations) {
      processed++

      try {
        // 자동 승인 처리
        const { error: updateError } = await supabase
          .from('order_cancellations')
          .update({
            status: 'approved',
            owner_action: 'approved',
            owner_action_at: new Date().toISOString(),
            auto_approved: true,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', cancellation.id)

        if (updateError) {
          throw updateError
        }

        // 주문 상태 업데이트
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            cancelled_reason: `자동 승인: ${cancellation.reason}`,
            cancelled_at: new Date().toISOString(),
            refunded_amount: cancellation.refund_amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cancellation.order_id)

        // 복구 처리
        await processCancellationRecovery(supabase, cancellation.id)

        autoApproved++
        results.push({
          cancellationId: cancellation.id,
          success: true,
        })
      } catch (err) {
        failed++
        results.push({
          cancellationId: cancellation.id,
          success: false,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return { processed, autoApproved, failed, results }
  } catch (error) {
    console.error('[processAutoApprovalsDirect] unexpected error:', error)
    return { processed, autoApproved, failed, results }
  }
}

/**
 * 특정 가게의 취소 통계 조회
 *
 * @param supabase Supabase 클라이언트
 * @param ownerId 점주 ID
 * @param dateRange 조회 기간
 * @returns 취소 통계
 */
export async function getCancellationStats(
  supabase: SupabaseClient,
  ownerId: string,
  dateRange?: {
    from: Date
    to: Date
  }
): Promise<{
  totalRequests: number
  approved: number
  rejected: number
  autoApproved: number
  pending: number
}> {
  try {
    const from = dateRange?.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const to = dateRange?.to ?? new Date()

    // 점주의 가게 ID 조회
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', ownerId)

    if (!restaurants || restaurants.length === 0) {
      return {
        totalRequests: 0,
        approved: 0,
        rejected: 0,
        autoApproved: 0,
        pending: 0,
      }
    }

    const restaurantIds = restaurants.map((r) => r.id)

    // 해당 기간의 주문 ID 조회
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .in('restaurant_id', restaurantIds)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())

    if (!orders || orders.length === 0) {
      return {
        totalRequests: 0,
        approved: 0,
        rejected: 0,
        autoApproved: 0,
        pending: 0,
      }
    }

    const orderIds = orders.map((o) => o.id)

    // 취소 요청 통계 조회
    const { data: cancellations } = await supabase
      .from('order_cancellations')
      .select('status, auto_approved')
      .in('order_id', orderIds)

    if (!cancellations) {
      return {
        totalRequests: 0,
        approved: 0,
        rejected: 0,
        autoApproved: 0,
        pending: 0,
      }
    }

    const stats = {
      totalRequests: cancellations.length,
      approved: 0,
      rejected: 0,
      autoApproved: 0,
      pending: 0,
    }

    for (const c of cancellations) {
      if (c.status === 'pending') {
        stats.pending++
      } else if (c.status === 'approved' || c.status === 'completed') {
        stats.approved++
        if (c.auto_approved) {
          stats.autoApproved++
        }
      } else if (c.status === 'rejected') {
        stats.rejected++
      }
    }

    return stats
  } catch (error) {
    console.error('[getCancellationStats] unexpected error:', error)
    return {
      totalRequests: 0,
      approved: 0,
      rejected: 0,
      autoApproved: 0,
      pending: 0,
    }
  }
}

/**
 * 대기 중인 취소 요청 수 조회
 *
 * @param supabase Supabase 클라이언트
 * @param ownerId 점주 ID
 * @returns 대기 중인 취소 요청 수
 */
export async function getPendingApprovalCount(
  supabase: SupabaseClient,
  ownerId: string
): Promise<number> {
  try {
    const pendingList = await getPendingApprovalsForOwner(supabase, ownerId)
    return pendingList.length
  } catch (error) {
    console.error('[getPendingApprovalCount] unexpected error:', error)
    return 0
  }
}
