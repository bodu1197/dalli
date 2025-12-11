'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Ticket, Clock, Store, Loader2 } from 'lucide-react'
import { useUserCoupons, useRegisterCoupon } from '@/hooks/useCoupon'
import { calculateCouponDiscount } from '@/types/coupon.types'
import type { UserCouponListItem } from '@/types/coupon.types'

type TabType = 'available' | 'used'

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('available')
  const [couponCode, setCouponCode] = useState('')

  const { coupons, isLoading, error, refetch } = useUserCoupons()
  const { registerCoupon, isRegistering, error: registerError } = useRegisterCoupon()

  const now = new Date().toISOString()
  const availableCoupons = coupons.filter(
    (c) => !c.isUsed && c.endDate >= now
  )
  const usedOrExpiredCoupons = coupons.filter(
    (c) => c.isUsed || c.endDate < now
  )

  const displayCoupons = activeTab === 'available' ? availableCoupons : usedOrExpiredCoupons

  const handleRegisterCoupon = async () => {
    if (!couponCode.trim()) {
      alert('쿠폰 코드를 입력해주세요')
      return
    }

    const success = await registerCoupon(couponCode)
    if (success) {
      alert('쿠폰이 등록되었습니다!')
      setCouponCode('')
      refetch()
    } else if (registerError) {
      alert(registerError)
    }
  }

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate)
    const diff = end.getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
            disabled={isRegistering}
            className="px-5 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl whitespace-nowrap disabled:bg-[var(--color-neutral-300)] disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '등록'
            )}
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
          사용/만료 {usedOrExpiredCoupons.length > 0 && `(${usedOrExpiredCoupons.length})`}
        </button>
      </div>

      {/* 쿠폰 목록 */}
      <main className="p-4 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin mb-4" />
            <p className="text-[var(--color-neutral-500)]">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <p className="text-[var(--color-error-500)] mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg"
            >
              다시 시도
            </button>
          </div>
        ) : displayCoupons.length === 0 ? (
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
                daysRemaining={getDaysRemaining(coupon.endDate)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

interface CouponCardProps {
  coupon: UserCouponListItem
  daysRemaining: number
}

function CouponCard({ coupon, daysRemaining }: Readonly<CouponCardProps>) {
  const isExpired = daysRemaining <= 0
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
  const isInactive = coupon.isUsed || isExpired

  const discountText =
    coupon.discountType === 'fixed'
      ? `${coupon.discountValue.toLocaleString()}원`
      : `${coupon.discountValue}%`

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm ${
        isInactive ? 'opacity-50' : ''
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
          {coupon.description && (
            <p className="text-sm text-[var(--color-neutral-500)] mb-2">
              {coupon.description}
            </p>
          )}

          {/* 사용 조건 */}
          <div className="space-y-1">
            {coupon.minOrderAmount && (
              <p className="text-xs text-[var(--color-neutral-400)]">
                {coupon.minOrderAmount.toLocaleString()}원 이상 주문 시
              </p>
            )}
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
            {new Date(coupon.endDate).toLocaleDateString('ko-KR')} 까지
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
        {isExpired && !coupon.isUsed && (
          <span className="text-xs font-medium text-[var(--color-neutral-400)]">
            만료됨
          </span>
        )}
      </div>
    </div>
  )
}
