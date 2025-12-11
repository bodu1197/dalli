// ============================================================================
// 주문 상태 타입
// ============================================================================

/**
 * 주문 상태
 * @description 주문 생명주기의 모든 상태 정의
 */
export type OrderStatus =
  | 'pending' // 주문 대기 (결제 완료, 점주 확인 대기)
  | 'confirmed' // 주문 접수 (점주 수락)
  | 'rejected' // 주문 거절 (점주 거절)
  | 'preparing' // 조리 중
  | 'ready' // 조리 완료 (라이더 픽업 대기)
  | 'picked_up' // 픽업 완료 (라이더가 음식 수령)
  | 'delivering' // 배달 중
  | 'delivered' // 배달 완료
  | 'cancelled' // 취소됨 (고객 요청 또는 시스템)

/**
 * 주문 거절 사유
 */
export type OrderRejectionReason =
  | 'sold_out' // 재료 소진
  | 'too_busy' // 주문 폭주
  | 'closing_soon' // 영업 종료 임박
  | 'menu_unavailable' // 메뉴 판매 불가
  | 'delivery_area' // 배달 불가 지역
  | 'other' // 기타

/**
 * 주문 거절 사유 라벨
 */
export const ORDER_REJECTION_REASON_LABELS: Record<OrderRejectionReason, string> = {
  sold_out: '재료가 소진되었습니다',
  too_busy: '주문이 많아 접수가 어렵습니다',
  closing_soon: '영업 종료 시간이 임박했습니다',
  menu_unavailable: '해당 메뉴를 준비할 수 없습니다',
  delivery_area: '배달 가능 지역이 아닙니다',
  other: '기타 사유',
}

// ============================================================================
// 주문 정보 인터페이스
// ============================================================================

/**
 * 주문 정보
 */
export interface Order {
  id: string
  orderNumber: string // 주문 번호 (예: D241209-001234)
  userId: string
  restaurantId: string
  restaurantName: string
  restaurantImage: string | null
  restaurantPhone: string | null
  riderId: string | null
  riderName: string | null
  riderPhone: string | null
  status: OrderStatus
  // 금액 정보
  menuAmount: number // 메뉴 금액 합계
  discountAmount: number // 할인 금액 (쿠폰 등)
  pointsUsed: number // 포인트 사용액
  deliveryFee: number // 배달비
  platformFee: number // 플랫폼 수수료 (점주 부담)
  totalAmount: number // 최종 결제 금액
  // 배달 정보
  deliveryAddress: string
  deliveryDetail: string | null
  deliveryLat: number
  deliveryLng: number
  // 요청사항
  specialInstructions: string | null // 가게 요청사항
  deliveryInstructions: string | null // 배달 요청사항
  disposableItems: boolean // 일회용품 요청 여부
  // 시간 정보
  estimatedPrepTime: number | null // 예상 조리 시간 (분)
  estimatedDeliveryTime: string | null // 예상 배달 완료 시간
  actualDeliveryTime: string | null // 실제 배달 완료 시간
  confirmedAt: string | null // 접수 시간
  preparedAt: string | null // 조리 완료 시간
  pickedUpAt: string | null // 픽업 시간
  deliveredAt: string | null // 배달 완료 시간
  // 거절/취소 정보
  rejectionReason: OrderRejectionReason | null
  rejectionDetail: string | null
  cancelledReason: string | null
  cancelledAt: string | null
  cancelledBy: 'customer' | 'owner' | 'system' | null
  // 결제 정보
  paymentMethod: PaymentMethod
  paymentId: string | null
  // 쿠폰/포인트
  couponId: string | null
  couponName: string | null
  // 주문 항목
  items: OrderItem[]
  // 메타
  createdAt: string
  updatedAt: string
}

/**
 * 결제 수단
 */
export type PaymentMethod =
  | 'card' // 신용/체크카드
  | 'kakaopay' // 카카오페이
  | 'naverpay' // 네이버페이
  | 'tosspay' // 토스페이
  | 'samsungpay' // 삼성페이
  | 'applepay' // 애플페이

/**
 * 결제 수단 라벨
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: '신용/체크카드',
  kakaopay: '카카오페이',
  naverpay: '네이버페이',
  tosspay: '토스페이',
  samsungpay: '삼성페이',
  applepay: 'Apple Pay',
}

// 주문 항목
export interface OrderItem {
  id: string
  orderId: string
  menuId: string
  menuName: string
  menuImage: string | null
  quantity: number
  price: number
  options: OrderItemOption[]
  specialInstructions: string | null
}

// 주문 항목 옵션
export interface OrderItemOption {
  id: string
  name: string
  price: number
}

// ============================================================================
// 주문 상태 라벨 및 색상
// ============================================================================

/**
 * 주문 상태별 라벨
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '주문 대기',
  confirmed: '주문 접수',
  rejected: '주문 거절',
  preparing: '조리 중',
  ready: '조리 완료',
  picked_up: '픽업 완료',
  delivering: '배달 중',
  delivered: '배달 완료',
  cancelled: '주문 취소',
}

/**
 * 주문 상태별 색상 (Tailwind)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-yellow-500',
  confirmed: 'text-blue-500',
  rejected: 'text-red-500',
  preparing: 'text-orange-500',
  ready: 'text-green-500',
  picked_up: 'text-blue-500',
  delivering: 'text-blue-600',
  delivered: 'text-green-600',
  cancelled: 'text-neutral-500',
}

/**
 * 주문 상태별 배경색 (Tailwind)
 */
export const ORDER_STATUS_BG_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100',
  confirmed: 'bg-blue-100',
  rejected: 'bg-red-100',
  preparing: 'bg-orange-100',
  ready: 'bg-green-100',
  picked_up: 'bg-blue-100',
  delivering: 'bg-blue-100',
  delivered: 'bg-green-100',
  cancelled: 'bg-neutral-100',
}

// ============================================================================
// 주문 입력/요청 타입
// ============================================================================

/**
 * 주문 항목 입력
 */
export interface OrderItemInput {
  menuId: string
  menuName: string
  menuImage: string | null
  quantity: number
  price: number // 단가
  options: OrderItemOptionInput[]
  specialInstructions: string | null
}

/**
 * 주문 항목 옵션 입력
 */
export interface OrderItemOptionInput {
  optionId: string
  name: string
  price: number
}

/**
 * 주문 생성 입력
 */
export interface CreateOrderInput {
  restaurantId: string
  items: OrderItemInput[]
  deliveryAddress: {
    address: string
    detail: string | null
    lat: number
    lng: number
  }
  paymentMethod: PaymentMethod
  couponId: string | null
  pointsToUse: number
  specialInstructions: string | null
  deliveryInstructions: string | null
  disposableItems: boolean
}

/**
 * 주문 접수 입력 (점주)
 */
export interface ConfirmOrderInput {
  orderId: string
  estimatedPrepTime: number // 예상 조리 시간 (분)
}

/**
 * 주문 거절 입력 (점주)
 */
export interface RejectOrderInput {
  orderId: string
  reason: OrderRejectionReason
  detail: string | null
}

/**
 * 주문 상태 변경 입력
 */
export interface UpdateOrderStatusInput {
  orderId: string
  status: OrderStatus
  note?: string
}

// ============================================================================
// 주문 조회 결과 타입
// ============================================================================

/**
 * 주문 목록 아이템 (간략 정보)
 */
export interface OrderListItem {
  id: string
  orderNumber: string
  restaurantId: string
  restaurantName: string
  restaurantImage: string | null
  status: OrderStatus
  totalAmount: number
  itemCount: number
  itemSummary: string // "황금올리브 치킨 외 2개"
  createdAt: string
}

/**
 * 점주용 주문 목록 아이템
 */
export interface OwnerOrderListItem {
  id: string
  orderNumber: string
  userId: string
  customerName: string
  customerPhone: string
  status: OrderStatus
  totalAmount: number
  deliveryFee: number
  platformFee: number
  itemCount: number
  items: Array<{
    menuName: string
    quantity: number
    options: string[]
    specialInstructions: string | null
  }>
  deliveryAddress: string
  deliveryDetail: string | null
  specialInstructions: string | null
  deliveryInstructions: string | null
  estimatedPrepTime: number | null
  createdAt: string
  confirmedAt: string | null
}

/**
 * 라이더용 배달 가능 주문 목록 아이템
 */
export interface AvailableDeliveryItem {
  id: string
  orderNumber: string
  restaurantName: string
  restaurantAddress: string
  restaurantLat: number
  restaurantLng: number
  deliveryAddress: string
  deliveryLat: number
  deliveryLng: number
  estimatedDistance: number // 미터
  estimatedEarnings: number // 예상 수익
  itemCount: number
  itemSummary: string
  createdAt: string
  preparedAt: string | null
}

// ============================================================================
// 주문 이력 타입
// ============================================================================

/**
 * 주문 상태 이력
 */
export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  note: string | null
  changedBy: 'customer' | 'owner' | 'rider' | 'system'
  changedByUserId: string | null
  createdAt: string
}

// ============================================================================
// DB 레코드 타입 (snake_case)
// ============================================================================

/**
 * orders 테이블 레코드
 */
export interface OrderRecord {
  id: string
  order_number: string
  user_id: string
  restaurant_id: string
  restaurant_name: string
  restaurant_image: string | null
  restaurant_phone: string | null
  rider_id: string | null
  rider_name: string | null
  rider_phone: string | null
  status: OrderStatus
  menu_amount: number
  discount_amount: number
  points_used: number
  delivery_fee: number
  platform_fee: number
  total_amount: number
  delivery_address: string
  delivery_detail: string | null
  delivery_lat: number
  delivery_lng: number
  special_instructions: string | null
  delivery_instructions: string | null
  disposable_items: boolean
  estimated_prep_time: number | null
  estimated_delivery_time: string | null
  actual_delivery_time: string | null
  confirmed_at: string | null
  prepared_at: string | null
  picked_up_at: string | null
  delivered_at: string | null
  rejection_reason: OrderRejectionReason | null
  rejection_detail: string | null
  cancelled_reason: string | null
  cancelled_at: string | null
  cancelled_by: 'customer' | 'owner' | 'system' | null
  payment_method: PaymentMethod
  payment_id: string | null
  coupon_id: string | null
  coupon_name: string | null
  created_at: string
  updated_at: string
}

/**
 * order_items 테이블 레코드
 */
export interface OrderItemRecord {
  id: string
  order_id: string
  menu_id: string
  menu_name: string
  menu_image: string | null
  quantity: number
  price: number
  options: OrderItemOption[]
  special_instructions: string | null
}

/**
 * order_status_history 테이블 레코드
 */
export interface OrderStatusHistoryRecord {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  changed_by: 'customer' | 'owner' | 'rider' | 'system'
  changed_by_user_id: string | null
  created_at: string
}
