/**
 * 사용자 기능 관련 타입 정의
 * - 최근 본 가게
 * - 결제 수단
 * - FAQ
 * - 고객 문의
 */

// ================================================
// 최근 본 가게 (Recent Views)
// ================================================
export interface RecentView {
  id: string
  user_id: string
  restaurant_id: string
  viewed_at: string
  view_count: number
  // 조인된 식당 정보
  restaurant?: RecentViewRestaurant
}

export interface RecentViewRestaurant {
  id: string
  name: string
  image_url: string | null
  category_id: string | null
  rating: number
  review_count: number
  estimated_delivery_time: number
  delivery_fee: number
  is_open: boolean
  address: string
  lat: number
  lng: number
  category?: {
    id: string
    name: string
    icon: string | null
  }
}

export interface RecentViewWithRestaurant extends RecentView {
  restaurant: RecentViewRestaurant
}

// ================================================
// 결제 수단 (Payment Methods)
// ================================================
export type PaymentMethodType =
  | 'card'
  | 'kakaopay'
  | 'naverpay'
  | 'tosspay'
  | 'payco'
  | 'samsungpay'
  | 'applepay'

export type CardType = 'credit' | 'debit' | 'prepaid'

export type CardCompany =
  | '신한'
  | '삼성'
  | '현대'
  | 'KB국민'
  | '롯데'
  | '하나'
  | '우리'
  | 'NH농협'
  | 'BC'
  | '씨티'

export interface PaymentMethod {
  id: string
  user_id: string
  type: PaymentMethodType
  card_company: CardCompany | null
  card_type: CardType | null
  card_number_last4: string | null
  card_holder_name: string | null
  easy_pay_account: string | null
  billing_key: string | null
  pg_provider: string | null
  is_default: boolean
  is_verified: boolean
  is_active: boolean
  nickname: string | null
  color: string
  created_at: string
  updated_at: string
  last_used_at: string | null
  expires_at: string | null
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType
  card_company?: CardCompany
  card_type?: CardType
  card_number_last4?: string
  card_holder_name?: string
  easy_pay_account?: string
  billing_key?: string
  pg_provider?: string
  nickname?: string
  color?: string
  is_default?: boolean
}

export interface UpdatePaymentMethodInput {
  nickname?: string
  color?: string
  is_default?: boolean
  is_active?: boolean
}

// ================================================
// FAQ
// ================================================
export interface FAQCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface FAQ {
  id: string
  category_id: string
  question: string
  answer: string
  search_keywords: string[] | null
  view_count: number
  helpful_count: number
  not_helpful_count: number
  is_pinned: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // 조인된 카테고리 정보
  category?: FAQCategory
}

export interface FAQWithCategory extends FAQ {
  category: FAQCategory
}

// ================================================
// 고객 문의 (Inquiries)
// ================================================
export type InquiryCategory =
  | 'order'
  | 'delivery'
  | 'payment'
  | 'refund'
  | 'account'
  | 'suggestion'
  | 'complaint'
  | 'etc'

export type InquiryStatus = 'pending' | 'in_progress' | 'answered' | 'closed'

export type InquiryPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Inquiry {
  id: string
  user_id: string
  category: InquiryCategory
  order_id: string | null
  title: string
  content: string
  images: string[]
  status: InquiryStatus
  answer: string | null
  answered_by: string | null
  answered_at: string | null
  satisfaction_rating: number | null
  satisfaction_comment: string | null
  priority: InquiryPriority
  created_at: string
  updated_at: string
  // 조인된 정보
  order?: {
    id: string
    status: string
    created_at: string
    restaurant?: {
      name: string
    }
  }
}

export interface CreateInquiryInput {
  category: InquiryCategory
  order_id?: string
  title: string
  content: string
  images?: string[]
}

export interface InquirySatisfactionInput {
  rating: number
  comment?: string
}

// ================================================
// 카테고리 레이블 매핑
// ================================================
export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  order: '주문 관련',
  delivery: '배달 관련',
  payment: '결제 관련',
  refund: '환불/취소',
  account: '계정 관련',
  suggestion: '서비스 제안',
  complaint: '불만 접수',
  etc: '기타 문의',
}

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: '답변 대기',
  in_progress: '처리 중',
  answered: '답변 완료',
  closed: '종료',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentMethodType, string> = {
  card: '카드',
  kakaopay: '카카오페이',
  naverpay: '네이버페이',
  tosspay: '토스페이',
  payco: '페이코',
  samsungpay: '삼성페이',
  applepay: '애플페이',
}

export const PAYMENT_TYPE_ICONS: Record<PaymentMethodType, string> = {
  card: '💳',
  kakaopay: '🟡',
  naverpay: '🟢',
  tosspay: '🔵',
  payco: '🔴',
  samsungpay: '⚫',
  applepay: '⚪',
}
