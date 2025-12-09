'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Navigation2, Calendar, ChevronDown, Check } from 'lucide-react'

interface DeliveryHistory {
  id: string
  restaurantName: string
  customerAddress: string
  distance: number
  duration: number // 분
  fee: number
  bonus?: number
  tip?: number
  status: 'completed' | 'cancelled'
  completedAt: string
}

// Mock 데이터
const MOCK_HISTORY: DeliveryHistory[] = [
  {
    id: '1',
    restaurantName: 'BBQ 치킨 강남점',
    customerAddress: '서울시 강남구 삼성동 래미안아파트',
    distance: 2.3,
    duration: 18,
    fee: 4500,
    bonus: 500,
    tip: 1000,
    status: 'completed',
    completedAt: '2024-12-09T14:30:00',
  },
  {
    id: '2',
    restaurantName: '맘스터치 논현점',
    customerAddress: '서울시 강남구 신사동 현대아파트',
    distance: 1.8,
    duration: 12,
    fee: 4000,
    status: 'completed',
    completedAt: '2024-12-09T13:15:00',
  },
  {
    id: '3',
    restaurantName: '도미노피자 삼성점',
    customerAddress: '서울시 강남구 대치동 은마아파트',
    distance: 3.5,
    duration: 22,
    fee: 5500,
    bonus: 1000,
    status: 'completed',
    completedAt: '2024-12-09T12:00:00',
  },
  {
    id: '4',
    restaurantName: '신전떡볶이 역삼점',
    customerAddress: '서울시 강남구 역삼동',
    distance: 0.8,
    duration: 8,
    fee: 3500,
    status: 'cancelled',
    completedAt: '2024-12-09T11:00:00',
  },
  {
    id: '5',
    restaurantName: '교촌치킨 선릉점',
    customerAddress: '서울시 강남구 역삼동',
    distance: 2.1,
    duration: 15,
    fee: 4000,
    tip: 500,
    status: 'completed',
    completedAt: '2024-12-08T20:30:00',
  },
  {
    id: '6',
    restaurantName: '버거킹 강남역점',
    customerAddress: '서울시 강남구 역삼동',
    distance: 1.5,
    duration: 10,
    fee: 3500,
    status: 'completed',
    completedAt: '2024-12-08T19:00:00',
  },
]

type FilterType = 'all' | 'completed' | 'cancelled'

export default function RiderHistoryPage() {
  const [history] = useState(MOCK_HISTORY)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const filteredHistory = history.filter((item) => {
    if (filter === 'completed') return item.status === 'completed'
    if (filter === 'cancelled') return item.status === 'cancelled'
    return true
  })

  // 날짜별 그룹핑
  const groupedByDate = filteredHistory.reduce((acc, item) => {
    const date = item.completedAt.split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, DeliveryHistory[]>)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return '오늘'
    if (date.toDateString() === yesterday.toDateString()) return '어제'

    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const getTotalEarnings = (item: DeliveryHistory) => {
    return item.fee + (item.bonus || 0) + (item.tip || 0)
  }

  const completedCount = history.filter((h) => h.status === 'completed').length
  const cancelledCount = history.filter((h) => h.status === 'cancelled').length

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/rider" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            배달 내역
          </h1>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-10 h-10 flex items-center justify-center -mr-2 text-[var(--color-neutral-700)]"
          >
            <Calendar className="w-6 h-6" />
          </button>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-neutral-100)]">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            전체 {history.length}건
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            완료 {completedCount}건
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'cancelled'
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            취소 {cancelledCount}건
          </button>
        </div>
      </header>

      <main className="pb-20">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date}>
            {/* 날짜 헤더 */}
            <div className="sticky top-[114px] z-20 px-4 py-2 bg-[var(--color-neutral-100)]">
              <p className="text-sm font-medium text-[var(--color-neutral-700)]">
                {formatDate(date)}
              </p>
            </div>

            {/* 배달 목록 */}
            <div className="divide-y divide-[var(--color-neutral-100)]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white px-4 py-4 ${
                    item.status === 'cancelled' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--color-neutral-900)]">
                        {item.restaurantName}
                      </h3>
                      {item.status === 'cancelled' && (
                        <span className="px-2 py-0.5 bg-[var(--color-error-100)] text-[var(--color-error-600)] text-xs font-medium rounded">
                          취소
                        </span>
                      )}
                    </div>
                    {item.status === 'completed' && (
                      <span className="font-bold text-[var(--color-success-500)]">
                        +{getTotalEarnings(item).toLocaleString()}원
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)] mb-2">
                    <Navigation2 className="w-4 h-4" />
                    <span className="truncate">{item.customerAddress}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[var(--color-neutral-500)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(item.completedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.distance}km
                    </span>
                    <span>{item.duration}분 소요</span>
                  </div>

                  {/* 수입 상세 */}
                  {item.status === 'completed' && (item.bonus || item.tip) && (
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <span className="text-[var(--color-neutral-600)]">
                        기본 {item.fee.toLocaleString()}원
                      </span>
                      {item.bonus && (
                        <span className="text-[var(--color-primary-500)]">
                          +보너스 {item.bonus.toLocaleString()}원
                        </span>
                      )}
                      {item.tip && (
                        <span className="text-[var(--color-warning-500)]">
                          +팁 {item.tip.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 빈 상태 */}
        {filteredHistory.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[var(--color-neutral-400)]" />
            </div>
            <h3 className="font-bold text-[var(--color-neutral-900)] mb-2">
              배달 내역이 없습니다
            </h3>
            <p className="text-sm text-[var(--color-neutral-500)]">
              {filter === 'cancelled'
                ? '취소된 배달이 없습니다'
                : '완료된 배달이 없습니다'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
