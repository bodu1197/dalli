'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Navigation2, Phone, Store, User, Camera, Check, MessageCircle } from 'lucide-react'

type DeliveryStatus = 'pickup' | 'picked_up' | 'delivering' | 'arrived'

interface ActiveDelivery {
  id: string
  status: DeliveryStatus
  restaurantName: string
  restaurantPhone: string
  restaurantAddress: string
  customerName: string
  customerPhone: string
  customerAddress: string
  deliveryNote?: string
  storeNote?: string
  fee: number
  bonus?: number
  menuItems: { name: string; quantity: number }[]
}

// Mock 데이터
const MOCK_DELIVERY: ActiveDelivery = {
  id: '1',
  status: 'pickup',
  restaurantName: 'BBQ 치킨 강남점',
  restaurantPhone: '02-1234-5678',
  restaurantAddress: '서울시 강남구 역삼동 123-45 강남빌딩 1층',
  customerName: '김**',
  customerPhone: '010-1234-5678',
  customerAddress: '서울시 강남구 삼성동 456-78 래미안아파트 101동 1001호',
  deliveryNote: '문 앞에 놔주세요. 벨 누르지 말아주세요.',
  storeNote: '음식 조심히 다뤄주세요',
  fee: 4500,
  bonus: 500,
  menuItems: [
    { name: '황금올리브 치킨', quantity: 1 },
    { name: '콜라 1.25L', quantity: 1 },
    { name: '치즈볼', quantity: 1 },
  ],
}

const STATUS_STEPS = [
  { status: 'pickup', label: '픽업 이동중', description: '가게로 이동해주세요' },
  { status: 'picked_up', label: '픽업 완료', description: '음식을 수령했습니다' },
  { status: 'delivering', label: '배달 중', description: '고객에게 이동 중입니다' },
  { status: 'arrived', label: '도착', description: '배달지에 도착했습니다' },
]

export default function RiderDeliveryPage() {
  const params = useParams()
  const router = useRouter()
  const deliveryId = params.id as string

  const [delivery, setDelivery] = useState(MOCK_DELIVERY)
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === delivery.status)
  const currentStep = STATUS_STEPS[currentStepIndex]

  const handlePickupComplete = () => {
    setDelivery((prev) => ({ ...prev, status: 'picked_up' }))
    setTimeout(() => {
      setDelivery((prev) => ({ ...prev, status: 'delivering' }))
    }, 500)
  }

  const handleArrived = () => {
    setDelivery((prev) => ({ ...prev, status: 'arrived' }))
    setShowCompleteModal(true)
  }

  const handleDeliveryComplete = () => {
    alert('배달이 완료되었습니다!')
    router.push('/rider')
  }

  const openNavigation = (address: string) => {
    // 카카오맵 네비게이션 연동
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://map.kakao.com/?q=${encodedAddress}`, '_blank')
  }

  const totalFee = delivery.fee + (delivery.bonus || 0)

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/rider" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            배달 진행중
          </h1>
          <Link
            href={`/chat/order/${deliveryId}`}
            className="w-10 h-10 flex items-center justify-center -mr-2 text-[var(--color-primary-500)]"
          >
            <MessageCircle className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <main className="pb-32">
        {/* 현재 상태 */}
        <section className="bg-[var(--color-primary-500)] text-white p-6">
          <div className="text-center">
            <p className="text-lg font-bold">{currentStep.label}</p>
            <p className="text-sm opacity-80 mt-1">{currentStep.description}</p>
          </div>

          {/* 진행 단계 */}
          <div className="flex items-center justify-center mt-6">
            {STATUS_STEPS.map((step) => {
              const stepIndex = STATUS_STEPS.indexOf(step)
              return (
                <div key={step.status} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stepIndex <= currentStepIndex
                        ? 'bg-white text-[var(--color-primary-500)]'
                        : 'bg-white/30 text-white'
                    }`}
                  >
                    {stepIndex < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{stepIndex + 1}</span>
                    )}
                  </div>
                  {stepIndex < STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-8 h-1 ${
                        stepIndex < currentStepIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* 픽업 정보 (픽업 전) */}
        {(delivery.status === 'pickup' || delivery.status === 'picked_up') && (
          <section className="bg-white mt-3 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                <Store className="w-4 h-4 text-[var(--color-primary-500)]" />
              </div>
              <h2 className="font-bold text-[var(--color-neutral-900)]">픽업 정보</h2>
            </div>

            <div className="space-y-3">
              <p className="text-lg font-semibold text-[var(--color-neutral-900)]">
                {delivery.restaurantName}
              </p>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-neutral-400)] mt-0.5" />
                <p className="text-[var(--color-neutral-700)]">{delivery.restaurantAddress}</p>
              </div>
            </div>

            {delivery.storeNote && (
              <div className="mt-4 p-3 bg-[var(--color-info-50)] rounded-xl">
                <p className="text-sm text-[var(--color-info-600)]">{delivery.storeNote}</p>
              </div>
            )}

            {/* 주문 내역 */}
            <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)]">
              <p className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">주문 내역</p>
              <div className="space-y-1">
                {delivery.menuItems.map((item) => (
                  <p key={`menu-${item.name}`} className="text-sm text-[var(--color-neutral-600)]">
                    {item.name} x {item.quantity}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <a
                href={`tel:${delivery.restaurantPhone}`}
                className="flex-1 py-3 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                전화
              </a>
              <button
                onClick={() => openNavigation(delivery.restaurantAddress)}
                className="flex-1 py-3 bg-[var(--color-primary-500)] text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <Navigation2 className="w-5 h-5" />
                길안내
              </button>
            </div>
          </section>
        )}

        {/* 배달 정보 */}
        <section className="bg-white mt-3 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-success-100)] flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--color-success-500)]" />
            </div>
            <h2 className="font-bold text-[var(--color-neutral-900)]">배달 정보</h2>
          </div>

          <div className="space-y-3">
            <p className="text-lg font-semibold text-[var(--color-neutral-900)]">
              {delivery.customerName}
            </p>
            <div className="flex items-start gap-2">
              <Navigation2 className="w-5 h-5 text-[var(--color-neutral-400)] mt-0.5" />
              <p className="text-[var(--color-neutral-700)]">{delivery.customerAddress}</p>
            </div>
          </div>

          {delivery.deliveryNote && (
            <div className="mt-4 p-3 bg-[var(--color-warning-50)] rounded-xl">
              <p className="text-sm font-medium text-[var(--color-warning-700)]">배달 요청사항</p>
              <p className="text-sm text-[var(--color-warning-600)] mt-1">{delivery.deliveryNote}</p>
            </div>
          )}

          {delivery.status === 'delivering' && (
            <div className="flex gap-3 mt-4">
              <a
                href={`tel:${delivery.customerPhone}`}
                className="flex-1 py-3 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                전화
              </a>
              <button
                onClick={() => openNavigation(delivery.customerAddress)}
                className="flex-1 py-3 bg-[var(--color-primary-500)] text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <Navigation2 className="w-5 h-5" />
                길안내
              </button>
            </div>
          )}
        </section>

        {/* 수입 정보 */}
        <section className="bg-white mt-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-neutral-700)]">예상 수입</span>
            <span className="text-xl font-bold text-[var(--color-success-500)]">
              {totalFee.toLocaleString()}원
            </span>
          </div>
        </section>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
        {delivery.status === 'pickup' && (
          <button
            onClick={handlePickupComplete}
            className="w-full py-4 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            픽업 완료
          </button>
        )}
        {delivery.status === 'delivering' && (
          <button
            onClick={handleArrived}
            className="w-full py-4 bg-[var(--color-success-500)] text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <Navigation2 className="w-5 h-5" />
            도착 완료
          </button>
        )}
        {delivery.status === 'arrived' && (
          <button
            onClick={() => setShowCompleteModal(true)}
            className="w-full py-4 bg-[var(--color-success-500)] text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            배달 완료
          </button>
        )}
      </div>

      {/* 배달 완료 모달 */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <h3 className="font-bold text-lg text-[var(--color-neutral-900)] mb-4">
              배달 완료 확인
            </h3>

            {/* 사진 촬영 */}
            <div className="mb-6">
              <p className="text-sm text-[var(--color-neutral-600)] mb-3">
                배달 완료 사진을 촬영해주세요 (선택)
              </p>
              <button className="w-full py-8 border-2 border-dashed border-[var(--color-neutral-300)] rounded-xl flex flex-col items-center justify-center gap-2 text-[var(--color-neutral-500)]">
                <Camera className="w-8 h-8" />
                <span className="text-sm">사진 촬영하기</span>
              </button>
            </div>

            <div className="bg-[var(--color-success-50)] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-success-700)]">배달 수입</span>
                <span className="font-bold text-lg text-[var(--color-success-600)]">
                  {totalFee.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-4 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleDeliveryComplete}
                className="flex-1 py-4 bg-[var(--color-success-500)] text-white font-semibold rounded-xl"
              >
                완료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
