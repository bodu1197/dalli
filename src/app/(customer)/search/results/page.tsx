'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react'

import { RestaurantList } from '@/components/features/restaurant'
import { Spinner } from '@/components/ui/Spinner'
import { MOCK_RESTAURANTS } from '@/lib/mock/restaurants'
import type { Restaurant } from '@/types/restaurant.types'

// 필터 옵션
const SORT_OPTIONS = [
  { value: 'distance', label: '거리순' },
  { value: 'rating', label: '평점순' },
  { value: 'delivery_time', label: '배달시간순' },
  { value: 'delivery_fee', label: '배달비순' },
]

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  // 검색 결과 필터링 (실제로는 서버에서 처리)
  const filteredRestaurants = MOCK_RESTAURANTS.filter(
    (restaurant) =>
      restaurant.name.includes(query) ||
      restaurant.description?.includes(query) ||
      restaurant.categoryId?.includes(query.toLowerCase())
  )

  // 정렬
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    // 기본: 광고 우선 + 평점순
    if (a.isAdvertised && !b.isAdvertised) return -1
    if (!a.isAdvertised && b.isAdvertised) return 1
    return b.rating - a.rating
  })

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/search"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>

          <Link
            href="/search"
            className="flex-1 flex items-center gap-3 h-10 px-4 rounded-xl bg-[var(--color-neutral-100)]"
          >
            <Search className="w-5 h-5 text-[var(--color-neutral-400)]" />
            <span className="text-[var(--color-neutral-700)]">{query}</span>
            <X className="w-4 h-4 text-[var(--color-neutral-400)] ml-auto" />
          </Link>
        </div>

        {/* 필터 바 */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            필터
          </button>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className="px-3 py-1.5 rounded-full border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] whitespace-nowrap hover:bg-[var(--color-neutral-50)]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4">
        {/* 검색 결과 수 */}
        <p className="text-sm text-[var(--color-neutral-500)] mb-4">
          &quot;{query}&quot; 검색 결과 {sortedRestaurants.length}개
        </p>

        {/* 검색 결과 */}
        <RestaurantList
          restaurants={sortedRestaurants}
          emptyMessage={`"${query}"에 대한 검색 결과가 없습니다`}
        />
      </main>
    </div>
  )
}

function SearchResultsFallback() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchResultsContent />
    </Suspense>
  )
}
