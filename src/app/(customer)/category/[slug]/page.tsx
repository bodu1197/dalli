'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, SlidersHorizontal, ChevronDown } from 'lucide-react'

import { RestaurantList } from '@/components/features/restaurant'
import { DEFAULT_CATEGORIES } from '@/lib/constants/categories'
import { getRestaurantsByCategory } from '@/lib/mock/restaurants'

interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>
}

const SORT_OPTIONS = [
  { value: 'recommend', label: '추천순' },
  { value: 'distance', label: '거리순' },
  { value: 'rating', label: '평점순' },
  { value: 'delivery_time', label: '배달시간순' },
  { value: 'delivery_fee', label: '배달비순' },
]

export default function CategoryPage({ params }: Readonly<CategoryPageProps>) {
  const { slug } = use(params)

  // 카테고리 정보 가져오기
  const category = DEFAULT_CATEGORIES.find((c) => c.id === slug)
  const categoryName = category?.name || '카테고리'

  // 해당 카테고리 식당 가져오기
  const restaurants = getRestaurantsByCategory(slug)

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
            </Link>
            <h1 className="text-lg font-bold text-[var(--color-neutral-900)]">
              {category?.icon} {categoryName}
            </h1>
          </div>
        </div>

        {/* 필터/정렬 바 */}
        <div className="flex items-center gap-2 px-4 pb-3 border-b border-[var(--color-neutral-100)]">
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)]">
            <SlidersHorizontal className="w-4 h-4" />
            필터
          </button>

          <button className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)]">
            {SORT_OPTIONS[0].label}
            <ChevronDown className="w-4 h-4" />
          </button>

          <button className="px-3 py-2 rounded-lg border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)]">
            배달팁 무료
          </button>
        </div>

        {/* 카테고리 탭 (다른 카테고리로 빠르게 이동) */}
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto hide-scrollbar bg-white">
          {DEFAULT_CATEGORIES.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-sm ${
                cat.id === slug
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </header>

      <main className="p-4">
        {/* 검색 결과 수 */}
        <p className="text-sm text-[var(--color-neutral-500)] mb-4">
          {categoryName} {restaurants.length}개
        </p>

        {/* 식당 목록 */}
        <RestaurantList
          restaurants={restaurants}
          emptyMessage={`${categoryName} 카테고리에 등록된 가게가 없습니다`}
        />
      </main>
    </div>
  )
}
