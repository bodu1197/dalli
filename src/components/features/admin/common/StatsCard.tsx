'use client'

import { cn } from '@/lib/utils'
import type { StatsCardProps, IconColorType } from '../types'

const iconColorClasses: Record<IconColorType, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
}

export function StatsCard({
  icon: Icon,
  iconColor,
  label,
  value,
  suffix,
  className,
}: StatsCardProps): React.ReactElement {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('rounded-xl p-3', iconColorClasses[iconColor])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formattedValue}
            {suffix ? <span className="text-lg font-medium">{suffix}</span> : null}
          </p>
        </div>
      </div>
    </div>
  )
}
