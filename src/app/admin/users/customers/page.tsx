'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Star,
  Ban,
  CheckCircle,
  Users,
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
interface Customer {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly joinDate: string
  readonly orderCount: number
  readonly totalSpent: number
  readonly avgRating: number
  readonly status: 'active' | 'inactive' | 'banned'
  readonly lastOrderDate: string
  readonly tier: 'normal' | 'silver' | 'gold' | 'vip'
}

// Mock Data
const mockCustomers: ReadonlyArray<Customer> = [
  {
    id: '1',
    name: '김민수',
    email: 'minsu.kim@email.com',
    phone: '010-1234-5678',
    joinDate: '2024-03-15',
    orderCount: 45,
    totalSpent: 1250000,
    avgRating: 4.8,
    status: 'active',
    lastOrderDate: '2024-12-08',
    tier: 'vip',
  },
  {
    id: '2',
    name: '이영희',
    email: 'younghee.lee@email.com',
    phone: '010-2345-6789',
    joinDate: '2024-05-20',
    orderCount: 28,
    totalSpent: 780000,
    avgRating: 4.5,
    status: 'active',
    lastOrderDate: '2024-12-07',
    tier: 'gold',
  },
  {
    id: '3',
    name: '박철수',
    email: 'cheolsu.park@email.com',
    phone: '010-3456-7890',
    joinDate: '2024-06-10',
    orderCount: 15,
    totalSpent: 420000,
    avgRating: 4.2,
    status: 'active',
    lastOrderDate: '2024-12-05',
    tier: 'silver',
  },
  {
    id: '4',
    name: '정수진',
    email: 'sujin.jung@email.com',
    phone: '010-4567-8901',
    joinDate: '2024-08-01',
    orderCount: 8,
    totalSpent: 180000,
    avgRating: 4.0,
    status: 'inactive',
    lastOrderDate: '2024-10-15',
    tier: 'normal',
  },
  {
    id: '5',
    name: '최동욱',
    email: 'dongwook.choi@email.com',
    phone: '010-5678-9012',
    joinDate: '2024-02-28',
    orderCount: 62,
    totalSpent: 1890000,
    avgRating: 3.2,
    status: 'banned',
    lastOrderDate: '2024-11-20',
    tier: 'gold',
  },
]

const tierConfig: Record<
  Customer['tier'],
  { label: string; className: string }
> = {
  vip: { label: 'VIP', className: 'bg-amber-100 text-amber-700' },
  gold: { label: 'Gold', className: 'bg-yellow-100 text-yellow-700' },
  silver: { label: 'Silver', className: 'bg-gray-100 text-gray-600' },
  normal: { label: 'Normal', className: 'bg-gray-50 text-gray-400' },
}

const statusConfig: Record<
  Customer['status'],
  { label: string; variant: StatusVariant }
> = {
  active: { label: '활성', variant: 'success' },
  inactive: { label: '휴면', variant: 'warning' },
  banned: { label: '정지', variant: 'error' },
}

export default function AdminCustomersPage(): React.ReactElement {
  const [customers] = useState<ReadonlyArray<Customer>>(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesTier = tierFilter === 'all' || c.tier === tierFilter
      return matchesSearch && matchesStatus && matchesTier
    })
  }, [customers, searchQuery, statusFilter, tierFilter])

  const stats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      inactive: customers.filter((c) => c.status === 'inactive').length,
      banned: customers.filter((c) => c.status === 'banned').length,
    }
  }, [customers])

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
        icon: User,
        iconColor: 'warning' as const,
        label: '휴면',
        value: stats.inactive,
        suffix: '명',
      },
      {
        icon: Ban,
        iconColor: 'error' as const,
        label: '정지',
        value: stats.banned,
        suffix: '명',
      },
    ],
    [stats]
  )

  const getActionItems = useCallback(
    (customer: Customer): ReadonlyArray<ActionMenuItem> => {
      const items: ActionMenuItem[] = [
        {
          label: '상세 보기',
          icon: User,
          onClick: () => {
            window.location.href = `/admin/users/customers/${customer.id}`
          },
        },
      ]

      if (customer.status !== 'banned') {
        items.push({
          label: '이용 정지',
          icon: Ban,
          onClick: () => {
            // Handle ban
          },
          variant: 'danger',
        })
      } else {
        items.push({
          label: '정지 해제',
          icon: CheckCircle,
          onClick: () => {
            // Handle unban
          },
        })
      }

      return items
    },
    []
  )

  const columns: ReadonlyArray<TableColumn<Customer>> = useMemo(
    () => [
      {
        key: 'customer',
        header: '고객',
        render: (customer) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/customers/${customer.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {customer.name}
                </Link>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-xs font-semibold uppercase',
                    tierConfig[customer.tier].className
                  )}
                >
                  {tierConfig[customer.tier].label}
                </span>
                <StatusBadge variant={statusConfig[customer.status].variant}>
                  {statusConfig[customer.status].label}
                </StatusBadge>
              </div>
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'joinDate',
        header: '가입일',
        render: (customer) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            {customer.joinDate}
          </div>
        ),
      },
      {
        key: 'orderCount',
        header: '주문',
        align: 'center',
        render: (customer) => (
          <div className="flex items-center justify-center gap-1 text-sm">
            <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold">{customer.orderCount}회</span>
          </div>
        ),
      },
      {
        key: 'totalSpent',
        header: '총 결제',
        align: 'right',
        render: (customer) => (
          <span className="font-semibold">
            {customer.totalSpent.toLocaleString()}원
          </span>
        ),
      },
      {
        key: 'avgRating',
        header: '평균 평점',
        align: 'center',
        render: (customer) => (
          <div className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{customer.avgRating.toFixed(1)}</span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (customer) => (
          <ActionMenu items={[...getActionItems(customer)]} />
        ),
      },
    ],
    [getActionItems]
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <PageHeader
        title="고객 관리"
        description="플랫폼에 가입한 고객 목록을 관리합니다"
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
            placeholder="이름, 이메일, 전화번호 검색"
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
          <option value="banned">정지</option>
        </select>

        {/* Tier Filter */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            tierFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">등급 전체</option>
          <option value="vip">VIP</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {/* Customer Table */}
      {filteredCustomers.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(customer) => customer.id}
          emptyIcon={User}
          emptyMessage="검색 결과가 없습니다"
        />
      ) : (
        <EmptyState
          icon={User}
          title="검색 결과 없음"
          description="검색 조건에 맞는 고객이 없습니다"
        />
      )}
    </div>
  )
}
