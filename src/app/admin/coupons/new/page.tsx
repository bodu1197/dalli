'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Info,
} from 'lucide-react'

interface CouponForm {
  name: string
  code: string
  type: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number
  totalCount: number
  startDate: string
  endDate: string
  target: 'all' | 'new' | 'vip'
  description: string
}

export default function AdminCouponNewPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<CouponForm>({
    name: '',
    code: '',
    type: 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    totalCount: 0,
    startDate: '',
    endDate: '',
    target: 'all',
    description: '',
  })

  const generateCode = (): void => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomValues = new Uint32Array(8)
    crypto.getRandomValues(randomValues)
    const code = Array.from(randomValues, (val) =>
      chars.charAt(val % chars.length)
    ).join('')
    setForm({ ...form, code })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.discountValue || !form.totalCount || !form.startDate || !form.endDate) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    // API 호출 로직
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/admin/coupons')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin/coupons" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            쿠폰 등록
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 기본 정보 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-[var(--color-primary-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">기본 정보</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="coupon-name" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                쿠폰명 <span className="text-[var(--color-error-500)]">*</span>
              </label>
              <input
                id="coupon-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 신규 가입 환영 쿠폰"
                className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              />
            </div>

            <div>
              <label htmlFor="coupon-code" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                쿠폰 코드 <span className="text-[var(--color-error-500)]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon-code"
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="예: WELCOME2024"
                  className="flex-1 px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-3 bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)] rounded-xl text-sm font-medium hover:bg-[var(--color-neutral-300)] transition-colors"
                >
                  자동생성
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="coupon-description" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                쿠폰 설명
              </label>
              <textarea
                id="coupon-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="쿠폰 설명을 입력하세요"
                className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* 할인 설정 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[var(--color-success-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">할인 설정</h3>
          </div>

          <div className="space-y-4">
            {/* 할인 유형 */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                할인 유형 <span className="text-[var(--color-error-500)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForm({ ...form, type: 'fixed' })}
                  className={`p-4 rounded-xl border-2 text-left ${
                    form.type === 'fixed'
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : 'border-[var(--color-neutral-200)]'
                  }`}
                >
                  <DollarSign className={`w-5 h-5 mb-1 ${
                    form.type === 'fixed' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                  }`} />
                  <p className="font-medium text-[var(--color-neutral-900)]">정액 할인</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">고정 금액 할인</p>
                </button>
                <button
                  onClick={() => setForm({ ...form, type: 'percentage' })}
                  className={`p-4 rounded-xl border-2 text-left ${
                    form.type === 'percentage'
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : 'border-[var(--color-neutral-200)]'
                  }`}
                >
                  <Percent className={`w-5 h-5 mb-1 ${
                    form.type === 'percentage' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                  }`} />
                  <p className="font-medium text-[var(--color-neutral-900)]">정률 할인</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">비율 할인</p>
                </button>
              </div>
            </div>

            {/* 할인 값 */}
            <div>
              <label htmlFor="discount-value" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                {form.type === 'fixed' ? '할인 금액' : '할인율'} <span className="text-[var(--color-error-500)]">*</span>
              </label>
              <div className="relative">
                <input
                  id="discount-value"
                  type="number"
                  value={form.discountValue || ''}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                  placeholder={form.type === 'fixed' ? '5000' : '10'}
                  className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]">
                  {form.type === 'fixed' ? '원' : '%'}
                </span>
              </div>
            </div>

            {/* 최소 주문 금액 */}
            <div>
              <label htmlFor="min-order-amount" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                최소 주문 금액
              </label>
              <div className="relative">
                <input
                  id="min-order-amount"
                  type="number"
                  value={form.minOrderAmount || ''}
                  onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                  placeholder="15000"
                  className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]">원 이상</span>
              </div>
            </div>

            {/* 최대 할인 금액 (정률 할인 시) */}
            {form.type === 'percentage' && (
              <div>
                <label htmlFor="max-discount-amount" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  최대 할인 금액
                </label>
                <div className="relative">
                  <input
                    id="max-discount-amount"
                    type="number"
                    value={form.maxDiscountAmount || ''}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })}
                    placeholder="10000"
                    className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]">원</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 발급 설정 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[var(--color-info-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">발급 설정</h3>
          </div>

          <div className="space-y-4">
            {/* 발급 수량 */}
            <div>
              <label htmlFor="total-count" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                발급 수량 <span className="text-[var(--color-error-500)]">*</span>
              </label>
              <div className="relative">
                <input
                  id="total-count"
                  type="number"
                  value={form.totalCount || ''}
                  onChange={(e) => setForm({ ...form, totalCount: Number(e.target.value) })}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]">개</span>
              </div>
            </div>

            {/* 대상 고객 */}
            <div>
              <span className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                대상 고객
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: '전체 고객' },
                  { value: 'new', label: '신규 고객' },
                  { value: 'vip', label: 'VIP 고객' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setForm({ ...form, target: option.value as 'all' | 'new' | 'vip' })}
                    className={`py-3 rounded-xl font-medium text-sm transition-colors ${
                      form.target === option.value
                        ? 'bg-[var(--color-primary-500)] text-white'
                        : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 유효 기간 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[var(--color-warning-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">유효 기간</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  시작일 <span className="text-[var(--color-error-500)]">*</span>
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  종료일 <span className="text-[var(--color-error-500)]">*</span>
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 미리보기 */}
        {form.name && form.discountValue > 0 && (
          <section className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[var(--color-neutral-500)]" />
              <h3 className="font-bold text-[var(--color-neutral-900)]">쿠폰 미리보기</h3>
            </div>
            <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl p-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {form.type === 'fixed'
                      ? `${form.discountValue.toLocaleString()}원`
                      : `${form.discountValue}%`}
                  </p>
                  <p className="text-white/80 text-sm mt-1">{form.name}</p>
                </div>
                <Ticket className="w-8 h-8 text-white/50" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-1 text-sm text-white/70">
                {form.minOrderAmount > 0 && (
                  <p>{form.minOrderAmount.toLocaleString()}원 이상 주문 시 사용 가능</p>
                )}
                {form.type === 'percentage' && form.maxDiscountAmount > 0 && (
                  <p>최대 {form.maxDiscountAmount.toLocaleString()}원 할인</p>
                )}
                {form.startDate && form.endDate && (
                  <p>{form.startDate} ~ {form.endDate}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[var(--color-primary-500)] text-white font-bold rounded-xl disabled:bg-[var(--color-neutral-300)] disabled:cursor-not-allowed"
        >
          {isSubmitting ? '등록 중...' : '쿠폰 등록'}
        </button>
      </div>
    </div>
  )
}
