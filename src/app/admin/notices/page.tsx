'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Bell,
  Edit,
  Trash2,
  Eye,
  Pin,
  Calendar,
  Users,
  AlertCircle,
  Info,
  Megaphone,
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
interface NoticeItem {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly category: 'general' | 'service' | 'event' | 'maintenance' | 'policy'
  readonly target: 'all' | 'customer' | 'owner' | 'rider'
  readonly status: 'published' | 'draft' | 'scheduled'
  readonly isPinned: boolean
  readonly isImportant: boolean
  readonly viewCount: number
  readonly publishedAt: string | null
  readonly scheduledAt: string | null
  readonly createdAt: string
  readonly author: string
}

// Mock Data
const mockNotices: ReadonlyArray<NoticeItem> = [
  {
    id: 'NTC001',
    title: '[공지] 설 연휴 배달 안내',
    content: '설 연휴 기간(2월 9일~12일) 동안 일부 음식점의 영업시간이 변경될 수 있습니다...',
    category: 'service',
    target: 'all',
    status: 'published',
    isPinned: true,
    isImportant: true,
    viewCount: 15234,
    publishedAt: '2024-01-20',
    scheduledAt: null,
    createdAt: '2024-01-18',
    author: '관리자',
  },
  {
    id: 'NTC002',
    title: '[이벤트] 신규 가입 50% 할인 이벤트',
    content: '달리고에 처음 가입하신 고객님께 첫 주문 50% 할인 혜택을 드립니다...',
    category: 'event',
    target: 'customer',
    status: 'published',
    isPinned: true,
    isImportant: false,
    viewCount: 8521,
    publishedAt: '2024-01-15',
    scheduledAt: null,
    createdAt: '2024-01-14',
    author: '마케팅팀',
  },
  {
    id: 'NTC003',
    title: '[점검] 시스템 정기 점검 안내',
    content: '서비스 품질 향상을 위한 시스템 정기 점검이 진행됩니다.',
    category: 'maintenance',
    target: 'all',
    status: 'scheduled',
    isPinned: false,
    isImportant: true,
    viewCount: 0,
    publishedAt: null,
    scheduledAt: '2024-01-24',
    createdAt: '2024-01-20',
    author: '운영팀',
  },
  {
    id: 'NTC004',
    title: '[안내] 점주님 정산 일정 안내',
    content: '매주 화요일에 전주 정산이 진행됩니다.',
    category: 'general',
    target: 'owner',
    status: 'published',
    isPinned: false,
    isImportant: false,
    viewCount: 3254,
    publishedAt: '2024-01-10',
    scheduledAt: null,
    createdAt: '2024-01-08',
    author: '정산팀',
  },
  {
    id: 'NTC005',
    title: '[정책] 개인정보 처리방침 개정 안내',
    content: '개인정보보호법 개정에 따라 개인정보 처리방침이 변경되었습니다...',
    category: 'policy',
    target: 'all',
    status: 'published',
    isPinned: false,
    isImportant: false,
    viewCount: 1234,
    publishedAt: '2024-01-05',
    scheduledAt: null,
    createdAt: '2024-01-03',
    author: '법무팀',
  },
  {
    id: 'NTC006',
    title: '[안내] 라이더 배달비 정산 안내',
    content: '배달비는 매일 정산되며, 출금 신청 후 익일 입금됩니다...',
    category: 'general',
    target: 'rider',
    status: 'draft',
    isPinned: false,
    isImportant: false,
    viewCount: 0,
    publishedAt: null,
    scheduledAt: null,
    createdAt: '2024-01-19',
    author: '운영팀',
  },
]

const statusConfig: Record<
  NoticeItem['status'],
  { label: string; variant: StatusVariant }
> = {
  published: { label: '게시됨', variant: 'success' },
  scheduled: { label: '예약', variant: 'primary' },
  draft: { label: '임시저장', variant: 'default' },
}

const categoryConfig: Record<
  NoticeItem['category'],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  general: { label: '일반', icon: Info },
  service: { label: '서비스', icon: Bell },
  event: { label: '이벤트', icon: Megaphone },
  maintenance: { label: '점검', icon: AlertCircle },
  policy: { label: '정책', icon: Info },
}

const targetConfig: Record<NoticeItem['target'], string> = {
  all: '전체',
  customer: '고객',
  owner: '점주',
  rider: '라이더',
}

export default function AdminNoticesPage(): React.ReactElement {
  const [notices, setNotices] = useState<ReadonlyArray<NoticeItem>>(mockNotices)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [targetFilter, setTargetFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    notice: NoticeItem | null
  }>({ isOpen: false, notice: null })

  const filteredNotices = useMemo(() => {
    return notices
      .filter((notice) => {
        const matchesSearch =
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory =
          categoryFilter === 'all' || notice.category === categoryFilter
        const matchesStatus =
          statusFilter === 'all' || notice.status === statusFilter
        const matchesTarget =
          targetFilter === 'all' ||
          notice.target === targetFilter ||
          notice.target === 'all'
        return matchesSearch && matchesCategory && matchesStatus && matchesTarget
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [notices, searchQuery, categoryFilter, statusFilter, targetFilter])

  const stats = useMemo(() => {
    return {
      total: notices.length,
      published: notices.filter((n) => n.status === 'published').length,
      draft: notices.filter((n) => n.status === 'draft').length,
      pinned: notices.filter((n) => n.isPinned).length,
    }
  }, [notices])

  const statsCards = useMemo(
    () => [
      { icon: Bell, iconColor: 'primary' as const, label: '전체', value: stats.total, suffix: '건' },
      { icon: Eye, iconColor: 'success' as const, label: '게시됨', value: stats.published, suffix: '건' },
      { icon: Edit, iconColor: 'default' as const, label: '임시저장', value: stats.draft, suffix: '건' },
      { icon: Pin, iconColor: 'primary' as const, label: '고정됨', value: stats.pinned, suffix: '건' },
    ],
    [stats]
  )

  const togglePinned = useCallback((noticeId: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === noticeId ? { ...notice, isPinned: !notice.isPinned } : notice
      )
    )
  }, [])

  const handleDelete = useCallback(() => {
    if (deleteModal.notice) {
      setNotices((prev) => prev.filter((n) => n.id !== deleteModal.notice!.id))
      setDeleteModal({ isOpen: false, notice: null })
    }
  }, [deleteModal.notice])

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="공지사항 관리"
          description="플랫폼 공지사항을 관리합니다"
          backLink="/admin"
        />
        <Link
          href="/admin/notices/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          공지 등록
        </Link>
      </div>

      {/* Stats */}
      <StatsCardGrid cards={statsCards} className="mb-6" />

      {/* Search and Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="공지사항 검색..."
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
          <option value="general">일반</option>
          <option value="service">서비스</option>
          <option value="event">이벤트</option>
          <option value="maintenance">점검</option>
          <option value="policy">정책</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            statusFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">전체 상태</option>
          <option value="published">게시됨</option>
          <option value="draft">임시저장</option>
          <option value="scheduled">예약</option>
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

      {/* Notice List */}
      {filteredNotices.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredNotices.map((notice) => {
            const CategoryIcon = categoryConfig[notice.category].icon

            return (
              <div
                key={notice.id}
                className={cn(
                  'rounded-xl bg-white p-4',
                  notice.isImportant && 'border-l-4 border-l-red-500'
                )}
              >
                {/* Badges */}
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.isPinned && (
                      <StatusBadge variant="error">
                        <Pin className="mr-1 h-3 w-3" />
                        고정
                      </StatusBadge>
                    )}
                    <StatusBadge variant={statusConfig[notice.status].variant}>
                      {statusConfig[notice.status].label}
                    </StatusBadge>
                    <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      <CategoryIcon className="h-3 w-3" />
                      {categoryConfig[notice.category].label}
                    </span>
                    <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
                      <Users className="h-3 w-3" />
                      {targetConfig[notice.target]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{notice.id}</span>
                </div>

                {/* Title & Content */}
                <h3 className="mb-1 text-sm font-semibold text-gray-900">
                  {notice.title}
                </h3>
                <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                  {notice.content}
                </p>

                {/* Meta */}
                <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {notice.status === 'scheduled'
                      ? `예약: ${notice.scheduledAt}`
                      : notice.publishedAt || notice.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    조회 {notice.viewCount.toLocaleString()}
                  </span>
                  <span>작성자: {notice.author}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => togglePinned(notice.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium',
                      notice.isPinned
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <Pin className="h-4 w-4" />
                    {notice.isPinned ? '고정해제' : '고정'}
                  </button>
                  <Link
                    href={`/admin/notices/${notice.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: true, notice })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="검색 결과 없음"
          description="검색 조건에 맞는 공지사항이 없습니다"
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, notice: null })}
        onConfirm={handleDelete}
        title="공지사항 삭제"
        message="이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  )
}
