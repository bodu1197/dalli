/**
 * KG이니시스 상수 정의
 * @description API 엔드포인트, 에러 코드 매핑 등
 */

import { PGErrorCode } from '../errors'

// ============================================================================
// API 엔드포인트
// ============================================================================

/**
 * KG이니시스 API 베이스 URL
 */
export const INICIS_API_URLS = {
  /** 운영 환경 */
  PRODUCTION: 'https://kgicert.inicis.com/api/v1',
  /** 테스트 환경 */
  SANDBOX: 'https://stgkgicert.inicis.com/api/v1',
} as const

/**
 * KG이니시스 API 엔드포인트
 */
export const INICIS_ENDPOINTS = {
  /** 환불 */
  REFUND: '/refund',
  /** 거래 조회 */
  TRANSACTION: '/transaction',
} as const

// ============================================================================
// 결과 코드
// ============================================================================

/**
 * KG이니시스 성공 코드
 */
export const INICIS_SUCCESS_CODE = '0000'

/**
 * KG이니시스 결과 코드별 에러 매핑
 * @see KG이니시스 API 문서
 */
export const INICIS_ERROR_CODE_MAP: Record<
  string,
  { pgErrorCode: PGErrorCode; message: string }
> = {
  // 성공
  '0000': {
    pgErrorCode: PGErrorCode.UNKNOWN, // 성공 시 사용되지 않음
    message: '정상 처리',
  },

  // 재시도 가능 에러
  '8001': {
    pgErrorCode: PGErrorCode.RETRYABLE_SERVER_ERROR,
    message: '시스템 오류',
  },
  '8002': {
    pgErrorCode: PGErrorCode.RETRYABLE_SERVICE_UNAVAILABLE,
    message: '서비스 점검 중',
  },
  '8003': {
    pgErrorCode: PGErrorCode.RETRYABLE_NETWORK_TIMEOUT,
    message: '통신 오류',
  },
  '8500': {
    pgErrorCode: PGErrorCode.RETRYABLE_RATE_LIMITED,
    message: '요청 한도 초과',
  },

  // 재시도 불가 에러 - 인증/권한
  '0001': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_AUTH_FAILED,
    message: '가맹점 인증 실패',
  },
  '0002': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_INVALID_SIGNATURE,
    message: '해시 검증 실패',
  },
  '0003': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_AUTH_FAILED,
    message: '가맹점 정보 없음',
  },

  // 재시도 불가 에러 - 거래 관련
  '0100': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_TRANSACTION_NOT_FOUND,
    message: '거래 정보 없음',
  },
  '0101': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_INVALID_TID,
    message: '잘못된 거래번호',
  },
  '0102': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_ALREADY_REFUNDED,
    message: '이미 취소된 거래',
  },
  '0103': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_INVALID_STATUS,
    message: '취소 불가능한 거래 상태',
  },
  '0104': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_EXPIRED,
    message: '취소 가능 기간 만료',
  },

  // 재시도 불가 에러 - 금액 관련
  '0200': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_INVALID_AMOUNT,
    message: '잘못된 취소 금액',
  },
  '0201': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_AMOUNT_EXCEEDED,
    message: '취소 금액 초과',
  },
  '0202': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_INVALID_AMOUNT,
    message: '부분취소 금액 오류',
  },

  // 재시도 불가 에러 - 파라미터
  '9001': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_MISSING_PARAMS,
    message: '필수 파라미터 누락',
  },
  '9002': {
    pgErrorCode: PGErrorCode.NON_RETRYABLE_MISSING_PARAMS,
    message: '파라미터 형식 오류',
  },
} as const

/**
 * 이니시스 결과 코드로 PGErrorCode 조회
 */
export function mapInicisErrorCode(resultCode: string): PGErrorCode {
  const mapping = INICIS_ERROR_CODE_MAP[resultCode]
  return mapping?.pgErrorCode ?? PGErrorCode.UNKNOWN
}

/**
 * 이니시스 결과 코드로 에러 메시지 조회
 */
export function getInicisErrorMessage(resultCode: string): string {
  const mapping = INICIS_ERROR_CODE_MAP[resultCode]
  return mapping?.message ?? `알 수 없는 오류 (코드: ${resultCode})`
}

/**
 * 이니시스 결과 코드가 재시도 가능한지 확인
 */
export function isInicisRetryableError(resultCode: string): boolean {
  const pgErrorCode = mapInicisErrorCode(resultCode)
  return pgErrorCode.startsWith('PG_RETRYABLE_')
}

// ============================================================================
// 기타 상수
// ============================================================================

/**
 * 기본 요청 타임아웃 (밀리초)
 */
export const INICIS_DEFAULT_TIMEOUT_MS = 30000

/**
 * 환불 가능 기간 (일)
 * 카드 결제 기준, 결제수단에 따라 다를 수 있음
 */
export const INICIS_REFUND_PERIOD_DAYS = 365

/**
 * 웹훅 검증용 허용 IP 목록
 * 실제 운영 시 KG이니시스에서 제공하는 IP로 업데이트 필요
 */
export const INICIS_WEBHOOK_ALLOWED_IPS = [
  // 테스트 환경용 (실제 운영 시 변경 필요)
  '127.0.0.1',
  '::1',
] as const
