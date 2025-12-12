'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Plus,
  MoreVertical,
  Trash2,
  Star,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from '@/hooks/usePaymentMethods'
import {
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_ICONS,
  type PaymentMethod,
} from '@/types/user-features.types'

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = usePaymentMethods()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()

  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleSetDefault = async (id: string) => {
    setProcessingId(id)
    try {
      await setDefaultPaymentMethod.mutateAsync(id)
    } finally {
      setProcessingId(null)
      setActiveMenu(null)
    }
  }

  const handleDelete = async (id: string) => {
    const payment = payments?.find((p) => p.id === id)
    if (payment?.is_default) {
      alert('기본 결제 수단은 삭제할 수 없습니다.')
      return
    }

    if (confirm('이 결제 수단을 삭제하시겠습니까?')) {
      setProcessingId(id)
      try {
        await deletePaymentMethod.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '삭제에 실패했습니다'
        alert(errorMessage)
      } finally {
        setProcessingId(null)
        setActiveMenu(null)
      }
    }
  }

  const toggleMenu = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const cardPayments = payments?.filter((p) => p.type === 'card') ?? []
  const easyPayments = payments?.filter((p) => p.type !== 'card') ?? []

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col">
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
            결제 수단 관리
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle className="w-12 h-12 text-[var(--color-error-500)] mb-4" />
            <p className="text-[var(--color-neutral-500)] text-center mb-4">
              결제 수단을 불러오는데 실패했습니다
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--color-neutral-100)] rounded-lg text-sm"
            >
              다시 시도
            </button>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-[var(--color-neutral-400)]" />
            </div>
            <p className="text-[var(--color-neutral-500)] text-center mb-6">
              등록된 결제 수단이 없습니다.
              <br />
              결제 수단을 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* 카드 목록 */}
            {cardPayments.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
                  <h2 className="font-semibold text-[var(--color-neutral-900)]">
                    등록된 카드
                  </h2>
                </div>
                <div className="divide-y divide-[var(--color-neutral-100)]">
                  {cardPayments.map((payment) => (
                    <PaymentItem
                      key={payment.id}
                      payment={payment}
                      isMenuOpen={activeMenu === payment.id}
                      isProcessing={processingId === payment.id}
                      onToggleMenu={() => toggleMenu(payment.id)}
                      onSetDefault={() => handleSetDefault(payment.id)}
                      onDelete={() => handleDelete(payment.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 간편결제 목록 */}
            {easyPayments.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
                  <h2 className="font-semibold text-[var(--color-neutral-900)]">
                    간편결제
                  </h2>
                </div>
                <div className="divide-y divide-[var(--color-neutral-100)]">
                  {easyPayments.map((payment) => (
                    <PaymentItem
                      key={payment.id}
                      payment={payment}
                      isMenuOpen={activeMenu === payment.id}
                      isProcessing={processingId === payment.id}
                      onToggleMenu={() => toggleMenu(payment.id)}
                      onSetDefault={() => handleSetDefault(payment.id)}
                      onDelete={() => handleDelete(payment.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)] safe-area-bottom">
        <Link
          href="/my/payments/card/new"
          className="flex items-center justify-center w-full py-3.5 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          결제 수단 추가
        </Link>
      </div>

      {/* 메뉴 닫기 오버레이 */}
      {activeMenu && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default bg-transparent border-none p-0 m-0"
          onClick={() => setActiveMenu(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setActiveMenu(null)
            }
          }}
          aria-label="메뉴 닫기"
          tabIndex={0}
        />
      )}
    </div>
  )
}

interface PaymentItemProps {
  readonly payment: PaymentMethod
  readonly isMenuOpen: boolean
  readonly isProcessing: boolean
  readonly onToggleMenu: () => void
  readonly onSetDefault: () => void
  readonly onDelete: () => void
}

function PaymentItem({
  payment,
  isMenuOpen,
  isProcessing,
  onToggleMenu,
  onSetDefault,
  onDelete,
}: Readonly<PaymentItemProps>) {
  const displayName = payment.nickname ||
    (payment.type === 'card'
      ? `${payment.card_company || '카드'} •••• ${payment.card_number_last4 || '****'}`
      : PAYMENT_TYPE_LABELS[payment.type])

  return (
    <div className="relative px-4 py-4">
      <div className="flex items-center gap-3">
        {/* 아이콘 */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            payment.is_default
              ? 'bg-[var(--color-primary-100)]'
              : 'bg-[var(--color-neutral-100)]'
          )}
          style={payment.color ? { backgroundColor: payment.color } : undefined}
        >
          {PAYMENT_TYPE_ICONS[payment.type]}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-neutral-900)]">
              {displayName}
            </span>
            {payment.is_default && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                기본
              </span>
            )}
          </div>
          {payment.type === 'card' && payment.card_company && (
            <p className="text-sm text-[var(--color-neutral-500)]">
              {payment.card_company} {payment.card_type === 'credit' ? '신용' : payment.card_type === 'debit' ? '체크' : ''}카드
            </p>
          )}
          {payment.type !== 'card' && payment.easy_pay_account && (
            <p className="text-sm text-[var(--color-neutral-500)]">
              {payment.easy_pay_account}
            </p>
          )}
          {!payment.is_verified && (
            <p className="text-xs text-[var(--color-warning-500)] mt-1">
              인증 필요
            </p>
          )}
        </div>

        {/* 더보기 버튼 */}
        <button
          onClick={onToggleMenu}
          disabled={isProcessing}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-[var(--color-neutral-400)] animate-spin" />
          ) : (
            <MoreVertical className="w-5 h-5 text-[var(--color-neutral-400)]" />
          )}
        </button>
      </div>

      {/* 드롭다운 메뉴 */}
      {isMenuOpen && (
        <div className="absolute right-4 top-14 z-20 bg-white rounded-xl shadow-lg border border-[var(--color-neutral-100)] py-1 min-w-[140px]">
          {!payment.is_default && (
            <button
              onClick={onSetDefault}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--color-neutral-50)]"
            >
              <Star className="w-4 h-4" />
              기본으로 설정
            </button>
          )}
          {!payment.is_default && (
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          )}
          {payment.is_default && (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              기본 결제 수단입니다
            </p>
          )}
        </div>
      )}
    </div>
  )
}
