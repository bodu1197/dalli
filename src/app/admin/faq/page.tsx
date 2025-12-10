'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  HelpCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  PageHeader,
  StatsCardGrid,
  StatusBadge,
  EmptyState,
  ConfirmModal,
} from '@/components/features/admin/common'
import type { StatusVariant } from '@/components/features/admin/types'
import { cn } from '@/lib/utils'

// Types
interface FAQItem {
  readonly id: string
  readonly question: string
  readonly answer: string
  readonly category: 'order' | 'payment' | 'delivery' | 'account' | 'coupon' | 'other'
  readonly target: 'all' | 'customer' | 'owner' | 'rider'
  readonly isVisible: boolean
  readonly order: number
  readonly viewCount: number
  readonly createdAt: string
  readonly updatedAt: string
}

// Mock Data
const mockFAQs: ReadonlyArray<FAQItem> = [
  {
    id: 'FAQ001',
    question: '주문 취소는 어떻게 하나요?',
    answer: '주문 후 음식점에서 주문을 확인하기 전까지 취소가 가능합니다.',
    category: 'order',
    target: 'customer',
    isVisible: true,
    order: 1,
    viewCount: 15234,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'FAQ002',
    question: '결제 수단은 어떤 것이 있나요?',
    answer: '신용카드, 체크카드, 카카오페이, 네이버페이, 토스페이 등 다양한 결제 수단을 지원합니다.',
    category: 'payment',
    target: 'all',
    isVisible: true,
    order: 2,
    viewCount: 12453,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
  },
  {
    id: 'FAQ003',
    question: '배달 예상 시간은 정확한가요?',
    answer: '배달 예상 시간은 음식점의 조리 시간과 배달 거리를 기반으로 계산됩니다.',
    category: 'delivery',
    target: 'customer',
    isVisible: true,
    order: 3,
    viewCount: 9876,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12',
  },
  {
    id: 'FAQ004',
    question: '쿠폰은 어떻게 사용하나요?',
    answer: '결제 단계에서 쿠폰 적용 버튼을 누르면 보유한 쿠폰 목록이 표시됩니다.',
    category: 'coupon',
    target: 'customer',
    isVisible: true,
    order: 4,
    viewCount: 8521,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-08',
  },
  {
    id: 'FAQ005',
    question: '점주 가입은 어떻게 하나요?',
    answer: '달리고 점주 앱을 다운로드하신 후 회원가입을 진행해주세요.',
    category: 'account',
    target: 'owner',
    isVisible: true,
    order: 5,
    viewCount: 3254,
    createdAt: '2024-01-04',
    updatedAt: '2024-01-14',
  },
  {
    id: 'FAQ006',
    question: '라이더 등록 조건이 어떻게 되나요?',
    answer: '만 18세 이상이며, 이륜차 운전면허와 개인 오토바이가 있으신 분이라면 누구나 등록 가능합니다.',
    category: 'account',
    target: 'rider',
    isVisible: true,
    order: 6,
    viewCount: 2341,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-16',
  },
  {
    id: 'FAQ007',
    question: '환불은 언제 처리되나요?',
    answer: '주문 취소 시 결제 수단에 따라 환불 시점이 다릅니다.',
    category: 'payment',
    target: 'customer',
    isVisible: false,
    order: 7,
    viewCount: 0,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
]

const categoryConfig: Record<
  FAQItem['category'],
  { label: string; variant: StatusVariant }
> = {
  order: { label: '주문', variant: 'primary' },
  payment: { label: '결제', variant: 'success' },
  delivery: { label: '배달', variant: 'warning' },
  account: { label: '계정', variant: 'default' },
  coupon: { label: '쿠폰', variant: 'error' },
  other: { label: '기타', variant: 'default' },
}

const targetConfig: Record<FAQItem['target'], string> = {
  all: '전체',
  customer: '고객',
  owner: '점주',
  rider: '라이더',
}

export default function AdminFAQPage(): React.ReactElement {
  const [faqs, setFAQs] = useState<ReadonlyArray<FAQItem>>(mockFAQs)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [targetFilter, setTargetFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    faq: FAQItem | null
  }>({ isOpen: false, faq: null })

  const filteredFAQs = useMemo(() => {
    return faqs
      .filter((faq) => {
        const matchesSearch =
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory =
          categoryFilter === 'all' || faq.category === categoryFilter
        const matchesTarget =
          targetFilter === 'all' || faq.target === targetFilter || faq.target === 'all'
        return matchesSearch && matchesCategory && matchesTarget
      })
      .sort((a, b) => a.order - b.order)
  }, [faqs, searchQuery, categoryFilter, targetFilter])

  const stats = useMemo(() => {
    return {
      total: faqs.length,
      visible: faqs.filter((f) => f.isVisible).length,
      totalViews: faqs.reduce((sum, f) => sum + f.viewCount, 0),
    }
  }, [faqs])

  const statsCards = useMemo(
    () => [
      { icon: HelpCircle, iconColor: 'primary' as const, label: '전체 FAQ', value: stats.total, suffix: '건' },
      { icon: Eye, iconColor: 'success' as const, label: '노출중', value: stats.visible, suffix: '건' },
      { icon: Eye, iconColor: 'primary' as const, label: '총 조회수', value: `${(stats.totalViews / 1000).toFixed(1)}K` },
    ],
    [stats]
  )

  const toggleVisibility = useCallback((faqId: string) => {
    setFAQs((prev) =>
      prev.map((faq) =>
        faq.id === faqId ? { ...faq, isVisible: !faq.isVisible } : faq
      )
    )
  }, [])

  const handleDelete = useCallback(() => {
    if (deleteModal.faq) {
      setFAQs((prev) => prev.filter((f) => f.id !== deleteModal.faq!.id))
      setDeleteModal({ isOpen: false, faq: null })
    }
  }, [deleteModal.faq])

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="FAQ 관리"
          description="자주 묻는 질문을 관리합니다"
          backLink="/admin"
        />
        <Link
          href="/admin/faq/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          FAQ 등록
        </Link>
      </div>

      {/* Stats */}
      <StatsCardGrid cards={statsCards} columns={3} className="mb-6" />

      {/* Search and Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="FAQ 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            categoryFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">전체 카테고리</option>
          <option value="order">주문</option>
          <option value="payment">결제</option>
          <option value="delivery">배달</option>
          <option value="account">계정</option>
          <option value="coupon">쿠폰</option>
          <option value="other">기타</option>
        </select>

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            targetFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">전체 대상</option>
          <option value="customer">고객</option>
          <option value="owner">점주</option>
          <option value="rider">라이더</option>
        </select>
      </div>

      {/* FAQ List */}
      {filteredFAQs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id

            return (
              <div
                key={faq.id}
                className={cn(
                  'overflow-hidden rounded-xl bg-white',
                  !faq.isVisible && 'opacity-60'
                )}
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <div className="cursor-grab p-1 text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusBadge variant={categoryConfig[faq.category].variant}>
                        {categoryConfig[faq.category].label}
                      </StatusBadge>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {targetConfig[faq.target]}
                      </span>
                      <span className="text-xs text-gray-400">
                        조회 {faq.viewCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {faq.question}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {/* Answer */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pl-12">
                    <p className="whitespace-pre-wrap py-4 text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVisibility(faq.id)
                        }}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium',
                          faq.isVisible
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-green-50 text-green-600'
                        )}
                      >
                        {faq.isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {faq.isVisible ? '숨김' : '노출'}
                      </button>
                      <Link
                        href={`/admin/faq/${faq.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteModal({ isOpen: true, faq })
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={HelpCircle}
          title="검색 결과 없음"
          description="검색 조건에 맞는 FAQ가 없습니다"
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, faq: null })}
        onConfirm={handleDelete}
        title="FAQ 삭제"
        message="이 FAQ를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  )
}
