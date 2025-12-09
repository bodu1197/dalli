'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Store,
  User,
  CreditCard,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
  customer: {
    name: string
    phone: string
    address: string
    detail: string
    request: string
  }
  restaurant: {
    id: string
    name: string
    phone: string
    address: string
  }
  rider?: {
    id: string
    name: string
    phone: string
  }
  items: {
    name: string
    quantity: number
    price: number
    options?: string[]
  }[]
  payment: {
    method: string
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  timeline: {
    status: string
    time: string
    description: string
  }[]
  createdAt: string
  cancelledReason?: string
}

// Mock 데이터
const MOCK_ORDER: OrderDetail = {
  id: '1',
  orderNumber: 'ORD-12847',
  status: 'delivering',
  customer: {
    name: '김민수',
    phone: '010-1234-5678',
    address: '서울시 강남구 삼성동 래미안아파트',
    detail: '101동 1501호',
    request: '문 앞에 놓아주세요',
  },
  restaurant: {
    id: 'r1',
    name: 'BBQ 치킨 강남점',
    phone: '02-1234-5678',
    address: '서울시 강남구 역삼동 123-45',
  },
  rider: {
    id: 'rd1',
    name: '박철수',
    phone: '010-9876-5432',
  },
  items: [
    { name: '황금올리브치킨', quantity: 1, price: 21000, options: ['순살', '양념추가'] },
    { name: '치즈볼', quantity: 1, price: 5000 },
    { name: '콜라 1.25L', quantity: 1, price: 2000 },
  ],
  payment: {
    method: '카카오페이',
    subtotal: 28000,
    deliveryFee: 3000,
    discount: -3000,
    total: 28000,
  },
  timeline: [
    { status: 'pending', time: '14:30:15', description: '주문 접수' },
    { status: 'confirmed', time: '14:31:20', description: '가게 주문 확인' },
    { status: 'preparing', time: '14:32:05', description: '조리 시작' },
    { status: 'ready', time: '14:50:30', description: '조리 완료' },
    { status: 'delivering', time: '14:52:10', description: '라이더 픽업 완료' },
  ],
  createdAt: '2024-12-09T14:30:15',
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const [order] = useState(MOCK_ORDER)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[var(--color-warning-500)]" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-[var(--color-info-500)]" />
      case 'preparing':
        return <Package className="w-5 h-5 text-[var(--color-primary-500)]" />
      case 'delivering':
        return <Truck className="w-5 h-5 text-[var(--color-success-500)]" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-[var(--color-error-500)]" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중'
      case 'confirmed':
        return '접수됨'
      case 'preparing':
        return '조리중'
      case 'ready':
        return '조리완료'
      case 'delivering':
        return '배달중'
      case 'completed':
        return '완료'
      case 'cancelled':
        return '취소'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
      case 'confirmed':
        return 'bg-[var(--color-info-100)] text-[var(--color-info-600)]'
      case 'preparing':
      case 'ready':
        return 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
      case 'delivering':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'completed':
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
      case 'cancelled':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin/orders" className="w-10 h-10 flex items-center justify-center -ml-2">
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
        <section className="p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-neutral-900)]">
                {order.orderNumber}
              </h2>
              <p className="text-sm text-[var(--color-neutral-500)]">
                {new Date(order.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
            <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* 타임라인 */}
          <div className="border-t border-[var(--color-neutral-100)] pt-4">
            <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">주문 진행</h3>
            <div className="space-y-3">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${
                    index === order.timeline.length - 1
                      ? 'bg-[var(--color-primary-500)]'
                      : 'bg-[var(--color-neutral-300)]'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                      {item.description}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-400)]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 고객 정보 */}
        <section className="mt-2 p-4 bg-white">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            <User className="w-5 h-5 inline mr-2" />
            고객 정보
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-500)]">이름</span>
              <span className="font-medium">{order.customer.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-500)]">연락처</span>
              <a href={`tel:${order.customer.phone}`} className="font-medium text-[var(--color-primary-500)]">
                {order.customer.phone}
              </a>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-[var(--color-neutral-500)]">배달주소</span>
              <div className="text-right">
                <p className="font-medium">{order.customer.address}</p>
                <p className="text-sm text-[var(--color-neutral-500)]">{order.customer.detail}</p>
              </div>
            </div>
            {order.customer.request && (
              <div className="flex items-start justify-between">
                <span className="text-[var(--color-neutral-500)]">요청사항</span>
                <span className="font-medium text-right">{order.customer.request}</span>
              </div>
            )}
          </div>
        </section>

        {/* 가게 정보 */}
        <section className="mt-2 p-4 bg-white">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            <Store className="w-5 h-5 inline mr-2" />
            가게 정보
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-500)]">가게명</span>
              <Link href={`/admin/stores/${order.restaurant.id}`} className="font-medium text-[var(--color-primary-500)]">
                {order.restaurant.name}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-neutral-500)]">연락처</span>
              <a href={`tel:${order.restaurant.phone}`} className="font-medium text-[var(--color-primary-500)]">
                {order.restaurant.phone}
              </a>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-[var(--color-neutral-500)]">주소</span>
              <span className="font-medium text-right">{order.restaurant.address}</span>
            </div>
          </div>
        </section>

        {/* 라이더 정보 */}
        {order.rider && (
          <section className="mt-2 p-4 bg-white">
            <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
              <Truck className="w-5 h-5 inline mr-2" />
              라이더 정보
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-neutral-500)]">이름</span>
                <Link href={`/admin/users/riders/${order.rider.id}`} className="font-medium text-[var(--color-primary-500)]">
                  {order.rider.name}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-neutral-500)]">연락처</span>
                <a href={`tel:${order.rider.phone}`} className="font-medium text-[var(--color-primary-500)]">
                  {order.rider.phone}
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 주문 내역 */}
        <section className="mt-2 p-4 bg-white">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            <Package className="w-5 h-5 inline mr-2" />
            주문 내역
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">
                    {item.name} x {item.quantity}
                  </p>
                  {item.options && item.options.length > 0 && (
                    <p className="text-sm text-[var(--color-neutral-500)]">
                      옵션: {item.options.join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </section>

        {/* 결제 정보 */}
        <section className="mt-2 p-4 bg-white">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            <CreditCard className="w-5 h-5 inline mr-2" />
            결제 정보
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-neutral-500)]">주문금액</span>
              <span>{order.payment.subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-neutral-500)]">배달비</span>
              <span>{order.payment.deliveryFee.toLocaleString()}원</span>
            </div>
            {order.payment.discount !== 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-neutral-500)]">할인</span>
                <span className="text-[var(--color-error-500)]">{order.payment.discount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutral-100)]">
              <span className="font-semibold">총 결제금액</span>
              <span className="font-bold text-lg">{order.payment.total.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-neutral-500)]">결제수단</span>
              <span>{order.payment.method}</span>
            </div>
          </div>
        </section>
      </main>

      {/* 하단 액션 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
        <div className="flex gap-3">
          <Link
            href={`/chat/order/${order.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-700)] font-medium"
          >
            <MessageSquare className="w-5 h-5" />
            채팅방 보기
          </Link>
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-error-500)] text-white rounded-xl font-medium"
            >
              <XCircle className="w-5 h-5" />
              주문 취소
            </button>
          )}
        </div>
      </div>

      {/* 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[var(--color-neutral-900)] mb-2">
              주문을 취소하시겠습니까?
            </h3>
            <p className="text-sm text-[var(--color-neutral-500)] mb-4">
              취소 시 고객에게 자동으로 환불 처리됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-[var(--color-neutral-200)] rounded-xl font-medium"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  // 취소 처리 로직
                  setShowCancelModal(false)
                }}
                className="flex-1 py-3 bg-[var(--color-error-500)] text-white rounded-xl font-medium"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
