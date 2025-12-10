'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cart.store'

export default function CartPage() {
  const {
    items,
    restaurantName,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
  } = useCartStore()

  const totalAmount = getTotalAmount()
  const deliveryFee: number = 0

  // 빈 장바구니
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
          <div className="flex items-center px-4 h-14">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
            </Link>
            <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
              장바구니
            </h1>
            <div className="w-10" />
          </div>
        </header>

        {/* 빈 상태 */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-[var(--color-neutral-500)] mb-6">
            장바구니가 비어있습니다
          </p>
          <Link href="/">
            <Button>맛집 구경하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-40">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            장바구니
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-[var(--color-neutral-400)]"
          >
            비우기
          </button>
        </div>
      </header>

      <main>
        {/* 가게 정보 */}
        <Link
          href={`/restaurant/${items[0]?.restaurantId}`}
          className="flex items-center justify-between bg-white px-4 py-4"
        >
          <span className="font-semibold text-[var(--color-neutral-900)]">
            {restaurantName}
          </span>
          <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
        </Link>

        {/* 장바구니 항목 */}
        <div className="bg-white mt-2">
          {items.map((item) => {
            const optionsPrice = item.options.reduce(
              (sum, opt) => sum + opt.price,
              0
            )
            const itemTotalPrice = (item.basePrice + optionsPrice) * item.quantity

            return (
              <div
                key={item.id}
                className="p-4 border-b border-[var(--color-neutral-100)] last:border-b-0"
              >
                <div className="flex gap-4">
                  {/* 이미지 */}
                  <div className="w-20 h-20 rounded-xl bg-[var(--color-neutral-100)] overflow-hidden flex-shrink-0">
                    {item.menuImage ? (
                      <Image
                        src={item.menuImage}
                        alt={item.menuName}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] mb-1">
                      {item.menuName}
                    </h3>

                    {/* 옵션 */}
                    {item.options.length > 0 && (
                      <p className="text-sm text-[var(--color-neutral-500)] mb-2">
                        {item.options.map((opt) => opt.name).join(', ')}
                      </p>
                    )}

                    <p className="font-bold text-[var(--color-neutral-900)]">
                      {itemTotalPrice.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 수량 조절 */}
                <div className="flex items-center justify-end gap-1 mt-4">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeItem(item.id)
                      } else {
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    }}
                    className="w-8 h-8 rounded-lg border border-[var(--color-neutral-200)] flex items-center justify-center"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-4 h-4 text-[var(--color-neutral-500)]" />
                    ) : (
                      <Minus className="w-4 h-4 text-[var(--color-neutral-700)]" />
                    )}
                  </button>

                  <span className="w-10 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-[var(--color-neutral-200)] flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-[var(--color-neutral-700)]" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 메뉴 추가 */}
        <Link
          href={`/restaurant/${items[0]?.restaurantId}`}
          className="flex items-center justify-center gap-2 bg-white mt-2 py-4 text-[var(--color-primary-500)]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">메뉴 추가</span>
        </Link>

        {/* 주문 금액 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-4">
            주문 금액
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-600)]">
                메뉴 금액
              </span>
              <span className="font-medium text-[var(--color-neutral-900)]">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-600)]">배달팁</span>
              <span className="font-medium text-[var(--color-neutral-900)]">
                {deliveryFee === 0
                  ? '무료'
                  : `${deliveryFee.toLocaleString()}원`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-neutral-100)]">
              <span className="font-bold text-[var(--color-neutral-900)]">
                총 결제 예정금액
              </span>
              <span className="font-bold text-lg text-[var(--color-neutral-900)]">
                {(totalAmount + deliveryFee).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 주문 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
        <Link href="/checkout">
          <Button className="w-full h-14 text-base font-bold">
            {(totalAmount + deliveryFee).toLocaleString()}원 주문하기
          </Button>
        </Link>
      </div>
    </div>
  )
}
