'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Clock, MapPin } from 'lucide-react'

interface FavoriteRestaurant {
  id: string
  name: string
  imageUrl: string
  category: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  distance: string
  isOpen: boolean
  addedAt: string
}

// Mock 찜 데이터
const MOCK_FAVORITES: FavoriteRestaurant[] = [
  {
    id: '1',
    name: 'BBQ 치킨 강남점',
    imageUrl: '/images/restaurants/bbq.jpg',
    category: '치킨',
    rating: 4.8,
    reviewCount: 1234,
    deliveryTime: '30~45분',
    deliveryFee: 3000,
    distance: '1.2km',
    isOpen: true,
    addedAt: '2024-12-08T10:00:00',
  },
  {
    id: '2',
    name: '맥도날드 역삼점',
    imageUrl: '/images/restaurants/mcdonalds.jpg',
    category: '버거',
    rating: 4.5,
    reviewCount: 856,
    deliveryTime: '20~30분',
    deliveryFee: 2500,
    distance: '0.8km',
    isOpen: true,
    addedAt: '2024-12-07T14:30:00',
  },
  {
    id: '3',
    name: '본죽&비빔밥 강남역점',
    imageUrl: '/images/restaurants/bonjuk.jpg',
    category: '한식',
    rating: 4.6,
    reviewCount: 432,
    deliveryTime: '25~35분',
    deliveryFee: 2000,
    distance: '1.5km',
    isOpen: false,
    addedAt: '2024-12-05T09:00:00',
  },
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES)

  const handleRemoveFavorite = (id: string) => {
    if (confirm('찜 목록에서 삭제하시겠습니까?')) {
      setFavorites((prev) => prev.filter((f) => f.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/my"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            찜한 가게
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 찜 목록 */}
      <main className="pb-20">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Heart className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)] mb-6">
              찜한 가게가 없습니다
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              맛집 구경하기
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {favorites.map((restaurant) => (
              <FavoriteCard
                key={restaurant.id}
                restaurant={restaurant}
                onRemove={() => handleRemoveFavorite(restaurant.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function FavoriteCard({
  restaurant,
  onRemove,
}: {
  restaurant: FavoriteRestaurant
  onRemove: () => void
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <Link href={`/restaurant/${restaurant.id}`} className="flex">
        {/* 이미지 */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <div className="absolute inset-0 bg-[var(--color-neutral-200)]">
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🍽️
            </div>
          </div>
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium">영업 종료</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--color-neutral-900)] truncate">
                {restaurant.name}
              </h3>
              <p className="text-sm text-[var(--color-neutral-500)]">
                {restaurant.category}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove()
              }}
              className="p-1 -mr-1"
            >
              <Heart className="w-5 h-5 fill-[var(--color-error-500)] text-[var(--color-error-500)]" />
            </button>
          </div>

          {/* 평점 */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-[var(--color-warning-400)] text-[var(--color-warning-400)]" />
            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
              {restaurant.rating}
            </span>
            <span className="text-sm text-[var(--color-neutral-400)]">
              ({restaurant.reviewCount})
            </span>
          </div>

          {/* 배달 정보 */}
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-neutral-500)]">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{restaurant.distance}</span>
            </div>
            <span>배달비 {restaurant.deliveryFee.toLocaleString()}원</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
