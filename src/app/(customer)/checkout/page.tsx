'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  ChevronRight,
  CreditCard,
  Smartphone,
  MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/stores/cart.store'
import { useLocationStore } from '@/stores/location.store'

type PaymentMethod = 'card' | 'kakao' | 'toss' | 'naver'

const PAYMENT_METHODS = [
  { id: 'card', name: '신용/체크카드', icon: CreditCard },
  { id: 'kakao', name: '카카오페이', icon: Smartphone },
  { id: 'toss', name: '토스페이', icon: Smartphone },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const { selectedAddress } = useLocationStore()
  const { items, restaurantName, getTotalAmount, clearCart } = useCartStore()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [deliveryRequest, setDeliveryRequest] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalAmount = getTotalAmount()
  const deliveryFee: number = 0 // TODO: 실제 배달비 계산
  const finalAmount = totalAmount + deliveryFee

  // 빈 장바구니 체크
  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  // 주문 제출
  const handleSubmit = async () => {
    if (!selectedAddress) {
      alert('배달 주소를 설정해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: 실제 주문 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 주문 완료 처리
      clearCart()
      router.push('/checkout/complete')
    } catch (error) {
      alert('주문에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-40">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/cart"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            주문하기
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main>
        {/* 배달 주소 */}
        <Link
          href="/address/select"
          className="flex items-center justify-between bg-white px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[var(--color-primary-500)]" />
            <div>
              <p className="font-semibold text-[var(--color-neutral-900)]">
                {selectedAddress?.address || '배달 주소를 설정해주세요'}
              </p>
              {selectedAddress?.detail && (
                <p className="text-sm text-[var(--color-neutral-500)]">
                  {selectedAddress.detail}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
        </Link>

        {/* 주문 가게 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">
            {restaurantName}
          </h3>
          <div className="space-y-2">
            {items.map((item) => {
              const optionsPrice = item.options.reduce(
                (sum, opt) => sum + opt.price,
                0
              )
              const itemTotal = (item.basePrice + optionsPrice) * item.quantity

              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[var(--color-neutral-600)]">
                    {item.menuName} x {item.quantity}
                    {item.options.length > 0 && (
                      <span className="text-[var(--color-neutral-400)] ml-1">
                        ({item.options.map((o) => o.name).join(', ')})
                      </span>
                    )}
                  </span>
                  <span className="text-[var(--color-neutral-900)]">
                    {itemTotal.toLocaleString()}원
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 배달 요청사항 */}
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-[var(--color-neutral-400)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">
              배달 요청사항
            </h3>
          </div>
          <Input
            placeholder="예: 문 앞에 놓아주세요"
            value={deliveryRequest}
            onChange={(e) => setDeliveryRequest(e.target.value)}
            className="bg-[var(--color-neutral-50)]"
          />
        </div>

        {/* 결제 수단 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-4">
            결제 수단
          </h3>

          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === method.id
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                    : 'border-[var(--color-neutral-200)]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                  className="hidden"
                />
                <method.icon
                  className={`w-5 h-5 ${
                    paymentMethod === method.id
                      ? 'text-[var(--color-primary-500)]'
                      : 'text-[var(--color-neutral-400)]'
                  }`}
                />
                <span
                  className={`font-medium ${
                    paymentMethod === method.id
                      ? 'text-[var(--color-primary-500)]'
                      : 'text-[var(--color-neutral-700)]'
                  }`}
                >
                  {method.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 결제 금액 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-4">
            결제 금액
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-600)]">
                주문 금액
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
                총 결제금액
              </span>
              <span className="font-bold text-xl text-[var(--color-primary-500)]">
                {finalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="px-4 py-4 text-xs text-[var(--color-neutral-400)]">
          위 주문 내용을 확인하였으며, 결제에 동의합니다.
        </div>
      </main>

      {/* 하단 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
        <Button
          className="w-full h-14 text-base font-bold"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedAddress}
        >
          {isSubmitting ? '결제 처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
        </Button>
      </div>
    </div>
  )
}
