'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Restaurant } from '@/types/restaurant.types'

interface RestaurantCardProps {
  restaurant: Restaurant
  isAd?: boolean
}

export function RestaurantCard({ restaurant, isAd }: RestaurantCardProps) {
  const formattedDeliveryFee =
    restaurant.deliveryFee === 0
      ? '무료배달'
      : `배달비 ${restaurant.deliveryFee.toLocaleString()}원`

  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className={cn(
        'block bg-white rounded-2xl overflow-hidden',
        'shadow-card hover:shadow-card-hover',
        'transition-shadow duration-200',
        'active:scale-[0.98]'
      )}
    >
      {/* 이미지 영역 - 3:2 비율 */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--color-neutral-100)]">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}

        {/* 배달팁 배지 - 좌측 하단 */}
        {restaurant.deliveryFee === 0 && (
          <Badge
            variant="delivery"
            className="absolute left-3 bottom-3"
          >
            배달팁 0원
          </Badge>
        )}

        {/* 광고 표시 */}
        {isAd && (
          <span className="absolute right-3 bottom-3 text-2xs text-white/80 bg-black/30 px-1.5 py-0.5 rounded">
            광고
          </span>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-4">
        {/* 상호명 + 평점 */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-[var(--color-neutral-900)] truncate flex-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-0.5 ml-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* 배달비 정보 */}
        <p className="text-sm">
          {restaurant.deliveryFee === 0 && restaurant.originalDeliveryFee ? (
            <>
              <span className="text-[var(--color-primary-500)] font-medium">
                무료배달 적용 중
              </span>
              <span className="text-[var(--color-neutral-400)] line-through ml-2">
                {restaurant.originalDeliveryFee.toLocaleString()}원
              </span>
            </>
          ) : (
            <span className="text-[var(--color-neutral-500)]">
              {formattedDeliveryFee}
            </span>
          )}
        </p>

        {/* 배달 시간 + 최소 주문 */}
        <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-neutral-500)]">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>약 {restaurant.estimatedDeliveryTime}분</span>
          </div>
          <span>·</span>
          <span>최소 {restaurant.minOrderAmount.toLocaleString()}원</span>
        </div>

        {/* 배지들 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {restaurant.isNew && (
            <Badge variant="new" size="sm">
              신규
            </Badge>
          )}
          {restaurant.hasDiscount && restaurant.discountAmount && (
            <Badge variant="discount" size="sm">
              {restaurant.discountAmount.toLocaleString()}원 할인
            </Badge>
          )}
          {restaurant.canPickup && (
            <Badge variant="outline" size="sm">
              픽업가능
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
