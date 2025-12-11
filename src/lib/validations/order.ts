/**
 * 주문 검증 스키마
 * @description Zod를 사용한 주문 관련 입력 데이터 검증 스키마
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
 * 결제 수단 스키마
 */
export const paymentMethodSchema = z.enum([
  'card',
  'kakaopay',
  'naverpay',
  'tosspay',
  'samsungpay',
  'applepay',
])

/**
 * 주문 상태 스키마
 */
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'rejected',
  'preparing',
  'ready',
  'picked_up',
  'delivering',
  'delivered',
  'cancelled',
])

/**
 * 주문 거절 사유 스키마
 */
export const rejectionReasonSchema = z.enum([
  'sold_out',
  'too_busy',
  'closing_soon',
  'menu_unavailable',
  'delivery_area',
  'other',
])

// ============================================================================
// 주문 생성 스키마
// ============================================================================

/**
 * 주문 항목 옵션 입력 스키마
 */
export const orderItemOptionInputSchema = z.object({
  optionId: uuidSchema,
  name: z.string().min(1, '옵션명을 입력해주세요.').max(100, '옵션명은 100자 이내로 입력해주세요.'),
  price: z.number().min(0, '옵션 가격은 0 이상이어야 합니다.'),
})

/**
 * 주문 항목 입력 스키마
 */
export const orderItemInputSchema = z.object({
  menuId: uuidSchema,
  menuName: z.string().min(1, '메뉴명을 입력해주세요.').max(100, '메뉴명은 100자 이내로 입력해주세요.'),
  menuImage: z.string().url('유효한 이미지 URL이 아닙니다.').nullable(),
  quantity: z.number().int().min(1, '수량은 1 이상이어야 합니다.').max(99, '수량은 99 이하여야 합니다.'),
  price: z.number().min(0, '가격은 0 이상이어야 합니다.'),
  options: z.array(orderItemOptionInputSchema).default([]),
  specialInstructions: z.string().max(200, '요청사항은 200자 이내로 입력해주세요.').nullable(),
})

/**
 * 배달 주소 스키마
 */
export const deliveryAddressSchema = z.object({
  address: z.string().min(1, '주소를 입력해주세요.').max(200, '주소는 200자 이내로 입력해주세요.'),
  detail: z.string().max(100, '상세 주소는 100자 이내로 입력해주세요.').nullable(),
  lat: z.number().min(-90).max(90, '유효한 위도 값이 아닙니다.'),
  lng: z.number().min(-180).max(180, '유효한 경도 값이 아닙니다.'),
})

/**
 * 주문 생성 요청 스키마
 */
export const createOrderSchema = z.object({
  restaurantId: uuidSchema,
  items: z.array(orderItemInputSchema).min(1, '최소 1개 이상의 메뉴를 선택해주세요.'),
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: paymentMethodSchema,
  couponId: uuidSchema.nullable(),
  pointsToUse: z.number().int().min(0, '포인트는 0 이상이어야 합니다.').default(0),
  specialInstructions: z.string().max(500, '가게 요청사항은 500자 이내로 입력해주세요.').nullable(),
  deliveryInstructions: z.string().max(500, '배달 요청사항은 500자 이내로 입력해주세요.').nullable(),
  disposableItems: z.boolean().default(false),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ============================================================================
// 주문 접수/거절 스키마 (점주)
// ============================================================================

/**
 * 주문 접수 요청 스키마
 */
export const confirmOrderSchema = z.object({
  estimatedPrepTime: z.number().int().min(1, '예상 조리 시간은 1분 이상이어야 합니다.').max(180, '예상 조리 시간은 180분 이하여야 합니다.'),
})

export type ConfirmOrderInput = z.infer<typeof confirmOrderSchema>

/**
 * 주문 거절 요청 스키마
 */
export const rejectOrderSchema = z.object({
  reason: rejectionReasonSchema,
  detail: z.string().max(500, '상세 사유는 500자 이내로 입력해주세요.').nullable().optional(),
})

export type RejectOrderInput = z.infer<typeof rejectOrderSchema>

// ============================================================================
// 라이더 관련 스키마
// ============================================================================

/**
 * 픽업 완료 요청 스키마
 */
export const pickupOrderSchema = z.object({
  riderName: z.string().min(1, '라이더 이름을 입력해주세요.').max(50, '라이더 이름은 50자 이내로 입력해주세요.'),
  riderPhone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '유효한 전화번호 형식이 아닙니다.'),
})

export type PickupOrderInput = z.infer<typeof pickupOrderSchema>

// ============================================================================
// 주문 조회 쿼리 스키마
// ============================================================================

/**
 * 주문 목록 조회 쿼리 스키마
 */
export const getOrdersQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>

/**
 * 점주 주문 목록 조회 쿼리 스키마
 */
export const getOwnerOrdersQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type GetOwnerOrdersQuery = z.infer<typeof getOwnerOrdersQuerySchema>

// ============================================================================
// 유틸리티 함수
// ============================================================================

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

/**
 * 주문 금액 검증
 * @param menuAmount 메뉴 금액
 * @param minOrderAmount 최소 주문 금액
 */
export function validateOrderAmount(
  menuAmount: number,
  minOrderAmount: number
): { valid: boolean; message: string | null } {
  if (menuAmount < minOrderAmount) {
    return {
      valid: false,
      message: `최소 주문 금액은 ${minOrderAmount.toLocaleString()}원입니다.`,
    }
  }

  return { valid: true, message: null }
}
