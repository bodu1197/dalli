'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Menu } from '@/types/restaurant.types'

interface MenuCardProps {
  menu: Menu
  restaurantId: string
}

export function MenuCard({ menu, restaurantId }: MenuCardProps) {
  return (
    <Link
      href={`/restaurant/${restaurantId}/menu/${menu.id}`}
      className={cn(
        'flex gap-4 p-4 bg-white',
        'border-b border-[var(--color-neutral-100)] last:border-b-0',
        !menu.isAvailable && 'opacity-50'
      )}
    >
      {/* 메뉴 정보 */}
      <div className="flex-1 min-w-0">
        {/* 인기 순위 배지 */}
        {menu.rank && (
          <span className="inline-block bg-[var(--color-neutral-800)] text-white text-2xs font-medium px-1.5 py-0.5 rounded mb-2">
            인기 {menu.rank}위
          </span>
        )}

        <h4 className="font-semibold text-[var(--color-neutral-900)] mb-1">
          {menu.name}
        </h4>

        {menu.description && (
          <p className="text-sm text-[var(--color-neutral-500)] line-clamp-2 mb-2">
            {menu.description}
          </p>
        )}

        <p className="font-bold text-[var(--color-neutral-900)]">
          {menu.price.toLocaleString()}원
        </p>

        {menu.reviewCount && (
          <p className="text-sm text-[var(--color-neutral-400)] mt-1">
            리뷰 {menu.reviewCount}
          </p>
        )}
      </div>

      {/* 메뉴 이미지 + 담기 버튼 */}
      <div className="relative flex-shrink-0">
        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-[var(--color-neutral-100)]">
          {menu.imageUrl ? (
            <Image
              src={menu.imageUrl}
              alt={menu.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🍽️
            </div>
          )}
        </div>

        {/* 담기 버튼 */}
        {menu.isAvailable && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // TODO: 장바구니에 담기
            }}
            className={cn(
              'absolute -bottom-2 -right-2',
              'w-8 h-8 rounded-full',
              'bg-white border border-[var(--color-neutral-200)]',
              'flex items-center justify-center',
              'shadow-sm hover:shadow-md',
              'transition-shadow',
              'active:scale-95'
            )}
          >
            <Plus className="w-5 h-5 text-[var(--color-neutral-700)]" />
          </button>
        )}
      </div>
    </Link>
  )
}
