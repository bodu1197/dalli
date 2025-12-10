'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Plus,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

interface CouponItem {
  id: string
  name: string
  code: string
  type: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount?: number
  totalCount: number
  usedCount: number
  status: 'active' | 'inactive' | 'expired'
  startDate: string
  endDate: string
  target: 'all' | 'new' | 'vip'
  createdAt: string
}

// Mock 데이터
const MOCK_COUPONS: CouponItem[] = [
  {
    id: '1',
    name: '신규 가입 환영 쿠폰',
    code: 'WELCOME2024',
    type: 'fixed',
    discountValue: 5000,
    minOrderAmount: 15000,
    totalCount: 10000,
    usedCount: 3240,
    status: 'active',
    startDate: '2024-01-01T00:00:00',
    endDate: '2024-12-31T23:59:59',
    target: 'new',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: '2',
    name: '연말 특별 할인',
    code: 'YEAREND20',
    type: 'percentage',
    discountValue: 20,
    minOrderAmount: 20000,
    maxDiscountAmount: 10000,
    totalCount: 5000,
    usedCount: 4850,
    status: 'active',
    startDate: '2024-12-01T00:00:00',
    endDate: '2024-12-31T23:59:59',
    target: 'all',
    createdAt: '2024-12-01T00:00:00',
  },
  {
    id: '3',
    name: 'VIP 전용 쿠폰',
    code: 'VIP3000',
    type: 'fixed',
    discountValue: 3000,
    minOrderAmount: 10000,
    totalCount: 1000,
    usedCount: 450,
    status: 'active',
    startDate: '2024-12-01T00:00:00',
    endDate: '2025-03-31T23:59:59',
    target: 'vip',
    createdAt: '2024-12-01T00:00:00',
  },
  {
    id: '4',
    name: '가을 시즌 할인',
    code: 'FALL15',
    type: 'percentage',
    discountValue: 15,
    minOrderAmount: 18000,
    maxDiscountAmount: 5000,
    totalCount: 3000,
    usedCount: 3000,
    status: 'expired',
    startDate: '2024-09-01T00:00:00',
    endDate: '2024-11-30T23:59:59',
    target: 'all',
    createdAt: '2024-09-01T00:00:00',
  },
  {
    id: '5',
    name: '비활성 테스트 쿠폰',
    code: 'TEST1000',
    type: 'fixed',
    discountValue: 1000,
    minOrderAmount: 5000,
    totalCount: 100,
    usedCount: 0,
    status: 'inactive',
    startDate: '2024-12-01T00:00:00',
    endDate: '2025-01-31T23:59:59',
    target: 'all',
    createdAt: '2024-12-01T00:00:00',
  },
]

type StatusFilter = 'all' | 'active' | 'inactive' | 'expired'

export default function AdminCouponsPage() {
  const [coupons] = useState(MOCK_COUPONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null)

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-[var(--color-success-500)]" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-[var(--color-neutral-400)]" />
      case 'expired':
        return <Clock className="w-4 h-4 text-[var(--color-error-500)]" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'inactive':
        return '비활성'
      case 'expired':
        return '만료됨'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'inactive':
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
      case 'expired':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
      default:
        return ''
    }
  }

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all':
        return '전체 고객'
      case 'new':
        return '신규 고객'
      case 'vip':
        return 'VIP 고객'
      default:
        return target
    }
  }

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'all':
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
      case 'new':
        return 'bg-[var(--color-info-100)] text-[var(--color-info-600)]'
      case 'vip':
        return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
      default:
        return ''
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    // Toast 표시 로직 추가 가능
  }

  const statusCounts = {
    all: coupons.length,
    active: coupons.filter((c) => c.status === 'active').length,
    inactive: coupons.filter((c) => c.status === 'inactive').length,
    expired: coupons.filter((c) => c.status === 'expired').length,
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            쿠폰 관리
          </h1>
          <Link
            href="/admin/coupons/new"
            className="w-10 h-10 flex items-center justify-center -mr-2"
          >
            <Plus className="w-6 h-6 text-[var(--color-primary-500)]" />
          </Link>
        </div>

        {/* 검색 */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="쿠폰명 또는 코드 검색"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {(['all', 'active', 'inactive', 'expired'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
              }`}
            >
              {status === 'all' ? '전체' : getStatusLabel(status)}
              <span className="ml-1">({statusCounts[status]})</span>
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 요약 카드 */}
        <section className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Ticket className="w-6 h-6 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {coupons.length}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">전체 쿠폰</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <CheckCircle className="w-6 h-6 text-[var(--color-success-500)] mx-auto mb-2" />
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {statusCounts.active}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">활성 쿠폰</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Users className="w-6 h-6 text-[var(--color-info-500)] mx-auto mb-2" />
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {coupons.reduce((acc, c) => acc + c.usedCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">총 사용</p>
            </div>
          </div>
        </section>

        {/* 쿠폰 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white px-4 py-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--color-neutral-900)]">{coupon.name}</h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(coupon.status)}`}>
                      {getStatusIcon(coupon.status)}
                      {getStatusLabel(coupon.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="flex items-center gap-1 px-2 py-1 bg-[var(--color-neutral-100)] rounded text-sm font-mono hover:bg-[var(--color-neutral-200)] transition-colors"
                    >
                      <span>{coupon.code}</span>
                      <Copy className="w-3 h-3 text-[var(--color-neutral-500)]" />
                    </button>
                    <span className={`px-2 py-0.5 rounded text-xs ${getTargetColor(coupon.target)}`}>
                      {getTargetLabel(coupon.target)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCoupon(selectedCoupon === coupon.id ? null : coupon.id)}
                  className="p-2 hover:bg-[var(--color-neutral-100)] rounded-lg"
                >
                  <MoreVertical className="w-5 h-5 text-[var(--color-neutral-500)]" />
                </button>
              </div>

              {/* 할인 정보 */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  {coupon.type === 'percentage' ? (
                    <Percent className="w-4 h-4 text-[var(--color-primary-500)]" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-[var(--color-primary-500)]" />
                  )}
                  <span className="font-bold text-[var(--color-primary-600)]">
                    {coupon.type === 'percentage'
                      ? `${coupon.discountValue}% 할인`
                      : `${coupon.discountValue.toLocaleString()}원 할인`}
                  </span>
                </div>
                <span className="text-sm text-[var(--color-neutral-500)]">
                  {coupon.minOrderAmount.toLocaleString()}원 이상
                </span>
                {coupon.maxDiscountAmount && (
                  <span className="text-sm text-[var(--color-neutral-500)]">
                    (최대 {coupon.maxDiscountAmount.toLocaleString()}원)
                  </span>
                )}
              </div>

              {/* 사용률 */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--color-neutral-500)]">사용률</span>
                  <span className="text-[var(--color-neutral-700)]">
                    {coupon.usedCount.toLocaleString()} / {coupon.totalCount.toLocaleString()}
                    <span className="ml-1 text-[var(--color-primary-500)]">
                      ({getUsagePercentage(coupon.usedCount, coupon.totalCount)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary-500)] rounded-full transition-all"
                    style={{ width: `${getUsagePercentage(coupon.usedCount, coupon.totalCount)}%` }}
                  />
                </div>
              </div>

              {/* 기간 */}
              <div className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(coupon.startDate)} ~ {formatDate(coupon.endDate)}</span>
              </div>

              {/* 액션 메뉴 */}
              {selectedCoupon === coupon.id && (
                <div className="mt-3 p-2 bg-[var(--color-neutral-50)] rounded-lg flex gap-2">
                  <Link
                    href={`/admin/coupons/${coupon.id}/edit`}
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </Link>
                  <button
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] rounded-lg"
                  >
                    {coupon.status === 'active' ? (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        비활성화
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        활성화
                      </>
                    )}
                  </button>
                  <button
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-sm text-[var(--color-error-500)] hover:bg-[var(--color-error-50)] rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredCoupons.length === 0 && (
          <div className="py-16 text-center bg-white">
            <Ticket className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">쿠폰이 없습니다</p>
            <Link
              href="/admin/coupons/new"
              className="inline-block mt-4 px-6 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium"
            >
              쿠폰 등록하기
            </Link>
          </div>
        )}
      </main>

      {/* 플로팅 버튼 */}
      <Link
        href="/admin/coupons/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--color-primary-500)] rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-600)] transition-colors"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  )
}
