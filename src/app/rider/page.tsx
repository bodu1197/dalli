'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Navigation,
  Package,
  Clock,
  DollarSign,
  Bell,
  Settings,
  ChevronRight,
  Power,
  Zap,
} from 'lucide-react'

interface TodayStats {
  deliveries: number
  earnings: number
  distance: number
  onlineHours: number
}

interface DeliveryRequest {
  id: string
  restaurantName: string
  pickupAddress: string
  deliveryAddress: string
  distance: number
  estimatedTime: number
  fee: number
  createdAt: string
}

// Mock 데이터
const MOCK_TODAY: TodayStats = {
  deliveries: 8,
  earnings: 72000,
  distance: 24.5,
  onlineHours: 5.5,
}

const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: '1',
    restaurantName: 'BBQ 치킨 강남점',
    pickupAddress: '서울시 강남구 역삼동 123-45',
    deliveryAddress: '서울시 강남구 삼성동 456-78',
    distance: 2.3,
    estimatedTime: 15,
    fee: 4500,
    createdAt: '2024-12-09T11:00:00',
  },
  {
    id: '2',
    restaurantName: '맘스터치 논현점',
    pickupAddress: '서울시 강남구 논현동 111-22',
    deliveryAddress: '서울시 강남구 신사동 333-44',
    distance: 1.8,
    estimatedTime: 12,
    fee: 4000,
    createdAt: '2024-12-09T11:02:00',
  },
]

export default function RiderHomePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [stats] = useState(MOCK_TODAY)
  const [requests] = useState(MOCK_REQUESTS)

  const quickMenus = [
    {
      icon: <Package className="w-6 h-6" />,
      label: '배달 요청',
      href: '/rider/requests',
      badge: requests.length,
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: '수입',
      href: '/rider/earnings',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: '배달 내역',
      href: '/rider/history',
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: '설정',
      href: '/rider/settings',
    },
  ]

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="bg-[var(--color-primary-500)] text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Navigation className="w-6 h-6" />
            <span className="font-bold text-lg">달리고 라이더</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative p-2">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error-500)] rounded-full" />
            </Link>
          </div>
        </div>

        {/* 온라인/오프라인 토글 */}
        <div className="px-4 pb-6 pt-2">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all ${
              isOnline
                ? 'bg-white text-[var(--color-primary-500)]'
                : 'bg-white/20 text-white'
            }`}
          >
            <Power className={`w-6 h-6 ${isOnline ? 'animate-pulse' : ''}`} />
            {isOnline ? '배달 가능' : '오프라인'}
          </button>
          <p className="text-center text-sm text-white/80 mt-2">
            {isOnline
              ? '배달 요청을 받을 수 있습니다'
              : '탭하여 배달을 시작하세요'}
          </p>
        </div>
      </header>

      <main className="pb-24">
        {/* 오늘 실적 */}
        <section className="px-4 -mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">오늘 실적</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[var(--color-neutral-50)] rounded-xl">
                <p className="text-2xl font-bold text-[var(--color-primary-500)]">
                  {stats.deliveries}건
                </p>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">배달 완료</p>
              </div>
              <div className="text-center p-3 bg-[var(--color-neutral-50)] rounded-xl">
                <p className="text-2xl font-bold text-[var(--color-success-500)]">
                  {stats.earnings.toLocaleString()}원
                </p>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">총 수입</p>
              </div>
              <div className="text-center p-3 bg-[var(--color-neutral-50)] rounded-xl">
                <p className="text-2xl font-bold text-[var(--color-neutral-800)]">
                  {stats.distance}km
                </p>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">이동 거리</p>
              </div>
              <div className="text-center p-3 bg-[var(--color-neutral-50)] rounded-xl">
                <p className="text-2xl font-bold text-[var(--color-neutral-800)]">
                  {stats.onlineHours}시간
                </p>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">근무 시간</p>
              </div>
            </div>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="px-4 mt-4">
          <div className="grid grid-cols-4 gap-3">
            {quickMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="relative flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm"
              >
                <span className="text-[var(--color-primary-500)]">{menu.icon}</span>
                <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                  {menu.label}
                </span>
                {menu.badge && menu.badge > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {menu.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* 신규 배달 요청 */}
        {isOnline && requests.length > 0 && (
          <section className="mt-4">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="font-bold text-[var(--color-neutral-900)] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--color-warning-500)]" />
                신규 배달 요청
              </h2>
              <Link
                href="/rider/requests"
                className="text-sm text-[var(--color-primary-500)] flex items-center gap-1"
              >
                전체보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3 px-4">
              {requests.slice(0, 2).map((request) => (
                <Link
                  key={request.id}
                  href={`/rider/requests/${request.id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border-l-4 border-[var(--color-primary-500)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--color-neutral-900)]">
                        {request.restaurantName}
                      </h3>
                      <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
                        {request.distance}km · 약 {formatTime(request.estimatedTime)}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-success-500)]">
                      {request.fee.toLocaleString()}원
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="px-1.5 py-0.5 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] text-xs font-medium rounded">
                        픽업
                      </span>
                      <span className="text-[var(--color-neutral-600)] flex-1 truncate">
                        {request.pickupAddress}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="px-1.5 py-0.5 bg-[var(--color-success-100)] text-[var(--color-success-600)] text-xs font-medium rounded">
                        배달
                      </span>
                      <span className="text-[var(--color-neutral-600)] flex-1 truncate">
                        {request.deliveryAddress}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 오프라인 상태 안내 */}
        {!isOnline && (
          <section className="px-4 mt-8">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Power className="w-8 h-8 text-[var(--color-neutral-400)]" />
              </div>
              <h3 className="font-bold text-[var(--color-neutral-900)] mb-2">
                오프라인 상태입니다
              </h3>
              <p className="text-sm text-[var(--color-neutral-500)]">
                상단의 버튼을 눌러 배달을 시작하세요
              </p>
            </div>
          </section>
        )}

        {/* 공지사항 */}
        <section className="mt-4 px-4">
          <Link
            href="/rider/notices"
            className="flex items-center justify-between p-4 bg-[var(--color-info-50)] rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[var(--color-info-500)]" />
              <span className="text-sm text-[var(--color-info-700)]">
                <span className="font-medium">[공지]</span> 12월 배달 인센티브 프로그램 안내
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-info-400)]" />
          </Link>
        </section>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)]">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/rider"
            className="flex flex-col items-center justify-center gap-1 text-[var(--color-primary-500)]"
          >
            <Navigation className="w-6 h-6" />
            <span className="text-xs font-medium">홈</span>
          </Link>
          <Link
            href="/rider/requests"
            className="flex flex-col items-center justify-center gap-1 text-[var(--color-neutral-400)]"
          >
            <Package className="w-6 h-6" />
            <span className="text-xs">배달</span>
          </Link>
          <Link
            href="/rider/earnings"
            className="flex flex-col items-center justify-center gap-1 text-[var(--color-neutral-400)]"
          >
            <DollarSign className="w-6 h-6" />
            <span className="text-xs">수입</span>
          </Link>
          <Link
            href="/rider/settings"
            className="flex flex-col items-center justify-center gap-1 text-[var(--color-neutral-400)]"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">설정</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
