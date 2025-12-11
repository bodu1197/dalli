/**
 * KG이니시스 전용 타입 정의
 * @description KG이니시스 API 요청/응답 타입
 */

// ============================================================================
// 설정 타입
// ============================================================================

/**
 * KG이니시스 클라이언트 설정
 */
export interface InicisClientConfig {
  /** 상점 ID (MID) */
  mid: string
  /** API 키 */
  apiKey: string
  /** 서명 키 (HMAC-SHA256용) */
  signKey: string
  /** 운영 환경 여부 (false면 테스트 환경) */
  isProduction: boolean
  /** 요청 타임아웃 (밀리초, 기본: 30000) */
  timeoutMs?: number
}

// ============================================================================
// API 요청 타입
// ============================================================================

/**
 * KG이니시스 환불 요청 파라미터
 */
export interface InicisRefundRequestParams {
  /** 상점 ID */
  mid: string
  /** 거래 ID */
  tid: string
  /** 취소금액 */
  price: number
  /** 취소사유 */
  msg: string
  /** 타임스탬프 (밀리초) */
  timestamp: string
  /** HMAC-SHA256 서명 */
  hashData: string
  /** 부분취소 여부 (1: 부분취소, 0 또는 미전송: 전체취소) */
  partialCancelCode?: '1' | '0'
  /** 공급가액 (부분취소 시) */
  supplyAmt?: number
  /** 부가세 (부분취소 시) */
  taxAmt?: number
  /** 면세금액 (부분취소 시) */
  freeAmt?: number
}

/**
 * KG이니시스 거래 조회 요청 파라미터
 */
export interface InicisTransactionQueryParams {
  /** 상점 ID */
  mid: string
  /** 거래 ID */
  tid: string
  /** 타임스탬프 */
  timestamp: string
  /** 서명 */
  hashData: string
}

// ============================================================================
// API 응답 타입
// ============================================================================

/**
 * KG이니시스 환불 응답
 */
export interface InicisRefundResponse {
  /** 결과코드 (0000: 성공) */
  resultCode: string
  /** 결과메시지 */
  resultMsg: string
  /** 취소일자 (YYYYMMDD) */
  cancelDate?: string
  /** 취소시간 (HHmmss) */
  cancelTime?: string
  /** 취소 거래 ID */
  cancelTid?: string
  /** 취소 현금영수증 번호 */
  cshrCancelNum?: string
  /** 잔여 금액 (부분취소 후) */
  remainPrice?: number
}

/**
 * KG이니시스 거래 조회 응답
 */
export interface InicisTransactionQueryResponse {
  /** 결과코드 */
  resultCode: string
  /** 결과메시지 */
  resultMsg: string
  /** 거래 상태 */
  status?: string
  /** 결제 금액 */
  price?: number
  /** 취소 금액 */
  cancelPrice?: number
  /** 결제일시 */
  payDate?: string
  /** 결제수단 */
  payMethod?: string
}

/**
 * KG이니시스 웹훅 페이로드
 */
export interface InicisWebhookPayload {
  /** 결과코드 */
  resultCode: string
  /** 결과메시지 */
  resultMsg: string
  /** 상점 ID */
  mid: string
  /** 거래 ID */
  tid: string
  /** 거래 유형 (cancel: 취소) */
  transType: string
  /** 취소금액 */
  price?: number
  /** 취소일시 */
  cancelDate?: string
  /** 서명 */
  signature: string
}

// ============================================================================
// 내부 타입
// ============================================================================

/**
 * 이니시스 결과 코드와 내부 에러 코드 매핑
 */
export interface InicisErrorMapping {
  /** 이니시스 결과 코드 */
  resultCode: string
  /** 에러 메시지 */
  message: string
  /** 재시도 가능 여부 */
  isRetryable: boolean
}
