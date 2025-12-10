import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartItemOption, AddToCartInput } from '@/types/cart.types'

interface CartState {
  // 장바구니 항목
  items: CartItem[]
  // 현재 식당 정보
  restaurantId: string | null
  restaurantName: string | null
  minOrderAmount: number
  deliveryFee: number

  // 액션
  addItem: (input: AddToCartInput) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void

  // 계산
  getTotalAmount: () => number
  getItemCount: () => number
  canAddItem: (restaurantId: string) => boolean
}

// 장바구니 항목 ID 생성 (메뉴 + 옵션 조합으로 고유 ID)
function generateItemId(menuId: string, options: CartItemOption[]): string {
  const optionIds = options
    .map((o) => o.id)
    .sort((a, b) => a.localeCompare(b))
    .join('-')
  return `${menuId}-${optionIds || 'no-options'}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      minOrderAmount: 0,
      deliveryFee: 0,

      addItem: (input) => {
        const state = get()

        // 다른 식당 음식이 있으면 장바구니 비우기 확인 필요
        if (state.restaurantId && state.restaurantId !== input.restaurantId) {
          // 기존 장바구니 비우고 새 식당 음식 담기
          set({
            items: [],
            restaurantId: input.restaurantId,
            restaurantName: input.restaurantName,
          })
        }

        const itemId = generateItemId(input.menuId, input.options)

        set((state) => {
          // 같은 메뉴+옵션 조합이 있으면 수량만 증가
          const existingIndex = state.items.findIndex(
            (item) => item.id === itemId
          )

          if (existingIndex !== -1) {
            const newItems = [...state.items]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + input.quantity,
            }
            return { items: newItems }
          }

          // 새 항목 추가
          const newItem: CartItem = {
            id: itemId,
            menuId: input.menuId,
            menuName: input.menuName,
            menuImage: input.menuImage,
            restaurantId: input.restaurantId,
            restaurantName: input.restaurantName,
            basePrice: input.basePrice,
            quantity: input.quantity,
            options: input.options,
            specialInstructions: input.specialInstructions,
          }

          return {
            items: [...state.items, newItem],
            restaurantId: input.restaurantId,
            restaurantName: input.restaurantName,
          }
        })
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId)

          // 장바구니가 비면 식당 정보도 초기화
          if (newItems.length === 0) {
            return {
              items: [],
              restaurantId: null,
              restaurantName: null,
              minOrderAmount: 0,
              deliveryFee: 0,
            }
          }

          return { items: newItems }
        })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
          minOrderAmount: 0,
          deliveryFee: 0,
        })
      },

      getTotalAmount: () => {
        const state = get()
        return state.items.reduce((total, item) => {
          const optionsPrice = item.options.reduce(
            (sum, opt) => sum + opt.price,
            0
          )
          return total + (item.basePrice + optionsPrice) * item.quantity
        }, 0)
      },

      getItemCount: () => {
        const state = get()
        return state.items.reduce((count, item) => count + item.quantity, 0)
      },

      canAddItem: (restaurantId) => {
        const state = get()
        // 장바구니가 비었거나 같은 식당이면 추가 가능
        return state.restaurantId === null || state.restaurantId === restaurantId
      },
    }),
    {
      name: 'dalligo-cart',
    }
  )
)
