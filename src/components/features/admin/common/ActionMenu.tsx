'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionMenuProps } from '../types'

export function ActionMenu({
  items,
  className,
}: ActionMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((event: MouseEvent): void => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  const handleItemClick = useCallback(
    (onClick: () => void, disabled?: boolean): void => {
      if (disabled) return
      onClick()
      setIsOpen(false)
    },
    []
  )

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="더보기 메뉴"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleItemClick(item.onClick, item.disabled)}
                disabled={item.disabled}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
                  item.disabled
                    ? 'cursor-not-allowed text-gray-300'
                    : item.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
