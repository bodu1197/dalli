'use client'

import { Heart } from 'lucide-react'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)]">
      <div className="max-w-[700px] mx-auto min-h-screen bg-white md:shadow-[0_0_20px_rgba(0,0,0,0.1)] pb-20">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-center h-14 px-4">
            <h1 className="text-lg font-bold text-gray-900">찜한 가게</h1>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="px-4 py-20">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">찜한 가게</h2>
            <p className="text-gray-500">곧 만나요! ❤️</p>
            <p className="text-sm text-gray-400 mt-2">찜 기능을 준비 중입니다</p>
          </div>
        </main>

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
