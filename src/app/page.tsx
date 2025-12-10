'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Bell, ShoppingCart, ChevronDown, Bike, Store, ShoppingBag, Gift, SlidersHorizontal } from 'lucide-react'

import { CategoryGrid } from '@/components/features/category'
import { RestaurantList } from '@/components/features/restaurant'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'
import { KakaoMap } from '@/components/features/map/KakaoMap'
import { PickupStoreList } from '@/components/features/pickup/PickupStoreList'
import { PickupFilters } from '@/components/features/pickup/PickupFilters'
import { useLocationStore } from '@/stores/location.store'
import { useCartStore } from '@/stores/cart.store'
import { getRecommendedRestaurants, getPopularRestaurants } from '@/lib/mock/restaurants'

type PlatformCategory = 'delivery' | 'pickup' | 'shopping' | 'gift'
type SortOption = 'distance' | 'rating' | 'discount'
type CategoryFilter = 'all' | 'korean' | 'chinese' | 'japanese' | 'western' | 'cafe' | 'chicken' | 'pizza' | 'burger' | 'dessert'

export default function HomePage() {
  const { selectedAddress } = useLocationStore()
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const [activeTab, setActiveTab] = useState<'recommend' | 'popular'>('recommend')
  const [activePlatform, setActivePlatform] = useState<PlatformCategory>('delivery')

  // 픽업 페이지용 상태
  const [showPickupFilters, setShowPickupFilters] = useState(false)
  const [pickupSortBy, setPickupSortBy] = useState<SortOption>('distance')
  const [pickupCategoryFilter, setPickupCategoryFilter] = useState<CategoryFilter>('all')
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)

  const recommendedRestaurants = getRecommendedRestaurants()
  const popularRestaurants = getPopularRestaurants()

  const displayAddress = selectedAddress?.address || '주소를 설정해주세요'
  const shortAddress = displayAddress.length > 20
    ? displayAddress.slice(0, 20) + '...'
    : displayAddress

  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)]">
      <div className="max-w-[700px] mx-auto min-h-screen bg-white md:shadow-[0_0_20px_rgba(0,0,0,0.1)] pb-20">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-[#df0012]">
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

        <main>
          {/* 플랫폼 카테고리 */}
          <section className="px-4 pt-6 pb-0 bg-white">
            <div className="grid grid-cols-4 gap-4">
              {/* 음식배달 */}
              <button
                onClick={() => setActivePlatform('delivery')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  activePlatform === 'delivery'
                    ? 'bg-[#df0012]'
                    : 'bg-gray-200'
                }`}>
                  <Bike className={`w-7 h-7 ${
                    activePlatform === 'delivery'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  activePlatform === 'delivery'
                    ? 'font-bold text-[#df0012] border-b-2 border-[#df0012] pb-0.5'
                    : 'font-medium text-gray-600'
                }`}>음식배달</span>
              </button>

              {/* 직접수령 (포장) */}
              <button
                onClick={() => setActivePlatform('pickup')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  activePlatform === 'pickup'
                    ? 'bg-[#df0012]'
                    : 'bg-gray-200'
                }`}>
                  <Store className={`w-7 h-7 ${
                    activePlatform === 'pickup'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-[10px] whitespace-nowrap ${
                  activePlatform === 'pickup'
                    ? 'font-bold text-[#df0012] border-b-2 border-[#df0012] pb-0.5'
                    : 'font-medium text-gray-600'
                }`}>직접수령 (포장)</span>
              </button>

              {/* 심부름 */}
              <button
                onClick={() => setActivePlatform('shopping')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  activePlatform === 'shopping'
                    ? 'bg-[#df0012]'
                    : 'bg-gray-200'
                }`}>
                  <ShoppingBag className={`w-7 h-7 ${
                    activePlatform === 'shopping'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  activePlatform === 'shopping'
                    ? 'font-bold text-[#df0012] border-b-2 border-[#df0012] pb-0.5'
                    : 'font-medium text-gray-600'
                }`}>심부름</span>
              </button>

              {/* 선물하기 */}
              <button
                onClick={() => setActivePlatform('gift')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  activePlatform === 'gift'
                    ? 'bg-[#df0012]'
                    : 'bg-gray-200'
                }`}>
                  <Gift className={`w-7 h-7 ${
                    activePlatform === 'gift'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  activePlatform === 'gift'
                    ? 'font-bold text-[#df0012] border-b-2 border-[#df0012] pb-0.5'
                    : 'font-medium text-gray-600'
                }`}>선물하기</span>
              </button>
            </div>
          </section>

          {/* 플랫폼별 콘텐츠 */}
          {activePlatform === 'delivery' && (
            <>
              {/* 음식 카테고리 */}
              <section className="px-4 pt-0 pb-0 bg-white">
                <CategoryGrid />
              </section>

              {/* 식당 리스트 */}
              <section className="bg-white">
                {/* 탭 */}
                <div className="flex border-b border-[var(--color-neutral-100)]">
                  <button
                    onClick={() => setActiveTab('recommend')}
                    className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${
                      activeTab === 'recommend'
                        ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
                        : 'text-[var(--color-neutral-400)] border-transparent'
                    }`}
                  >
                    추천 맛집
                  </button>
                  <button
                    onClick={() => setActiveTab('popular')}
                    className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${
                      activeTab === 'popular'
                        ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
                        : 'text-[var(--color-neutral-400)] border-transparent'
                    }`}
                  >
                    인기 맛집
                  </button>
                </div>

                {/* 리스트 */}
                <div className="p-4">
                  <RestaurantList
                    restaurants={
                      activeTab === 'recommend'
                        ? recommendedRestaurants
                        : popularRestaurants
                    }
                  />
                </div>
              </section>
            </>
          )}

          {activePlatform === 'pickup' && (
            <>
              {/* 필터 버튼들 */}
              <section className="flex gap-2 px-4 pt-6 pb-0 overflow-x-auto hide-scrollbar bg-white">
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
                  평점 높은 순
                </button>

                <button
                  onClick={() => setPickupSortBy('discount')}
                  className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    pickupSortBy === 'discount'
                      ? 'bg-gray-900 text-white border border-gray-900'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  할인 많은 순
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
            </>
          )}

          {activePlatform === 'shopping' && (
            <section className="px-4 py-20 bg-white">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">심부름</h2>
                <p className="text-gray-500">곧 만나요! 🏃</p>
                <p className="text-sm text-gray-400 mt-2">심부름 서비스를 준비 중입니다</p>
              </div>
            </section>
          )}

          {activePlatform === 'gift' && (
            <section className="px-4 py-20 bg-white">
              <div className="text-center">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">선물하기</h2>
                <p className="text-gray-500">곧 만나요! 🎁</p>
                <p className="text-sm text-gray-400 mt-2">선물하기 서비스를 준비 중입니다</p>
              </div>
            </section>
          )}
        </main>

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
