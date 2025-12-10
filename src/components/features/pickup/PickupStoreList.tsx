'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, MapPin, Tag } from 'lucide-react'

interface PickupStoreListProps {
  searchQuery: string
  sortBy: 'distance' | 'rating' | 'discount'
  categoryFilter: string
  showDiscountOnly: boolean
}

// 임시 픽업 가게 데이터
const MOCK_PICKUP_STORES = [
  {
    id: '1',
    name: '교촌치킨 강남점',
    category: 'chicken',
    categoryName: '치킨',
    rating: 4.8,
    reviewCount: 342,
    distance: 0.5,
    pickupTime: '15~20분',
    discount: 30,
    image: '/images/restaurants/default.jpg',
    hasPickupDiscount: true,
  },
  {
    id: '2',
    name: '스타벅스 역삼점',
    category: 'cafe',
    categoryName: '카페',
    rating: 4.6,
    reviewCount: 523,
    distance: 0.3,
    pickupTime: '10~15분',
    discount: 20,
    image: '/images/restaurants/default.jpg',
    hasPickupDiscount: true,
  },
  {
    id: '3',
    name: '맘스터치 서초점',
    category: 'burger',
    categoryName: '버거',
    rating: 4.5,
    reviewCount: 287,
    distance: 0.8,
    pickupTime: '20~25분',
    discount: 15,
    image: '/images/restaurants/default.jpg',
    hasPickupDiscount: true,
  },
  {
    id: '4',
    name: '본죽 논현점',
    category: 'korean',
    categoryName: '한식',
    rating: 4.7,
    reviewCount: 198,
    distance: 1.2,
    pickupTime: '15~20분',
    discount: 0,
    image: '/images/restaurants/default.jpg',
    hasPickupDiscount: false,
  },
]

export function PickupStoreList({
  searchQuery,
  sortBy,
  categoryFilter,
  showDiscountOnly,
}: PickupStoreListProps) {
  // 필터링 및 정렬 로직
  let filteredStores = [...MOCK_PICKUP_STORES]

  // 검색어 필터
  if (searchQuery) {
    filteredStores = filteredStores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 카테고리 필터
  if (categoryFilter && categoryFilter !== 'all') {
    filteredStores = filteredStores.filter((store) => store.category === categoryFilter)
  }

  // 할인만 보기 필터
  if (showDiscountOnly) {
    filteredStores = filteredStores.filter((store) => store.hasPickupDiscount)
  }

  // 정렬
  filteredStores.sort((a, b) => {
    if (sortBy === 'distance') return a.distance - b.distance
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'discount') return b.discount - a.discount
    return 0
  })

  return (
    <div className="divide-y divide-gray-100">
      {/* 결과 헤더 */}
      <div className="px-4 py-3 bg-gray-50">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{filteredStores.length}개</span>의 픽업 가능한 가게
        </p>
      </div>

      {/* 가게 목록 */}
      {filteredStores.length > 0 ? (
        filteredStores.map((store) => (
          <Link
            key={store.id}
            href={`/restaurant/${store.id}`}
            className="block px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-4">
              {/* 가게 이미지 */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  이미지
                </div>

                {/* 할인 배지 */}
                {store.hasPickupDiscount && (
                  <div className="absolute top-2 left-2 bg-[#df0012] text-white text-xs font-bold px-2 py-1 rounded">
                    {store.discount}%
                  </div>
                )}
              </div>

              {/* 가게 정보 */}
              <div className="flex-1 min-w-0">
                {/* 가게명 + 카테고리 */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">{store.categoryName}</span>
                </div>

                {/* 평점 */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">{store.rating}</span>
                  <span className="text-xs text-gray-400">({store.reviewCount})</span>
                </div>

                {/* 픽업 시간 */}
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">픽업 {store.pickupTime}</span>
                </div>

                {/* 거리 */}
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{store.distance}km</span>
                </div>

                {/* 픽업 할인 안내 */}
                {store.hasPickupDiscount && (
                  <div className="mt-2 flex items-center gap-1 text-[#df0012]">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">픽업 시 {store.discount}% 할인</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="px-4 py-20 text-center">
          <p className="text-gray-400">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  )
}
