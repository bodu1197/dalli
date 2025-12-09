'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'

import { MOCK_ORDERS, getActiveOrders, getCompletedOrders } from '@/lib/mock/orders'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/types/order.types'
import type { Order } from '@/types/order.types'

type TabType = 'active' | 'completed'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active')

  const activeOrders = getActiveOrders()
  const completedOrders = getCompletedOrders()

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            주문내역
          </h1>
          <div className="w-10" />
        </div>

        {/* 탭 */}
        <div className="flex border-b border-[var(--color-neutral-100)]">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
                : 'text-[var(--color-neutral-400)] border-transparent'
            }`}
          >
            진행중 {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
                : 'text-[var(--color-neutral-400)] border-transparent'
            }`}
          >
            완료
          </button>
        </div>
      </header>

      <main className="pb-20">
        {displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-6xl mb-4">
              {activeTab === 'active' ? '🛵' : '📋'}
            </div>
            <p className="text-[var(--color-neutral-500)] mb-6">
              {activeTab === 'active'
                ? '진행 중인 주문이 없습니다'
                : '완료된 주문이 없습니다'}
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              맛집 구경하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const statusColor = ORDER_STATUS_COLORS[order.status]
  const statusLabel = ORDER_STATUS_LABELS[order.status]
  const orderDate = new Date(order.createdAt).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const isActive = !['delivered', 'cancelled'].includes(order.status)

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm"
    >
      {/* 상단: 날짜 + 상태 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--color-neutral-500)]">
          {orderDate}
        </span>
        <span className={`text-sm font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* 가게 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-1">
            {order.restaurantName}
          </h3>
          <p className="text-sm text-[var(--color-neutral-500)] truncate">
            {order.items.map((item) => item.menuName).join(', ')}
          </p>
          <p className="text-sm font-medium text-[var(--color-neutral-900)] mt-1">
            {(order.totalAmount + order.deliveryFee).toLocaleString()}원
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)] flex-shrink-0" />
      </div>

      {/* 진행 중인 주문: 추적 버튼 */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)]">
          <Link
            href={`/orders/${order.id}/tracking`}
            className="block w-full py-3 text-center bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            배달 현황 보기
          </Link>
        </div>
      )}

      {/* 완료된 주문: 리뷰/재주문 버튼 */}
      {order.status === 'delivered' && (
        <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)] flex gap-2">
          <Link
            href={`/orders/${order.id}/review`}
            className="flex-1 py-3 text-center border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            리뷰 쓰기
          </Link>
          <button
            className="flex-1 py-3 text-center bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // TODO: 재주문 기능
              alert('재주문 기능 준비 중입니다')
            }}
          >
            재주문
          </button>
        </div>
      )}
    </Link>
  )
}
