'use client'

import { cn } from '@/lib/utils'
import { StatsCard } from './StatsCard'
import type { StatsCardProps } from '../types'

interface StatsCardGridProps {
  readonly cards: ReadonlyArray<StatsCardProps>
  readonly columns?: 2 | 3 | 4
  readonly className?: string
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function StatsCardGrid({
  cards,
  columns = 4,
  className,
}: StatsCardGridProps): React.ReactElement {
  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {cards.map((card, index) => (
        <StatsCard key={`${card.label}-${index}`} {...card} />
      ))}
    </div>
  )
}
