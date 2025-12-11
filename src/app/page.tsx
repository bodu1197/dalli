'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Bell, ShoppingCart, ChevronDown, SlidersHorizontal } from 'lucide-react'

import { BottomNavBar } from '@/components/layouts/BottomNavBar'
import { KakaoMap } from '@/components/features/map/KakaoMap'
import { PickupStoreList } from '@/components/features/pickup/PickupStoreList'
import { PickupFilters } from '@/components/features/pickup/PickupFilters'
import { useLocationStore } from '@/stores/location.store'
import { useCartStore } from '@/stores/cart.store'

type SortOption = 'distance' | 'rating' | 'discount'
type CategoryFilter = 'all' | 'korean' | 'chinese' | 'japanese' | 'western' | 'cafe' | 'chicken' | 'pizza' | 'burger' | 'dessert'

export default function HomePage() {
  const { selectedAddress } = useLocationStore()
  const cartItemCount = useCartStore((state) => state.getItemCount())

  // 픽업 페이지용 상태
  const [showPickupFilters, setShowPickupFilters] = useState(false)
  const [pickupSortBy, setPickupSortBy] = useState<SortOption>('distance')
  const [pickupCategoryFilter, setPickupCategoryFilter] = useState<CategoryFilter>('all')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)

  const displayAddress = selectedAddress?.address || '주소를 설정해주세요'
  const shortAddress = displayAddress.length > 20
    ? displayAddress.slice(0, 20) + '...'
    : displayAddress

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 700px 빨간 배경 컨테이너 */}
      <div className="max-w-[700px] mx-auto min-h-screen bg-[#df0012] relative">

        {/* 헤더 - 고정 */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] z-50 bg-[#df0012] pb-8">
          {/* 상단 바 */}
          <div className="flex items-center justify-between px-4 h-14">
            {/* 위치 선택 */}
            <Link
              href="/address/select"
              className="flex items-center gap-1 max-w-[200px]"
            >
              <MapPin className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-medium truncate text-white">{shortAddress}</span>
              <ChevronDown className="w-4 h-4 text-white/70 flex-shrink-0" />
            </Link>

            {/* 알림 & 장바구니 */}
            <div className="flex items-center">
              {/* 장바구니 */}
              <Link
                href="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-white text-[#df0012] text-xs font-bold rounded-full px-1">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* 알림 */}
              <Link
                href="/notifications"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                <Bell className="w-6 h-6 text-white" />
              </Link>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="px-4 pb-3">
            <Link
              href="/search"
              className="flex items-center gap-3 h-12 px-4 bg-white/20 rounded-xl backdrop-blur-sm"
            >
              <Search className="w-5 h-5 text-white/80" />
              <span className="text-white/80">
                맛집, 메뉴를 검색해보세요
              </span>
            </Link>
          </div>
        </header>

        {/* 보디 - 스크롤 가능 */}
        <main className="bg-white rounded-t-xl relative z-10 pb-20 min-h-screen pt-[500px]">
          {/* 필터 버튼들 */}
          <section className="flex gap-2 px-4 pt-5 pb-5 overflow-x-auto hide-scrollbar bg-white">
            <button
              onClick={() => setShowPickupFilters(!showPickupFilters)}
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
              onClick={() => setPickupSortBy('distance')}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                pickupSortBy === 'distance'
                  ? 'bg-gray-900 text-white border border-gray-900'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              가까운 순
            </button>

            <button
              onClick={() => setPickupSortBy('rating')}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                pickupSortBy === 'rating'
                  ? 'bg-gray-900 text-white border border-gray-900'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              평점순
            </button>
          </section>

          {/* 지도 */}
          <section className="h-[300px] bg-gray-100 relative">
            <KakaoMap />

            {/* 현재 위치 버튼 */}
            <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50">
              <MapPin className="w-5 h-5 text-gray-700" />
            </button>
          </section>

          {/* 가게 목록 */}
          <section className="bg-white">
            <PickupStoreList
              searchQuery=""
              sortBy={pickupSortBy}
              categoryFilter={pickupCategoryFilter}
              showDiscountOnly={showDiscountOnly}
            />
          </section>

          {/* 필터 모달 */}
          {showPickupFilters && (
            <PickupFilters
              categoryFilter={pickupCategoryFilter}
              onCategoryChange={setPickupCategoryFilter}
              onClose={() => setShowPickupFilters(false)}
            />
          )}
        </main>

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
