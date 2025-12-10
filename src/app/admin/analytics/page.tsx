'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingBag,
  Bike,
  DollarSign,
  Calendar,
  ChevronRight,
  BarChart3,
  MapPin,
} from 'lucide-react'

interface DailyStats {
  date: string
  orders: number
  revenue: number
  users: number
}

interface CategoryStats {
  name: string
  orders: number
  percentage: number
  color: string
}

// Mock 데이터
const MOCK_OVERVIEW = {
  totalRevenue: 285400000,
  totalOrders: 12470,
  totalUsers: 8520,
  totalStores: 342,
  activeRiders: 156,
  avgOrderValue: 22880,
  compared: {
    revenue: 12,
    orders: 8,
    users: 15,
    stores: 5,
  },
}

const MOCK_DAILY_STATS: DailyStats[] = [
  { date: '12/03', orders: 1580, revenue: 36200000, users: 1120 },
  { date: '12/04', orders: 1620, revenue: 37800000, users: 1180 },
  { date: '12/05', orders: 1750, revenue: 41200000, users: 1250 },
  { date: '12/06', orders: 1820, revenue: 43500000, users: 1320 },
  { date: '12/07', orders: 2100, revenue: 52800000, users: 1580 },
  { date: '12/08', orders: 1950, revenue: 48200000, users: 1450 },
  { date: '12/09', orders: 1650, revenue: 38400000, users: 1200 },
]

const MOCK_CATEGORY_STATS: CategoryStats[] = [
  { name: '치킨', orders: 3240, percentage: 26, color: 'var(--color-primary-500)' },
  { name: '피자', orders: 2180, percentage: 17.5, color: 'var(--color-success-500)' },
  { name: '중식', orders: 1870, percentage: 15, color: 'var(--color-warning-500)' },
  { name: '한식', orders: 1620, percentage: 13, color: 'var(--color-error-500)' },
  { name: '분식', orders: 1240, percentage: 10, color: 'var(--color-info-500)' },
  { name: '기타', orders: 2320, percentage: 18.5, color: 'var(--color-neutral-400)' },
]

type PeriodType = 'today' | 'week' | 'month'

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<PeriodType>('week')
  const [overview] = useState(MOCK_OVERVIEW)
  const [dailyStats] = useState(MOCK_DAILY_STATS)
  const [categoryStats] = useState(MOCK_CATEGORY_STATS)

  const maxRevenue = Math.max(...dailyStats.map((d) => d.revenue))

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            통계/분석
          </h1>
          <div className="w-10" />
        </div>

        {/* 기간 선택 */}
        <div className="flex p-2 gap-2">
          {(['today', 'week', 'month'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                period === p
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
              }`}
            >
              {(() => {
                if (p === 'today') return '오늘'
                if (p === 'week') return '이번 주'
                return '이번 달'
              })()}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 핵심 지표 */}
        <section className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* 총 매출 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-[var(--color-success-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">총 매출</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {(overview.totalRevenue / 100000000).toFixed(1)}억원
              </p>
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                overview.compared.revenue >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-error-500)]'
              }`}>
                {overview.compared.revenue >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>전주 대비 {overview.compared.revenue >= 0 ? '+' : ''}{overview.compared.revenue}%</span>
              </div>
            </div>

            {/* 총 주문 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-primary-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">총 주문</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {overview.totalOrders.toLocaleString()}건
              </p>
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                overview.compared.orders >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-error-500)]'
              }`}>
                {overview.compared.orders >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>전주 대비 {overview.compared.orders >= 0 ? '+' : ''}{overview.compared.orders}%</span>
              </div>
            </div>

            {/* 전체 사용자 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[var(--color-info-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">전체 사용자</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {overview.totalUsers.toLocaleString()}명
              </p>
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                overview.compared.users >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-error-500)]'
              }`}>
                {overview.compared.users >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>전주 대비 {overview.compared.users >= 0 ? '+' : ''}{overview.compared.users}%</span>
              </div>
            </div>

            {/* 입점 가게 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-5 h-5 text-[var(--color-warning-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">입점 가게</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {overview.totalStores.toLocaleString()}개
              </p>
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                overview.compared.stores >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-error-500)]'
              }`}>
                {overview.compared.stores >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>전주 대비 {overview.compared.stores >= 0 ? '+' : ''}{overview.compared.stores}%</span>
              </div>
            </div>
          </div>

          {/* 추가 지표 */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-success-100)] rounded-full flex items-center justify-center">
                <Bike className="w-5 h-5 text-[var(--color-success-500)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-500)]">활성 라이더</p>
                <p className="font-bold text-[var(--color-neutral-900)]">{overview.activeRiders}명</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[var(--color-primary-500)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-500)]">객단가</p>
                <p className="font-bold text-[var(--color-neutral-900)]">{overview.avgOrderValue.toLocaleString()}원</p>
              </div>
            </div>
          </div>
        </section>

        {/* 매출 추이 차트 */}
        <section className="mt-4 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[var(--color-neutral-900)]">매출 추이</h2>
            <div className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">
              <Calendar className="w-4 h-4" />
              <span>최근 7일</span>
            </div>
          </div>

          {/* 바 차트 */}
          <div className="flex items-end gap-2 h-40">
            {dailyStats.map((day) => {
              const dayIndex = dailyStats.indexOf(day)
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--color-neutral-500)]">
                    {(day.revenue / 10000000).toFixed(1)}천
                  </span>
                  <div
                    className="w-full bg-[var(--color-primary-500)] rounded-t-lg transition-all"
                    style={{
                      height: `${(day.revenue / maxRevenue) * 100}%`,
                      opacity: dayIndex === dailyStats.length - 1 ? 1 : 0.6,
                    }}
                />
                <span className="text-xs text-[var(--color-neutral-500)]">{day.date}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* 카테고리별 주문 */}
        <section className="mt-4 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[var(--color-neutral-900)]">카테고리별 주문</h2>
            <Link
              href="/admin/analytics/categories"
              className="flex items-center gap-1 text-sm text-[var(--color-primary-500)]"
            >
              상세보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--color-neutral-700)]">{cat.name}</span>
                  <span className="text-[var(--color-neutral-500)]">
                    {cat.orders.toLocaleString()}건 ({cat.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 분석 바로가기 */}
        <section className="p-4">
          <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">상세 분석</h2>
          <div className="space-y-2">
            <Link
              href="/admin/analytics/sales"
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-success-100)] rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[var(--color-success-500)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">매출 분석</p>
                  <p className="text-sm text-[var(--color-neutral-500)]">일별/주별/월별 매출 상세</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>

            <Link
              href="/admin/analytics/users"
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-info-100)] rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--color-info-500)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">사용자 분석</p>
                  <p className="text-sm text-[var(--color-neutral-500)]">가입/활성/이탈 분석</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>

            <Link
              href="/admin/analytics/regions"
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-warning-100)] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--color-warning-500)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">지역별 분석</p>
                  <p className="text-sm text-[var(--color-neutral-500)]">지역별 주문/매출 분석</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
