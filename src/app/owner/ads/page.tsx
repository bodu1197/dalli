'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Megaphone,
  Check,
  Crown,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react'
import {
  useAdvertisements,
  useCurrentAdvertisement,
  useCreateAdvertisement,
} from '@/hooks/useAdvertisement'
import { AD_PLANS, type AdPlanType } from '@/types/advertisement.types'

// Mock restaurant ID (실제로는 auth/store에서 가져옴)
const MOCK_RESTAURANT_ID = 'mock-restaurant-id'

interface AdPlanCardProps {
  plan: (typeof AD_PLANS)[AdPlanType]
  isSelected: boolean
  isCurrentPlan: boolean
  onSelect: () => void
}

function AdPlanCard({ plan, isSelected, isCurrentPlan, onSelect }: AdPlanCardProps) {
  const getPlanIcon = (type: AdPlanType) => {
    switch (type) {
      case 'exclusive':
        return <Crown className="w-6 h-6" />
      case 'premium':
        return <Star className="w-6 h-6" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  const getPlanColor = (type: AdPlanType) => {
    switch (type) {
      case 'exclusive':
        return {
          bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
          border: 'border-amber-400',
          text: 'text-amber-600',
        }
      case 'premium':
        return {
          bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
          border: 'border-purple-400',
          text: 'text-purple-600',
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
          border: 'border-blue-400',
          text: 'text-blue-600',
        }
    }
  }

  const colors = getPlanColor(plan.type)

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-4 rounded-2xl border-2 transition-all text-left ${
        isSelected
          ? `${colors.border} bg-white shadow-lg`
          : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
      }`}
    >
      {isCurrentPlan && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[var(--color-success-500)] text-white text-xs font-bold rounded-full">
          현재 플랜
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-white`}>
          {getPlanIcon(plan.type)}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[var(--color-neutral-900)]">
              {plan.name}
            </h3>
            {isSelected && (
              <span className={`w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center`}>
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </div>

          <p className="text-lg font-bold text-[var(--color-neutral-900)] mb-2">
            월 {plan.price.toLocaleString()}원
          </p>

          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-600)]">
                <Check className={`w-3.5 h-3.5 ${colors.text}`} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  )
}

export default function OwnerAdsPage() {
  const [selectedPlan, setSelectedPlan] = useState<AdPlanType | null>(null)
  const [selectedMonths, setSelectedMonths] = useState(1)

  const { currentAd, isLoading: isLoadingCurrent, daysRemaining } = useCurrentAdvertisement(MOCK_RESTAURANT_ID)
  const { advertisements, isLoading: isLoadingAds } = useAdvertisements(MOCK_RESTAURANT_ID)
  const { createAdvertisement, isCreating } = useCreateAdvertisement()

  const monthOptions = [
    { value: 1, label: '1개월', discount: 0 },
    { value: 3, label: '3개월', discount: 5 },
    { value: 6, label: '6개월', discount: 10 },
    { value: 12, label: '12개월', discount: 15 },
  ]

  const calculateTotalPrice = () => {
    if (!selectedPlan) return 0
    const plan = AD_PLANS[selectedPlan]
    const option = monthOptions.find((o) => o.value === selectedMonths)
    const basePrice = plan.price * selectedMonths
    const discount = option?.discount ?? 0
    return Math.floor(basePrice * (1 - discount / 100))
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    const ad = await createAdvertisement({
      restaurantId: MOCK_RESTAURANT_ID,
      planType: selectedPlan,
      months: selectedMonths,
    })

    if (ad) {
      // 결제 페이지로 이동 (실제 구현 시)
      alert(`광고 신청이 완료되었습니다. 결제를 진행해 주세요.\n광고 ID: ${ad.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center h-14 px-4">
          <Link href="/owner" className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-[var(--color-neutral-900)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            광고 관리
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 현재 광고 상태 */}
        {currentAd ? (
          <section className="px-4 py-4">
            <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-5 h-5" />
                <span className="font-medium">현재 광고 진행중</span>
              </div>

              <div className="bg-white/10 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">플랜</span>
                  <span className="font-bold">{AD_PLANS[currentAd.planType].name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">남은 기간</span>
                  <span className="font-bold">{daysRemaining}일</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">만료일</span>
                  <span className="font-bold">
                    {new Date(currentAd.endDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              <Link
                href="/owner/ads/analytics"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-[var(--color-primary-500)] font-bold rounded-xl"
              >
                <TrendingUp className="w-5 h-5" />
                광고 효과 분석 보기
              </Link>
            </div>
          </section>
        ) : (
          <section className="px-4 py-4">
            <div className="bg-[var(--color-neutral-100)] rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-neutral-200)] rounded-full flex items-center justify-center">
                <Megaphone className="w-8 h-8 text-[var(--color-neutral-400)]" />
              </div>
              <p className="text-[var(--color-neutral-600)] mb-2">
                현재 진행중인 광고가 없습니다
              </p>
              <p className="text-sm text-[var(--color-neutral-500)]">
                광고를 시작하면 더 많은 고객에게 노출됩니다
              </p>
            </div>
          </section>
        )}

        {/* 광고 플랜 선택 */}
        <section className="px-4 py-4">
          <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">
            광고 플랜 선택
          </h2>

          <div className="space-y-3">
            {(Object.keys(AD_PLANS) as AdPlanType[]).reverse().map((planType) => (
              <AdPlanCard
                key={planType}
                plan={AD_PLANS[planType]}
                isSelected={selectedPlan === planType}
                isCurrentPlan={currentAd?.planType === planType}
                onSelect={() => setSelectedPlan(planType)}
              />
            ))}
          </div>
        </section>

        {/* 기간 선택 */}
        {selectedPlan && (
          <section className="px-4 py-4">
            <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">
              광고 기간 선택
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {monthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMonths(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMonths === option.value
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : 'border-[var(--color-neutral-200)] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[var(--color-neutral-900)]">
                      {option.label}
                    </span>
                    {option.discount > 0 && (
                      <span className="px-2 py-0.5 bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full">
                        -{option.discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-neutral-500)]">
                    {(AD_PLANS[selectedPlan].price * option.value * (1 - option.discount / 100)).toLocaleString()}원
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 광고 이력 */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[var(--color-neutral-900)]">
              광고 이력
            </h2>
            <Link
              href="/owner/ads/history"
              className="text-sm text-[var(--color-primary-500)] font-medium flex items-center gap-1"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingAds ? (
            <div className="bg-white rounded-xl p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-[var(--color-neutral-200)] rounded w-3/4" />
                <div className="h-4 bg-[var(--color-neutral-200)] rounded w-1/2" />
              </div>
            </div>
          ) : advertisements.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-[var(--color-neutral-500)]">
                광고 이력이 없습니다
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl divide-y divide-[var(--color-neutral-100)]">
              {advertisements.slice(0, 3).map((ad) => (
                <div key={ad.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--color-neutral-900)]">
                      {AD_PLANS[ad.planType].name}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      ad.paymentStatus === 'paid'
                        ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
                        : ad.paymentStatus === 'pending'
                          ? 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
                          : 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
                    }`}>
                      {ad.paymentStatus === 'paid' ? '결제완료' :
                       ad.paymentStatus === 'pending' ? '결제대기' : '실패'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--color-neutral-500)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ad.startDate).toLocaleDateString('ko-KR')} ~{' '}
                      {new Date(ad.endDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 하단 결제 버튼 */}
      {selectedPlan && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
          <div className="max-w-[700px] mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-[var(--color-neutral-500)]">총 결제금액</p>
                <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                  {calculateTotalPrice().toLocaleString()}원
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-neutral-500)]">
                  {AD_PLANS[selectedPlan].name} · {selectedMonths}개월
                </p>
                {monthOptions.find((o) => o.value === selectedMonths)?.discount ?? 0 > 0 && (
                  <p className="text-sm text-[var(--color-error-500)] line-through">
                    {(AD_PLANS[selectedPlan].price * selectedMonths).toLocaleString()}원
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isCreating}
              className="w-full py-4 bg-[var(--color-primary-500)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-600)] disabled:bg-[var(--color-neutral-300)] disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? '처리중...' : '광고 시작하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
