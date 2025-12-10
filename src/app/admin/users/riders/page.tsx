'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Bike,
  Phone,
  Calendar,
  Star,
  Ban,
  CheckCircle,
  MapPin,
  Package,
  Users,
  Wifi,
  WifiOff,
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
interface Rider {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly joinDate: string
  readonly vehicleType: 'motorcycle' | 'bicycle' | 'car'
  readonly deliveryCount: number
  readonly totalEarnings: number
  readonly avgRating: number
  readonly status: 'active' | 'inactive' | 'suspended'
  readonly isOnline: boolean
  readonly currentArea: string
}

// Mock Data
const mockRiders: ReadonlyArray<Rider> = [
  {
    id: '1',
    name: '김라이더',
    email: 'rider1@email.com',
    phone: '010-1111-3333',
    joinDate: '2024-03-01',
    vehicleType: 'motorcycle',
    deliveryCount: 1234,
    totalEarnings: 8500000,
    avgRating: 4.9,
    status: 'active',
    isOnline: true,
    currentArea: '강남구',
  },
  {
    id: '2',
    name: '이배달',
    email: 'rider2@email.com',
    phone: '010-2222-4444',
    joinDate: '2024-04-15',
    vehicleType: 'motorcycle',
    deliveryCount: 876,
    totalEarnings: 6200000,
    avgRating: 4.7,
    status: 'active',
    isOnline: true,
    currentArea: '서초구',
  },
  {
    id: '3',
    name: '박퀵',
    email: 'rider3@email.com',
    phone: '010-3333-5555',
    joinDate: '2024-05-20',
    vehicleType: 'bicycle',
    deliveryCount: 432,
    totalEarnings: 2800000,
    avgRating: 4.5,
    status: 'active',
    isOnline: false,
    currentArea: '마포구',
  },
  {
    id: '4',
    name: '최달리',
    email: 'rider4@email.com',
    phone: '010-4444-6666',
    joinDate: '2024-06-10',
    vehicleType: 'motorcycle',
    deliveryCount: 156,
    totalEarnings: 980000,
    avgRating: 3.8,
    status: 'inactive',
    isOnline: false,
    currentArea: '송파구',
  },
  {
    id: '5',
    name: '정빠름',
    email: 'rider5@email.com',
    phone: '010-5555-7777',
    joinDate: '2024-02-01',
    vehicleType: 'motorcycle',
    deliveryCount: 2341,
    totalEarnings: 15600000,
    avgRating: 3.2,
    status: 'suspended',
    isOnline: false,
    currentArea: '영등포구',
  },
]

const statusConfig: Record<
  Rider['status'],
  { label: string; variant: StatusVariant }
> = {
  active: { label: '활성', variant: 'success' },
  inactive: { label: '휴면', variant: 'warning' },
  suspended: { label: '정지', variant: 'error' },
}

const vehicleConfig: Record<
  Rider['vehicleType'],
  { label: string; emoji: string }
> = {
  motorcycle: { label: '오토바이', emoji: '🏍️' },
  bicycle: { label: '자전거', emoji: '🚴' },
  car: { label: '자동차', emoji: '🚗' },
}

export default function AdminRidersPage(): React.ReactElement {
  const [riders] = useState<ReadonlyArray<Rider>>(mockRiders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vehicleFilter, setVehicleFilter] = useState<string>('all')

  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery)
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const matchesVehicle =
        vehicleFilter === 'all' || r.vehicleType === vehicleFilter
      return matchesSearch && matchesStatus && matchesVehicle
    })
  }, [riders, searchQuery, statusFilter, vehicleFilter])

  const stats = useMemo(() => {
    return {
      total: riders.length,
      online: riders.filter((r) => r.isOnline).length,
      offline: riders.filter((r) => !r.isOnline).length,
      suspended: riders.filter((r) => r.status === 'suspended').length,
    }
  }, [riders])

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
        icon: Wifi,
        iconColor: 'success' as const,
        label: '온라인',
        value: stats.online,
        suffix: '명',
      },
      {
        icon: WifiOff,
        iconColor: 'warning' as const,
        label: '오프라인',
        value: stats.offline,
        suffix: '명',
      },
      {
        icon: Ban,
        iconColor: 'error' as const,
        label: '정지',
        value: stats.suspended,
        suffix: '명',
      },
    ],
    [stats]
  )

  const getActionItems = useCallback(
    (rider: Rider): ReadonlyArray<ActionMenuItem> => {
      const items: ActionMenuItem[] = [
        {
          label: '상세 보기',
          icon: Bike,
          onClick: () => {
            window.location.href = `/admin/users/riders/${rider.id}`
          },
        },
      ]

      if (rider.status !== 'suspended') {
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

  const columns: ReadonlyArray<TableColumn<Rider>> = useMemo(
    () => [
      {
        key: 'rider',
        header: '라이더',
        render: (rider) => (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-full',
                rider.isOnline ? 'bg-green-100' : 'bg-gray-100'
              )}
            >
              <Bike
                className={cn(
                  'h-6 w-6',
                  rider.isOnline ? 'text-green-600' : 'text-gray-400'
                )}
              />
              {rider.isOnline && (
                <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/riders/${rider.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {rider.name}
                </Link>
                <span className="text-base">
                  {vehicleConfig[rider.vehicleType].emoji}
                </span>
                <StatusBadge variant={statusConfig[rider.status].variant}>
                  {statusConfig[rider.status].label}
                </StatusBadge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {rider.phone}
                </span>
                {rider.isOnline && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {rider.currentArea}
                  </span>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'joinDate',
        header: '가입일',
        render: (rider) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            {rider.joinDate}
          </div>
        ),
      },
      {
        key: 'deliveryCount',
        header: '배달',
        align: 'center',
        render: (rider) => (
          <div className="flex items-center justify-center gap-1 text-sm">
            <Package className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold">
              {rider.deliveryCount.toLocaleString()}건
            </span>
          </div>
        ),
      },
      {
        key: 'totalEarnings',
        header: '총 수입',
        align: 'right',
        render: (rider) => (
          <span className="font-semibold">
            {(rider.totalEarnings / 10000).toLocaleString()}만원
          </span>
        ),
      },
      {
        key: 'avgRating',
        header: '평균 평점',
        align: 'center',
        render: (rider) => (
          <div className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rider.avgRating.toFixed(1)}</span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (rider) => (
          <ActionMenu items={[...getActionItems(rider)]} />
        ),
      },
    ],
    [getActionItems]
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <PageHeader
        title="라이더 관리"
        description="플랫폼에 등록된 라이더 목록을 관리합니다"
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
          <option value="suspended">정지</option>
        </select>

        {/* Vehicle Filter */}
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            vehicleFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">이동수단 전체</option>
          <option value="motorcycle">오토바이</option>
          <option value="bicycle">자전거</option>
          <option value="car">자동차</option>
        </select>
      </div>

      {/* Rider Table */}
      {filteredRiders.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredRiders}
          keyExtractor={(rider) => rider.id}
          emptyIcon={Bike}
          emptyMessage="검색 결과가 없습니다"
        />
      ) : (
        <EmptyState
          icon={Bike}
          title="검색 결과 없음"
          description="검색 조건에 맞는 라이더가 없습니다"
        />
      )}
    </div>
  )
}
