'use client'

import { InboxIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'
import type { DataTableProps, TableAlignType } from '../types'

const alignClasses: Record<TableAlignType, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyIcon = InboxIcon,
  emptyMessage = '데이터가 없습니다',
  isLoading,
  className,
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return <TableSkeleton columnCount={columns.length} />
  }

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyMessage} />
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
                  alignClasses[column.align ?? 'left']
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-gray-50'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'whitespace-nowrap px-4 py-4 text-sm',
                    alignClasses[column.align ?? 'left']
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableSkeleton({
  columnCount,
}: {
  readonly columnCount: number
}): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {Array.from({ length: columnCount }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-4">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
