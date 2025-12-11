/**
 * 주문 취소 검증 스키마
 * @description Zod를 사용한 입력 데이터 검증 스키마
 */

import { z } from 'zod'

// ============================================================================
// 공통 스키마
// ============================================================================

/**
 * UUID 스키마
 */
const uuidSchema = z.string().uuid('유효한 ID 형식이 아닙니다.')

/**
 * 취소 사유 카테고리 스키마
 */
export const cancelReasonCategorySchema = z.enum([
  'customer_change_mind',
  'customer_wrong_order',
  'customer_duplicate_order',
  'restaurant_closed',
  'restaurant_out_of_stock',
  'restaurant_too_busy',
  'delivery_issue',
  'system_error',
  'other',
])

/**
 * 취소 상태 스키마
 */
export const cancelStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'completed',
])

/**
 * 환불 상태 스키마
 */
export const refundStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
])

/**
 * 결제 수단 스키마
 */
export const paymentMethodSchema = z.enum([
  'card',
  'kakaopay',
  'naverpay',
  'tosspay',
  'samsungpay',
  'payco',
  'cash',
])

// ============================================================================
// 요청 스키마
// ============================================================================

/**
 * 취소 가능 여부 조회 요청 스키마
 */
export const checkCancelabilitySchema = z.object({
  orderId: uuidSchema,
})

export type CheckCancelabilityInput = z.infer<typeof checkCancelabilitySchema>

/**
 * 주문 취소 요청 스키마
 */
export const cancelOrderSchema = z.object({
  orderId: uuidSchema,
  reasonCategory: cancelReasonCategorySchema,
  reasonDetail: z
    .string()
    .max(500, '상세 사유는 500자 이내로 입력해주세요.')
    .optional(),
})

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

/**
 * 취소 요청 처리 스키마 (점주/관리자용)
 */
export const processCancelRequestSchema = z.object({
  cancellationId: uuidSchema,
  action: z.enum(['approve', 'reject']),
  rejectedReason: z
    .string()
    .max(500, '거절 사유는 500자 이내로 입력해주세요.')
    .optional(),
})

export type ProcessCancelRequestInput = z.infer<typeof processCancelRequestSchema>

/**
 * 환불 요청 스키마
 */
export const requestRefundSchema = z.object({
  orderId: uuidSchema,
  amount: z.number().min(0, '환불 금액은 0 이상이어야 합니다.'),
  paymentMethod: paymentMethodSchema,
  paymentKey: z.string().optional(),
})

export type RequestRefundInput = z.infer<typeof requestRefundSchema>

/**
 * 환불 상태 업데이트 스키마
 */
export const updateRefundStatusSchema = z.object({
  refundId: uuidSchema,
  status: refundStatusSchema,
  pgResponse: z.record(z.string(), z.unknown()).optional(),
  pgTransactionId: z.string().optional(),
  failedReason: z.string().max(500).optional(),
})

export type UpdateRefundStatusInput = z.infer<typeof updateRefundStatusSchema>

// ============================================================================
// 쿼리 파라미터 스키마
// ============================================================================

/**
 * 취소 내역 조회 쿼리 스키마
 */
export const getCancellationsQuerySchema = z.object({
  orderId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  status: cancelStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type GetCancellationsQuery = z.infer<typeof getCancellationsQuerySchema>

/**
 * 환불 내역 조회 쿼리 스키마
 */
export const getRefundsQuerySchema = z.object({
  orderId: uuidSchema.optional(),
  status: refundStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type GetRefundsQuery = z.infer<typeof getRefundsQuerySchema>

// ============================================================================
// 응답 스키마
// ============================================================================

/**
 * 취소 가능 여부 응답 스키마
 */
export const cancelabilityResponseSchema = z.object({
  canCancel: z.boolean(),
  cancelType: z.enum(['instant', 'request']).nullable(),
  refundRate: z.number().min(0).max(100),
  refundAmount: z.number().min(0),
  canRefundCoupon: z.boolean(),
  canRefundPoints: z.boolean(),
  reason: z.string().nullable(),
  message: z.string(),
})

/**
 * 취소 정보 응답 스키마
 */
export const cancellationResponseSchema = z.object({
  id: uuidSchema,
  orderId: uuidSchema,
  requestedBy: uuidSchema,
  requestedByType: z.enum(['customer', 'owner', 'rider', 'admin', 'system']),
  cancelType: z.enum(['instant', 'request']),
  status: cancelStatusSchema,
  reason: cancelReasonCategorySchema,
  reasonDetail: z.string().nullable(),
  refundAmount: z.number(),
  refundRate: z.number(),
  canRefundCoupon: z.boolean(),
  canRefundPoints: z.boolean(),
  couponRefunded: z.boolean(),
  pointsRefunded: z.boolean(),
  rejectedReason: z.string().nullable(),
  processedBy: uuidSchema.nullable(),
  processedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/**
 * 환불 정보 응답 스키마
 */
export const refundResponseSchema = z.object({
  id: uuidSchema,
  orderId: uuidSchema,
  cancellationId: uuidSchema.nullable(),
  amount: z.number(),
  paymentMethod: paymentMethodSchema,
  paymentKey: z.string().nullable(),
  refundStatus: refundStatusSchema,
  pgResponse: z.record(z.string(), z.unknown()).nullable(),
  pgTransactionId: z.string().nullable(),
  failedReason: z.string().nullable(),
  retryCount: z.number(),
  lastRetryAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================================
// 유효성 검사 유틸리티
// ============================================================================

/**
 * 취소 사유가 요청자 유형에 맞는지 검증
 */
export function validateCancelReasonForRequester(
  reasonCategory: string,
  requesterType: string
): boolean {
  const validReasons: Record<string, string[]> = {
    customer: ['customer_change_mind', 'customer_wrong_order', 'customer_duplicate_order', 'other'],
    owner: ['restaurant_closed', 'restaurant_out_of_stock', 'restaurant_too_busy', 'other'],
    rider: ['delivery_issue', 'other'],
    admin: [
      'customer_duplicate_order',
      'restaurant_closed',
      'restaurant_out_of_stock',
      'restaurant_too_busy',
      'delivery_issue',
      'system_error',
      'other',
    ],
    system: ['customer_duplicate_order', 'delivery_issue', 'system_error'],
  }

  const allowedReasons = validReasons[requesterType]
  return allowedReasons ? allowedReasons.includes(reasonCategory) : false
}

/**
 * 안전한 스키마 파싱 (에러 메시지 포맷팅)
 */
export function safeParseWithErrors<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })

  return { success: false, errors }
}
