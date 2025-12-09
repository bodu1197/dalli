'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, MapPin, Clock, MessageCircle, User } from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  items: { name: string; quantity: number; options?: string; price: number }[]
  totalAmount: number
  deliveryFee: number
  platformFee: number
  deliveryAddress: string
  deliveryRequest?: string
  storeRequest?: string
  status: 'pending' | 'accepted' | 'cooking' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  createdAt: string
  acceptedAt?: string
  estimatedTime?: number
  rider?: {
    name: string
    phone: string
  }
}

// Mock 주문 상세 데이터
const MOCK_ORDER: OrderDetail = {
  id: '1',
  orderNumber: 'ORD-001',
  customerName: '김**',
  customerPhone: '010-1234-5678',
  items: [
    { name: '황금올리브 치킨', quantity: 1, price: 19000 },
    { name: '콜라 1.25L', quantity: 1, price: 2500 },
    { name: '치즈볼', quantity: 1, options: '5개', price: 5000 },
  ],
  totalAmount: 26500,
  deliveryFee: 3000,
  platformFee: 500,
  deliveryAddress: '서울시 강남구 역삼동 123-45 래미안아파트 101동 1001호',
  deliveryRequest: '문 앞에 놔주세요. 벨 누르지 말아주세요.',
  storeRequest: '치킨 바삭하게 해주세요',
  status: 'pending',
  createdAt: '2024-12-09T10:45:00',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '주문 대기중',
  accepted: '주문 접수됨',
  cooking: '조리중',
  ready: '조리 완료',
  picked_up: '픽업 완료',
  delivered: '배달 완료',
  cancelled: '주문 취소됨',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-[var(--color-error-500)]',
  accepted: 'text-[var(--color-info-500)]',
  cooking: 'text-[var(--color-warning-500)]',
  ready: 'text-[var(--color-success-500)]',
  picked_up: 'text-[var(--color-success-500)]',
  delivered: 'text-[var(--color-neutral-500)]',
  cancelled: 'text-[var(--color-neutral-400)]',
}

export default function OwnerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState(MOCK_ORDER)
  const [cookingTime, setCookingTime] = useState(20)
  const [showTimeModal, setShowTimeModal] = useState(false)

  const handleAccept = () => {
    setShowTimeModal(true)
  }

  const handleConfirmAccept = () => {
    setOrder((prev) => ({
      ...prev,
      status: 'cooking',
      acceptedAt: new Date().toISOString(),
      estimatedTime: cookingTime,
    }))
    setShowTimeModal(false)
    alert(`주문을 접수했습니다. 예상 조리시간: ${cookingTime}분`)
  }

  const handleReject = () => {
    if (confirm('주문을 거절하시겠습니까?\n거절 사유를 선택해야 합니다.')) {
      alert('주문 거절 처리 (개발 중)')
      router.push('/owner/orders')
    }
  }

  const handleComplete = () => {
    setOrder((prev) => ({ ...prev, status: 'ready' }))
    alert('조리가 완료되었습니다. 라이더가 픽업 예정입니다.')
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/owner/orders" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            주문 상세
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 주문 상태 */}
        <section className="bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg text-[var(--color-neutral-900)]">
              {order.orderNumber}
            </span>
            <span className={`font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">
            <Clock className="w-4 h-4" />
            <span>주문시간: {formatTime(order.createdAt)}</span>
          </div>
          {order.estimatedTime && order.status === 'cooking' && (
            <div className="mt-2 p-3 bg-[var(--color-warning-50)] rounded-xl">
              <p className="text-sm font-medium text-[var(--color-warning-600)]">
                예상 조리시간: {order.estimatedTime}분
              </p>
            </div>
          )}
        </section>

        {/* 고객 정보 */}
        <section className="mt-3 bg-white p-4">
          <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">고객 정보</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[var(--color-neutral-400)]" />
              <span className="text-[var(--color-neutral-700)]">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[var(--color-neutral-400)]" />
              <a href={`tel:${order.customerPhone}`} className="text-[var(--color-primary-500)]">
                {order.customerPhone}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--color-neutral-400)] mt-0.5" />
              <span className="text-[var(--color-neutral-700)]">{order.deliveryAddress}</span>
            </div>
          </div>
        </section>

        {/* 요청사항 */}
        {(order.storeRequest || order.deliveryRequest) && (
          <section className="mt-3 bg-white p-4">
            <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">요청사항</h2>
            {order.storeRequest && (
              <div className="mb-3">
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">가게 요청사항</p>
                <p className="text-[var(--color-neutral-800)] p-3 bg-[var(--color-warning-50)] rounded-xl">
                  {order.storeRequest}
                </p>
              </div>
            )}
            {order.deliveryRequest && (
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">배달 요청사항</p>
                <p className="text-[var(--color-neutral-700)] p-3 bg-[var(--color-neutral-50)] rounded-xl">
                  {order.deliveryRequest}
                </p>
              </div>
            )}
          </section>
        )}

        {/* 주문 내역 */}
        <section className="mt-3 bg-white p-4">
          <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">주문 내역</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <span className="text-[var(--color-neutral-800)]">{item.name}</span>
                  {item.options && (
                    <span className="text-sm text-[var(--color-neutral-500)] ml-2">
                      ({item.options})
                    </span>
                  )}
                  <span className="text-[var(--color-neutral-500)] ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium text-[var(--color-neutral-900)]">
                  {item.price.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>

          {/* 금액 정산 */}
          <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-neutral-500)]">상품금액</span>
              <span className="text-[var(--color-neutral-700)]">{order.totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-neutral-500)]">배달비</span>
              <span className="text-[var(--color-neutral-700)]">{order.deliveryFee.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-neutral-500)]">플랫폼 수수료</span>
              <span className="text-[var(--color-error-500)]">-{order.platformFee.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-100)]">
              <span className="font-bold text-[var(--color-neutral-900)]">정산 예정금액</span>
              <span className="font-bold text-lg text-[var(--color-primary-500)]">
                {(order.totalAmount - order.platformFee).toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        {/* 라이더 정보 */}
        {order.rider && (
          <section className="mt-3 bg-white p-4">
            <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">배달 라이더</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                  <span className="text-lg">🛵</span>
                </div>
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">{order.rider.name}</p>
                  <p className="text-sm text-[var(--color-neutral-500)]">{order.rider.phone}</p>
                </div>
              </div>
              <a
                href={`tel:${order.rider.phone}`}
                className="w-10 h-10 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center"
              >
                <Phone className="w-5 h-5 text-[var(--color-primary-500)]" />
              </a>
            </div>
          </section>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
        {order.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="flex-1 py-4 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
            >
              주문 거절
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-4 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              주문 접수
            </button>
          </div>
        )}
        {order.status === 'cooking' && (
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-[var(--color-success-500)] text-white font-semibold rounded-xl"
          >
            조리 완료
          </button>
        )}
        {(order.status === 'ready' || order.status === 'picked_up') && (
          <div className="text-center py-4 text-[var(--color-neutral-500)]">
            라이더가 픽업 예정입니다
          </div>
        )}
      </div>

      {/* 조리시간 선택 모달 */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <h3 className="font-bold text-lg text-[var(--color-neutral-900)] mb-4">
              예상 조리시간 설정
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[10, 15, 20, 25, 30, 40, 50, 60].map((time) => (
                <button
                  key={time}
                  onClick={() => setCookingTime(time)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    cookingTime === time
                      ? 'bg-[var(--color-primary-500)] text-white'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]'
                  }`}
                >
                  {time}분
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTimeModal(false)}
                className="flex-1 py-4 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAccept}
                className="flex-1 py-4 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
              >
                접수하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
