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
        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
