/**
 * PG(Payment Gateway) 모듈 통합 Export
 * @description 다양한 PG사를 지원하기 위한 추상화 레이어
 */

// Types
export type {
  PGProvider,
  PGRefundStatus,
  PGRefundRequest,
  PGRefundResponse,
  PGTransactionStatusResponse,
  IPGClient,
  PGClientConfig,
  RefundServiceConfig,
  RefundProcessResult,
  RetryInfo,
} from './types'

export { DEFAULT_REFUND_SERVICE_CONFIG } from './types'

// Errors
export {
  PGErrorCode,
  PGError,
  isRetryableError,
  wrapNetworkError,
  httpStatusToPGErrorCode,
  PG_ERROR_MESSAGES,
  getUserFriendlyErrorMessage,
} from './errors'

// Inicis Client
export { InicisClient, createInicisClientFromEnv } from './inicis/client'

export type {
  InicisClientConfig,
  InicisRefundRequestParams,
  InicisRefundResponse,
  InicisTransactionQueryParams,
  InicisTransactionQueryResponse,
  InicisWebhookPayload,
} from './inicis/types'

export {
  INICIS_API_URLS,
  INICIS_ENDPOINTS,
  INICIS_SUCCESS_CODE,
  INICIS_DEFAULT_TIMEOUT_MS,
  INICIS_REFUND_PERIOD_DAYS,
  INICIS_WEBHOOK_ALLOWED_IPS,
  mapInicisErrorCode,
  getInicisErrorMessage,
  isInicisRetryableError,
} from './inicis/constants'
