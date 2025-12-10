'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageHeaderProps, PageHeaderAction } from '../types'

const actionVariantClasses = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
}

export function PageHeader({
  title,
  description,
  backLink,
  actions,
  className,
}: PageHeaderProps): React.ReactElement {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        {backLink ? (
          <Link
            href={backLink}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
      </div>
      {actions && actions.length > 0 ? (
        <div className="flex items-center gap-3">
          {actions.map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ActionButton({
  action,
}: {
  readonly action: PageHeaderAction
}): React.ReactElement {
  const Icon = action.icon
  const variant = action.variant ?? 'primary'

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        actionVariantClasses[variant]
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {action.label}
    </button>
  )
}
