/**
 * PG 에러 처리 모듈
 * @description PG사별 에러 코드 매핑 및 에러 클래스 정의
 */

// ============================================================================
// 에러 코드
// ============================================================================

/**
 * PG 에러 코드 (내부용 통합 코드)
 */
export enum PGErrorCode {
  // 재시도 가능한 에러 (RETRYABLE_)
  /** 네트워크 타임아웃 */
  RETRYABLE_NETWORK_TIMEOUT = 'PG_RETRYABLE_NETWORK_TIMEOUT',
  /** 네트워크 연결 실패 */
  RETRYABLE_NETWORK_ERROR = 'PG_RETRYABLE_NETWORK_ERROR',
  /** PG 서버 에러 (5xx) */
  RETRYABLE_SERVER_ERROR = 'PG_RETRYABLE_SERVER_ERROR',
  /** 요청 제한 초과 (Rate Limit) */
  RETRYABLE_RATE_LIMITED = 'PG_RETRYABLE_RATE_LIMITED',
  /** 일시적 서비스 불가 */
  RETRYABLE_SERVICE_UNAVAILABLE = 'PG_RETRYABLE_SERVICE_UNAVAILABLE',

  // 재시도 불가능한 에러 (NON_RETRYABLE_)
  /** 잘못된 거래 ID */
  NON_RETRYABLE_INVALID_TID = 'PG_NON_RETRYABLE_INVALID_TID',
  /** 이미 환불된 거래 */
  NON_RETRYABLE_ALREADY_REFUNDED = 'PG_NON_RETRYABLE_ALREADY_REFUNDED',
  /** 환불 금액 초과 */
  NON_RETRYABLE_AMOUNT_EXCEEDED = 'PG_NON_RETRYABLE_AMOUNT_EXCEEDED',
  /** 잘못된 환불 금액 */
  NON_RETRYABLE_INVALID_AMOUNT = 'PG_NON_RETRYABLE_INVALID_AMOUNT',
  /** 인증 실패 */
  NON_RETRYABLE_AUTH_FAILED = 'PG_NON_RETRYABLE_AUTH_FAILED',
  /** 잘못된 서명 */
  NON_RETRYABLE_INVALID_SIGNATURE = 'PG_NON_RETRYABLE_INVALID_SIGNATURE',
  /** 존재하지 않는 거래 */
  NON_RETRYABLE_TRANSACTION_NOT_FOUND = 'PG_NON_RETRYABLE_TRANSACTION_NOT_FOUND',
  /** 거래 상태 불일치 (환불 불가 상태) */
  NON_RETRYABLE_INVALID_STATUS = 'PG_NON_RETRYABLE_INVALID_STATUS',
  /** 유효기간 만료 (환불 가능 기간 초과) */
  NON_RETRYABLE_EXPIRED = 'PG_NON_RETRYABLE_EXPIRED',
  /** 필수 파라미터 누락 */
  NON_RETRYABLE_MISSING_PARAMS = 'PG_NON_RETRYABLE_MISSING_PARAMS',

  // 기타
  /** 알 수 없는 에러 */
  UNKNOWN = 'PG_UNKNOWN',
}

// ============================================================================
// 에러 클래스
// ============================================================================

/**
 * PG 에러 클래스
 * 모든 PG 관련 에러는 이 클래스를 사용
 */
export class PGError extends Error {
  /** 내부 에러 코드 */
  public readonly code: PGErrorCode
  /** 재시도 가능 여부 */
  public readonly isRetryable: boolean
  /** PG사 원본 에러 코드 */
  public readonly pgErrorCode: string | null
  /** PG사 원본 에러 메시지 */
  public readonly pgErrorMessage: string | null
  /** 원본 에러 */
  public readonly originalError: unknown

  constructor(params: {
    code: PGErrorCode
    message: string
    pgErrorCode?: string
    pgErrorMessage?: string
    originalError?: unknown
  }) {
    super(params.message)
    this.name = 'PGError'
    this.code = params.code
    this.isRetryable = params.code.startsWith('PG_RETRYABLE_')
    this.pgErrorCode = params.pgErrorCode ?? null
    this.pgErrorMessage = params.pgErrorMessage ?? null
    this.originalError = params.originalError
  }

  /**
   * 에러 정보를 JSON으로 변환 (로깅용)
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      isRetryable: this.isRetryable,
      pgErrorCode: this.pgErrorCode,
      pgErrorMessage: this.pgErrorMessage,
    }
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 에러가 재시도 가능한지 확인
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof PGError) {
    return error.isRetryable
  }

  // 네트워크 에러 체크
  if (error instanceof Error) {
    const networkErrorPatterns = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'fetch failed',
      'network',
    ]
    return networkErrorPatterns.some(
      (pattern) =>
        error.message.toLowerCase().includes(pattern.toLowerCase()) ||
        error.name.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  return false
}

/**
 * 네트워크 에러를 PGError로 변환
 */
export function wrapNetworkError(error: unknown): PGError {
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown network error'

  // 타임아웃 체크
  if (errorMessage.toLowerCase().includes('timeout')) {
    return new PGError({
      code: PGErrorCode.RETRYABLE_NETWORK_TIMEOUT,
      message: '네트워크 요청 타임아웃',
      originalError: error,
    })
  }

  // 연결 거부 체크
  if (
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ECONNRESET')
  ) {
    return new PGError({
      code: PGErrorCode.RETRYABLE_NETWORK_ERROR,
      message: '네트워크 연결 실패',
      originalError: error,
    })
  }

  return new PGError({
    code: PGErrorCode.RETRYABLE_NETWORK_ERROR,
    message: `네트워크 오류: ${errorMessage}`,
    originalError: error,
  })
}

/**
 * HTTP 상태 코드를 PGErrorCode로 변환
 */
export function httpStatusToPGErrorCode(status: number): PGErrorCode {
  if (status >= 500) {
    return PGErrorCode.RETRYABLE_SERVER_ERROR
  }
  if (status === 429) {
    return PGErrorCode.RETRYABLE_RATE_LIMITED
  }
  if (status === 401) {
    return PGErrorCode.NON_RETRYABLE_AUTH_FAILED
  }
  if (status === 403) {
    return PGErrorCode.NON_RETRYABLE_AUTH_FAILED
  }
  if (status === 404) {
    return PGErrorCode.NON_RETRYABLE_TRANSACTION_NOT_FOUND
  }
  if (status === 400) {
    return PGErrorCode.NON_RETRYABLE_MISSING_PARAMS
  }
  return PGErrorCode.UNKNOWN
}

// ============================================================================
// 에러 메시지 상수
// ============================================================================

/**
 * 사용자 친화적 에러 메시지
 */
export const PG_ERROR_MESSAGES: Record<PGErrorCode, string> = {
  [PGErrorCode.RETRYABLE_NETWORK_TIMEOUT]:
    '결제 취소 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  [PGErrorCode.RETRYABLE_NETWORK_ERROR]:
    '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  [PGErrorCode.RETRYABLE_SERVER_ERROR]:
    '결제사 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  [PGErrorCode.RETRYABLE_RATE_LIMITED]:
    '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  [PGErrorCode.RETRYABLE_SERVICE_UNAVAILABLE]:
    '결제 취소 서비스를 일시적으로 사용할 수 없습니다.',
  [PGErrorCode.NON_RETRYABLE_INVALID_TID]:
    '유효하지 않은 결제 정보입니다. 고객센터에 문의해주세요.',
  [PGErrorCode.NON_RETRYABLE_ALREADY_REFUNDED]:
    '이미 환불 처리된 주문입니다.',
  [PGErrorCode.NON_RETRYABLE_AMOUNT_EXCEEDED]:
    '환불 금액이 결제 금액을 초과합니다.',
  [PGErrorCode.NON_RETRYABLE_INVALID_AMOUNT]:
    '환불 금액이 올바르지 않습니다.',
  [PGErrorCode.NON_RETRYABLE_AUTH_FAILED]:
    '결제 취소 인증에 실패했습니다. 고객센터에 문의해주세요.',
  [PGErrorCode.NON_RETRYABLE_INVALID_SIGNATURE]:
    '결제 취소 요청 검증에 실패했습니다.',
  [PGErrorCode.NON_RETRYABLE_TRANSACTION_NOT_FOUND]:
    '결제 정보를 찾을 수 없습니다.',
  [PGErrorCode.NON_RETRYABLE_INVALID_STATUS]:
    '현재 상태에서는 환불할 수 없습니다.',
  [PGErrorCode.NON_RETRYABLE_EXPIRED]: '환불 가능 기간이 만료되었습니다.',
  [PGErrorCode.NON_RETRYABLE_MISSING_PARAMS]:
    '필수 정보가 누락되었습니다.',
  [PGErrorCode.UNKNOWN]:
    '알 수 없는 오류가 발생했습니다. 고객센터에 문의해주세요.',
}

/**
 * 에러 코드에 해당하는 사용자 친화적 메시지 반환
 */
export function getUserFriendlyErrorMessage(code: PGErrorCode): string {
  return PG_ERROR_MESSAGES[code] ?? PG_ERROR_MESSAGES[PGErrorCode.UNKNOWN]
}
