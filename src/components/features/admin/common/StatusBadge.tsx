'use client'

import { cn } from '@/lib/utils'
import type { StatusBadgeProps, StatusVariant } from '../types'

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
  pending: 'bg-orange-100 text-orange-700',
}

export function StatusBadge({
  variant,
  children,
  className,
}: StatusBadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
