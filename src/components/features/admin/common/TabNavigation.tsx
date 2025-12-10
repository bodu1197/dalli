'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TabNavigationProps } from '../types'

export function TabNavigation({
  tabs,
  activeHref,
  className,
}: TabNavigationProps): React.ReactElement {
  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = tab.href === activeHref
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={cn(
                    'ml-2 rounded-full px-2 py-0.5 text-xs',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count.toLocaleString()}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
