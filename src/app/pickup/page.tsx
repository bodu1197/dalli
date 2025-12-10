'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'
import { KakaoMap } from '@/components/features/map/KakaoMap'
import { PickupStoreList } from '@/components/features/pickup/PickupStoreList'
import { PickupFilters } from '@/components/features/pickup/PickupFilters'

type SortOption = 'distance' | 'rating' | 'discount'
type CategoryFilter = 'all' | 'korean' | 'chinese' | 'japanese' | 'western' | 'cafe' | 'chicken' | 'pizza' | 'burger' | 'dessert'

export default function PickupPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[700px] mx-auto min-h-screen bg-white md:shadow-[0_0_20px_rgba(0,0,0,0.1)] pb-20">
        {/* 헤더 */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 h-14 px-4">
            <Link href="/" className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">직접수령 (포장)</h1>
          </div>

          {/* 검색바 */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="가게 이름, 메뉴 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df0012]"
              />
            </div>
          </div>

          {/* 필터 버튼들 */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              필터
            </button>

            <button
              onClick={() => setShowDiscountOnly(!showDiscountOnly)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                showDiscountOnly
                  ? 'bg-[#df0012] text-white border border-[#df0012]'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              픽업 할인
            </button>

            <button
              onClick={() => setSortBy('distance')}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                sortBy === 'distance'
                  ? 'bg-gray-900 text-white border border-gray-900'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              가까운 순
            </button>

            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                sortBy === 'rating'
                  ? 'bg-gray-900 text-white border border-gray-900'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              평점 높은 순
            </button>

            <button
              onClick={() => setSortBy('discount')}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                sortBy === 'discount'
                  ? 'bg-gray-900 text-white border border-gray-900'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              할인 많은 순
            </button>
          </div>
        </header>

        {/* 프로모션 배너 */}
        <section className="px-4 py-3 bg-gradient-to-r from-[#df0012] to-[#ff4757]">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs opacity-90">지금 픽업하면</p>
              <p className="font-bold text-base">최대 30% 할인!</p>
            </div>
            <div className="text-2xl">🏪</div>
          </div>
        </section>

        {/* 메인 콘텐츠 */}
        <main className="relative">
          {/* 지도 */}
          <div className="h-[300px] bg-gray-100 relative">
            <KakaoMap />

            {/* 현재 위치 버튼 */}
            <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50">
              <MapPin className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* 가게 목록 */}
          <div className="bg-white">
            <PickupStoreList
              searchQuery={searchQuery}
              sortBy={sortBy}
              categoryFilter={categoryFilter}
              showDiscountOnly={showDiscountOnly}
            />
          </div>
        </main>

        {/* 필터 모달 */}
        {showFilters && (
          <PickupFilters
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
