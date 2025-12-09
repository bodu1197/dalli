'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Bell, ShoppingCart, ChevronDown } from 'lucide-react'

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
        <header className="sticky top-0 z-30 bg-white">
          {/* 상단 바 */}
          <div className="flex items-center justify-between px-4 h-14">
            {/* 위치 선택 */}
            <Link
              href="/address/select"
              className="flex items-center gap-1 max-w-[200px]"
            >
              <MapPin className="w-5 h-5 text-[var(--color-primary-500)] flex-shrink-0" />
              <span className="font-medium truncate">{shortAddress}</span>
              <ChevronDown className="w-4 h-4 text-[var(--color-neutral-400)] flex-shrink-0" />
            </Link>

            {/* 알림 & 장바구니 */}
            <div className="flex items-center">
              {/* 장바구니 */}
              <Link
                href="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
              >
                <ShoppingCart className="w-6 h-6 text-[var(--color-neutral-700)]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-primary-500)] text-white text-xs font-bold rounded-full px-1">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* 알림 */}
              <Link
                href="/notifications"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
              >
                <Bell className="w-6 h-6 text-[var(--color-neutral-700)]" />
              </Link>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="px-4 pb-3">
            <Link
              href="/search"
              className="flex items-center gap-3 h-12 px-4 bg-[var(--color-neutral-100)] rounded-xl"
            >
              <Search className="w-5 h-5 text-[var(--color-neutral-400)]" />
              <span className="text-[var(--color-neutral-400)]">
                맛집, 메뉴를 검색해보세요
              </span>
            </Link>
          </div>
        </header>

        <main>
          {/* 이벤트 배너 */}
          <section className="px-4 py-4">
            <div className="relative h-32 rounded-2xl bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-400)] overflow-hidden">
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

          {/* 카테고리 */}
          <section className="px-4 py-4 bg-white">
            <h2 className="text-lg font-bold mb-4">뭐 먹을까?</h2>
            <CategoryGrid />
          </section>

          {/* 식당 리스트 */}
          <section className="mt-2 bg-white">
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
