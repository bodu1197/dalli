'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'

interface SalesData {
  date: string
  sales: number
  orders: number
}

interface PopularMenu {
  name: string
  orders: number
  revenue: number
}

// Mock 데이터
const MOCK_TODAY = {
  sales: 523000,
  orders: 28,
  avgOrderValue: 18678,
  compared: {
    sales: 12,
    orders: 8,
  },
}

const MOCK_WEEKLY: SalesData[] = [
  { date: '12/03', sales: 420000, orders: 22 },
  { date: '12/04', sales: 380000, orders: 20 },
  { date: '12/05', sales: 510000, orders: 27 },
  { date: '12/06', sales: 450000, orders: 24 },
  { date: '12/07', sales: 620000, orders: 32 },
  { date: '12/08', sales: 580000, orders: 30 },
  { date: '12/09', sales: 523000, orders: 28 },
]

const MOCK_POPULAR: PopularMenu[] = [
  { name: '황금올리브 치킨', orders: 145, revenue: 2755000 },
  { name: '양념치킨', orders: 98, revenue: 1862000 },
  { name: '후라이드 반 + 양념 반', orders: 76, revenue: 1520000 },
  { name: '치즈볼', orders: 62, revenue: 310000 },
  { name: '순살 후라이드', orders: 45, revenue: 900000 },
]

type PeriodType = 'today' | 'week' | 'month'

export default function OwnerStatsPage() {
  const [period, setPeriod] = useState<PeriodType>('today')

  const maxSales = Math.max(...MOCK_WEEKLY.map((d) => d.sales))
  const weeklyTotal = MOCK_WEEKLY.reduce((sum, d) => sum + d.sales, 0)
  const weeklyOrders = MOCK_WEEKLY.reduce((sum, d) => sum + d.orders, 0)

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/owner" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            매출 통계
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
              {p === 'today' ? '오늘' : p === 'week' ? '이번 주' : '이번 달'}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 오늘 요약 */}
        <section className="p-4">
          <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl p-6 text-white">
            <p className="text-sm opacity-80">오늘 매출</p>
            <p className="text-3xl font-bold mt-1">
              {MOCK_TODAY.sales.toLocaleString()}원
            </p>

            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-sm opacity-70">주문 건수</p>
                <p className="text-lg font-semibold">{MOCK_TODAY.orders}건</p>
              </div>
              <div>
                <p className="text-sm opacity-70">건당 평균</p>
                <p className="text-lg font-semibold">
                  {MOCK_TODAY.avgOrderValue.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 전일 대비 */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-1">
                {MOCK_TODAY.compared.sales >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  전일 대비 매출 {MOCK_TODAY.compared.sales >= 0 ? '+' : ''}
                  {MOCK_TODAY.compared.sales}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 주간 차트 */}
        <section className="px-4">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--color-neutral-900)]">주간 매출</h2>
              <div className="text-right">
                <p className="text-sm text-[var(--color-neutral-500)]">총 매출</p>
                <p className="font-bold text-[var(--color-neutral-900)]">
                  {weeklyTotal.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 간단한 바 차트 */}
            <div className="flex items-end gap-2 h-32">
              {MOCK_WEEKLY.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[var(--color-primary-500)] rounded-t-lg transition-all"
                    style={{
                      height: `${(day.sales / maxSales) * 100}%`,
                      opacity: i === MOCK_WEEKLY.length - 1 ? 1 : 0.6,
                    }}
                  />
                  <span className="text-xs text-[var(--color-neutral-500)]">{day.date}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)] text-center">
              <p className="text-sm text-[var(--color-neutral-500)]">
                총 {weeklyOrders}건 주문
              </p>
            </div>
          </div>
        </section>

        {/* 인기 메뉴 */}
        <section className="mt-4 bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="font-bold text-[var(--color-neutral-900)]">인기 메뉴 TOP 5</h2>
            <Link
              href="/owner/stats/menus"
              className="text-sm text-[var(--color-primary-500)] flex items-center gap-1"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--color-neutral-100)]">
            {MOCK_POPULAR.map((menu, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    i < 3
                      ? 'bg-[var(--color-primary-500)] text-white'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-[var(--color-neutral-900)]">{menu.name}</p>
                  <p className="text-sm text-[var(--color-neutral-500)]">{menu.orders}건 주문</p>
                </div>
                <p className="font-medium text-[var(--color-neutral-700)]">
                  {menu.revenue.toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 정산 내역 바로가기 */}
        <section className="p-4">
          <Link
            href="/owner/settlements"
            className="block bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[var(--color-neutral-900)]">정산 내역</h3>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                  이번 달 정산 예정금액 확인하기
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </div>
          </Link>
        </section>
      </main>
    </div>
  )
}
