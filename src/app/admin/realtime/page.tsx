'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bike,
  MapPin,
  Package,
  Clock,
  TrendingUp,
  RefreshCw,
  CircleDot,
  Store,
  User,
  Navigation2,
} from 'lucide-react'

interface ActiveOrder {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering'
  restaurant: string
  customer: string
  address: string
  createdAt: string
  estimatedDelivery: string
}

interface ActiveRider {
  id: string
  name: string
  status: 'available' | 'delivering' | 'offline'
  currentOrder?: string
  location: {
    lat: number
    lng: number
  }
  lastUpdate: string
}

interface RealtimeStats {
  activeOrders: number
  preparingOrders: number
  deliveringOrders: number
  availableRiders: number
  deliveringRiders: number
  avgDeliveryTime: number
}

// Mock 데이터
const MOCK_STATS: RealtimeStats = {
  activeOrders: 47,
  preparingOrders: 23,
  deliveringOrders: 24,
  availableRiders: 35,
  deliveringRiders: 24,
  avgDeliveryTime: 28,
}

const MOCK_ORDERS: ActiveOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-12850',
    status: 'pending',
    restaurant: 'BBQ 치킨 강남점',
    customer: '김민수',
    address: '서울시 강남구 삼성동',
    createdAt: '2024-12-09T14:45:00',
    estimatedDelivery: '2024-12-09T15:15:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-12849',
    status: 'preparing',
    restaurant: '맘스터치 논현점',
    customer: '이영희',
    address: '서울시 강남구 논현동',
    createdAt: '2024-12-09T14:40:00',
    estimatedDelivery: '2024-12-09T15:10:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-12848',
    status: 'delivering',
    restaurant: '도미노피자 삼성점',
    customer: '정수진',
    address: '서울시 강남구 대치동',
    createdAt: '2024-12-09T14:30:00',
    estimatedDelivery: '2024-12-09T15:00:00',
  },
  {
    id: '4',
    orderNumber: 'ORD-12847',
    status: 'delivering',
    restaurant: '교촌치킨 선릉점',
    customer: '박철수',
    address: '서울시 강남구 역삼동',
    createdAt: '2024-12-09T14:25:00',
    estimatedDelivery: '2024-12-09T14:55:00',
  },
  {
    id: '5',
    orderNumber: 'ORD-12846',
    status: 'confirmed',
    restaurant: '버거킹 강남역점',
    customer: '최영수',
    address: '서울시 강남구 역삼동',
    createdAt: '2024-12-09T14:42:00',
    estimatedDelivery: '2024-12-09T15:12:00',
  },
]

const MOCK_RIDERS: ActiveRider[] = [
  {
    id: '1',
    name: '김라이더',
    status: 'delivering',
    currentOrder: 'ORD-12848',
    location: { lat: 37.5085, lng: 127.0632 },
    lastUpdate: '2024-12-09T14:48:00',
  },
  {
    id: '2',
    name: '박배달',
    status: 'delivering',
    currentOrder: 'ORD-12847',
    location: { lat: 37.5012, lng: 127.0396 },
    lastUpdate: '2024-12-09T14:47:30',
  },
  {
    id: '3',
    name: '이퀵',
    status: 'available',
    location: { lat: 37.4979, lng: 127.0276 },
    lastUpdate: '2024-12-09T14:46:00',
  },
  {
    id: '4',
    name: '최빠른',
    status: 'available',
    location: { lat: 37.5045, lng: 127.0490 },
    lastUpdate: '2024-12-09T14:45:00',
  },
  {
    id: '5',
    name: '정안전',
    status: 'offline',
    location: { lat: 37.4950, lng: 127.0350 },
    lastUpdate: '2024-12-09T13:30:00',
  },
]

export default function AdminRealtimePage() {
  const [stats] = useState(MOCK_STATS)
  const [orders] = useState(MOCK_ORDERS)
  const [riders] = useState(MOCK_RIDERS)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [view, setView] = useState<'orders' | 'riders'>('orders')

  // 자동 새로고침 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--color-warning-500)]'
      case 'confirmed':
        return 'bg-[var(--color-info-500)]'
      case 'preparing':
        return 'bg-[var(--color-primary-500)]'
      case 'delivering':
        return 'bg-[var(--color-success-500)]'
      default:
        return 'bg-[var(--color-neutral-400)]'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기'
      case 'confirmed':
        return '접수'
      case 'preparing':
        return '조리'
      case 'delivering':
        return '배달'
      default:
        return status
    }
  }

  const getRiderStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-[var(--color-success-500)]'
      case 'delivering':
        return 'text-[var(--color-primary-500)]'
      case 'offline':
        return 'text-[var(--color-neutral-400)]'
      default:
        return ''
    }
  }

  const getRiderStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return '대기중'
      case 'delivering':
        return '배달중'
      case 'offline':
        return '오프라인'
      default:
        return status
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diff < 1) return '방금'
    return `${diff}분 전`
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-900)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-[var(--color-neutral-800)] border-b border-[var(--color-neutral-700)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-white">
            실시간 모니터링
          </h1>
          <button
            onClick={() => setLastRefresh(new Date())}
            className="w-10 h-10 flex items-center justify-center -mr-2"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="px-4 pb-2 text-xs text-[var(--color-neutral-400)]">
          마지막 업데이트: {lastRefresh.toLocaleTimeString('ko-KR')}
        </div>
      </header>

      <main className="pb-20">
        {/* 실시간 통계 */}
        <section className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {/* 활성 주문 */}
            <div className="bg-[var(--color-neutral-800)] rounded-xl p-4 text-center">
              <Package className="w-6 h-6 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.activeOrders}</p>
              <p className="text-xs text-[var(--color-neutral-400)]">활성 주문</p>
            </div>

            {/* 배달중 라이더 */}
            <div className="bg-[var(--color-neutral-800)] rounded-xl p-4 text-center">
              <Bike className="w-6 h-6 text-[var(--color-success-500)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.deliveringRiders}</p>
              <p className="text-xs text-[var(--color-neutral-400)]">배달중</p>
            </div>

            {/* 평균 배달시간 */}
            <div className="bg-[var(--color-neutral-800)] rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-[var(--color-warning-500)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.avgDeliveryTime}분</p>
              <p className="text-xs text-[var(--color-neutral-400)]">평균 배달</p>
            </div>
          </div>

          {/* 상세 통계 */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-[var(--color-neutral-800)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary-500)]" />
              <div>
                <p className="text-sm text-[var(--color-neutral-400)]">조리중</p>
                <p className="text-lg font-bold text-white">{stats.preparingOrders}건</p>
              </div>
            </div>
            <div className="bg-[var(--color-neutral-800)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--color-success-500)]" />
              <div>
                <p className="text-sm text-[var(--color-neutral-400)]">배달중</p>
                <p className="text-lg font-bold text-white">{stats.deliveringOrders}건</p>
              </div>
            </div>
          </div>
        </section>

        {/* 지도 플레이스홀더 */}
        <section className="mx-4 h-48 bg-[var(--color-neutral-800)] rounded-xl flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-[var(--color-neutral-600)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-neutral-500)]">지도 영역</p>
            <p className="text-xs text-[var(--color-neutral-600)]">라이더 위치 실시간 표시</p>
          </div>
        </section>

        {/* 탭 전환 */}
        <div className="flex mx-4 mt-4 bg-[var(--color-neutral-800)] rounded-lg p-1">
          <button
            onClick={() => setView('orders')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'orders'
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'text-[var(--color-neutral-400)]'
            }`}
          >
            주문 현황
          </button>
          <button
            onClick={() => setView('riders')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'riders'
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'text-[var(--color-neutral-400)]'
            }`}
          >
            라이더 현황
          </button>
        </div>

        {/* 주문 목록 */}
        {view === 'orders' && (
          <section className="mt-4">
            <div className="px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--color-neutral-400)]">
                실시간 주문 ({orders.length})
              </h3>
            </div>
            <div className="space-y-2 px-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block bg-[var(--color-neutral-800)] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                      <span className="font-medium text-white">{order.orderNumber}</span>
                      <span className="text-xs text-[var(--color-neutral-500)]">
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-neutral-500)]">
                      {getTimeSince(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-400)]">
                    <Store className="w-4 h-4" />
                    <span>{order.restaurant}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-400)] mt-1">
                    <Navigation2 className="w-4 h-4" />
                    <span>{order.address}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-[var(--color-neutral-500)]">
                      <User className="w-3 h-3 inline mr-1" />
                      {order.customer}
                    </span>
                    <span className="text-[var(--color-primary-400)]">
                      예상: {formatTime(order.estimatedDelivery)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 라이더 목록 */}
        {view === 'riders' && (
          <section className="mt-4">
            <div className="px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--color-neutral-400)]">
                라이더 현황 ({riders.filter(r => r.status !== 'offline').length}명 활동중)
              </h3>
            </div>
            <div className="space-y-2 px-4">
              {riders.map((rider) => (
                <Link
                  key={rider.id}
                  href={`/admin/users/riders/${rider.id}`}
                  className="block bg-[var(--color-neutral-800)] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rider.status === 'offline'
                          ? 'bg-[var(--color-neutral-700)]'
                          : 'bg-[var(--color-neutral-700)]'
                      }`}>
                        <Bike className={`w-5 h-5 ${getRiderStatusColor(rider.status)}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{rider.name}</p>
                        <p className={`text-sm ${getRiderStatusColor(rider.status)}`}>
                          {getRiderStatusLabel(rider.status)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {rider.currentOrder && (
                        <p className="text-sm text-[var(--color-primary-400)]">
                          {rider.currentOrder}
                        </p>
                      )}
                      <p className="text-xs text-[var(--color-neutral-500)]">
                        {getTimeSince(rider.lastUpdate)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
