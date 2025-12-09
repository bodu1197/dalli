'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronRight, User, Bell, Shield, FileText, LogOut, Trash2 } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'

interface SettingItem {
  icon: React.ReactNode
  label: string
  href: string
  description?: string
  danger?: boolean
}

export default function SettingsPage() {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut()
    }
  }

  const accountSettings: SettingItem[] = [
    {
      icon: <User className="w-5 h-5" />,
      label: '프로필 설정',
      href: '/settings/profile',
      description: '이름, 프로필 사진, 연락처 수정',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: '알림 설정',
      href: '/settings/notifications',
      description: '푸시, 이메일, SMS 알림 관리',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: '보안 설정',
      href: '/settings/security',
      description: '비밀번호 변경, 로그인 기록',
    },
  ]

  const serviceSettings: SettingItem[] = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: '이용약관',
      href: '/terms',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: '개인정보처리방침',
      href: '/privacy',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/my"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            설정
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-20">
        {/* 계정 설정 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              계정 설정
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {accountSettings.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
              >
                <span className="text-[var(--color-neutral-500)]">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-neutral-800)]">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-sm text-[var(--color-neutral-500)] truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </Link>
            ))}
          </div>
        </section>

        {/* 서비스 정보 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              서비스 정보
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {serviceSettings.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
              >
                <span className="text-[var(--color-neutral-500)]">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-neutral-800)]">
                    {item.label}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </Link>
            ))}

            {/* 앱 버전 */}
            <div className="flex items-center gap-4 px-4 py-4">
              <span className="text-[var(--color-neutral-500)]">
                <span className="w-5 h-5 flex items-center justify-center">📱</span>
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-neutral-800)]">
                  앱 버전
                </p>
              </div>
              <span className="text-sm text-[var(--color-neutral-400)]">
                v1.0.0
              </span>
            </div>
          </div>
        </section>

        {/* 계정 관리 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              계정 관리
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <LogOut className="w-5 h-5 text-[var(--color-neutral-500)]" />
              <span className="font-medium text-[var(--color-neutral-800)]">
                로그아웃
              </span>
            </button>
            <Link
              href="/settings/withdraw"
              className="flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <Trash2 className="w-5 h-5 text-[var(--color-error-500)]" />
              <span className="font-medium text-[var(--color-error-500)]">
                회원탈퇴
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
