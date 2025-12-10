'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Store,
  Mail,
  Phone,
  Calendar,
  Star,
  Ban,
  CheckCircle,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react'
import {
  PageHeader,
  StatsCardGrid,
  DataTable,
  StatusBadge,
  ActionMenu,
  EmptyState,
} from '@/components/features/admin/common'
import type {
  TableColumn,
  ActionMenuItem,
  StatusVariant,
} from '@/components/features/admin/types'
import { cn } from '@/lib/utils'

// Types
interface Owner {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly businessNumber: string
  readonly joinDate: string
  readonly storeCount: number
  readonly totalRevenue: number
  readonly avgRating: number
  readonly status: 'active' | 'inactive' | 'suspended'
  readonly settlementStatus: 'normal' | 'pending' | 'overdue'
}

// Mock Data
const mockOwners: ReadonlyArray<Owner> = [
  {
    id: '1',
    name: '박점주',
    email: 'owner1@email.com',
    phone: '010-1111-2222',
    businessNumber: '123-45-67890',
    joinDate: '2024-01-15',
    storeCount: 2,
    totalRevenue: 45600000,
    avgRating: 4.7,
    status: 'active',
    settlementStatus: 'normal',
  },
  {
    id: '2',
    name: '김사장',
    email: 'owner2@email.com',
    phone: '010-2222-3333',
    businessNumber: '234-56-78901',
    joinDate: '2024-02-20',
    storeCount: 1,
    totalRevenue: 28900000,
    avgRating: 4.5,
    status: 'active',
    settlementStatus: 'pending',
  },
  {
    id: '3',
    name: '이대표',
    email: 'owner3@email.com',
    phone: '010-3333-4444',
    businessNumber: '345-67-89012',
    joinDate: '2024-03-10',
    storeCount: 3,
    totalRevenue: 78200000,
    avgRating: 4.9,
    status: 'active',
    settlementStatus: 'normal',
  },
  {
    id: '4',
    name: '최점장',
    email: 'owner4@email.com',
    phone: '010-4444-5555',
    businessNumber: '456-78-90123',
    joinDate: '2024-04-05',
    storeCount: 1,
    totalRevenue: 12300000,
    avgRating: 3.8,
    status: 'inactive',
    settlementStatus: 'overdue',
  },
  {
    id: '5',
    name: '정사장',
    email: 'owner5@email.com',
    phone: '010-5555-6666',
    businessNumber: '567-89-01234',
    joinDate: '2024-05-15',
    storeCount: 1,
    totalRevenue: 5600000,
    avgRating: 2.5,
    status: 'suspended',
    settlementStatus: 'overdue',
  },
]

const statusConfig: Record<
  Owner['status'],
  { label: string; variant: StatusVariant }
> = {
  active: { label: '활성', variant: 'success' },
  inactive: { label: '휴면', variant: 'warning' },
  suspended: { label: '정지', variant: 'error' },
}

const settlementConfig: Record<
  Owner['settlementStatus'],
  { label: string; variant: StatusVariant }
> = {
  normal: { label: '정상', variant: 'success' },
  pending: { label: '대기', variant: 'warning' },
  overdue: { label: '연체', variant: 'error' },
}

export default function AdminOwnersPage(): React.ReactElement {
  const [owners] = useState<ReadonlyArray<Owner>>(mockOwners)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOwners = useMemo(() => {
    return owners.filter((o) => {
      const matchesSearch =
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.includes(searchQuery) ||
        o.businessNumber.includes(searchQuery)
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [owners, searchQuery, statusFilter])

  const stats = useMemo(() => {
    return {
      total: owners.length,
      active: owners.filter((o) => o.status === 'active').length,
      totalStores: owners.reduce((sum, o) => sum + o.storeCount, 0),
      overdue: owners.filter((o) => o.settlementStatus === 'overdue').length,
    }
  }, [owners])

  const statsCards = useMemo(
    () => [
      {
        icon: Users,
        iconColor: 'primary' as const,
        label: '전체',
        value: stats.total,
        suffix: '명',
      },
      {
        icon: CheckCircle,
        iconColor: 'success' as const,
        label: '활성',
        value: stats.active,
        suffix: '명',
      },
      {
        icon: Store,
        iconColor: 'primary' as const,
        label: '총 가게',
        value: stats.totalStores,
        suffix: '개',
      },
      {
        icon: AlertCircle,
        iconColor: 'error' as const,
        label: '연체',
        value: stats.overdue,
        suffix: '명',
      },
    ],
    [stats]
  )

  const getActionItems = useCallback(
    (owner: Owner): ReadonlyArray<ActionMenuItem> => {
      const items: ActionMenuItem[] = [
        {
          label: '상세 보기',
          icon: Store,
          onClick: () => {
            window.location.href = `/admin/users/owners/${owner.id}`
          },
        },
      ]

      if (owner.status !== 'suspended') {
        items.push({
          label: '이용 정지',
          icon: Ban,
          onClick: () => {
            // Handle suspend
          },
          variant: 'danger',
        })
      } else {
        items.push({
          label: '정지 해제',
          icon: CheckCircle,
          onClick: () => {
            // Handle unsuspend
          },
        })
      }

      return items
    },
    []
  )

  const columns: ReadonlyArray<TableColumn<Owner>> = useMemo(
    () => [
      {
        key: 'owner',
        header: '점주',
        render: (owner) => (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Store className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/owners/${owner.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {owner.name}
                </Link>
                <StatusBadge variant={statusConfig[owner.status].variant}>
                  {statusConfig[owner.status].label}
                </StatusBadge>
                <StatusBadge variant={settlementConfig[owner.settlementStatus].variant}>
                  정산 {settlementConfig[owner.settlementStatus].label}
                </StatusBadge>
              </div>
              <div className="mt-0.5 text-xs text-gray-500">
                사업자번호: {owner.businessNumber}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {owner.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {owner.phone}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'joinDate',
        header: '가입일',
        render: (owner) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            {owner.joinDate}
          </div>
        ),
      },
      {
        key: 'storeCount',
        header: '가게',
        align: 'center',
        render: (owner) => (
          <div className="flex items-center justify-center gap-1 text-sm">
            <Store className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold">{owner.storeCount}개</span>
          </div>
        ),
      },
      {
        key: 'totalRevenue',
        header: '총 매출',
        align: 'right',
        render: (owner) => (
          <div className="flex items-center justify-end gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold">
              {(owner.totalRevenue / 10000).toLocaleString()}만원
            </span>
          </div>
        ),
      },
      {
        key: 'avgRating',
        header: '평점',
        align: 'center',
        render: (owner) => (
          <div className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{owner.avgRating.toFixed(1)}</span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (owner) => (
          <ActionMenu items={[...getActionItems(owner)]} />
        ),
      },
    ],
    [getActionItems]
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <PageHeader
        title="점주 관리"
        description="플랫폼에 등록된 점주 목록을 관리합니다"
        backLink="/admin/users"
      />

      {/* Stats Cards */}
      <StatsCardGrid cards={statsCards} className="mb-6" />

      {/* Search and Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[300px] flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호, 사업자번호 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
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
          <option value="all">상태 전체</option>
          <option value="active">활성</option>
          <option value="inactive">휴면</option>
          <option value="suspended">정지</option>
        </select>
      </div>

      {/* Owner Table */}
      {filteredOwners.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredOwners}
          keyExtractor={(owner) => owner.id}
          emptyIcon={Store}
          emptyMessage="검색 결과가 없습니다"
        />
      ) : (
        <EmptyState
          icon={Store}
          title="검색 결과 없음"
          description="검색 조건에 맞는 점주가 없습니다"
        />
      )}
    </div>
  )
}
