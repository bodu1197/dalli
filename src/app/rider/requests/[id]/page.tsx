'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Navigation2, Phone, Clock, Store, User, Zap, X } from 'lucide-react'

interface DeliveryRequestDetail {
  id: string
  restaurantName: string
  restaurantPhone: string
  restaurantAddress: string
  customerName: string
  customerPhone: string
  customerAddress: string
  deliveryNote?: string
  distance: number
  estimatedTime: number
  fee: number
  bonus?: number
  menuItems: { name: string; quantity: number }[]
  createdAt: string
  expiresIn: number
}

// Mock 데이터
const MOCK_REQUEST: DeliveryRequestDetail = {
  id: '1',
  restaurantName: 'BBQ 치킨 강남점',
  restaurantPhone: '02-1234-5678',
  restaurantAddress: '서울시 강남구 역삼동 123-45 강남빌딩 1층',
  customerName: '김**',
  customerPhone: '010-1234-5678',
  customerAddress: '서울시 강남구 삼성동 456-78 래미안아파트 101동 1001호',
  deliveryNote: '문 앞에 놔주세요. 벨 누르지 말아주세요.',
  distance: 2.3,
  estimatedTime: 15,
  fee: 4500,
  bonus: 500,
  menuItems: [
    { name: '황금올리브 치킨', quantity: 1 },
    { name: '콜라 1.25L', quantity: 1 },
    { name: '치즈볼', quantity: 1 },
  ],
  createdAt: '2024-12-09T11:00:00',
  expiresIn: 45,
}

export default function RiderRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [request] = useState(MOCK_REQUEST)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleAccept = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmAccept = () => {
    alert('배달을 수락했습니다! 픽업지로 이동해주세요.')
    router.push(`/rider/delivery/${requestId}`)
  }

  const handleReject = () => {
    if (confirm('이 배달 요청을 거절하시겠습니까?')) {
      alert('배달 요청을 거절했습니다.')
      router.push('/rider/requests')
    }
  }

  const totalFee = request.fee + (request.bonus || 0)

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/rider/requests" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            배달 상세
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 수입 정보 */}
        <section className="bg-gradient-to-r from-[var(--color-success-500)] to-[var(--color-success-600)] p-6 text-white">
          <div className="text-center">
            <p className="text-sm opacity-80">예상 수입</p>
            <p className="text-3xl font-bold mt-1">
              {totalFee.toLocaleString()}원
            </p>
            {request.bonus && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">보너스 +{request.bonus.toLocaleString()}원 포함</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-sm opacity-70">총 거리</p>
              <p className="font-semibold">{request.distance}km</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-70">예상 시간</p>
              <p className="font-semibold">약 {request.estimatedTime}분</p>
            </div>
          </div>
        </section>

        {/* 픽업 정보 */}
        <section className="bg-white mt-3 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
              <Store className="w-4 h-4 text-[var(--color-primary-500)]" />
            </div>
            <h2 className="font-bold text-[var(--color-neutral-900)]">픽업 정보</h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-[var(--color-neutral-900)]">
                {request.restaurantName}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-neutral-400)] mt-0.5" />
              <p className="text-[var(--color-neutral-700)]">{request.restaurantAddress}</p>
            </div>
            <a
              href={`tel:${request.restaurantPhone}`}
              className="flex items-center gap-2 text-[var(--color-primary-500)]"
            >
              <Phone className="w-5 h-5" />
              <span>{request.restaurantPhone}</span>
            </a>
          </div>

          {/* 주문 내역 */}
          <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)]">
            <p className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">주문 내역</p>
            <div className="space-y-1">
              {request.menuItems.map((item, i) => (
                <p key={i} className="text-sm text-[var(--color-neutral-600)]">
                  {item.name} x {item.quantity}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* 배달 정보 */}
        <section className="bg-white mt-3 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-success-100)] flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--color-success-500)]" />
            </div>
            <h2 className="font-bold text-[var(--color-neutral-900)]">배달 정보</h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-[var(--color-neutral-900)]">
                {request.customerName}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Navigation2 className="w-5 h-5 text-[var(--color-neutral-400)] mt-0.5" />
              <p className="text-[var(--color-neutral-700)]">{request.customerAddress}</p>
            </div>
            <a
              href={`tel:${request.customerPhone}`}
              className="flex items-center gap-2 text-[var(--color-primary-500)]"
            >
              <Phone className="w-5 h-5" />
              <span>{request.customerPhone}</span>
            </a>
          </div>

          {/* 배달 요청사항 */}
          {request.deliveryNote && (
            <div className="mt-4 p-3 bg-[var(--color-warning-50)] rounded-xl">
              <p className="text-sm font-medium text-[var(--color-warning-700)]">배달 요청사항</p>
              <p className="text-sm text-[var(--color-warning-600)] mt-1">{request.deliveryNote}</p>
            </div>
          )}
        </section>

        {/* 경로 미리보기 */}
        <section className="bg-white mt-3 p-4">
          <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">경로 미리보기</h2>
          <div className="aspect-video bg-[var(--color-neutral-100)] rounded-xl flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="text-sm text-[var(--color-neutral-500)]">지도 미리보기</p>
            </div>
          </div>
        </section>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[var(--color-warning-500)]" />
          <span className="text-sm text-[var(--color-warning-600)]">
            {request.expiresIn}초 후 만료됩니다
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 py-4 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
          >
            거절
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-4 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
          >
            수락하기
          </button>
        </div>
      </div>

      {/* 수락 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[var(--color-neutral-900)]">
                배달 수락
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 text-[var(--color-neutral-400)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-[var(--color-neutral-600)] mb-6">
              {request.restaurantName}에서 {request.customerName}님에게 배달합니다.
              <br /><br />
              수락하시면 즉시 픽업지로 이동해주세요.
            </p>

            <div className="bg-[var(--color-success-50)] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-success-700)]">예상 수입</span>
                <span className="font-bold text-lg text-[var(--color-success-600)]">
                  {totalFee.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAccept}
                className="flex-1 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
              >
                수락하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
