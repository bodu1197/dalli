/**
 * 주문 취소 복구 통합 서비스
 * @description PG 환불 + 쿠폰 복구 + 포인트 복구를 통합 처리
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CancellationProcessResult,
  OrderCancellation,
  Refund,
} from '@/types/order-cancellation.types'
import { recoverCouponFromOrder } from './coupon-recovery.service'
import { recoverPointsFromOrder } from './point-recovery.service'
import { processPGRefund, type ProcessPGRefundResult } from './pg-refund.service'

// ============================================================================
// 상수 정의
// ============================================================================

const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  CANCELLATION_NOT_FOUND: '취소 정보를 찾을 수 없습니다.',
  REFUND_NOT_FOUND: '환불 정보를 찾을 수 없습니다.',
  ALREADY_PROCESSED: '이미 처리된 취소 건입니다.',
  PG_REFUND_FAILED: 'PG사 환불 처리에 실패했습니다.',
  UNEXPECTED_ERROR: '예기치 않은 오류가 발생했습니다.',
} as const

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 취소 처리 옵션
 */
interface CancellationRecoveryOptions {
  /** PG 환불 처리 여부 (기본: true) */
  processPGRefund?: boolean
  /** 쿠폰 복구 처리 여부 (기본: true) */
  recoverCoupon?: boolean
  /** 포인트 복구 처리 여부 (기본: true) */
  recoverPoints?: boolean
  /** 실패 시 롤백 여부 (기본: false, 부분 성공 허용) */
  rollbackOnFailure?: boolean
}

/**
 * 상세 처리 결과
 */
interface DetailedRecoveryResult extends CancellationProcessResult {
  /** PG 환불 결과 상세 */
  pgRefundResult: ProcessPGRefundResult | null
  /** 처리 시간 (ms) */
  processingTimeMs: number
  /** 각 단계별 성공 여부 */
  stepResults: {
    pgRefund: boolean | null
    couponRecovery: boolean | null
    pointsRecovery: boolean | null
  }
}

// ============================================================================
// 취소 복구 통합 서비스
// ============================================================================

/**
 * 주문 취소에 대한 전체 복구 처리
 *
 * @description 다음 순서로 복구를 처리합니다:
 * 1. PG 환불 (결제 취소)
 * 2. 쿠폰 복구 (can_refund_coupon이 true인 경우)
 * 3. 포인트 복구 (can_refund_points가 true인 경우)
 *
 * 부분 성공을 허용하며, 각 단계의 결과를 개별적으로 반환합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @param options 처리 옵션
 * @returns 상세 처리 결과
 */
export async function processCancellationRecovery(
  supabase: SupabaseClient,
  cancellationId: string,
  options: CancellationRecoveryOptions = {}
): Promise<DetailedRecoveryResult> {
  const startTime = Date.now()

  const {
    processPGRefund: shouldProcessPGRefund = true,
    recoverCoupon: shouldRecoverCoupon = true,
    recoverPoints: shouldRecoverPoints = true,
  } = options

  // 결과 초기화
  const result: DetailedRecoveryResult = {
    success: false,
    cancellation: null,
    refund: null,
    couponRecovery: null,
    pointsRecovery: null,
    errorMessage: null,
    pgRefundResult: null,
    processingTimeMs: 0,
    stepResults: {
      pgRefund: null,
      couponRecovery: null,
      pointsRecovery: null,
    },
  }

  try {
    // 1. 취소 정보 조회
    const { data: cancellation, error: cancellationError } = await supabase
      .from('order_cancellations')
      .select('*')
      .eq('id', cancellationId)
      .single()

    if (cancellationError || !cancellation) {
      result.errorMessage = ERROR_MESSAGES.CANCELLATION_NOT_FOUND
      result.processingTimeMs = Date.now() - startTime
      return result
    }

    result.cancellation = cancellation as OrderCancellation

    // 2. 이미 완료된 취소인지 확인
    if (cancellation.status === 'completed') {
      result.success = true
      result.errorMessage = ERROR_MESSAGES.ALREADY_PROCESSED
      result.processingTimeMs = Date.now() - startTime
      return result
    }

    // 3. 환불 정보 조회
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .select('*')
      .eq('cancellation_id', cancellationId)
      .single()

    if (!refundError && refund) {
      result.refund = refund as Refund
    }

    const orderId = cancellation.order_id

    // ========================================================================
    // Step 1: PG 환불 처리
    // ========================================================================
    if (shouldProcessPGRefund && result.refund && result.refund.refundStatus === 'pending') {
      const pgResult = await processPGRefund(supabase, result.refund.id)
      result.pgRefundResult = pgResult
      result.stepResults.pgRefund = pgResult.success

      // 환불 정보 업데이트 조회
      if (pgResult.success) {
        const { data: updatedRefund } = await supabase
          .from('refunds')
          .select('*')
          .eq('id', result.refund.id)
          .single()

        if (updatedRefund) {
          result.refund = updatedRefund as Refund
        }
      }
    } else {
      result.stepResults.pgRefund = result.refund?.refundStatus === 'completed' ? true : null
    }

    // ========================================================================
    // Step 2: 쿠폰 복구
    // ========================================================================
    if (shouldRecoverCoupon && cancellation.can_refund_coupon && !cancellation.coupon_refunded) {
      const couponResult = await recoverCouponFromOrder(
        supabase,
        orderId,
        cancellationId
      )
      result.couponRecovery = couponResult
      result.stepResults.couponRecovery = couponResult.success
    } else {
      // 복구 불필요 또는 이미 복구됨
      result.stepResults.couponRecovery = cancellation.coupon_refunded ? true : null
      if (cancellation.coupon_refunded) {
        result.couponRecovery = {
          success: true,
          userCouponId: null,
          couponId: null,
          errorMessage: '이미 복구된 쿠폰입니다.',
        }
      }
    }

    // ========================================================================
    // Step 3: 포인트 복구
    // ========================================================================
    if (shouldRecoverPoints && cancellation.can_refund_points && !cancellation.points_refunded) {
      const pointsResult = await recoverPointsFromOrder(
        supabase,
        orderId,
        cancellationId
      )
      result.pointsRecovery = pointsResult
      result.stepResults.pointsRecovery = pointsResult.success
    } else {
      // 복구 불필요 또는 이미 복구됨
      result.stepResults.pointsRecovery = cancellation.points_refunded ? true : null
      if (cancellation.points_refunded) {
        result.pointsRecovery = {
          success: true,
          recoveredPoints: 0,
          newBalance: 0,
          transactionId: null,
          errorMessage: '이미 복구된 포인트입니다.',
        }
      }
    }

    // ========================================================================
    // 최종 결과 판정
    // ========================================================================
    const pgSuccess = result.stepResults.pgRefund !== false
    const couponSuccess = result.stepResults.couponRecovery !== false
    const pointsSuccess = result.stepResults.pointsRecovery !== false

    // 모든 처리가 성공하거나 해당 없음인 경우 전체 성공
    result.success = pgSuccess && couponSuccess && pointsSuccess

    // 모든 복구가 완료되면 취소 상태를 completed로 업데이트
    if (result.success) {
      const allRefundsCompleted =
        (result.stepResults.pgRefund === true || result.stepResults.pgRefund === null) &&
        (result.stepResults.couponRecovery === true || result.stepResults.couponRecovery === null) &&
        (result.stepResults.pointsRecovery === true || result.stepResults.pointsRecovery === null)

      if (allRefundsCompleted) {
        await supabase
          .from('order_cancellations')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', cancellationId)

        // 취소 정보 다시 조회
        const { data: updatedCancellation } = await supabase
          .from('order_cancellations')
          .select('*')
          .eq('id', cancellationId)
          .single()

        if (updatedCancellation) {
          result.cancellation = updatedCancellation as OrderCancellation
        }
      }
    }

    // 에러 메시지 생성
    if (!result.success) {
      const failedSteps: string[] = []
      if (result.stepResults.pgRefund === false) failedSteps.push('PG 환불')
      if (result.stepResults.couponRecovery === false) failedSteps.push('쿠폰 복구')
      if (result.stepResults.pointsRecovery === false) failedSteps.push('포인트 복구')
      result.errorMessage = `다음 단계에서 실패했습니다: ${failedSteps.join(', ')}`
    }

  } catch (error) {
    console.error('[processCancellationRecovery] unexpected error:', error)
    result.success = false
    result.errorMessage =
      error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR
  }

  result.processingTimeMs = Date.now() - startTime
  return result
}

/**
 * 취소 복구 상태 확인
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @returns 복구 상태
 */
export async function getRecoveryStatus(
  supabase: SupabaseClient,
  cancellationId: string
): Promise<{
  cancellationId: string
  status: string
  pgRefunded: boolean
  couponRefunded: boolean
  pointsRefunded: boolean
  isFullyRecovered: boolean
  pendingSteps: string[]
}> {
  const { data: cancellation, error } = await supabase
    .from('order_cancellations')
    .select('status, coupon_refunded, points_refunded')
    .eq('id', cancellationId)
    .single()

  if (error || !cancellation) {
    return {
      cancellationId,
      status: 'unknown',
      pgRefunded: false,
      couponRefunded: false,
      pointsRefunded: false,
      isFullyRecovered: false,
      pendingSteps: ['취소 정보를 찾을 수 없습니다'],
    }
  }

  // 환불 상태 확인
  const { data: refund } = await supabase
    .from('refunds')
    .select('refund_status')
    .eq('cancellation_id', cancellationId)
    .single()

  const pgRefunded = refund?.refund_status === 'completed'
  const couponRefunded = cancellation.coupon_refunded
  const pointsRefunded = cancellation.points_refunded

  const pendingSteps: string[] = []
  if (refund && refund.refund_status !== 'completed') {
    pendingSteps.push('PG 환불')
  }
  if (!couponRefunded) {
    pendingSteps.push('쿠폰 복구')
  }
  if (!pointsRefunded) {
    pendingSteps.push('포인트 복구')
  }

  const isFullyRecovered =
    (pgRefunded || !refund) && couponRefunded && pointsRefunded

  return {
    cancellationId,
    status: cancellation.status,
    pgRefunded,
    couponRefunded,
    pointsRefunded,
    isFullyRecovered,
    pendingSteps,
  }
}

/**
 * 미완료 취소 건 일괄 처리
 *
 * @description 대기 중인 취소 건들을 일괄로 복구 처리합니다.
 * 주로 크론 작업이나 백그라운드 작업에서 사용됩니다.
 *
 * @param supabase Supabase 클라이언트
 * @param options 처리 옵션
 * @returns 처리 결과 배열
 */
export async function processPendingCancellations(
  supabase: SupabaseClient,
  options?: {
    limit?: number
    olderThanMinutes?: number
  }
): Promise<{
  processed: number
  succeeded: number
  failed: number
  results: Array<{
    cancellationId: string
    success: boolean
    errorMessage: string | null
  }>
}> {
  const { limit = 50, olderThanMinutes = 5 } = options ?? {}

  // 처리 대기 중인 취소 건 조회
  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes)

  const { data: pendingCancellations, error } = await supabase
    .from('order_cancellations')
    .select('id')
    .in('status', ['pending', 'approved'])
    .lt('created_at', cutoffTime.toISOString())
    .limit(limit)

  if (error || !pendingCancellations || pendingCancellations.length === 0) {
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
      results: [],
    }
  }

  const results: Array<{
    cancellationId: string
    success: boolean
    errorMessage: string | null
  }> = []

  let succeeded = 0
  let failed = 0

  for (const cancellation of pendingCancellations) {
    const result = await processCancellationRecovery(supabase, cancellation.id)

    results.push({
      cancellationId: cancellation.id,
      success: result.success,
      errorMessage: result.errorMessage,
    })

    if (result.success) {
      succeeded++
    } else {
      failed++
    }
  }

  return {
    processed: pendingCancellations.length,
    succeeded,
    failed,
    results,
  }
}

/**
 * 특정 취소 건 재시도
 *
 * @description 실패한 단계만 선택적으로 재시도합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param cancellationId 취소 ID
 * @param steps 재시도할 단계들
 * @returns 처리 결과
 */
export async function retryCancellationRecovery(
  supabase: SupabaseClient,
  cancellationId: string,
  steps: {
    pgRefund?: boolean
    couponRecovery?: boolean
    pointsRecovery?: boolean
  }
): Promise<DetailedRecoveryResult> {
  return processCancellationRecovery(supabase, cancellationId, {
    processPGRefund: steps.pgRefund ?? false,
    recoverCoupon: steps.couponRecovery ?? false,
    recoverPoints: steps.pointsRecovery ?? false,
  })
}
