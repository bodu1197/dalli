/**
 * 포인트 복구 서비스
 * @description 주문 취소 시 사용된 포인트를 복구하는 서비스
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  PointRecoveryResult,
  RecoverPointsParams,
} from '@/types/order-cancellation.types'

// ============================================================================
// 상수 정의
// ============================================================================

const ERROR_MESSAGES = {
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  NO_POINTS_USED: '사용된 포인트가 없습니다.',
  ALREADY_RECOVERED: '이미 복구된 포인트입니다.',
  RECOVERY_FAILED: '포인트 복구에 실패했습니다.',
  CANCELLATION_UPDATE_FAILED: '취소 정보 업데이트에 실패했습니다.',
} as const

// ============================================================================
// 포인트 복구 서비스
// ============================================================================

/**
 * 포인트 복구 처리
 *
 * @description 주문에 사용된 포인트를 복구합니다.
 * - user_points.balance를 증가
 * - user_points.total_used를 감소
 * - point_transactions에 환불 내역 생성
 * - order_cancellations.points_refunded를 true로 설정
 *
 * @param supabase Supabase 클라이언트
 * @param params 복구 파라미터
 * @returns 복구 결과
 */
export async function recoverPoints(
  supabase: SupabaseClient,
  params: RecoverPointsParams
): Promise<PointRecoveryResult> {
  const { orderId, cancellationId, userId, usedPoints } = params

  // 사용된 포인트가 없으면 성공으로 처리
  if (usedPoints <= 0) {
    return {
      success: true,
      recoveredPoints: 0,
      newBalance: 0,
      transactionId: null,
      errorMessage: null,
    }
  }

  try {
    // 1. 이미 복구되었는지 확인 (취소 레코드 조회)
    const { data: cancellation, error: cancellationFetchError } = await supabase
      .from('order_cancellations')
      .select('id, points_refunded')
      .eq('id', cancellationId)
      .single()

    if (cancellationFetchError) {
      console.error('[recoverPoints] cancellation fetch failed:', cancellationFetchError)
      // 취소 레코드를 찾을 수 없어도 포인트 복구는 진행
    }

    // 이미 복구된 경우
    if (cancellation?.points_refunded) {
      // 현재 잔액 조회
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('balance')
        .eq('user_id', userId)
        .single()

      return {
        success: true,
        recoveredPoints: usedPoints,
        newBalance: userPoints?.balance ?? 0,
        transactionId: null,
        errorMessage: ERROR_MESSAGES.ALREADY_RECOVERED,
      }
    }

    // 2. DB 함수를 통해 원자적으로 포인트 환불 처리
    const { data: refundResult, error: refundError } = await supabase.rpc(
      'refund_user_points',
      {
        p_user_id: userId,
        p_order_id: orderId,
        p_cancellation_id: cancellationId,
        p_amount: usedPoints,
        p_description: `주문 취소로 인한 포인트 환불 (주문 ID: ${orderId})`,
      }
    )

    if (refundError) {
      console.error('[recoverPoints] refund_user_points failed:', refundError)
      return {
        success: false,
        recoveredPoints: 0,
        newBalance: 0,
        transactionId: null,
        errorMessage: ERROR_MESSAGES.RECOVERY_FAILED,
      }
    }

    // RPC 결과 파싱 (배열 형태로 반환됨)
    const result = Array.isArray(refundResult) ? refundResult[0] : refundResult
    const newBalance = result?.new_balance ?? 0
    const transactionId = result?.transaction_id ?? null

    // 3. 취소 레코드 업데이트 (points_refunded = true)
    const { error: cancellationError } = await supabase
      .from('order_cancellations')
      .update({
        points_refunded: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellationId)

    if (cancellationError) {
      console.error('[recoverPoints] cancellation update failed:', cancellationError)
      // 취소 레코드 업데이트 실패해도 포인트 복구 자체는 성공으로 처리
    }

    return {
      success: true,
      recoveredPoints: usedPoints,
      newBalance,
      transactionId,
      errorMessage: null,
    }
  } catch (error) {
    console.error('[recoverPoints] unexpected error:', error)
    return {
      success: false,
      recoveredPoints: 0,
      newBalance: 0,
      transactionId: null,
      errorMessage:
        error instanceof Error ? error.message : ERROR_MESSAGES.RECOVERY_FAILED,
    }
  }
}

/**
 * 주문에서 포인트 복구 처리
 *
 * @description 주문 ID로 사용된 포인트를 조회하고 복구합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param orderId 주문 ID
 * @param cancellationId 취소 ID
 * @returns 복구 결과
 */
export async function recoverPointsFromOrder(
  supabase: SupabaseClient,
  orderId: string,
  cancellationId: string
): Promise<PointRecoveryResult> {
  try {
    // 1. 주문에서 사용된 포인트 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id, used_points, points_discount_amount')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return {
        success: true,
        recoveredPoints: 0,
        newBalance: 0,
        transactionId: null,
        errorMessage: null, // 주문을 찾을 수 없어도 에러로 처리하지 않음
      }
    }

    // 2. 포인트가 사용되지 않은 경우
    if (!order.used_points || order.used_points === 0) {
      return {
        success: true,
        recoveredPoints: 0,
        newBalance: 0,
        transactionId: null,
        errorMessage: null,
      }
    }

    // 3. 포인트 복구 실행
    return recoverPoints(supabase, {
      orderId,
      cancellationId,
      userId: order.user_id,
      usedPoints: order.used_points,
    })
  } catch (error) {
    console.error('[recoverPointsFromOrder] unexpected error:', error)
    return {
      success: false,
      recoveredPoints: 0,
      newBalance: 0,
      transactionId: null,
      errorMessage:
        error instanceof Error ? error.message : ERROR_MESSAGES.RECOVERY_FAILED,
    }
  }
}

/**
 * 사용자 포인트 잔액 조회
 *
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @returns 포인트 잔액 (없으면 0)
 */
export async function getUserPointBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return 0
    }

    return data.balance
  } catch {
    return 0
  }
}

/**
 * 포인트 복구 가능 여부 확인
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @returns 복구 가능 여부
 */
export async function canRecoverPoints(
  supabase: SupabaseClient,
  cancellationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('order_cancellations')
      .select('points_refunded, can_refund_points')
      .eq('id', cancellationId)
      .single()

    if (error || !data) {
      return false
    }

    // 아직 환불되지 않았고, 환불 가능한 경우에만 true
    return data.can_refund_points && !data.points_refunded
  } catch {
    return false
  }
}

/**
 * 포인트 거래 내역 조회
 *
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @param options 조회 옵션
 * @returns 거래 내역 배열
 */
export async function getPointTransactions(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    limit?: number
    offset?: number
    type?: 'earn' | 'use' | 'refund' | 'expire' | 'admin_adjust'
  }
): Promise<{
  transactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string | null
    createdAt: string
  }>
  error: string | null
}> {
  try {
    let query = supabase
      .from('point_transactions')
      .select('id, type, amount, balance_after, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.type) {
      query = query.eq('type', options.type)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('[getPointTransactions] query failed:', error)
      return {
        transactions: [],
        error: error.message,
      }
    }

    return {
      transactions: (data ?? []).map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balance_after,
        description: t.description,
        createdAt: t.created_at,
      })),
      error: null,
    }
  } catch (error) {
    console.error('[getPointTransactions] unexpected error:', error)
    return {
      transactions: [],
      error: error instanceof Error ? error.message : '거래 내역 조회에 실패했습니다.',
    }
  }
}
