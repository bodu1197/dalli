/**
 * 광고 시스템 타입 정의
 */

// 광고 플랜 타입
export type AdPlanType = 'basic' | 'premium' | 'exclusive'

// 결제 상태
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// 광고 플랜 정보
export interface AdPlan {
  type: AdPlanType
  name: string
  price: number // 월 가격
  priority: number // 노출 우선순위 (낮을수록 높은 우선순위)
  features: string[]
}

// 광고 플랜 상수
export const AD_PLANS: Record<AdPlanType, AdPlan> = {
  basic: {
    type: 'basic',
    name: 'Basic',
    price: 50000,
    priority: 3,
    features: ['검색 결과 상위 노출', '일반 광고 배지'],
  },
  premium: {
    type: 'premium',
    name: 'Premium',
    price: 100000,
    priority: 2,
    features: ['검색 결과 최상단 노출', '프리미엄 광고 배지', '홈 배너 노출'],
  },
  exclusive: {
    type: 'exclusive',
    name: 'Exclusive',
    price: 200000,
    priority: 1,
    features: [
      '검색 결과 최우선 노출',
      '프리미엄 광고 배지',
      '홈 배너 우선 노출',
      '푸시 알림 마케팅',
      '전담 매니저 지원',
    ],
  },
}

// 광고 데이터
export interface Advertisement {
  id: string
  restaurantId: string
  planType: AdPlanType
  amount: number
  startDate: string
  endDate: string
  isActive: boolean
  paymentStatus: PaymentStatus
  paymentId: string | null
  createdAt: string
  updatedAt: string | null
}

// 광고 생성 입력
export interface CreateAdvertisementInput {
  restaurantId: string
  planType: AdPlanType
  months: number // 구매 개월 수
}

// 광고 목록 아이템 (식당 정보 포함)
export interface AdvertisementWithRestaurant extends Advertisement {
  restaurant: {
    id: string
    name: string
    thumbnailUrl: string | null
  }
}

// 광고 통계
export interface AdStatistics {
  impressions: number // 노출 수
  clicks: number // 클릭 수
  orders: number // 주문 수
  revenue: number // 매출
  ctr: number // 클릭률 (Click Through Rate)
  conversionRate: number // 전환율
}
