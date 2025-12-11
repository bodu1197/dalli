'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, ShoppingCart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const baseNavItems = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/orders', icon: ClipboardList, label: '주문내역' },
  { href: '/cart', icon: ShoppingCart, label: '장바구니' },
]

export function BottomNavBar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [supabase] = useState(() => typeof window !== 'undefined' ? createClient() : null)

  useEffect(() => {
    if (!supabase) return

    // 초기 인증 상태 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // 마이 항목을 로그인 상태에 따라 동적으로 설정
  const myNavItem = {
    href: isLoggedIn ? '/my' : '/login',
    icon: User,
    label: isLoggedIn ? '마이' : '로그인',
  }

  const navItems = [...baseNavItems, myNavItem]

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
