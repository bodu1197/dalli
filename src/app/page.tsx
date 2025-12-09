'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Bell, ChevronDown } from 'lucide-react'

import { CategoryGrid } from '@/components/features/category'
import { RestaurantList } from '@/components/features/restaurant'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'
import { useLocationStore } from '@/stores/location.store'
import { getRecommendedRestaurants, getPopularRestaurants } from '@/lib/mock/restaurants'

export default function HomePage() {
  const { selectedAddress } = useLocationStore()
  const [activeTab, setActiveTab] = useState<'recommend' | 'popular'>('recommend')

  const recommendedRestaurants = getRecommendedRestaurants()
  const popularRestaurants = getPopularRestaurants()

  const displayAddress = selectedAddress?.address || '주소를 설정해주세요'
  const shortAddress = displayAddress.length > 20
    ? displayAddress.slice(0, 20) + '...'
    : displayAddress

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-20">
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

          {/* 알림 */}
          <Link
            href="/notifications"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
          >
            <Bell className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
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
  )
}
