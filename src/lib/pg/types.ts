/**
 * PG(Payment Gateway) 공통 타입 정의
 * @description 다양한 PG사를 지원하기 위한 추상화 레이어
 */

// ============================================================================
// 기본 타입
// ============================================================================

/**
 * 지원하는 PG사 타입
 */
export type PGProvider = 'inicis' | 'toss' | 'kakaopay' | 'naverpay'

/**
 * PG 환불 상태
 */
export type PGRefundStatus =
  | 'pending' // 환불 대기
  | 'processing' // 환불 처리 중
  | 'completed' // 환불 완료
  | 'failed' // 환불 실패
  | 'cancelled' // 환불 취소됨

// ============================================================================
// 요청/응답 타입
// ============================================================================

/**
 * PG 환불 요청 인터페이스
 */
export interface PGRefundRequest {
  /** 거래 ID (PG사에서 발급한 고유 ID) */
  transactionId: string
  /** 환불 금액 */
  amount: number
  /** 환불 사유 */
  reason: string
  /** 원거래 금액 (부분취소 검증용) */
  originalAmount?: number
  /** 이전 취소 누적 금액 (부분취소 시) */
  previousCancelAmount?: number
  /** 주문 ID (참조용) */
  orderId?: string
}

/**
 * PG 환불 응답 인터페이스
 */
export interface PGRefundResponse {
  /** 성공 여부 */
  success: boolean
  /** PG사 결과 코드 */
  resultCode: string
  /** PG사 결과 메시지 */
  resultMessage: string
  /** 취소 거래 ID */
  cancelTransactionId: string | null
  /** 취소 일시 (ISO 8601) */
  cancelledAt: string | null
  /** 원본 응답 데이터 (디버깅 및 감사 로그용) */
  rawResponse: Record<string, unknown>
}

/**
 * PG 거래 상태 조회 응답
 */
export interface PGTransactionStatusResponse {
  /** 조회 성공 여부 */
  success: boolean
  /** 거래 상태 */
  status: 'paid' | 'cancelled' | 'partial_cancelled' | 'unknown'
  /** 원거래 금액 */
  originalAmount: number
  /** 취소 누적 금액 */
  cancelledAmount: number
  /** 남은 금액 */
  remainingAmount: number
  /** 원본 응답 데이터 */
  rawResponse: Record<string, unknown>
}

// ============================================================================
// 클라이언트 인터페이스
// ============================================================================

/**
 * PG 클라이언트 공통 인터페이스
 * 모든 PG사 클라이언트는 이 인터페이스를 구현해야 함
 */
export interface IPGClient {
  /** PG사 타입 */
  readonly provider: PGProvider

  /**
   * 환불 처리
   * @param request 환불 요청 정보
   * @returns 환불 응답
   */
  refund(request: PGRefundRequest): Promise<PGRefundResponse>

  /**
   * 거래 상태 조회
   * @param transactionId 거래 ID
   * @returns 거래 상태 정보
   */
  getTransactionStatus(
    transactionId: string
  ): Promise<PGTransactionStatusResponse>

  /**
   * 서명 생성 (인증용)
   * @param data 서명할 데이터
   * @returns 서명 문자열
   */
  generateSignature(data: string): string

  /**
   * 서명 검증 (웹훅 수신 시 사용)
   * @param data 원본 데이터
   * @param signature 검증할 서명
   * @returns 서명 유효 여부
   */
  verifySignature(data: string, signature: string): boolean
}

// ============================================================================
// 설정 타입
// ============================================================================

/**
 * PG 클라이언트 기본 설정
 */
export interface PGClientConfig {
  /** 운영 환경 여부 (false면 테스트 환경) */
  isProduction: boolean
  /** 요청 타임아웃 (밀리초) */
  timeoutMs: number
}

/**
 * 환불 서비스 설정
 */
export interface RefundServiceConfig {
  /** 최대 재시도 횟수 */
  maxRetries: number
  /** 기본 재시도 대기 시간 (밀리초) */
  baseRetryDelayMs: number
  /** 지수 백오프 사용 여부 */
  useExponentialBackoff: boolean
  /** 최대 대기 시간 (밀리초) */
  maxRetryDelayMs: number
}

/**
 * 환불 서비스 기본 설정값
 */
export const DEFAULT_REFUND_SERVICE_CONFIG: RefundServiceConfig = {
  maxRetries: 3,
  baseRetryDelayMs: 1000,
  useExponentialBackoff: true,
  maxRetryDelayMs: 60000,
}

// ============================================================================
// 결과 타입
// ============================================================================

/**
 * 환불 처리 결과
 */
export interface RefundProcessResult {
  /** 성공 여부 */
  success: boolean
  /** 환불 ID */
  refundId: string
  /** PG 응답 */
  pgResponse: PGRefundResponse | null
  /** 에러 메시지 (실패 시) */
  errorMessage: string | null
  /** 재시도 가능 여부 */
  isRetryable: boolean
}

/**
 * 재시도 정보
 */
export interface RetryInfo {
  /** 현재 재시도 횟수 */
  currentAttempt: number
  /** 최대 재시도 횟수 */
  maxAttempts: number
  /** 다음 재시도까지 대기 시간 (밀리초) */
  nextRetryDelayMs: number | null
  /** 재시도 가능 여부 */
  canRetry: boolean
}
