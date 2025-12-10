'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Bell, ShoppingCart, ChevronDown, Bike, Store, ShoppingBag, Gift } from 'lucide-react'

import { CategoryGrid } from '@/components/features/category'
import { RestaurantList } from '@/components/features/restaurant'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'
import { useLocationStore } from '@/stores/location.store'
import { useCartStore } from '@/stores/cart.store'
import { getRecommendedRestaurants, getPopularRestaurants } from '@/lib/mock/restaurants'

export default function HomePage() {
  const { selectedAddress } = useLocationStore()
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const [activeTab, setActiveTab] = useState<'recommend' | 'popular'>('recommend')

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
          {/* 이벤트 배너 */}
          <section className="px-4 py-4 bg-[#df0012]">
            <div className="relative h-32 rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 p-5 text-white">
                <p className="text-sm opacity-90">달리고 신규 가입 혜택</p>
                <h2 className="text-xl font-bold mt-1">
                  첫 주문 배달비 무료!
                </h2>
                <p className="text-sm mt-2 opacity-80">
                  지금 바로 주문하세요
                </p>
              </div>
            </div>
          </section>

          {/* 플랫폼 카테고리 */}
          <section className="px-4 pt-6 pb-4 bg-white">
            <div className="grid grid-cols-4 gap-4">
              {/* 음식배달 - ACTIVE */}
              <Link
                href="/"
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-[#df0012] flex items-center justify-center">
                  <Bike className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-[#df0012] whitespace-nowrap border-b-2 border-[#df0012] pb-0.5">음식배달</span>
              </Link>

              {/* 픽업 */}
              <Link
                href="/pickup"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                  <Store className="w-7 h-7 text-gray-600" />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">픽업</span>
              </Link>

              {/* 장보기·쇼핑 */}
              <Link
                href="/shopping"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-gray-600" />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">장보기·쇼핑</span>
              </Link>

              {/* 선물하기 */}
              <Link
                href="/gift"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                  <Gift className="w-7 h-7 text-gray-600" />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">선물하기</span>
              </Link>
            </div>
          </section>

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
        </main>

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
