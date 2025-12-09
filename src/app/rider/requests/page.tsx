'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Navigation2, Filter, Zap } from 'lucide-react'

interface DeliveryRequest {
  id: string
  restaurantName: string
  restaurantAddress: string
  customerAddress: string
  distance: number
  estimatedTime: number
  fee: number
  bonus?: number
  menuSummary: string
  createdAt: string
  expiresIn: number // 초
}

// Mock 데이터
const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: '1',
    restaurantName: 'BBQ 치킨 강남점',
    restaurantAddress: '서울시 강남구 역삼동 123-45',
    customerAddress: '서울시 강남구 삼성동 456-78 래미안아파트 101동 1001호',
    distance: 2.3,
    estimatedTime: 15,
    fee: 4500,
    bonus: 500,
    menuSummary: '황금올리브 치킨 외 2개',
    createdAt: '2024-12-09T11:00:00',
    expiresIn: 45,
  },
  {
    id: '2',
    restaurantName: '맘스터치 논현점',
    restaurantAddress: '서울시 강남구 논현동 111-22',
    customerAddress: '서울시 강남구 신사동 333-44 현대아파트 201동 501호',
    distance: 1.8,
    estimatedTime: 12,
    fee: 4000,
    menuSummary: '싸이버거 세트 외 1개',
    createdAt: '2024-12-09T11:02:00',
    expiresIn: 30,
  },
  {
    id: '3',
    restaurantName: '도미노피자 삼성점',
    restaurantAddress: '서울시 강남구 삼성동 789-12',
    customerAddress: '서울시 강남구 대치동 555-66 은마아파트 303동 1201호',
    distance: 3.5,
    estimatedTime: 20,
    fee: 5500,
    bonus: 1000,
    menuSummary: '포테이토 피자 L 외 2개',
    createdAt: '2024-12-09T11:05:00',
    expiresIn: 60,
  },
  {
    id: '4',
    restaurantName: '신전떡볶이 역삼점',
    restaurantAddress: '서울시 강남구 역삼동 234-56',
    customerAddress: '서울시 강남구 역삼동 345-67 역삼타워빌딩 5층',
    distance: 0.8,
    estimatedTime: 8,
    fee: 3500,
    menuSummary: '떡볶이 + 순대',
    createdAt: '2024-12-09T11:08:00',
    expiresIn: 55,
  },
]

type SortType = 'fee' | 'distance' | 'time'

export default function RiderRequestsPage() {
  const [requests] = useState(MOCK_REQUESTS)
  const [sortBy, setSortBy] = useState<SortType>('fee')

  const sortedRequests = [...requests].sort((a, b) => {
    if (sortBy === 'fee') return (b.fee + (b.bonus || 0)) - (a.fee + (a.bonus || 0))
    if (sortBy === 'distance') return a.distance - b.distance
    if (sortBy === 'time') return a.estimatedTime - b.estimatedTime
    return 0
  })

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/rider" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            배달 요청
          </h1>
          <div className="w-10" />
        </div>

        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-neutral-100)]">
          <Filter className="w-4 h-4 text-[var(--color-neutral-500)]" />
          <div className="flex gap-2">
            {[
              { value: 'fee', label: '수입 높은순' },
              { value: 'distance', label: '거리 가까운순' },
              { value: 'time', label: '시간 짧은순' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as SortType)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-[var(--color-neutral-900)] text-white'
                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* 요청 개수 */}
        <div className="px-4 py-3">
          <p className="text-sm text-[var(--color-neutral-600)]">
            현재 <span className="font-bold text-[var(--color-primary-500)]">{requests.length}건</span>의 배달 요청이 있습니다
          </p>
        </div>

        {/* 요청 목록 */}
        <div className="space-y-3 px-4">
          {sortedRequests.map((request) => (
            <Link
              key={request.id}
              href={`/rider/requests/${request.id}`}
              className="block bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* 만료 타이머 */}
              <div className="px-4 py-2 bg-[var(--color-warning-50)] flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-warning-600)]">
                  {request.expiresIn}초 후 만료
                </span>
                {request.bonus && (
                  <span className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary-500)]">
                    <Zap className="w-4 h-4" />
                    +{request.bonus.toLocaleString()}원 보너스
                  </span>
                )}
              </div>

              <div className="p-4">
                {/* 가게 정보 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[var(--color-neutral-900)]">
                      {request.restaurantName}
                    </h3>
                    <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
                      {request.menuSummary}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[var(--color-success-500)]">
                      {(request.fee + (request.bonus || 0)).toLocaleString()}원
                    </p>
                    {request.bonus && (
                      <p className="text-xs text-[var(--color-neutral-400)] line-through">
                        {request.fee.toLocaleString()}원
                      </p>
                    )}
                  </div>
                </div>

                {/* 주소 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-primary-500)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-neutral-500)]">픽업</p>
                      <p className="text-sm text-[var(--color-neutral-700)] truncate">
                        {request.restaurantAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-success-100)] flex items-center justify-center flex-shrink-0">
                      <Navigation2 className="w-3.5 h-3.5 text-[var(--color-success-500)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-neutral-500)]">배달</p>
                      <p className="text-sm text-[var(--color-neutral-700)] truncate">
                        {request.customerAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 거리/시간 정보 */}
                <div className="flex items-center gap-4 pt-3 border-t border-[var(--color-neutral-100)]">
                  <div className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-600)]">
                    <MapPin className="w-4 h-4" />
                    <span>{request.distance}km</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-600)]">
                    <Clock className="w-4 h-4" />
                    <span>약 {request.estimatedTime}분</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {requests.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[var(--color-neutral-400)]" />
            </div>
            <h3 className="font-bold text-[var(--color-neutral-900)] mb-2">
              배달 요청이 없습니다
            </h3>
            <p className="text-sm text-[var(--color-neutral-500)]">
              잠시 후 새로운 요청이 들어올 수 있습니다
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
