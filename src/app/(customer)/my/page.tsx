'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Ticket,
  Star,
  Heart,
  Clock,
  ShoppingBag,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/hooks/useAuth'

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  badge?: string
  color?: string
}

export default function MyPage() {
  const router = useRouter()
  const { profile, isAuthenticated, isLoading } = useAuthStore()
  const { signOut } = useAuth()

  // 비로그인 시 로그인 페이지로 이동
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/my')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut()
    }
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return null
  }

  const orderMenus: MenuItem[] = [
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: '주문내역',
      href: '/orders',
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: '내 리뷰',
      href: '/my/reviews',
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: '찜한 가게',
      href: '/my/favorites',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: '최근 본 가게',
      href: '/my/recent',
    },
  ]

  const benefitMenus: MenuItem[] = [
    {
      icon: <Ticket className="w-5 h-5" />,
      label: '쿠폰함',
      href: '/my/coupons',
      badge: '3',
      color: 'text-[var(--color-primary-500)]',
    },
    {
      icon: <span className="text-lg">🅿️</span>,
      label: '포인트',
      href: '/my/points',
      badge: '1,200P',
      color: 'text-[var(--color-primary-500)]',
    },
  ]

  const settingMenus: MenuItem[] = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: '주소 관리',
      href: '/my/addresses',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: '결제 수단 관리',
      href: '/my/payments',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: '설정',
      href: '/settings',
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: '고객센터',
      href: '/support',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-20">
      {/* 헤더 */}
      <header className="bg-white">
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
            마이페이지
          </h1>
        </div>
      </header>

      {/* 프로필 카드 */}
      <section className="bg-white px-4 pb-6">
        <Link href="/settings/profile" className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center overflow-hidden">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-[var(--color-neutral-400)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-[var(--color-neutral-900)]">
              {profile?.name || '사용자'}님
            </h2>
            <p className="text-sm text-[var(--color-neutral-500)] truncate">
              {profile?.email || '이메일 없음'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
        </Link>
      </section>

      {/* 혜택 섹션 */}
      <section className="mt-3 bg-white">
        <div className="px-4 py-4">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            나의 혜택
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {benefitMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="flex items-center justify-between p-4 bg-[var(--color-neutral-50)] rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-neutral-600)]">
                    {menu.icon}
                  </span>
                  <span className="font-medium text-[var(--color-neutral-700)]">
                    {menu.label}
                  </span>
                </div>
                {menu.badge && (
                  <span className={`font-bold ${menu.color}`}>{menu.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 주문 관련 메뉴 */}
      <section className="mt-3 bg-white">
        <div className="px-4 py-4">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
            주문 관리
          </h3>
        </div>
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {orderMenus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="flex items-center justify-between px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-neutral-500)]">
                  {menu.icon}
                </span>
                <span className="text-[var(--color-neutral-800)]">
                  {menu.label}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* 설정 메뉴 */}
      <section className="mt-3 bg-white">
        <div className="px-4 py-4">
          <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
            설정
          </h3>
        </div>
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {settingMenus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="flex items-center justify-between px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-neutral-500)]">
                  {menu.icon}
                </span>
                <span className="text-[var(--color-neutral-800)]">
                  {menu.label}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* 로그아웃 */}
      <section className="mt-3 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-[var(--color-error-500)] hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </section>

      {/* 앱 정보 */}
      <div className="mt-6 text-center text-sm text-[var(--color-neutral-400)]">
        <p>달리고 v1.0.0</p>
        <p className="mt-1">© 2024 DALLIGO. All rights reserved.</p>
      </div>
    </div>
  )
}
