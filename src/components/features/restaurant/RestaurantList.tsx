'use client'

import { RestaurantCard } from './RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import type { Restaurant } from '@/types/restaurant.types'

interface RestaurantListProps {
  readonly restaurants: Restaurant[]
  readonly isLoading?: boolean
  readonly emptyMessage?: string
}

export function RestaurantList({
  restaurants,
  isLoading,
  emptyMessage = '주변에 가게가 없습니다',
}: Readonly<RestaurantListProps>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center mb-4 text-3xl">
          🍽️
        </div>
        <p className="text-[var(--color-neutral-500)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          isAd={restaurant.isAdvertised}
        />
      ))}
    </div>
  )
}
