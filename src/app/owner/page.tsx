'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Bell,
  Menu,
  Store,
  BarChart3,
  Settings,
  MessageCircle,
} from 'lucide-react'

interface DashboardStats {
  todaySales: number
  todayOrders: number
  pendingOrders: number
  avgRating: number
  newReviews: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  items: string[]
  totalAmount: number
  status: 'pending' | 'accepted' | 'cooking' | 'ready' | 'picked_up'
  createdAt: string
}

// Mock 데이터
const MOCK_STATS: DashboardStats = {
  todaySales: 523000,
  todayOrders: 28,
  pendingOrders: 3,
  avgRating: 4.7,
  newReviews: 5,
}

const MOCK_RECENT_ORDERS: RecentOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: '김**',
    items: ['황금올리브 치킨', '콜라 1.25L'],
    totalAmount: 23000,
    status: 'pending',
    createdAt: '2024-12-09T10:45:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: '이**',
    items: ['양념치킨', '치즈볼'],
    totalAmount: 27000,
    status: 'pending',
    createdAt: '2024-12-09T10:42:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: '박**',
    items: ['후라이드 반 + 양념 반'],
    totalAmount: 20000,
    status: 'cooking',
    createdAt: '2024-12-09T10:35:00',
  },
]

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  accepted: '접수됨',
  cooking: '조리중',
  ready: '조리완료',
  picked_up: '픽업완료',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-[var(--color-error-500)]',
  accepted: 'bg-[var(--color-info-500)]',
  cooking: 'bg-[var(--color-warning-500)]',
  ready: 'bg-[var(--color-success-500)]',
  picked_up: 'bg-[var(--color-neutral-400)]',
}

export default function OwnerDashboardPage() {
  const [isOpen, setIsOpen] = useState(true)

  const quickMenus = [
    { icon: <ShoppingBag className="w-6 h-6" />, label: '주문관리', href: '/owner/orders', badge: MOCK_STATS.pendingOrders },
    { icon: <Menu className="w-6 h-6" />, label: '메뉴관리', href: '/owner/menus' },
    { icon: <Store className="w-6 h-6" />, label: '가게관리', href: '/owner/store' },
    { icon: <BarChart3 className="w-6 h-6" />, label: '매출통계', href: '/owner/stats' },
    { icon: <Star className="w-6 h-6" />, label: '리뷰관리', href: '/owner/reviews', badge: MOCK_STATS.newReviews },
    { icon: <Settings className="w-6 h-6" />, label: '설정', href: '/owner/settings' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="bg-[var(--color-primary-500)] text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="font-bold text-lg">BBQ 치킨 강남점</h1>
          <div className="flex items-center gap-2">
            <Link href="/owner/notifications" className="relative p-2">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error-500)] rounded-full" />
            </Link>
          </div>
        </div>

        {/* 영업 상태 토글 */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
            <div>
              <p className="text-sm opacity-80">현재 영업 상태</p>
              <p className="font-bold text-lg">
                {isOpen ? '영업중' : '영업종료'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isOpen ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-neutral-400)]'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isOpen ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* 오늘의 현황 */}
        <section className="px-4 -mt-2">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">
              오늘의 현황
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-primary-50)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[var(--color-primary-500)]" />
                  <span className="text-sm text-[var(--color-neutral-600)]">오늘 매출</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                  {MOCK_STATS.todaySales.toLocaleString()}원
                </p>
              </div>
              <div className="bg-[var(--color-info-50)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--color-info-500)]" />
                  <span className="text-sm text-[var(--color-neutral-600)]">주문 건수</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                  {MOCK_STATS.todayOrders}건
                </p>
              </div>
              <div className="bg-[var(--color-warning-50)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[var(--color-warning-500)]" />
                  <span className="text-sm text-[var(--color-neutral-600)]">평균 별점</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                  {MOCK_STATS.avgRating}
                </p>
              </div>
              <div className="bg-[var(--color-error-50)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-[var(--color-error-500)]" />
                  <span className="text-sm text-[var(--color-neutral-600)]">대기 주문</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                  {MOCK_STATS.pendingOrders}건
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">
              빠른 메뉴
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {quickMenus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-neutral-50)] transition-colors relative"
                >
                  <span className="text-[var(--color-primary-500)]">{menu.icon}</span>
                  <span className="text-sm text-[var(--color-neutral-700)]">{menu.label}</span>
                  {menu.badge && menu.badge > 0 && (
                    <span className="absolute top-1 right-1 min-w-5 h-5 bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {menu.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 신규 주문 */}
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-neutral-100)]">
              <h2 className="font-bold text-[var(--color-neutral-900)]">
                신규 주문
              </h2>
              <Link
                href="/owner/orders"
                className="text-sm text-[var(--color-primary-500)] font-medium flex items-center gap-1"
              >
                전체보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {MOCK_RECENT_ORDERS.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[var(--color-neutral-500)]">
                  신규 주문이 없습니다
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {MOCK_RECENT_ORDERS.map((order) => (
                  <Link
                    key={order.id}
                    href={`/owner/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--color-neutral-50)] transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[order.status]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--color-neutral-900)]">
                          {order.orderNumber}
                        </span>
                        <span className="text-sm text-[var(--color-neutral-500)]">
                          {order.customerName}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-neutral-600)] truncate">
                        {order.items.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--color-neutral-900)]">
                        {order.totalAmount.toLocaleString()}원
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'pending'
                          ? 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
                          : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                      }`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)]">
        <div className="flex items-center justify-around h-16">
          <Link href="/owner" className="flex flex-col items-center gap-1 text-[var(--color-primary-500)]">
            <Store className="w-6 h-6" />
            <span className="text-xs font-medium">홈</span>
          </Link>
          <Link href="/owner/orders" className="flex flex-col items-center gap-1 text-[var(--color-neutral-400)] relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs">주문</span>
            {MOCK_STATS.pendingOrders > 0 && (
              <span className="absolute -top-1 right-0 min-w-4 h-4 bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {MOCK_STATS.pendingOrders}
              </span>
            )}
          </Link>
          <Link href="/owner/menus" className="flex flex-col items-center gap-1 text-[var(--color-neutral-400)]">
            <Menu className="w-6 h-6" />
            <span className="text-xs">메뉴</span>
          </Link>
          <Link href="/owner/reviews" className="flex flex-col items-center gap-1 text-[var(--color-neutral-400)]">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">리뷰</span>
          </Link>
          <Link href="/owner/settings" className="flex flex-col items-center gap-1 text-[var(--color-neutral-400)]">
            <Settings className="w-6 h-6" />
            <span className="text-xs">설정</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
