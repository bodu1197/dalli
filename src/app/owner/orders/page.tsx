'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Clock, MapPin } from 'lucide-react'

interface OwnerOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  items: { name: string; quantity: number; options?: string; price: number }[]
  totalAmount: number
  deliveryFee: number
  deliveryAddress: string
  deliveryRequest?: string
  status: 'pending' | 'accepted' | 'cooking' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  createdAt: string
  estimatedTime?: number
}

// Mock 주문 데이터
const MOCK_ORDERS: OwnerOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: '김**',
    customerPhone: '010-****-1234',
    items: [
      { name: '황금올리브 치킨', quantity: 1, price: 19000 },
      { name: '콜라 1.25L', quantity: 1, price: 2500 },
    ],
    totalAmount: 21500,
    deliveryFee: 3000,
    deliveryAddress: '서울시 강남구 역삼동 123-45',
    deliveryRequest: '문 앞에 놔주세요',
    status: 'pending',
    createdAt: '2024-12-09T10:45:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: '이**',
    customerPhone: '010-****-5678',
    items: [
      { name: '양념치킨', quantity: 1, price: 19000 },
      { name: '치즈볼', quantity: 1, options: '5개', price: 5000 },
    ],
    totalAmount: 24000,
    deliveryFee: 3000,
    deliveryAddress: '서울시 강남구 삼성동 456-78',
    status: 'pending',
    createdAt: '2024-12-09T10:42:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: '박**',
    customerPhone: '010-****-9012',
    items: [
      { name: '후라이드 반 + 양념 반', quantity: 1, price: 20000 },
    ],
    totalAmount: 20000,
    deliveryFee: 3000,
    deliveryAddress: '서울시 강남구 대치동 789-01',
    status: 'cooking',
    createdAt: '2024-12-09T10:35:00',
    estimatedTime: 15,
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customerName: '최**',
    customerPhone: '010-****-3456',
    items: [
      { name: '간장치킨', quantity: 1, price: 19000 },
    ],
    totalAmount: 19000,
    deliveryFee: 3000,
    deliveryAddress: '서울시 강남구 청담동 234-56',
    status: 'ready',
    createdAt: '2024-12-09T10:20:00',
  },
]

type TabType = 'pending' | 'cooking' | 'ready' | 'completed'

const TAB_LABELS: Record<TabType, string> = {
  pending: '대기',
  cooking: '조리중',
  ready: '완료',
  completed: '전체',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  accepted: '접수됨',
  cooking: '조리중',
  ready: '조리완료',
  picked_up: '픽업완료',
  delivered: '배달완료',
  cancelled: '취소됨',
}

export default function OwnerOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending')

  const filterOrders = (tab: TabType) => {
    switch (tab) {
      case 'pending':
        return MOCK_ORDERS.filter((o) => o.status === 'pending')
      case 'cooking':
        return MOCK_ORDERS.filter((o) => o.status === 'cooking' || o.status === 'accepted')
      case 'ready':
        return MOCK_ORDERS.filter((o) => o.status === 'ready' || o.status === 'picked_up')
      case 'completed':
        return MOCK_ORDERS
    }
  }

  const orders = filterOrders(activeTab)
  const pendingCount = MOCK_ORDERS.filter((o) => o.status === 'pending').length
  const cookingCount = MOCK_ORDERS.filter((o) => ['cooking', 'accepted'].includes(o.status)).length
  const readyCount = MOCK_ORDERS.filter((o) => ['ready', 'picked_up'].includes(o.status)).length

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/owner" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            주문 관리
          </h1>
          <Link href="/owner/notifications" className="w-10 h-10 flex items-center justify-center -mr-2 relative">
            <Bell className="w-5 h-5 text-[var(--color-neutral-500)]" />
          </Link>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-[var(--color-neutral-100)]">
          {(['pending', 'cooking', 'ready', 'completed'] as TabType[]).map((tab) => {
            const getCount = (): number | null => {
              if (tab === 'pending') return pendingCount
              if (tab === 'cooking') return cookingCount
              if (tab === 'ready') return readyCount
              return null
            }
            const count = getCount()

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors relative ${
                  activeTab === tab
                    ? 'text-[var(--color-primary-500)] border-[var(--color-primary-500)]'
                    : 'text-[var(--color-neutral-400)] border-transparent'
                }`}
              >
                {TAB_LABELS[tab]}
                {count !== null && count > 0 && (
                  <span className="ml-1 text-xs bg-[var(--color-error-500)] text-white px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* 주문 목록 */}
      <main className="pb-20">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-[var(--color-neutral-500)]">
              {activeTab === 'pending' ? '대기 중인 주문이 없습니다' : '주문이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function OrderCard({ order }: Readonly<{ order: OwnerOrder }>) {
  const timeAgo = () => {
    const now = new Date()
    const created = new Date(order.createdAt)
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
    if (diff < 60) return `${diff}분 전`
    return `${Math.floor(diff / 60)}시간 전`
  }

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault()
    alert('주문을 접수합니다 (개발 중)')
  }

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('주문을 거절하시겠습니까?')) {
      alert('주문 거절 처리 (개발 중)')
    }
  }

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault()
    alert('조리 완료 처리 (개발 중)')
  }

  const getStatusBadgeClass = (): string => {
    if (order.status === 'pending') {
      return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
    }
    if (order.status === 'cooking') {
      return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
    }
    return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
  }

  return (
    <Link href={`/owner/orders/${order.id}`} className="block bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[var(--color-neutral-900)]">{order.orderNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass()}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">
          <Clock className="w-4 h-4" />
          <span>{timeAgo()}</span>
        </div>
      </div>

      {/* 주문 내역 */}
      <div className="p-4">
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={`${item.name}-${item.quantity}`} className="flex items-center justify-between">
              <div>
                <span className="text-[var(--color-neutral-800)]">{item.name}</span>
                {item.options && (
                  <span className="text-sm text-[var(--color-neutral-500)] ml-2">
                    ({item.options})
                  </span>
                )}
                <span className="text-[var(--color-neutral-500)] ml-2">x{item.quantity}</span>
              </div>
              <span className="text-[var(--color-neutral-700)]">{item.price.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        {/* 배달 정보 */}
        <div className="pt-3 border-t border-[var(--color-neutral-100)] space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[var(--color-neutral-400)] mt-0.5" />
            <span className="text-[var(--color-neutral-600)]">{order.deliveryAddress}</span>
          </div>
          {order.deliveryRequest && (
            <p className="text-sm text-[var(--color-neutral-500)] pl-6">
              요청사항: {order.deliveryRequest}
            </p>
          )}
        </div>

        {/* 금액 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-neutral-100)]">
          <span className="text-[var(--color-neutral-500)]">총 결제금액</span>
          <span className="font-bold text-lg text-[var(--color-neutral-900)]">
            {(order.totalAmount + order.deliveryFee).toLocaleString()}원
          </span>
        </div>

        {/* 액션 버튼 */}
        {order.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleReject}
              className="flex-1 py-3 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
            >
              거절
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              접수하기
            </button>
          </div>
        )}

        {order.status === 'cooking' && (
          <button
            onClick={handleComplete}
            className="w-full mt-4 py-3 bg-[var(--color-success-500)] text-white font-semibold rounded-xl"
          >
            조리 완료
          </button>
        )}
      </div>
    </Link>
  )
}
