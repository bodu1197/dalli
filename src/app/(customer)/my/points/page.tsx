'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Info } from 'lucide-react'

interface PointHistory {
  id: string
  type: 'earn' | 'use' | 'expire'
  amount: number
  description: string
  orderId?: string
  restaurantName?: string
  createdAt: string
  expiresAt?: string
}

// Mock 포인트 데이터
const MOCK_POINT_BALANCE = 1200

const MOCK_POINT_HISTORY: PointHistory[] = [
  {
    id: '1',
    type: 'earn',
    amount: 300,
    description: '주문 적립',
    orderId: 'ORD001',
    restaurantName: 'BBQ 치킨 강남점',
    createdAt: '2024-12-08T14:30:00',
    expiresAt: '2025-12-08T23:59:59',
  },
  {
    id: '2',
    type: 'use',
    amount: -500,
    description: '주문 시 사용',
    orderId: 'ORD002',
    restaurantName: '맥도날드 역삼점',
    createdAt: '2024-12-07T12:00:00',
  },
  {
    id: '3',
    type: 'earn',
    amount: 200,
    description: '리뷰 작성 적립',
    orderId: 'ORD001',
    restaurantName: 'BBQ 치킨 강남점',
    createdAt: '2024-12-06T16:45:00',
    expiresAt: '2025-12-06T23:59:59',
  },
  {
    id: '4',
    type: 'earn',
    amount: 1000,
    description: '신규 가입 환영 포인트',
    createdAt: '2024-12-01T10:00:00',
    expiresAt: '2025-03-01T23:59:59',
  },
  {
    id: '5',
    type: 'expire',
    amount: -200,
    description: '포인트 소멸',
    createdAt: '2024-11-30T23:59:59',
  },
]

type TabType = 'all' | 'earn' | 'use'

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const filteredHistory =
    activeTab === 'all'
      ? MOCK_POINT_HISTORY
      : MOCK_POINT_HISTORY.filter((h) =>
          activeTab === 'earn' ? h.type === 'earn' : h.type === 'use'
        )

  // 이번 달 적립/사용 계산
  const thisMonth = new Date().getMonth()
  const thisMonthHistory = MOCK_POINT_HISTORY.filter(
    (h) => new Date(h.createdAt).getMonth() === thisMonth
  )
  const earnedThisMonth = thisMonthHistory
    .filter((h) => h.type === 'earn')
    .reduce((sum, h) => sum + h.amount, 0)
  const usedThisMonth = Math.abs(
    thisMonthHistory
      .filter((h) => h.type === 'use')
      .reduce((sum, h) => sum + h.amount, 0)
  )

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/my"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            포인트
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 포인트 잔액 카드 */}
      <section className="p-4 bg-white">
        <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl p-6 text-white">
          <p className="text-sm opacity-80 mb-2">사용 가능한 포인트</p>
          <p className="text-3xl font-bold mb-4">
            {MOCK_POINT_BALANCE.toLocaleString()}P
          </p>

          <div className="flex gap-4 text-sm">
            <div>
              <p className="opacity-70">이번 달 적립</p>
              <p className="font-semibold">+{earnedThisMonth.toLocaleString()}P</p>
            </div>
            <div>
              <p className="opacity-70">이번 달 사용</p>
              <p className="font-semibold">-{usedThisMonth.toLocaleString()}P</p>
            </div>
          </div>
        </div>

        {/* 포인트 안내 */}
        <div className="mt-4 p-4 bg-[var(--color-neutral-50)] rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-primary-500)] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--color-neutral-600)]">
            <p className="font-medium text-[var(--color-neutral-700)] mb-1">
              포인트 적립 안내
            </p>
            <ul className="space-y-1 text-xs">
              <li>• 주문 금액의 1% 포인트 적립</li>
              <li>• 리뷰 작성 시 200P 추가 적립</li>
              <li>• 포인트는 적립일로부터 1년간 유효</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 탭 */}
      <div className="flex bg-white border-b border-[var(--color-neutral-100)] mt-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveTab('earn')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'earn'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          적립
        </button>
        <button
          onClick={() => setActiveTab('use')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'use'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          사용
        </button>
      </div>

      {/* 포인트 내역 */}
      <main className="pb-20">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <span className="text-5xl mb-4">🅿️</span>
            <p className="text-[var(--color-neutral-500)]">
              포인트 내역이 없습니다
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {filteredHistory.map((history) => (
              <PointHistoryItem key={history.id} history={history} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PointHistoryItem({ history }: Readonly<{ history: PointHistory }>) {
  const isEarn = history.type === 'earn'
  const isExpire = history.type === 'expire'

  const formattedDate = new Date(history.createdAt).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const getIconBgClass = (): string => {
    if (isEarn) return 'bg-[var(--color-success-50)]'
    if (isExpire) return 'bg-[var(--color-neutral-100)]'
    return 'bg-[var(--color-error-50)]'
  }

  const getIconColorClass = (): string => {
    if (isExpire) return 'text-[var(--color-neutral-400)]'
    return 'text-[var(--color-error-500)]'
  }

  const getAmountColorClass = (): string => {
    if (isEarn) return 'text-[var(--color-success-500)]'
    if (isExpire) return 'text-[var(--color-neutral-400)]'
    return 'text-[var(--color-error-500)]'
  }

  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white">
      {/* 아이콘 */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBgClass()}`}>
        {isEarn ? (
          <TrendingUp className="w-5 h-5 text-[var(--color-success-500)]" />
        ) : (
          <TrendingDown className={`w-5 h-5 ${getIconColorClass()}`} />
        )}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-neutral-900)]">
          {history.description}
        </p>
        {history.restaurantName && (
          <p className="text-sm text-[var(--color-neutral-500)] truncate">
            {history.restaurantName}
          </p>
        )}
        <p className="text-xs text-[var(--color-neutral-400)] mt-1">
          {formattedDate}
        </p>
      </div>

      {/* 포인트 금액 */}
      <p className={`font-bold ${getAmountColorClass()}`}>
        {isEarn ? '+' : ''}
        {history.amount.toLocaleString()}P
      </p>
    </div>
  )
}
