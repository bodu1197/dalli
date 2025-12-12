'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Star, MapPin, X } from 'lucide-react'

interface RecentRestaurant {
  id: string
  name: string
  imageUrl: string
  category: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  distance: string
  isOpen: boolean
  viewedAt: string
}

// Mock 최근 본 가게 데이터
const MOCK_RECENT: RecentRestaurant[] = [
  {
    id: '1',
    name: '굽네치킨 강남역점',
    imageUrl: '/images/restaurants/goobne.jpg',
    category: '치킨',
    rating: 4.7,
    reviewCount: 892,
    deliveryTime: '25~40분',
    deliveryFee: 2500,
    distance: '1.0km',
    isOpen: true,
    viewedAt: '2024-12-12T14:30:00',
  },
  {
    id: '2',
    name: '피자헛 역삼점',
    imageUrl: '/images/restaurants/pizzahut.jpg',
    category: '피자',
    rating: 4.4,
    reviewCount: 567,
    deliveryTime: '30~45분',
    deliveryFee: 3000,
    distance: '1.5km',
    isOpen: true,
    viewedAt: '2024-12-12T12:00:00',
  },
  {
    id: '3',
    name: '명동교자 강남점',
    imageUrl: '/images/restaurants/myungdong.jpg',
    category: '한식',
    rating: 4.6,
    reviewCount: 1234,
    deliveryTime: '20~35분',
    deliveryFee: 2000,
    distance: '0.8km',
    isOpen: false,
    viewedAt: '2024-12-11T19:00:00',
  },
  {
    id: '4',
    name: '스시히로바 선릉점',
    imageUrl: '/images/restaurants/sushihiroba.jpg',
    category: '일식',
    rating: 4.8,
    reviewCount: 445,
    deliveryTime: '35~50분',
    deliveryFee: 4000,
    distance: '2.0km',
    isOpen: true,
    viewedAt: '2024-12-10T20:30:00',
  },
]

function formatViewedTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    return '방금 전'
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

export default function RecentPage() {
  const [recentList, setRecentList] = useState(MOCK_RECENT)

  const handleRemove = (id: string) => {
    setRecentList((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    if (confirm('최근 본 가게 목록을 모두 삭제하시겠습니까?')) {
      setRecentList([])
    }
  }

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
            최근 본 가게
          </h1>
          {recentList.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
            >
              전체삭제
            </button>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </header>

      {/* 최근 본 목록 */}
      <main className="pb-20">
        {recentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Clock className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)] mb-6">
              최근 본 가게가 없습니다
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              맛집 구경하기
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {recentList.map((restaurant) => (
              <RecentCard
                key={restaurant.id}
                restaurant={restaurant}
                onRemove={() => handleRemove(restaurant.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function RecentCard({
  restaurant,
  onRemove,
}: Readonly<{
  restaurant: RecentRestaurant
  onRemove: () => void
}>) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative">
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      <Link href={`/restaurant/${restaurant.id}`} className="flex">
        {/* 이미지 */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <div className="absolute inset-0 bg-[var(--color-neutral-200)]">
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🍽️
            </div>
          </div>
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium">영업 종료</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--color-neutral-900)] truncate">
                {restaurant.name}
              </h3>
              <p className="text-sm text-[var(--color-neutral-500)]">
                {restaurant.category}
              </p>
            </div>
          </div>

          {/* 평점 */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-[var(--color-warning-400)] text-[var(--color-warning-400)]" />
            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
              {restaurant.rating}
            </span>
            <span className="text-sm text-[var(--color-neutral-400)]">
              ({restaurant.reviewCount})
            </span>
          </div>

          {/* 배달 정보 */}
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-neutral-500)]">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{restaurant.distance}</span>
            </div>
          </div>

          {/* 본 시간 */}
          <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
            {formatViewedTime(restaurant.viewedAt)}에 봄
          </p>
        </div>
      </Link>
    </div>
  )
}
