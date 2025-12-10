'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DEFAULT_CATEGORIES } from '@/lib/constants/categories'

interface CategoryGridProps {
  readonly className?: string
}

export function CategoryGrid({ className }: Readonly<CategoryGridProps>) {
  return (
    <div className={cn('grid grid-cols-4 gap-3', className)}>
      {DEFAULT_CATEGORIES.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.id}`}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-neutral-100)] flex items-center justify-center text-2xl">
            {category.icon}
          </div>
          <span className="text-xs font-medium text-[var(--color-neutral-700)]">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
