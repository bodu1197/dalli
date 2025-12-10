'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Ticket, Clock, Store } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  discountType: 'amount' | 'percentage'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount?: number
  restaurantId?: string
  restaurantName?: string
  expiresAt: string
  isUsed: boolean
}

// Mock 쿠폰 데이터
const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME2024',
    name: '신규 가입 축하 쿠폰',
    description: '달리고 첫 주문 할인',
    discountType: 'amount',
    discountValue: 3000,
    minOrderAmount: 15000,
    expiresAt: '2024-12-31T23:59:59',
    isUsed: false,
  },
  {
    id: '2',
    code: 'CHICKEN20',
    name: '치킨 전문점 20% 할인',
    description: '치킨 카테고리 전용',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 18000,
    maxDiscountAmount: 5000,
    expiresAt: '2024-12-25T23:59:59',
    isUsed: false,
  },
  {
    id: '3',
    code: 'BBQSPECIAL',
    name: 'BBQ 치킨 전용 쿠폰',
    description: 'BBQ 치킨에서만 사용 가능',
    discountType: 'amount',
    discountValue: 2000,
    minOrderAmount: 20000,
    restaurantId: '1',
    restaurantName: 'BBQ 치킨 강남점',
    expiresAt: '2024-12-20T23:59:59',
    isUsed: false,
  },
  {
    id: '4',
    code: 'USED001',
    name: '사용된 쿠폰',
    description: '이미 사용된 쿠폰입니다',
    discountType: 'amount',
    discountValue: 1000,
    minOrderAmount: 10000,
    expiresAt: '2024-11-30T23:59:59',
    isUsed: true,
  },
]

type TabType = 'available' | 'used'

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('available')
  const [couponCode, setCouponCode] = useState('')

  const availableCoupons = MOCK_COUPONS.filter((c) => !c.isUsed)
  const usedCoupons = MOCK_COUPONS.filter((c) => c.isUsed)

  const displayCoupons = activeTab === 'available' ? availableCoupons : usedCoupons

  const handleRegisterCoupon = () => {
    if (!couponCode.trim()) {
      alert('쿠폰 코드를 입력해주세요')
      return
    }
    // Note: Register coupon via API (to be implemented with Supabase)
    alert(`쿠폰 코드 "${couponCode}" 등록 시도 (개발 중)`)
    setCouponCode('')
  }

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/my"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            쿠폰함
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 쿠폰 등록 */}
      <section className="p-4 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="쿠폰 코드 입력"
            className="flex-1 px-4 py-3 bg-[var(--color-neutral-50)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          />
          <button
            onClick={handleRegisterCoupon}
            className="px-5 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl whitespace-nowrap"
          >
            등록
          </button>
        </div>
      </section>

      {/* 탭 */}
      <div className="flex bg-white border-b border-[var(--color-neutral-100)]">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          사용 가능 {availableCoupons.length > 0 && `(${availableCoupons.length})`}
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'used'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          사용/만료
        </button>
      </div>

      {/* 쿠폰 목록 */}
      <main className="p-4 pb-20">
        {displayCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Ticket className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)]">
              {activeTab === 'available'
                ? '사용 가능한 쿠폰이 없습니다'
                : '사용/만료된 쿠폰이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                daysRemaining={getDaysRemaining(coupon.expiresAt)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CouponCard({
  coupon,
  daysRemaining,
}: Readonly<{
  coupon: Coupon
  daysRemaining: number
}>) {
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0

  const discountText =
    coupon.discountType === 'amount'
      ? `${coupon.discountValue.toLocaleString()}원`
      : `${coupon.discountValue}%`

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm ${
        coupon.isUsed ? 'opacity-50' : ''
      }`}
    >
      {/* 쿠폰 상단 - 할인 금액 */}
      <div className="flex">
        <div className="flex-shrink-0 w-28 bg-[var(--color-primary-500)] flex flex-col items-center justify-center py-4">
          <span className="text-2xl font-bold text-white">{discountText}</span>
          {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && (
            <span className="text-xs text-white/80 mt-1">
              최대 {coupon.maxDiscountAmount.toLocaleString()}원
            </span>
          )}
        </div>

        {/* 쿠폰 정보 */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-1">
            {coupon.name}
          </h3>
          <p className="text-sm text-[var(--color-neutral-500)] mb-2">
            {coupon.description}
          </p>

          {/* 사용 조건 */}
          <div className="space-y-1">
            <p className="text-xs text-[var(--color-neutral-400)]">
              {coupon.minOrderAmount.toLocaleString()}원 이상 주문 시
            </p>
            {coupon.restaurantName && (
              <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                <Store className="w-3 h-3" />
                <span>{coupon.restaurantName} 전용</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 쿠폰 하단 - 유효기간 */}
      <div className="px-4 py-3 bg-[var(--color-neutral-50)] border-t border-dashed border-[var(--color-neutral-200)] flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(coupon.expiresAt).toLocaleDateString('ko-KR')} 까지
          </span>
        </div>
        {isExpiringSoon && !coupon.isUsed && (
          <span className="text-xs font-medium text-[var(--color-error-500)]">
            D-{daysRemaining}
          </span>
        )}
        {coupon.isUsed && (
          <span className="text-xs font-medium text-[var(--color-neutral-400)]">
            사용완료
          </span>
        )}
      </div>
    </div>
  )
}
