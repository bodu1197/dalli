'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
} from 'lucide-react'

interface OrderItem {
  id: string
  orderNumber: string
  customerName: string
  restaurantName: string
  riderName?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
  totalAmount: number
  orderTime: string
  deliveryAddress: string
}

// Mock 데이터
const MOCK_ORDERS: OrderItem[] = [
  {
    id: '1',
    orderNumber: 'ORD-12847',
    customerName: '김민수',
    restaurantName: 'BBQ 치킨 강남점',
    riderName: '박철수',
    status: 'delivering',
    totalAmount: 28000,
    orderTime: '2024-12-09T14:30:00',
    deliveryAddress: '서울시 강남구 삼성동 래미안아파트 101동',
  },
  {
    id: '2',
    orderNumber: 'ORD-12846',
    customerName: '이영희',
    restaurantName: '맘스터치 논현점',
    status: 'preparing',
    totalAmount: 15500,
    orderTime: '2024-12-09T14:25:00',
    deliveryAddress: '서울시 강남구 논현동 현대아파트 203호',
  },
  {
    id: '3',
    orderNumber: 'ORD-12845',
    customerName: '정수진',
    restaurantName: '도미노피자 삼성점',
    riderName: '김라이더',
    status: 'completed',
    totalAmount: 35000,
    orderTime: '2024-12-09T13:45:00',
    deliveryAddress: '서울시 강남구 대치동 은마아파트 505호',
  },
  {
    id: '4',
    orderNumber: 'ORD-12844',
    customerName: '최영수',
    restaurantName: '신전떡볶이 역삼점',
    status: 'cancelled',
    totalAmount: 12000,
    orderTime: '2024-12-09T13:30:00',
    deliveryAddress: '서울시 강남구 역삼동 123-45',
  },
  {
    id: '5',
    orderNumber: 'ORD-12843',
    customerName: '박지민',
    restaurantName: '교촌치킨 선릉점',
    status: 'pending',
    totalAmount: 22000,
    orderTime: '2024-12-09T14:35:00',
    deliveryAddress: '서울시 강남구 역삼동 456-78',
  },
  {
    id: '6',
    orderNumber: 'ORD-12842',
    customerName: '김철호',
    restaurantName: '버거킹 강남역점',
    riderName: '이배달',
    status: 'confirmed',
    totalAmount: 18500,
    orderTime: '2024-12-09T14:20:00',
    deliveryAddress: '서울시 강남구 역삼동 789-12',
  },
]

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'

export default function AdminOrdersPage() {
  const [orders] = useState(MOCK_ORDERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-[var(--color-warning-500)]" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-[var(--color-info-500)]" />
      case 'preparing':
        return <Package className="w-4 h-4 text-[var(--color-primary-500)]" />
      case 'delivering':
        return <Truck className="w-4 h-4 text-[var(--color-success-500)]" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-[var(--color-success-500)]" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-[var(--color-error-500)]" />
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    delivering: orders.filter((o) => o.status === 'delivering').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            주문 관리
          </h1>
          <div className="w-10" />
        </div>

        {/* 검색 */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주문번호, 고객명, 가게명 검색"
              aria-label="주문 검색"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {(['all', 'pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
              }`}
            >
              {status === 'all' ? '전체' : getStatusLabel(status)}
              <span className="ml-1 text-xs">({statusCounts[status]})</span>
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 긴급 알림 */}
        {statusCounts.pending > 0 && statusFilter === 'all' && (
          <div className="mx-4 mt-4 p-4 bg-[var(--color-warning-50)] rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
              <span className="text-sm font-medium text-[var(--color-warning-700)]">
                미확인 주문 {statusCounts.pending}건이 대기중입니다
              </span>
            </div>
          </div>
        )}

        {/* 주문 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)] mt-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--color-neutral-900)]">
                      {order.orderNumber}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                    {order.restaurantName} → {order.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--color-neutral-900)]">
                    {order.totalAmount.toLocaleString()}원
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)]">
                    {formatDate(order.orderTime)} {formatTime(order.orderTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--color-neutral-500)] truncate flex-1 mr-4">
                  {order.deliveryAddress}
                </p>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </div>

              {order.riderName && (
                <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-success-600)]">
                  <Truck className="w-4 h-4" />
                  <span>라이더: {order.riderName}</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredOrders.length === 0 && (
          <div className="py-16 text-center bg-white">
            <Package className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">검색 결과가 없습니다</p>
          </div>
        )}
      </main>
    </div>
  )
}
