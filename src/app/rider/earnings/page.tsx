'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Calendar, ChevronRight, Wallet, CreditCard } from 'lucide-react'

interface DailyEarning {
  date: string
  deliveries: number
  earnings: number
  bonus: number
  tips: number
}

interface WeeklyStats {
  totalEarnings: number
  totalDeliveries: number
  avgPerDelivery: number
  bestDay: { date: string; earnings: number }
}

// Mock 데이터
const MOCK_WEEKLY_STATS: WeeklyStats = {
  totalEarnings: 523000,
  totalDeliveries: 62,
  avgPerDelivery: 8435,
  bestDay: { date: '12/07 (토)', earnings: 98000 },
}

const MOCK_DAILY_EARNINGS: DailyEarning[] = [
  { date: '2024-12-09', deliveries: 8, earnings: 72000, bonus: 5000, tips: 3000 },
  { date: '2024-12-08', deliveries: 12, earnings: 96000, bonus: 8000, tips: 5000 },
  { date: '2024-12-07', deliveries: 14, earnings: 98000, bonus: 10000, tips: 6000 },
  { date: '2024-12-06', deliveries: 10, earnings: 85000, bonus: 6000, tips: 4000 },
  { date: '2024-12-05', deliveries: 6, earnings: 54000, bonus: 3000, tips: 2000 },
  { date: '2024-12-04', deliveries: 7, earnings: 63000, bonus: 4000, tips: 3000 },
  { date: '2024-12-03', deliveries: 5, earnings: 45000, bonus: 2000, tips: 1500 },
]

type PeriodType = 'today' | 'week' | 'month'

export default function RiderEarningsPage() {
  const [period, setPeriod] = useState<PeriodType>('week')
  const [weeklyStats] = useState(MOCK_WEEKLY_STATS)
  const [dailyEarnings] = useState(MOCK_DAILY_EARNINGS)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`
  }

  const maxEarnings = Math.max(...dailyEarnings.map((d) => d.earnings))

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/rider" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            수입
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
        {/* 총 수입 */}
        <section className="p-4">
          <div className="bg-gradient-to-r from-[var(--color-success-500)] to-[var(--color-success-600)] rounded-2xl p-6 text-white">
            <p className="text-sm opacity-80">이번 주 총 수입</p>
            <p className="text-3xl font-bold mt-1">
              {weeklyStats.totalEarnings.toLocaleString()}원
            </p>

            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-sm opacity-70">배달 건수</p>
                <p className="text-lg font-semibold">{weeklyStats.totalDeliveries}건</p>
              </div>
              <div>
                <p className="text-sm opacity-70">건당 평균</p>
                <p className="text-lg font-semibold">
                  {weeklyStats.avgPerDelivery.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 최고 실적 */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">
                최고 실적: {weeklyStats.bestDay.date} - {weeklyStats.bestDay.earnings.toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/rider/withdraw"
              className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[var(--color-primary-500)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-neutral-900)]">출금하기</p>
                <p className="text-sm text-[var(--color-neutral-500)]">계좌로 송금</p>
              </div>
            </Link>
            <Link
              href="/rider/bank"
              className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[var(--color-neutral-500)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-neutral-900)]">계좌 관리</p>
                <p className="text-sm text-[var(--color-neutral-500)]">출금 계좌 설정</p>
              </div>
            </Link>
          </div>
        </section>

        {/* 주간 차트 */}
        <section className="mt-4 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[var(--color-neutral-900)]">주간 수입</h2>
            <div className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">
              <Calendar className="w-4 h-4" />
              <span>12/03 ~ 12/09</span>
            </div>
          </div>

          {/* 바 차트 */}
          <div className="flex items-end gap-2 h-32">
            {dailyEarnings.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--color-success-500)] rounded-t-lg transition-all"
                  style={{
                    height: `${(day.earnings / maxEarnings) * 100}%`,
                    opacity: i === 0 ? 1 : 0.6,
                  }}
                />
                <span className="text-xs text-[var(--color-neutral-500)]">
                  {formatDate(day.date).split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 일별 상세 */}
        <section className="mt-4 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="font-bold text-[var(--color-neutral-900)]">일별 상세</h2>
          </div>

          <div className="divide-y divide-[var(--color-neutral-100)]">
            {dailyEarnings.map((day, i) => (
              <Link
                key={i}
                href={`/rider/earnings/${day.date}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-[var(--color-neutral-50)]"
              >
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">
                    {formatDate(day.date)}
                  </p>
                  <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
                    {day.deliveries}건 배달 · 보너스 {day.bonus.toLocaleString()}원
                    {day.tips > 0 && ` · 팁 ${day.tips.toLocaleString()}원`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--color-success-500)]">
                    {day.earnings.toLocaleString()}원
                  </span>
                  <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
