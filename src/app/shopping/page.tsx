'use client'

import { ShoppingBag } from 'lucide-react'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'

export default function ShoppingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)]">
      <div className="max-w-[700px] mx-auto min-h-screen bg-white md:shadow-[0_0_20px_rgba(0,0,0,0.1)] pb-20">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-center h-14 px-4">
            <h1 className="text-lg font-bold text-gray-900">장보기·쇼핑</h1>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="px-4 py-20">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">장보기·쇼핑</h2>
            <p className="text-gray-500">곧 만나요! 🛒</p>
            <p className="text-sm text-gray-400 mt-2">장보기 서비스를 준비 중입니다</p>
          </div>
        </main>

        {/* 하단 네비게이션 */}
        <BottomNavBar />
      </div>
    </div>
  )
}
