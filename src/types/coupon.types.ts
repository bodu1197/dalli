/**
 * 쿠폰 시스템 타입 정의
 */

// 할인 타입
export type DiscountType = 'percentage' | 'fixed'

// 쿠폰 데이터
export interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  discountType: DiscountType
  discountValue: number // percentage면 %, fixed면 원
  minOrderAmount: number | null // 최소 주문 금액
  maxDiscountAmount: number | null // 최대 할인 금액 (percentage일 때)
  restaurantId: string | null // null이면 전체 가게 적용
  startDate: string
  endDate: string
  totalQuantity: number | null // null이면 무제한
  usedQuantity: number
  isActive: boolean
  createdAt: string
}

// 사용자 보유 쿠폰
export interface UserCoupon {
  id: string
  userId: string
  couponId: string
  usedAt: string | null
  orderId: string | null
  createdAt: string
  // 조인 데이터
  coupon?: Coupon
}

// 쿠폰 목록 아이템 (사용자용)
export interface UserCouponListItem {
  id: string
  couponId: string
  code: string
  name: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  restaurantId: string | null
  restaurantName: string | null
  endDate: string
  isUsed: boolean
  usedAt: string | null
  createdAt: string
}

// 쿠폰 생성 입력 (관리자/점주용)
export interface CreateCouponInput {
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  restaurantId?: string // 점주용 쿠폰일 때
  startDate: string
  endDate: string
  totalQuantity?: number
}

// 쿠폰 적용 결과
export interface CouponApplyResult {
  isValid: boolean
  discountAmount: number
  message: string
}

// 쿠폰 유효성 검사 결과
export interface CouponValidationResult {
  isValid: boolean
  errorCode?:
    | 'COUPON_NOT_FOUND'
    | 'COUPON_EXPIRED'
    | 'COUPON_NOT_STARTED'
    | 'COUPON_OUT_OF_STOCK'
    | 'COUPON_ALREADY_USED'
    | 'MIN_ORDER_NOT_MET'
    | 'RESTAURANT_NOT_MATCH'
    | 'COUPON_INACTIVE'
  message: string
  coupon?: Coupon
}

/**
 * 쿠폰 할인 금액 계산
 */
export function calculateCouponDiscount(
  coupon: Coupon,
  orderAmount: number
): number {
  if (coupon.discountType === 'fixed') {
    return coupon.discountValue
  }

  // percentage
  const discount = Math.floor(orderAmount * (coupon.discountValue / 100))

  // 최대 할인 금액 적용
  if (coupon.maxDiscountAmount !== null) {
    return Math.min(discount, coupon.maxDiscountAmount)
  }

  return discount
}
