'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Gift,
  Percent,
  Clock,
  Users,
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
interface EventItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly type: 'discount' | 'freeDelivery' | 'coupon' | 'point' | 'special'
  readonly status: 'upcoming' | 'active' | 'ended'
  readonly isVisible: boolean
  readonly startDate: string
  readonly endDate: string
  readonly targetUsers: 'all' | 'new' | 'vip' | 'dormant'
  readonly participantCount: number
  readonly imageUrl: string
  readonly createdAt: string
}

// Mock Data
const mockEvents: ReadonlyArray<EventItem> = [
  {
    id: 'EVT001',
    title: '신규 가입 50% 할인',
    description: '신규 회원 첫 주문 50% 할인 이벤트',
    type: 'discount',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    targetUsers: 'new',
    participantCount: 1523,
    imageUrl: '/events/new-user.jpg',
    createdAt: '2024-01-01',
  },
  {
    id: 'EVT002',
    title: '무료 배달 페스티벌',
    description: '이번 주말 모든 주문 무료 배달',
    type: 'freeDelivery',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    targetUsers: 'all',
    participantCount: 3241,
    imageUrl: '/events/free-delivery.jpg',
    createdAt: '2024-01-15',
  },
  {
    id: 'EVT003',
    title: 'VIP 고객 감사 이벤트',
    description: 'VIP 등급 고객 대상 특별 쿠폰 지급',
    type: 'coupon',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    targetUsers: 'vip',
    participantCount: 245,
    imageUrl: '/events/vip.jpg',
    createdAt: '2024-01-10',
  },
  {
    id: 'EVT004',
    title: '포인트 2배 적립',
    description: '주문 금액의 2배 포인트 적립',
    type: 'point',
    status: 'upcoming',
    isVisible: false,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    targetUsers: 'all',
    participantCount: 0,
    imageUrl: '/events/double-point.jpg',
    createdAt: '2024-01-18',
  },
  {
    id: 'EVT005',
    title: '설날 특별 이벤트',
    description: '설날 연휴 특별 할인 및 쿠폰 증정',
    type: 'special',
    status: 'ended',
    isVisible: false,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    targetUsers: 'all',
    participantCount: 5621,
    imageUrl: '/events/newyear.jpg',
    createdAt: '2023-12-20',
  },
  {
    id: 'EVT006',
    title: '휴면 고객 복귀 이벤트',
    description: '3개월 이상 미이용 고객 대상 30% 할인',
    type: 'discount',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    targetUsers: 'dormant',
    participantCount: 128,
    imageUrl: '/events/comeback.jpg',
    createdAt: '2024-01-05',
  },
]

const statusConfig: Record<
  EventItem['status'],
  { label: string; variant: StatusVariant }
> = {
  active: { label: '진행중', variant: 'success' },
  upcoming: { label: '예정', variant: 'primary' },
  ended: { label: '종료', variant: 'default' },
}

const typeConfig: Record<
  EventItem['type'],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  discount: { label: '할인', icon: Percent },
  freeDelivery: { label: '무료배달', icon: Gift },
  coupon: { label: '쿠폰', icon: Gift },
  point: { label: '포인트', icon: Gift },
  special: { label: '특별', icon: Gift },
}

const targetConfig: Record<EventItem['targetUsers'], string> = {
  all: '전체',
  new: '신규',
  vip: 'VIP',
  dormant: '휴면',
}

export default function AdminEventsPage(): React.ReactElement {
  const [events, setEvents] = useState<ReadonlyArray<EventItem>>(mockEvents)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    event: EventItem | null
  }>({ isOpen: false, event: null })

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      const matchesType = typeFilter === 'all' || event.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [events, searchQuery, statusFilter, typeFilter])

  const stats = useMemo(() => {
    return {
      total: events.length,
      active: events.filter((e) => e.status === 'active').length,
      upcoming: events.filter((e) => e.status === 'upcoming').length,
      ended: events.filter((e) => e.status === 'ended').length,
    }
  }, [events])

  const statsCards = useMemo(
    () => [
      { icon: Calendar, iconColor: 'primary' as const, label: '전체', value: stats.total, suffix: '개' },
      { icon: Eye, iconColor: 'success' as const, label: '진행중', value: stats.active, suffix: '개' },
      { icon: Clock, iconColor: 'primary' as const, label: '예정', value: stats.upcoming, suffix: '개' },
      { icon: Calendar, iconColor: 'default' as const, label: '종료', value: stats.ended, suffix: '개' },
    ],
    [stats]
  )

  const toggleVisibility = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, isVisible: !event.isVisible } : event
      )
    )
  }, [])

  const handleDelete = useCallback(() => {
    if (deleteModal.event) {
      setEvents((prev) => prev.filter((e) => e.id !== deleteModal.event!.id))
      setDeleteModal({ isOpen: false, event: null })
    }
  }, [deleteModal.event])

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="이벤트 관리"
          description="프로모션 이벤트를 관리합니다"
          backLink="/admin"
        />
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          이벤트 등록
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
            placeholder="이벤트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

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
          <option value="active">진행중</option>
          <option value="upcoming">예정</option>
          <option value="ended">종료</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            typeFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">전체 유형</option>
          <option value="discount">할인</option>
          <option value="freeDelivery">무료배달</option>
          <option value="coupon">쿠폰</option>
          <option value="point">포인트</option>
          <option value="special">특별</option>
        </select>
      </div>

      {/* Event List */}
      {filteredEvents.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event) => {
            const TypeIcon = typeConfig[event.type].icon

            return (
              <div
                key={event.id}
                className={cn(
                  'rounded-xl bg-white p-4',
                  !event.isVisible && 'opacity-60'
                )}
              >
                {/* Badges */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge variant={statusConfig[event.status].variant}>
                      {statusConfig[event.status].label}
                    </StatusBadge>
                    <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig[event.type].label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{event.id}</span>
                </div>

                {/* Title & Description */}
                <h3 className="mb-1 text-sm font-semibold text-gray-900">
                  {event.title}
                </h3>
                <p className="mb-3 text-sm text-gray-500">{event.description}</p>

                {/* Meta */}
                <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.startDate} ~ {event.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    대상: {targetConfig[event.targetUsers]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    참여: {event.participantCount.toLocaleString()}명
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleVisibility(event.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium',
                      event.isVisible
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-50 text-green-600'
                    )}
                  >
                    {event.isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {event.isVisible ? '숨김' : '노출'}
                  </button>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: true, event })}
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
          icon={Calendar}
          title="검색 결과 없음"
          description="검색 조건에 맞는 이벤트가 없습니다"
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, event: null })}
        onConfirm={handleDelete}
        title="이벤트 삭제"
        message={`"${deleteModal.event?.title}" 이벤트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  )
}
