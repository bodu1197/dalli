/**
 * KG이니시스 API 클라이언트
 * @description KG이니시스 결제 취소(환불) API 연동
 */

import crypto from 'crypto'
import type {
  IPGClient,
  PGRefundRequest,
  PGRefundResponse,
  PGTransactionStatusResponse,
} from '../types'
import { PGError, PGErrorCode, wrapNetworkError } from '../errors'
import type {
  InicisClientConfig,
  InicisRefundRequestParams,
  InicisRefundResponse,
} from './types'
import {
  INICIS_API_URLS,
  INICIS_ENDPOINTS,
  INICIS_SUCCESS_CODE,
  INICIS_DEFAULT_TIMEOUT_MS,
  mapInicisErrorCode,
  getInicisErrorMessage,
} from './constants'

// ============================================================================
// 클라이언트 구현
// ============================================================================

/**
 * KG이니시스 PG 클라이언트
 */
export class InicisClient implements IPGClient {
  readonly provider = 'inicis' as const

  private readonly config: Required<InicisClientConfig>
  private readonly baseUrl: string

  constructor(config: InicisClientConfig) {
    this.validateConfig(config)

    this.config = {
      mid: config.mid,
      apiKey: config.apiKey,
      signKey: config.signKey,
      isProduction: config.isProduction,
      timeoutMs: config.timeoutMs ?? INICIS_DEFAULT_TIMEOUT_MS,
    }

    this.baseUrl = config.isProduction
      ? INICIS_API_URLS.PRODUCTION
      : INICIS_API_URLS.SANDBOX
  }

  /**
   * 환불 처리
   */
  async refund(request: PGRefundRequest): Promise<PGRefundResponse> {
    this.validateRefundRequest(request)

    const timestamp = Date.now().toString()
    const signData = `${this.config.mid}${request.transactionId}${request.amount}${timestamp}`
    const hashData = this.generateSignature(signData)

    const params: InicisRefundRequestParams = {
      mid: this.config.mid,
      tid: request.transactionId,
      price: request.amount,
      msg: this.sanitizeReason(request.reason),
      timestamp,
      hashData,
    }

    // 부분취소 여부 확인
    if (
      request.originalAmount !== undefined &&
      request.amount < request.originalAmount
    ) {
      params.partialCancelCode = '1'
    }

    const response = await this.sendRequest<InicisRefundResponse>(
      INICIS_ENDPOINTS.REFUND,
      params as unknown as Record<string, unknown>
    )

    return this.transformRefundResponse(response)
  }

  /**
   * 거래 상태 조회
   */
  async getTransactionStatus(
    transactionId: string
  ): Promise<PGTransactionStatusResponse> {
    const timestamp = Date.now().toString()
    const signData = `${this.config.mid}${transactionId}${timestamp}`
    const hashData = this.generateSignature(signData)

    const params = {
      mid: this.config.mid,
      tid: transactionId,
      timestamp,
      hashData,
    }

    const response = await this.sendRequest<{
      resultCode: string
      resultMsg: string
      status?: string
      price?: number
      cancelPrice?: number
    }>(INICIS_ENDPOINTS.TRANSACTION, params)

    return this.transformTransactionStatusResponse(response)
  }

  /**
   * HMAC-SHA256 서명 생성
   */
  generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.config.signKey)
      .update(data)
      .digest('hex')
  }

  /**
   * 서명 검증
   */
  verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data)
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * 설정 유효성 검증
   */
  private validateConfig(config: InicisClientConfig): void {
    if (!config.mid || config.mid.trim() === '') {
      throw new PGError({
        code: PGErrorCode.NON_RETRYABLE_MISSING_PARAMS,
        message: 'KG이니시스 상점 ID(MID)가 설정되지 않았습니다.',
      })
    }

    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new PGError({
        code: PGErrorCode.NON_RETRYABLE_MISSING_PARAMS,
        message: 'KG이니시스 API 키가 설정되지 않았습니다.',
      })
    }

    if (!config.signKey || config.signKey.trim() === '') {
      throw new PGError({
        code: PGErrorCode.NON_RETRYABLE_MISSING_PARAMS,
        message: 'KG이니시스 서명 키가 설정되지 않았습니다.',
      })
    }
  }

  /**
   * 환불 요청 유효성 검증
   */
  private validateRefundRequest(request: PGRefundRequest): void {
    if (!request.transactionId || request.transactionId.trim() === '') {
      throw new PGError({
        code: PGErrorCode.NON_RETRYABLE_INVALID_TID,
        message: '거래 ID가 없습니다.',
      })
    }

    if (!Number.isInteger(request.amount) || request.amount <= 0) {
      throw new PGError({
        code: PGErrorCode.NON_RETRYABLE_INVALID_AMOUNT,
        message: '환불 금액이 올바르지 않습니다.',
      })
    }

    // 부분취소 시 금액 검증
    if (
      request.originalAmount !== undefined &&
      request.amount > request.originalAmount
    ) {
      throw new PGError({
        code: PGErrorCode.NON_RETRYABLE_AMOUNT_EXCEEDED,
        message: '환불 금액이 원거래 금액을 초과합니다.',
      })
    }
  }

  /**
   * 취소 사유 정제 (특수문자 제거, 길이 제한)
   */
  private sanitizeReason(reason: string): string {
    const maxLength = 100
    const sanitized = reason
      .replace(/[<>'"&]/g, '') // 특수문자 제거
      .trim()
      .slice(0, maxLength)

    return sanitized || '주문 취소'
  }

  /**
   * API 요청 전송
   */
  private async sendRequest<T>(
    endpoint: string,
    params: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs
    )

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey,
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new PGError({
          code: this.httpStatusToPGErrorCode(response.status),
          message: `HTTP 오류: ${response.status} ${response.statusText}`,
          pgErrorCode: response.status.toString(),
        })
      }

      const data = (await response.json()) as T
      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof PGError) {
        throw error
      }

      // AbortError (타임아웃)
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.includes('abort'))
      ) {
        throw new PGError({
          code: PGErrorCode.RETRYABLE_NETWORK_TIMEOUT,
          message: `요청 타임아웃 (${this.config.timeoutMs}ms)`,
          originalError: error,
        })
      }

      // 기타 네트워크 에러
      throw wrapNetworkError(error)
    }
  }

  /**
   * HTTP 상태 코드를 PGErrorCode로 변환
   */
  private httpStatusToPGErrorCode(status: number): PGErrorCode {
    if (status >= 500) return PGErrorCode.RETRYABLE_SERVER_ERROR
    if (status === 429) return PGErrorCode.RETRYABLE_RATE_LIMITED
    if (status === 401 || status === 403)
      return PGErrorCode.NON_RETRYABLE_AUTH_FAILED
    if (status === 404) return PGErrorCode.NON_RETRYABLE_TRANSACTION_NOT_FOUND
    return PGErrorCode.UNKNOWN
  }

  /**
   * 환불 응답 변환
   */
  private transformRefundResponse(
    response: InicisRefundResponse
  ): PGRefundResponse {
    const isSuccess = response.resultCode === INICIS_SUCCESS_CODE

    if (!isSuccess) {
      const pgErrorCode = mapInicisErrorCode(response.resultCode)
      throw new PGError({
        code: pgErrorCode,
        message: getInicisErrorMessage(response.resultCode),
        pgErrorCode: response.resultCode,
        pgErrorMessage: response.resultMsg,
      })
    }

    let cancelledAt: string | null = null
    if (response.cancelDate && response.cancelTime) {
      // YYYYMMDD + HHmmss -> ISO 8601
      const dateStr = response.cancelDate
      const timeStr = response.cancelTime
      const isoDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}+09:00`
      cancelledAt = isoDate
    }

    return {
      success: true,
      resultCode: response.resultCode,
      resultMessage: response.resultMsg,
      cancelTransactionId: response.cancelTid ?? null,
      cancelledAt,
      rawResponse: response as unknown as Record<string, unknown>,
    }
  }

  /**
   * 거래 상태 응답 변환
   */
  private transformTransactionStatusResponse(response: {
    resultCode: string
    resultMsg: string
    status?: string
    price?: number
    cancelPrice?: number
  }): PGTransactionStatusResponse {
    const isSuccess = response.resultCode === INICIS_SUCCESS_CODE

    if (!isSuccess) {
      return {
        success: false,
        status: 'unknown',
        originalAmount: 0,
        cancelledAmount: 0,
        remainingAmount: 0,
        rawResponse: response as Record<string, unknown>,
      }
    }

    const originalAmount = response.price ?? 0
    const cancelledAmount = response.cancelPrice ?? 0
    const remainingAmount = originalAmount - cancelledAmount

    let status: PGTransactionStatusResponse['status'] = 'unknown'
    if (cancelledAmount === 0) {
      status = 'paid'
    } else if (cancelledAmount === originalAmount) {
      status = 'cancelled'
    } else if (cancelledAmount > 0 && cancelledAmount < originalAmount) {
      status = 'partial_cancelled'
    }

    return {
      success: true,
      status,
      originalAmount,
      cancelledAmount,
      remainingAmount,
      rawResponse: response as Record<string, unknown>,
    }
  }
}

// ============================================================================
// 팩토리 함수
// ============================================================================

/**
 * 환경변수에서 KG이니시스 클라이언트 생성
 */
export function createInicisClientFromEnv(): InicisClient {
  const mid = process.env.INICIS_MID
  const apiKey = process.env.INICIS_API_KEY
  const signKey = process.env.INICIS_SIGN_KEY
  const isProduction = process.env.INICIS_IS_PRODUCTION === 'true'

  if (!mid || !apiKey || !signKey) {
    throw new PGError({
      code: PGErrorCode.NON_RETRYABLE_MISSING_PARAMS,
      message:
        'KG이니시스 환경변수가 설정되지 않았습니다. (INICIS_MID, INICIS_API_KEY, INICIS_SIGN_KEY)',
    })
  }

  return new InicisClient({
    mid,
    apiKey,
    signKey,
    isProduction,
  })
}
