'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/hooks/useAuth'

const WITHDRAW_REASONS = [
  '서비스 이용이 불편해요',
  '주문할 일이 없어요',
  '다른 서비스를 이용할 거예요',
  '개인정보가 걱정돼요',
  '기타',
] as const

export default function WithdrawPage() {
  const router = useRouter()
  const { profile, isAuthenticated, isLoading } = useAuthStore()
  const { signOut } = useAuth()

  const [selectedReason, setSelectedReason] = useState<string>('')
  const [otherReason, setOtherReason] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/settings/withdraw')
    }
  }, [isLoading, isAuthenticated, router])

  const handleWithdraw = async () => {
    if (!selectedReason) {
      alert('탈퇴 사유를 선택해주세요')
      return
    }

    if (selectedReason === '기타' && !otherReason.trim()) {
      alert('기타 사유를 입력해주세요')
      return
    }

    if (!isConfirmed) {
      alert('안내사항을 확인하고 동의해주세요')
      return
    }

    const confirmWithdraw = confirm(
      '정말 탈퇴하시겠습니까?\n\n탈퇴 후에는 계정 복구가 불가능하며, 모든 데이터가 삭제됩니다.'
    )

    if (!confirmWithdraw) return

    setIsWithdrawing(true)

    try {
      // Note: 실제 탈퇴 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 로그아웃 처리
      await signOut()

      alert('회원탈퇴가 완료되었습니다.\n그동안 이용해주셔서 감사합니다.')
      router.push('/')
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert('탈퇴 처리 중 오류가 발생했습니다')
    } finally {
      setIsWithdrawing(false)
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
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-28">
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
            회원탈퇴
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main>
        {/* 경고 배너 */}
        <section className="bg-[var(--color-error-50)] p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-[var(--color-error-500)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--color-error-700)]">
                탈퇴 전 꼭 확인해주세요
              </p>
              <ul className="mt-2 text-sm text-[var(--color-error-600)] space-y-1">
                <li>• 탈퇴 후 계정 복구는 불가능합니다</li>
                <li>• 모든 주문 내역이 삭제됩니다</li>
                <li>• 보유 쿠폰 및 포인트가 소멸됩니다</li>
                <li>• 작성한 리뷰는 삭제되지 않습니다</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 현재 계정 정보 */}
        <section className="mt-3 bg-white p-4">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-500)] mb-3">
            탈퇴하는 계정
          </h2>
          <div className="flex items-center gap-3 p-4 bg-[var(--color-neutral-50)] rounded-xl">
            <div className="w-12 h-12 bg-[var(--color-neutral-200)] rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <p className="font-medium text-[var(--color-neutral-900)]">
                {profile?.name || '사용자'}
              </p>
              <p className="text-sm text-[var(--color-neutral-500)]">
                {profile?.email || '-'}
              </p>
            </div>
          </div>
        </section>

        {/* 탈퇴 사유 */}
        <section className="mt-3 bg-white p-4">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-500)] mb-3">
            탈퇴 사유를 선택해주세요
          </h2>
          <div className="space-y-2">
            {WITHDRAW_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                    : 'border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedReason === reason
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                      : 'border-[var(--color-neutral-300)]'
                  }`}
                >
                  {selectedReason === reason && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-[var(--color-neutral-800)]">{reason}</span>
              </label>
            ))}
          </div>

          {/* 기타 사유 입력 */}
          {selectedReason === '기타' && (
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="탈퇴 사유를 입력해주세요"
              maxLength={500}
              className="mt-3 w-full h-24 p-4 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] resize-none"
            />
          )}
        </section>

        {/* 동의 확인 */}
        <section className="mt-3 bg-white p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isConfirmed
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                  : 'border-[var(--color-neutral-300)]'
              }`}
            >
              {isConfirmed && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm text-[var(--color-neutral-700)]">
              위 안내사항을 모두 확인하였으며, 보유 중인 쿠폰과 포인트가 소멸되는 것에 동의합니다.
            </span>
          </label>
        </section>
      </main>

      {/* 탈퇴 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing || !selectedReason || !isConfirmed}
          className="w-full py-4 bg-[var(--color-error-500)] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? '처리 중...' : '회원 탈퇴하기'}
        </button>
      </div>
    </div>
  )
}
