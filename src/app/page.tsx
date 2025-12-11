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

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
