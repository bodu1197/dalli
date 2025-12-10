'use client'

import { ChevronLeft, Bell, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  readonly title?: string
  readonly showBack?: boolean
  readonly showSearch?: boolean
  readonly showNotification?: boolean
  readonly transparent?: boolean
  readonly rightElement?: React.ReactNode
  readonly onBackClick?: () => void
}

export function Header({
  title,
  showBack = false,
  showSearch = false,
  showNotification = false,
  transparent = false,
  rightElement,
  onBackClick,
}: Readonly<HeaderProps>) {
  const router = useRouter()

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-14 flex items-center justify-center',
        'safe-area-top',
        transparent ? 'bg-transparent' : 'bg-white border-b border-[var(--color-neutral-100)]'
      )}
    >
      <div className="w-full max-w-[700px] px-4 flex items-center justify-between">
        {/* 왼쪽 영역 */}
        <div className="flex items-center gap-2 min-w-[48px]">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] transition-colors"
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-6 h-6 text-[var(--color-neutral-900)]" />
            </button>
          )}
        </div>

        {/* 타이틀 */}
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-[var(--color-neutral-900)]">
            {title}
          </h1>
        )}

        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-1 min-w-[48px] justify-end">
          {showSearch && (
            <button
              onClick={() => router.push('/search')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] transition-colors"
              aria-label="검색"
            >
              <Search className="w-5 h-5 text-[var(--color-neutral-700)]" />
            </button>
          )}
          {showNotification && (
            <button
              onClick={() => router.push('/notifications')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] transition-colors relative"
              aria-label="알림"
            >
              <Bell className="w-5 h-5 text-[var(--color-neutral-700)]" />
            </button>
          )}
          {rightElement}
        </div>
      </div>
    </header>
  )
}
