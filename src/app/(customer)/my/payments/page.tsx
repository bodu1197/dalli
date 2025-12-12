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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethod {
  id: string
  type: 'card' | 'kakaopay' | 'naverpay' | 'tosspay'
  name: string
  cardNumber?: string
  cardCompany?: string
  isDefault: boolean
  createdAt: string
}

// Mock 결제 수단 데이터
const MOCK_PAYMENTS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: '신한카드',
    cardNumber: '9411',
    cardCompany: '신한',
    isDefault: true,
    createdAt: '2024-10-15T10:00:00',
  },
  {
    id: '2',
    type: 'card',
    name: '삼성카드',
    cardNumber: '1234',
    cardCompany: '삼성',
    isDefault: false,
    createdAt: '2024-11-01T14:30:00',
  },
  {
    id: '3',
    type: 'kakaopay',
    name: '카카오페이',
    isDefault: false,
    createdAt: '2024-09-20T09:00:00',
  },
]

const PAYMENT_ICONS: Record<string, string> = {
  card: '💳',
  kakaopay: '🟡',
  naverpay: '🟢',
  tosspay: '🔵',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleSetDefault = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    )
    setActiveMenu(null)
  }

  const handleDelete = (id: string) => {
    const payment = payments.find((p) => p.id === id)
    if (payment?.isDefault) {
      alert('기본 결제 수단은 삭제할 수 없습니다.')
      return
    }

    if (confirm('이 결제 수단을 삭제하시겠습니까?')) {
      setPayments((prev) => prev.filter((p) => p.id !== id))
    }
    setActiveMenu(null)
  }

  const toggleMenu = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

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
        {payments.length === 0 ? (
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
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
                <h2 className="font-semibold text-[var(--color-neutral-900)]">
                  등록된 카드
                </h2>
              </div>
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {payments
                  .filter((p) => p.type === 'card')
                  .map((payment) => (
                    <PaymentItem
                      key={payment.id}
                      payment={payment}
                      isMenuOpen={activeMenu === payment.id}
                      onToggleMenu={() => toggleMenu(payment.id)}
                      onSetDefault={() => handleSetDefault(payment.id)}
                      onDelete={() => handleDelete(payment.id)}
                    />
                  ))}
              </div>
            </div>

            {/* 간편결제 목록 */}
            {payments.filter((p) => p.type !== 'card').length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
                  <h2 className="font-semibold text-[var(--color-neutral-900)]">
                    간편결제
                  </h2>
                </div>
                <div className="divide-y divide-[var(--color-neutral-100)]">
                  {payments
                    .filter((p) => p.type !== 'card')
                    .map((payment) => (
                      <PaymentItem
                        key={payment.id}
                        payment={payment}
                        isMenuOpen={activeMenu === payment.id}
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
  readonly onToggleMenu: () => void
  readonly onSetDefault: () => void
  readonly onDelete: () => void
}

function PaymentItem({
  payment,
  isMenuOpen,
  onToggleMenu,
  onSetDefault,
  onDelete,
}: Readonly<PaymentItemProps>) {
  return (
    <div className="relative px-4 py-4">
      <div className="flex items-center gap-3">
        {/* 아이콘 */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            payment.isDefault
              ? 'bg-[var(--color-primary-100)]'
              : 'bg-[var(--color-neutral-100)]'
          )}
        >
          {PAYMENT_ICONS[payment.type]}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-neutral-900)]">
              {payment.name}
            </span>
            {payment.isDefault && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                기본
              </span>
            )}
          </div>
          {payment.cardNumber && (
            <p className="text-sm text-[var(--color-neutral-500)]">
              {payment.cardCompany} •••• {payment.cardNumber}
            </p>
          )}
        </div>

        {/* 더보기 버튼 */}
        <button
          onClick={onToggleMenu}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
        >
          <MoreVertical className="w-5 h-5 text-[var(--color-neutral-400)]" />
        </button>
      </div>

      {/* 드롭다운 메뉴 */}
      {isMenuOpen && (
        <div className="absolute right-4 top-14 z-20 bg-white rounded-xl shadow-lg border border-[var(--color-neutral-100)] py-1 min-w-[140px]">
          {!payment.isDefault && (
            <button
              onClick={onSetDefault}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--color-neutral-50)]"
            >
              <Star className="w-4 h-4" />
              기본으로 설정
            </button>
          )}
          {!payment.isDefault && (
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          )}
          {payment.isDefault && (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              기본 결제 수단입니다
            </p>
          )}
        </div>
      )}
    </div>
  )
}
