/**
 * 환불 서비스
 * @description PG사 환불 API 호출 및 재시도 로직 처리
 */

import type {
  IPGClient,
  PGRefundRequest,
  RefundServiceConfig,
  RefundProcessResult,
  RetryInfo,
} from '../pg/types'
import { DEFAULT_REFUND_SERVICE_CONFIG } from '../pg/types'
import { PGError, isRetryableError } from '../pg/errors'

// ============================================================================
// 서비스 구현
// ============================================================================

/**
 * 환불 서비스 클래스
 * PG 클라이언트를 주입받아 환불 처리를 수행
 */
export class RefundService {
  private readonly client: IPGClient
  private readonly config: RefundServiceConfig

  constructor(client: IPGClient, config?: Partial<RefundServiceConfig>) {
    this.client = client
    this.config = {
      maxRetries: config?.maxRetries ?? DEFAULT_REFUND_SERVICE_CONFIG.maxRetries,
      baseRetryDelayMs:
        config?.baseRetryDelayMs ?? DEFAULT_REFUND_SERVICE_CONFIG.baseRetryDelayMs,
      useExponentialBackoff:
        config?.useExponentialBackoff ??
        DEFAULT_REFUND_SERVICE_CONFIG.useExponentialBackoff,
      maxRetryDelayMs:
        config?.maxRetryDelayMs ?? DEFAULT_REFUND_SERVICE_CONFIG.maxRetryDelayMs,
    }
  }

  /**
   * 환불 처리 (재시도 로직 포함)
   */
  async processRefund(
    request: PGRefundRequest,
    refundId: string
  ): Promise<RefundProcessResult> {
    let lastError: PGError | Error | null = null
    let attempt = 0

    while (attempt <= this.config.maxRetries) {
      try {
        const response = await this.client.refund(request)

        return {
          success: true,
          refundId,
          pgResponse: response,
          errorMessage: null,
          isRetryable: false,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        attempt++

        // 재시도 불가능한 에러면 즉시 종료
        if (!isRetryableError(error)) {
          break
        }

        // 최대 재시도 횟수 초과
        if (attempt > this.config.maxRetries) {
          break
        }

        // 재시도 대기
        const delayMs = this.calculateRetryDelay(attempt)
        await this.delay(delayMs)
      }
    }

    // 모든 재시도 실패
    const errorMessage =
      lastError instanceof PGError
        ? lastError.message
        : lastError?.message ?? '알 수 없는 오류'

    return {
      success: false,
      refundId,
      pgResponse: null,
      errorMessage,
      isRetryable: isRetryableError(lastError),
    }
  }

  /**
   * 재시도 정보 조회
   */
  getRetryInfo(currentAttempt: number): RetryInfo {
    const canRetry = currentAttempt < this.config.maxRetries
    const nextRetryDelayMs = canRetry
      ? this.calculateRetryDelay(currentAttempt + 1)
      : null

    return {
      currentAttempt,
      maxAttempts: this.config.maxRetries,
      nextRetryDelayMs,
      canRetry,
    }
  }

  /**
   * 재시도 대기 시간 계산 (지수 백오프)
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.config.useExponentialBackoff) {
      return this.config.baseRetryDelayMs
    }

    // 지수 백오프: baseDelay * 2^(attempt-1)
    const exponentialDelay =
      this.config.baseRetryDelayMs * Math.pow(2, attempt - 1)

    // 지터(jitter) 추가: ±10% 랜덤
    const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1)
    const delayWithJitter = exponentialDelay + jitter

    // 최대 대기 시간 제한
    return Math.min(delayWithJitter, this.config.maxRetryDelayMs)
  }

  /**
   * 대기 유틸리티
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 환불 요청 생성 헬퍼
 */
export function createRefundRequest(params: {
  transactionId: string
  amount: number
  reason: string
  originalAmount?: number
  previousCancelAmount?: number
  orderId?: string
}): PGRefundRequest {
  return {
    transactionId: params.transactionId,
    amount: params.amount,
    reason: params.reason,
    originalAmount: params.originalAmount,
    previousCancelAmount: params.previousCancelAmount,
    orderId: params.orderId,
  }
}

/**
 * 부분 환불 가능 금액 계산
 */
export function calculateRefundableAmount(
  originalAmount: number,
  previousCancelAmount: number
): number {
  const refundable = originalAmount - previousCancelAmount
  return Math.max(0, refundable)
}

/**
 * 부분 환불 여부 확인
 */
export function isPartialRefund(
  refundAmount: number,
  originalAmount: number
): boolean {
  return refundAmount > 0 && refundAmount < originalAmount
}

/**
 * 환불 금액 유효성 검증
 */
export function validateRefundAmount(params: {
  refundAmount: number
  originalAmount: number
  previousCancelAmount?: number
}): { isValid: boolean; errorMessage: string | null } {
  const { refundAmount, originalAmount, previousCancelAmount = 0 } = params

  if (refundAmount <= 0) {
    return {
      isValid: false,
      errorMessage: '환불 금액은 0보다 커야 합니다.',
    }
  }

  if (!Number.isInteger(refundAmount)) {
    return {
      isValid: false,
      errorMessage: '환불 금액은 정수여야 합니다.',
    }
  }

  const refundableAmount = calculateRefundableAmount(
    originalAmount,
    previousCancelAmount
  )

  if (refundAmount > refundableAmount) {
    return {
      isValid: false,
      errorMessage: `환불 가능 금액(${refundableAmount.toLocaleString()}원)을 초과했습니다.`,
    }
  }

  return {
    isValid: true,
    errorMessage: null,
  }
}
