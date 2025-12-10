'use client'

import { MenuCard } from './MenuCard'
import type { Menu } from '@/types/restaurant.types'

interface MenuListProps {
  readonly menus: Menu[]
  readonly restaurantId: string
}

export function MenuList({ menus, restaurantId }: Readonly<MenuListProps>) {
  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center mb-4 text-3xl">
          🍽️
        </div>
        <p className="text-[var(--color-neutral-500)]">등록된 메뉴가 없습니다</p>
      </div>
    )
  }

  return (
    <div>
      {menus.map((menu) => (
        <MenuCard key={menu.id} menu={menu} restaurantId={restaurantId} />
      ))}
    </div>
  )
}
