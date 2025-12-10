'use client'

import { X } from 'lucide-react'

type CategoryFilter = 'all' | 'korean' | 'chinese' | 'japanese' | 'western' | 'cafe' | 'chicken' | 'pizza' | 'burger' | 'dessert'

interface PickupFiltersProps {
  categoryFilter: CategoryFilter
  onCategoryChange: (category: CategoryFilter) => void
  onClose: () => void
}

const CATEGORIES: Array<{ id: CategoryFilter; name: string; icon: string }> = [
  { id: 'all', name: '전체', icon: '🍽️' },
  { id: 'korean', name: '한식', icon: '🍚' },
  { id: 'chinese', name: '중식', icon: '🥟' },
  { id: 'japanese', name: '일식', icon: '🍣' },
  { id: 'western', name: '양식', icon: '🍝' },
  { id: 'cafe', name: '카페', icon: '☕' },
  { id: 'chicken', name: '치킨', icon: '🍗' },
  { id: 'pizza', name: '피자', icon: '🍕' },
  { id: 'burger', name: '버거', icon: '🍔' },
  { id: 'dessert', name: '디저트', icon: '🍰' },
]

export function PickupFilters({
  categoryFilter,
  onCategoryChange,
  onClose,
}: PickupFiltersProps) {
  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-bottom-sheet animate-slide-up max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">음식 카테고리</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 카테고리 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange(category.id)
                  onClose()
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${
                  categoryFilter === category.id
                    ? 'bg-[#df0012] text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <span className="text-3xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
