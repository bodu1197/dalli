'use client'

import { Search, X, ChevronDown } from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { SearchFilterBarProps, FilterConfig } from '../types'

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = '검색...',
  filters,
  onFilterChange,
  onReset,
  className,
}: SearchFilterBarProps): React.ReactElement {
  const hasActiveFilters =
    filters?.some((filter) => filter.value !== '') ?? false
  const hasSearchQuery = searchQuery.trim() !== ''
  const canReset = hasActiveFilters || hasSearchQuery

  const handleReset = useCallback((): void => {
    onSearchChange('')
    onReset?.()
  }, [onSearchChange, onReset])

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {/* 검색창 */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* 필터 드롭다운들 */}
      {filters?.map((filter) => (
        <FilterDropdown
          key={filter.name}
          filter={filter}
          onChange={(value) => onFilterChange?.(filter.name, value)}
        />
      ))}

      {/* 초기화 버튼 */}
      {canReset ? (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
          초기화
        </button>
      ) : null}
    </div>
  )
}

function FilterDropdown({
  filter,
  onChange,
}: {
  readonly filter: FilterConfig
  readonly onChange: (value: string) => void
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = filter.options.find((opt) => opt.value === filter.value)

  const handleSelect = useCallback(
    (value: string): void => {
      onChange(value)
      setIsOpen(false)
    },
    [onChange]
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
          filter.value
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        )}
      >
        {selectedOption?.label ?? filter.label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false)
            }}
            role="button"
            tabIndex={0}
            aria-label="Close dropdown"
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-gray-50',
                !filter.value && 'bg-gray-50 font-medium'
              )}
            >
              전체
            </button>
            {filter.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-50',
                  filter.value === option.value && 'bg-gray-50 font-medium'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
