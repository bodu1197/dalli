'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/orders', icon: ClipboardList, label: '주문내역' },
  { href: '/my', icon: User, label: '마이' },
]

export function BottomNavBar() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-1/2 -translate-x-1/2 z-50',
        'w-full max-w-[700px]',
        'bg-white border-t border-[var(--color-neutral-100)]',
        'safe-area-bottom'
      )}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'w-full h-full',
                'transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  'w-6 h-6 mb-1',
                  isActive
                    ? 'text-[var(--color-neutral-900)]'
                    : 'text-[var(--color-neutral-400)]'
                )}
              />
              <span
                className={cn(
                  'text-[0.625rem]',
                  isActive
                    ? 'text-[var(--color-neutral-900)] font-medium'
                    : 'text-[var(--color-neutral-400)]'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
