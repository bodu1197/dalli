// 주문 상태
export type OrderStatus =
  | 'pending' // 주문 대기
  | 'confirmed' // 주문 접수
  | 'preparing' // 조리 중
  | 'ready' // 조리 완료
  | 'picked_up' // 픽업 완료
  | 'delivering' // 배달 중
  | 'delivered' // 배달 완료
  | 'cancelled' // 취소됨

// 주문 정보
export interface Order {
  id: string
  userId: string
  restaurantId: string
  restaurantName: string
  restaurantImage: string | null
  riderId: string | null
  status: OrderStatus
  totalAmount: number
  deliveryFee: number
  platformFee: number
  deliveryAddress: string
  deliveryDetail: string | null
  deliveryLat: number
  deliveryLng: number
  specialInstructions: string | null
  estimatedDeliveryTime: string | null
  actualDeliveryTime: string | null
  cancelledReason: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
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

// 주문 상태별 라벨
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '주문 대기',
  confirmed: '주문 접수',
  preparing: '조리 중',
  ready: '조리 완료',
  picked_up: '픽업 완료',
  delivering: '배달 중',
  delivered: '배달 완료',
  cancelled: '주문 취소',
}

// 주문 상태별 색상
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-yellow-500',
  confirmed: 'text-blue-500',
  preparing: 'text-orange-500',
  ready: 'text-green-500',
  picked_up: 'text-blue-500',
  delivering: 'text-blue-500',
  delivered: 'text-green-600',
  cancelled: 'text-red-500',
}
