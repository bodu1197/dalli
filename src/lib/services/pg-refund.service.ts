/**
 * PG 환불 처리 서비스
 * @description 환불 레코드를 기반으로 실제 PG사 API를 호출하여 환불을 처리
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createInicisClientFromEnv } from '../pg/inicis'
import { RefundService, createRefundRequest } from './refund.service'
import type { IPGClient } from '../pg/types'
import type { PaymentMethod, RefundStatus } from '@/types/order-cancellation.types'

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 환불 처리 결과
 */
export interface ProcessPGRefundResult {
  /** 성공 여부 */
  success: boolean
  /** 환불 ID */
  refundId: string
  /** 새로운 환불 상태 */
  newStatus: RefundStatus
  /** PG 거래 ID */
  pgTransactionId: string | null
  /** PG 응답 데이터 */
  pgResponse: Record<string, unknown> | null
  /** 에러 메시지 (실패 시) */
  errorMessage: string | null
  /** 재시도 가능 여부 */
  isRetryable: boolean
}

/**
 * 환불 레코드 데이터
 */
interface RefundRecord {
  id: string
  order_id: string
  cancellation_id: string | null
  amount: number
  payment_method: PaymentMethod
  payment_key: string | null
  refund_status: RefundStatus
  retry_count: number
}

/**
 * 주문 데이터 (환불에 필요한 필드만)
 */
interface OrderForRefund {
  id: string
  total_amount: number
  payment_key: string | null
  pg_transaction_id: string | null
}

// ============================================================================
// PG 클라이언트 팩토리
// ============================================================================

/**
 * 결제 수단에 따른 PG 클라이언트 생성
 * 현재는 KG이니시스만 지원, 향후 다른 PG사 추가 가능
 */
function createPGClient(paymentMethod: PaymentMethod): IPGClient | null {
  // 현금 결제는 PG 환불 불필요
  if (paymentMethod === 'cash') {
    return null
  }

  // 현재는 모든 카드/간편결제가 이니시스를 통해 처리된다고 가정
  // 향후 각 결제 수단별로 다른 PG사 연동 가능
  try {
    return createInicisClientFromEnv()
  } catch {
    // 환경변수 미설정 시 null 반환
    return null
  }
}

// ============================================================================
// 환불 처리 서비스
// ============================================================================

/**
 * 환불 레코드를 기반으로 PG 환불 처리
 *
 * @param supabase Supabase 클라이언트
 * @param refundId 환불 레코드 ID
 * @returns 처리 결과
 */
export async function processPGRefund(
  supabase: SupabaseClient,
  refundId: string
): Promise<ProcessPGRefundResult> {
  // 1. 환불 레코드 조회
  const { data: refund, error: refundError } = await supabase
    .from('refunds')
    .select('*')
    .eq('id', refundId)
    .single()

  if (refundError || !refund) {
    return {
      success: false,
      refundId,
      newStatus: 'failed',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: '환불 정보를 찾을 수 없습니다.',
      isRetryable: false,
    }
  }

  const refundRecord = refund as RefundRecord

  // 2. 이미 완료된 환불인지 확인
  if (refundRecord.refund_status === 'completed') {
    return {
      success: true,
      refundId,
      newStatus: 'completed',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: null,
      isRetryable: false,
    }
  }

  // 3. 취소된 환불인지 확인
  if (refundRecord.refund_status === 'cancelled') {
    return {
      success: false,
      refundId,
      newStatus: 'cancelled',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: '취소된 환불입니다.',
      isRetryable: false,
    }
  }

  // 4. 주문 정보 조회 (PG 거래 ID 확인용)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total_amount, payment_key, pg_transaction_id')
    .eq('id', refundRecord.order_id)
    .single()

  if (orderError || !order) {
    await updateRefundStatus(supabase, refundId, 'failed', {
      failedReason: '주문 정보를 찾을 수 없습니다.',
    })

    return {
      success: false,
      refundId,
      newStatus: 'failed',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: '주문 정보를 찾을 수 없습니다.',
      isRetryable: false,
    }
  }

  const orderData = order as OrderForRefund

  // 5. PG 클라이언트 생성
  const pgClient = createPGClient(refundRecord.payment_method)

  // 현금 결제 또는 PG 클라이언트 미설정 시 바로 완료 처리
  if (!pgClient) {
    await updateRefundStatus(supabase, refundId, 'completed', {
      completedAt: new Date().toISOString(),
    })

    return {
      success: true,
      refundId,
      newStatus: 'completed',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: null,
      isRetryable: false,
    }
  }

  // 6. PG 거래 ID 확인
  const transactionId =
    orderData.pg_transaction_id ?? refundRecord.payment_key ?? orderData.payment_key

  if (!transactionId) {
    await updateRefundStatus(supabase, refundId, 'failed', {
      failedReason: 'PG 거래 ID가 없습니다.',
    })

    return {
      success: false,
      refundId,
      newStatus: 'failed',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: 'PG 거래 ID가 없습니다.',
      isRetryable: false,
    }
  }

  // 7. 환불 상태를 processing으로 업데이트
  await updateRefundStatus(supabase, refundId, 'processing')

  // 8. RefundService를 통해 PG 환불 요청 (재시도 로직 포함)
  const refundService = new RefundService(pgClient)

  const refundRequest = createRefundRequest({
    transactionId,
    amount: refundRecord.amount,
    reason: '주문 취소에 따른 환불',
    originalAmount: orderData.total_amount,
    orderId: refundRecord.order_id,
  })

  const result = await refundService.processRefund(refundRequest, refundId)

  // 9. 결과에 따라 환불 레코드 업데이트
  if (result.success && result.pgResponse) {
    await updateRefundStatus(supabase, refundId, 'completed', {
      pgResponse: result.pgResponse.rawResponse,
      pgTransactionId: result.pgResponse.cancelTransactionId,
      completedAt: result.pgResponse.cancelledAt ?? new Date().toISOString(),
    })

    return {
      success: true,
      refundId,
      newStatus: 'completed',
      pgTransactionId: result.pgResponse.cancelTransactionId,
      pgResponse: result.pgResponse.rawResponse,
      errorMessage: null,
      isRetryable: false,
    }
  } else {
    // 실패 시 재시도 횟수 증가
    const newRetryCount = refundRecord.retry_count + 1

    await updateRefundStatus(supabase, refundId, result.isRetryable ? 'pending' : 'failed', {
      failedReason: result.errorMessage ?? undefined,
      retryCount: newRetryCount,
      lastRetryAt: new Date().toISOString(),
    })

    return {
      success: false,
      refundId,
      newStatus: result.isRetryable ? 'pending' : 'failed',
      pgTransactionId: null,
      pgResponse: null,
      errorMessage: result.errorMessage,
      isRetryable: result.isRetryable,
    }
  }
}

/**
 * 여러 환불 레코드를 일괄 처리 (배치 처리용)
 */
export async function processPGRefundBatch(
  supabase: SupabaseClient,
  refundIds: string[]
): Promise<ProcessPGRefundResult[]> {
  const results: ProcessPGRefundResult[] = []

  for (const refundId of refundIds) {
    const result = await processPGRefund(supabase, refundId)
    results.push(result)
  }

  return results
}

/**
 * 대기 중인 환불 처리 (스케줄러용)
 * pending 상태이고 재시도 횟수가 남은 환불을 처리
 */
export async function processPendingRefunds(
  supabase: SupabaseClient,
  limit: number = 10
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const maxRetries = 3

  // pending 상태이고 재시도 횟수가 남은 환불 조회
  const { data: pendingRefunds, error } = await supabase
    .from('refunds')
    .select('id')
    .eq('refund_status', 'pending')
    .lt('retry_count', maxRetries)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !pendingRefunds || pendingRefunds.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  const refundIds = pendingRefunds.map((r) => r.id)
  const results = await processPGRefundBatch(supabase, refundIds)

  return {
    processed: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success && !r.isRetryable).length,
  }
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 환불 상태 업데이트
 */
async function updateRefundStatus(
  supabase: SupabaseClient,
  refundId: string,
  status: RefundStatus,
  additionalData?: {
    pgResponse?: Record<string, unknown>
    pgTransactionId?: string | null
    failedReason?: string
    retryCount?: number
    lastRetryAt?: string
    completedAt?: string
  }
): Promise<void> {
  const updateData: Record<string, unknown> = {
    refund_status: status,
    updated_at: new Date().toISOString(),
  }

  if (additionalData?.pgResponse) {
    updateData.pg_response = additionalData.pgResponse
  }

  if (additionalData?.pgTransactionId !== undefined) {
    updateData.pg_transaction_id = additionalData.pgTransactionId
  }

  if (additionalData?.failedReason) {
    updateData.failed_reason = additionalData.failedReason
  }

  if (additionalData?.retryCount !== undefined) {
    updateData.retry_count = additionalData.retryCount
  }

  if (additionalData?.lastRetryAt) {
    updateData.last_retry_at = additionalData.lastRetryAt
  }

  if (additionalData?.completedAt) {
    updateData.completed_at = additionalData.completedAt
  }

  await supabase.from('refunds').update(updateData).eq('id', refundId)
}
