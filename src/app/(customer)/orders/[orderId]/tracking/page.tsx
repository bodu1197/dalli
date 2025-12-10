'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Check,
  ChefHat,
  Bike,
  Package,
} from 'lucide-react'

import { getOrderById } from '@/lib/mock/orders'
import type { OrderStatus } from '@/types/order.types'

interface PageProps {
  readonly params: Promise<{ orderId: string }>
}

// 주문 상태 단계 정의
const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'confirmed', label: '주문 접수', icon: Check },
  { status: 'preparing', label: '조리 중', icon: ChefHat },
  { status: 'picked_up', label: '픽업 완료', icon: Package },
  { status: 'delivering', label: '배달 중', icon: Bike },
  { status: 'delivered', label: '배달 완료', icon: MapPin },
]

// 상태별 인덱스 계산
function getStatusIndex(status: OrderStatus): number {
  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered']
  return statusOrder.indexOf(status)
}

export default function OrderTrackingPage({ params }: Readonly<PageProps>) {
  const { orderId } = use(params)
  const router = useRouter()
  const order = getOrderById(orderId)

  // 예상 도착 시간 카운트다운
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  useEffect(() => {
    if (!order?.estimatedDeliveryTime) return

    const updateRemainingTime = () => {
      const now = new Date().getTime()
      const estimated = new Date(order.estimatedDeliveryTime!).getTime()
      const diff = Math.max(0, Math.floor((estimated - now) / 1000 / 60))
      setRemainingTime(diff)
    }

    updateRemainingTime()
    const interval = setInterval(updateRemainingTime, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [order?.estimatedDeliveryTime])

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-[var(--color-neutral-500)] mb-6">
          주문을 찾을 수 없습니다
        </p>
        <Link
          href="/orders"
          className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
        >
          주문내역으로 돌아가기
        </Link>
      </div>
    )
  }

  // 완료/취소 상태이면 상세 페이지로 리다이렉트
  if (['delivered', 'cancelled'].includes(order.status)) {
    router.replace(`/orders/${orderId}`)
    return null
  }

  const currentStatusIndex = getStatusIndex(order.status)

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </button>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            배달 현황
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 지도 영역 (플레이스홀더) */}
        <div className="relative h-64 bg-[var(--color-neutral-200)]">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <MapPin className="w-12 h-12 text-[var(--color-primary-500)] mb-2" />
            <p className="text-sm text-[var(--color-neutral-500)]">
              지도가 여기에 표시됩니다
            </p>
            <p className="text-xs text-[var(--color-neutral-400)] mt-1">
              (카카오맵 연동 예정)
            </p>
          </div>

          {/* 예상 도착 시간 오버레이 */}
          {remainingTime !== null && remainingTime > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-neutral-500)]">
                    예상 도착 시간
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-primary-500)]">
                    약 {remainingTime}분
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[var(--color-primary-500)]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 주문 상태 스테퍼 */}
        <div className="bg-white mt-2 px-4 py-6">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-6">
            배달 진행 상황
          </h3>

          <div className="relative">
            {/* 연결선 */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--color-neutral-200)]" />

            {/* 스텝 아이템 */}
            <div className="space-y-6">
              {ORDER_STEPS.map((step) => {
                const stepIndex = getStatusIndex(step.status)
                const isCompleted = currentStatusIndex >= stepIndex
                const isCurrent = order.status === step.status ||
                  (order.status === 'ready' && step.status === 'preparing') ||
                  (order.status === 'pending' && step.status === 'confirmed')

                return (
                  <div key={step.status} className="relative flex items-center gap-4">
                    {/* 아이콘 */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-[var(--color-primary-500)]'
                          : 'bg-[var(--color-neutral-200)]'
                      }`}
                    >
                      <step.icon
                        className={`w-5 h-5 ${
                          isCompleted ? 'text-white' : 'text-[var(--color-neutral-400)]'
                        }`}
                      />
                    </div>

                    {/* 텍스트 */}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isCompleted
                            ? 'text-[var(--color-neutral-900)]'
                            : 'text-[var(--color-neutral-400)]'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-[var(--color-primary-500)] mt-0.5">
                          현재 단계
                        </p>
                      )}
                    </div>

                    {/* 완료 체크 */}
                    {isCompleted && currentStatusIndex > stepIndex && (
                      <Check className="w-5 h-5 text-[var(--color-primary-500)]" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 가게 정보 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">
            주문 가게
          </h3>
          <p className="text-[var(--color-neutral-700)]">
            {order.restaurantName}
          </p>
        </div>

        {/* 배달 주소 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">
            배달 주소
          </h3>
          <p className="text-[var(--color-neutral-700)]">
            {order.deliveryAddress}
          </p>
          {order.deliveryDetail && (
            <p className="text-sm text-[var(--color-neutral-500)] mt-1">
              {order.deliveryDetail}
            </p>
          )}
        </div>

        {/* 라이더 정보 (배달 중일 때만) */}
        {order.riderId && ['picked_up', 'delivering'].includes(order.status) && (
          <div className="bg-white mt-2 px-4 py-4">
            <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">
              라이더 정보
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                  <Bike className="w-6 h-6 text-[var(--color-neutral-500)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">
                    배달 기사님
                  </p>
                  <p className="text-sm text-[var(--color-neutral-500)]">
                    안전하게 배달 중입니다
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="w-10 h-10 border border-[var(--color-neutral-200)] rounded-full flex items-center justify-center"
                  onClick={() => alert('전화 연결 기능 준비 중입니다')}
                >
                  <Phone className="w-5 h-5 text-[var(--color-neutral-600)]" />
                </button>
                <button
                  className="w-10 h-10 border border-[var(--color-neutral-200)] rounded-full flex items-center justify-center"
                  onClick={() => alert('채팅 기능 준비 중입니다')}
                >
                  <MessageCircle className="w-5 h-5 text-[var(--color-neutral-600)]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 text-center border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl flex items-center justify-center gap-2"
            onClick={() => alert('가게 전화 연결 기능 준비 중입니다')}
          >
            <Phone className="w-4 h-4" />
            가게 전화
          </button>
          <Link
            href={`/orders/${orderId}`}
            className="flex-1 py-3 text-center bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
          >
            주문 상세
          </Link>
        </div>
      </div>
    </div>
  )
}
