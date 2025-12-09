// 장바구니 항목
export interface CartItem {
  id: string // 고유 ID (menuId + options 조합)
  menuId: string
  menuName: string
  menuImage: string | null
  restaurantId: string
  restaurantName: string
  basePrice: number // 메뉴 기본 가격
  quantity: number
  options: CartItemOption[]
  specialInstructions?: string
}

// 장바구니 옵션
export interface CartItemOption {
  id: string
  name: string
  price: number
}

// 장바구니 요약
export interface CartSummary {
  restaurantId: string | null
  restaurantName: string | null
  itemCount: number
  totalAmount: number
  deliveryFee: number
  minOrderAmount: number
}

// 장바구니에 담기 입력
export interface AddToCartInput {
  menuId: string
  menuName: string
  menuImage: string | null
  restaurantId: string
  restaurantName: string
  basePrice: number
  quantity: number
  options: CartItemOption[]
  specialInstructions?: string
}
