'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Lock, Smartphone, Shield, Eye, EyeOff, Check } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'

interface LoginHistory {
  id: string
  device: string
  location: string
  time: string
  isCurrent: boolean
}

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  // 비밀번호 변경 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 목업 로그인 기록
  const [loginHistory] = useState<LoginHistory[]>([
    {
      id: '1',
      device: 'Chrome - Windows',
      location: '서울, 대한민국',
      time: '현재 세션',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari - iPhone',
      location: '서울, 대한민국',
      time: '2024-01-15 14:30',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Chrome - MacOS',
      location: '부산, 대한민국',
      time: '2024-01-14 09:15',
      isCurrent: false,
    },
  ])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/settings/security')
    }
  }, [isLoading, isAuthenticated, router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요')
      return
    }

    if (!newPassword) {
      alert('새 비밀번호를 입력해주세요')
      return
    }

    if (newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다')
      return
    }

    setIsChangingPassword(true)

    try {
      // Note: 비밀번호 변경 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert('비밀번호가 변경되었습니다')
      setShowPasswordModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Password change failed:', error)
      alert('비밀번호 변경에 실패했습니다')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('이 기기에서 로그아웃 하시겠습니까?')) return

    try {
      // Note: 세션 종료 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500))
      alert('로그아웃되었습니다')
    } catch (error) {
      console.error('Session termination failed:', error)
      alert('로그아웃에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-10">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/settings"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            보안 설정
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main>
        {/* 비밀번호 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              계정 보안
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <Lock className="w-5 h-5 text-[var(--color-neutral-500)]" />
              <div className="flex-1 text-left">
                <p className="font-medium text-[var(--color-neutral-800)]">
                  비밀번호 변경
                </p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  정기적으로 비밀번호를 변경해주세요
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </button>

            <div className="flex items-center gap-4 px-4 py-4">
              <Shield className="w-5 h-5 text-[var(--color-neutral-500)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--color-neutral-800)]">
                  2단계 인증
                </p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  추가 보안을 위해 2단계 인증을 설정하세요
                </p>
              </div>
              <span className="text-sm text-[var(--color-neutral-400)]">
                추후 지원 예정
              </span>
            </div>
          </div>
        </section>

        {/* 로그인 기록 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              로그인 기록
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {loginHistory.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 px-4 py-4"
              >
                <Smartphone className="w-5 h-5 text-[var(--color-neutral-500)]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--color-neutral-800)] truncate">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full">
                        현재
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-neutral-500)]">
                    {session.location} · {session.time}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-sm text-[var(--color-error-500)] font-medium"
                  >
                    로그아웃
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 보안 팁 */}
        <section className="mt-3 mx-4 p-4 bg-[var(--color-primary-50)] rounded-xl">
          <h3 className="font-semibold text-[var(--color-primary-700)] mb-2">
            🔒 보안 팁
          </h3>
          <ul className="text-sm text-[var(--color-primary-600)] space-y-1">
            <li>• 비밀번호는 8자 이상, 영문/숫자/특수문자를 조합하세요</li>
            <li>• 다른 사이트와 동일한 비밀번호 사용을 피하세요</li>
            <li>• 공용 컴퓨터에서는 반드시 로그아웃하세요</li>
            <li>• 의심스러운 로그인 기록이 있으면 비밀번호를 변경하세요</li>
          </ul>
        </section>
      </main>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--color-neutral-100)]">
              <h3 className="text-lg font-bold text-[var(--color-neutral-900)]">
                비밀번호 변경
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="p-4 space-y-4">
              {/* 현재 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="w-full px-4 py-3 pr-12 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full px-4 py-3 pr-12 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
                  8자 이상 입력해주세요
                </p>
              </div>

              {/* 새 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="w-full px-4 py-3 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  {confirmPassword && newPassword === confirmPassword && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-success-500)]" />
                  )}
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="flex-1 py-3 border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {isChangingPassword ? '변경 중...' : '변경하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
