'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Download,
  Bike,
  Wallet,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import {
  PageHeader,
  StatsCardGrid,
  TabNavigation,
  SearchFilterBar,
  DataTable,
  StatusBadge,
  ActionMenu,
  BaseModal,
  ConfirmModal,
} from '@/components/features/admin/common'
import type {
  TabItem,
  TableColumn,
  FilterConfig,
  ActionMenuItem,
  StatusVariant,
} from '@/components/features/admin/types'

// Types
interface RiderSettlement {
  readonly id: string
  readonly riderId: string
  readonly riderName: string
  readonly phone: string
  readonly period: { readonly start: string; readonly end: string }
  readonly deliveryCount: number
  readonly totalDeliveryFee: number
  readonly incentive: number
  readonly deductions: number
  readonly netAmount: number
  readonly status: 'pending' | 'processing' | 'completed' | 'failed'
  readonly bankAccount: {
    readonly bank: string
    readonly accountNumber: string
    readonly accountHolder: string
  }
  readonly scheduledDate: string
  readonly processedDate: string | null
  readonly transactionId: string | null
  readonly avgRating: number
  readonly activeArea: string
}

// Mock Data
const mockSettlements: ReadonlyArray<RiderSettlement> = [
  {
    id: 'RSET001',
    riderId: 'RID001',
    riderName: '박배달',
    phone: '010-1111-2222',
    period: { start: '2024-01-08', end: '2024-01-14' },
    deliveryCount: 87,
    totalDeliveryFee: 348000,
    incentive: 52000,
    deductions: 0,
    netAmount: 400000,
    status: 'pending',
    bankAccount: {
      bank: '카카오뱅크',
      accountNumber: '3333-01-1234567',
      accountHolder: '박배달',
    },
    scheduledDate: '2024-01-17',
    processedDate: null,
    transactionId: null,
    avgRating: 4.9,
    activeArea: '강남구',
  },
  {
    id: 'RSET002',
    riderId: 'RID002',
    riderName: '김빠른',
    phone: '010-2222-3333',
    period: { start: '2024-01-08', end: '2024-01-14' },
    deliveryCount: 72,
    totalDeliveryFee: 288000,
    incentive: 35000,
    deductions: -5000,
    netAmount: 318000,
    status: 'processing',
    bankAccount: {
      bank: '토스뱅크',
      accountNumber: '1000-1234-5678',
      accountHolder: '김빠른',
    },
    scheduledDate: '2024-01-17',
    processedDate: null,
    transactionId: null,
    avgRating: 4.7,
    activeArea: '서초구',
  },
  {
    id: 'RSET003',
    riderId: 'RID003',
    riderName: '이달리',
    phone: '010-3333-4444',
    period: { start: '2024-01-08', end: '2024-01-14' },
    deliveryCount: 95,
    totalDeliveryFee: 380000,
    incentive: 65000,
    deductions: 0,
    netAmount: 445000,
    status: 'completed',
    bankAccount: {
      bank: '국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '이달리',
    },
    scheduledDate: '2024-01-15',
    processedDate: '2024-01-15',
    transactionId: 'RTXN123456',
    avgRating: 4.95,
    activeArea: '송파구',
  },
  {
    id: 'RSET004',
    riderId: 'RID004',
    riderName: '최스피드',
    phone: '010-4444-5555',
    period: { start: '2024-01-08', end: '2024-01-14' },
    deliveryCount: 58,
    totalDeliveryFee: 232000,
    incentive: 15000,
    deductions: -10000,
    netAmount: 237000,
    status: 'completed',
    bankAccount: {
      bank: '신한은행',
      accountNumber: '987-654-321098',
      accountHolder: '최스피드',
    },
    scheduledDate: '2024-01-15',
    processedDate: '2024-01-15',
    transactionId: 'RTXN789012',
    avgRating: 4.5,
    activeArea: '마포구',
  },
  {
    id: 'RSET005',
    riderId: 'RID005',
    riderName: '정라이더',
    phone: '010-5555-6666',
    period: { start: '2024-01-08', end: '2024-01-14' },
    deliveryCount: 43,
    totalDeliveryFee: 172000,
    incentive: 0,
    deductions: -8000,
    netAmount: 164000,
    status: 'failed',
    bankAccount: {
      bank: '우리은행',
      accountNumber: '456-789-012345',
      accountHolder: '정라이더',
    },
    scheduledDate: '2024-01-15',
    processedDate: null,
    transactionId: null,
    avgRating: 4.3,
    activeArea: '영등포구',
  },
]

const statusConfig: Record<
  RiderSettlement['status'],
  { label: string; variant: StatusVariant }
> = {
  pending: { label: '대기중', variant: 'warning' },
  processing: { label: '처리중', variant: 'info' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
}

const SETTLEMENT_TABS: ReadonlyArray<TabItem> = [
  { href: '/admin/settlements/owners', label: '점주 정산' },
  { href: '/admin/settlements/riders', label: '라이더 정산' },
  { href: '/admin/settlements/history', label: '정산 내역' },
]

const FILTER_CONFIG: ReadonlyArray<FilterConfig> = [
  {
    name: 'status',
    label: '상태',
    options: [
      { value: 'all', label: '전체' },
      { value: 'pending', label: '대기중' },
      { value: 'processing', label: '처리중' },
      { value: 'completed', label: '완료' },
      { value: 'failed', label: '실패' },
    ],
  },
  {
    name: 'period',
    label: '기간',
    options: [
      { value: 'this_week', label: '이번 주' },
      { value: 'last_week', label: '지난 주' },
      { value: 'this_month', label: '이번 달' },
      { value: 'last_month', label: '지난 달' },
    ],
  },
]

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getStatusIcon = (
  status: RiderSettlement['status']
): React.ReactElement => {
  switch (status) {
    case 'pending':
      return <Clock className="h-3.5 w-3.5" />
    case 'processing':
      return <TrendingUp className="h-3.5 w-3.5" />
    case 'completed':
      return <CheckCircle className="h-3.5 w-3.5" />
    case 'failed':
      return <XCircle className="h-3.5 w-3.5" />
  }
}

export default function RiderSettlementsPage(): React.ReactElement {
  const [settlements] = useState<ReadonlyArray<RiderSettlement>>(mockSettlements)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'all',
    period: 'this_week',
  })
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedSettlement, setSelectedSettlement] =
    useState<RiderSettlement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      const matchesSearch =
        settlement.riderName.includes(searchQuery) ||
        settlement.phone.includes(searchQuery) ||
        settlement.id.includes(searchQuery)

      const matchesStatus =
        filters.status === 'all' || settlement.status === filters.status

      return matchesSearch && matchesStatus
    })
  }, [settlements, searchQuery, filters])

  // Stats
  const stats = useMemo(() => {
    return {
      totalAmount: settlements.reduce((sum, s) => sum + s.netAmount, 0),
      totalDeliveries: settlements.reduce((sum, s) => sum + s.deliveryCount, 0),
      pendingAmount: settlements
        .filter((s) => s.status === 'pending' || s.status === 'processing')
        .reduce((sum, s) => sum + s.netAmount, 0),
      failed: settlements.filter((s) => s.status === 'failed').length,
    }
  }, [settlements])

  const statsCards = useMemo(
    () => [
      {
        icon: Wallet,
        iconColor: 'primary' as const,
        label: '총 정산액',
        value: formatCurrency(stats.totalAmount),
      },
      {
        icon: Bike,
        iconColor: 'success' as const,
        label: '총 배달 건수',
        value: stats.totalDeliveries,
        suffix: '건',
      },
      {
        icon: Clock,
        iconColor: 'warning' as const,
        label: '미정산액',
        value: formatCurrency(stats.pendingAmount),
      },
      {
        icon: AlertTriangle,
        iconColor: 'error' as const,
        label: '정산 실패',
        value: stats.failed,
        suffix: '건',
      },
    ],
    [stats]
  )

  const handleViewDetail = useCallback((settlement: RiderSettlement): void => {
    setSelectedSettlement(settlement)
    setShowDetailModal(true)
  }, [])

  const handleProcess = useCallback((settlement: RiderSettlement): void => {
    setSelectedSettlement(settlement)
    setShowProcessModal(true)
  }, [])

  const confirmProcess = useCallback((): void => {
    setIsProcessing(true)
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false)
      setShowProcessModal(false)
      setSelectedSettlement(null)
    }, 1000)
  }, [])

  const handleFilterChange = useCallback(
    (name: string, value: string): void => {
      setFilters((prev) => ({ ...prev, [name]: value }))
    },
    []
  )

  const handleResetFilters = useCallback((): void => {
    setFilters({ status: 'all', period: 'this_week' })
    setSearchQuery('')
  }, [])

  const getActionItems = useCallback(
    (settlement: RiderSettlement): ReadonlyArray<ActionMenuItem> => {
      const items: ActionMenuItem[] = [
        {
          label: '상세보기',
          icon: Eye,
          onClick: () => handleViewDetail(settlement),
        },
      ]

      if (settlement.status === 'pending' || settlement.status === 'failed') {
        items.push({
          label: '정산하기',
          icon: Send,
          onClick: () => handleProcess(settlement),
        })
      }

      return items
    },
    [handleViewDetail, handleProcess]
  )

  const columns: ReadonlyArray<TableColumn<RiderSettlement>> = useMemo(
    () => [
      {
        key: 'rider',
        header: '라이더',
        render: (settlement) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Bike className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {settlement.riderName}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{settlement.phone}</span>
                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                  <MapPin className="h-2.5 w-2.5" />
                  {settlement.activeArea}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'period',
        header: '정산기간',
        render: (settlement) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(settlement.period.start)} ~{' '}
            {formatDate(settlement.period.end)}
          </div>
        ),
      },
      {
        key: 'deliveryCount',
        header: '배달 건수',
        align: 'center',
        render: (settlement) => (
          <span className="font-semibold">{settlement.deliveryCount}건</span>
        ),
      },
      {
        key: 'deliveryFee',
        header: '배달비',
        align: 'right',
        render: (settlement) => (
          <span className="font-semibold">
            {formatCurrency(settlement.totalDeliveryFee)}
          </span>
        ),
      },
      {
        key: 'incentive',
        header: '인센티브',
        align: 'right',
        render: (settlement) => (
          <div>
            {settlement.incentive > 0 ? (
              <span className="text-sm text-green-600">
                +{formatCurrency(settlement.incentive)}
              </span>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
            {settlement.deductions < 0 && (
              <p className="mt-0.5 text-xs text-red-500">
                공제: {formatCurrency(settlement.deductions)}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'netAmount',
        header: '정산액',
        align: 'right',
        render: (settlement) => (
          <span className="text-base font-bold text-blue-600">
            {formatCurrency(settlement.netAmount)}
          </span>
        ),
      },
      {
        key: 'status',
        header: '상태',
        align: 'center',
        render: (settlement) => {
          const config = statusConfig[settlement.status]
          return (
            <StatusBadge
              variant={config.variant}
              icon={getStatusIcon(settlement.status)}
            >
              {config.label}
            </StatusBadge>
          )
        },
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (settlement) => (
          <ActionMenu items={[...getActionItems(settlement)]} />
        ),
      },
    ],
    [getActionItems]
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <PageHeader
        title="라이더 정산"
        description="라이더별 배달비 정산 현황을 관리합니다"
        actions={
          <>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              내보내기
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
              <Send className="h-4 w-4" />
              일괄 정산
            </button>
          </>
        }
      />

      {/* Stats Cards */}
      <StatsCardGrid cards={statsCards} className="mb-6" />

      {/* Tabs */}
      <TabNavigation
        tabs={SETTLEMENT_TABS}
        currentPath="/admin/settlements/riders"
        className="mb-5"
      />

      {/* Search and Filter */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="라이더명, 전화번호, 정산ID로 검색"
        filters={FILTER_CONFIG}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        className="mb-5"
      />

      {/* Settlements Table */}
      <DataTable
        columns={columns}
        data={filteredSettlements}
        keyExtractor={(settlement) => settlement.id}
        emptyIcon={Bike}
        emptyMessage="검색 조건에 맞는 정산 내역이 없습니다"
      />

      {/* Detail Modal */}
      <BaseModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="정산 상세"
        maxWidth="xl"
      >
        {selectedSettlement && (
          <div className="space-y-5">
            {/* Rider Info */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Bike className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">
                      {selectedSettlement.riderName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSettlement.phone}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  variant={statusConfig[selectedSettlement.status].variant}
                  icon={getStatusIcon(selectedSettlement.status)}
                >
                  {statusConfig[selectedSettlement.status].label}
                </StatusBadge>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedSettlement.activeArea}
                </span>
                <span className="text-sm text-gray-600">
                  평점: ⭐ {selectedSettlement.avgRating}
                </span>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">정산 내역</h4>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="flex justify-between border-b border-gray-100 px-4 py-3">
                  <span>배달 건수</span>
                  <span className="font-semibold">
                    {selectedSettlement.deliveryCount}건
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 px-4 py-3">
                  <span>배달비 합계</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedSettlement.totalDeliveryFee)}
                  </span>
                </div>
                {selectedSettlement.incentive > 0 && (
                  <div className="flex justify-between border-b border-gray-100 px-4 py-3 text-green-600">
                    <span>인센티브</span>
                    <span>+{formatCurrency(selectedSettlement.incentive)}</span>
                  </div>
                )}
                {selectedSettlement.deductions < 0 && (
                  <div className="flex justify-between border-b border-gray-100 px-4 py-3 text-red-600">
                    <span>공제액</span>
                    <span>{formatCurrency(selectedSettlement.deductions)}</span>
                  </div>
                )}
                <div className="flex justify-between bg-blue-50 px-4 py-3.5">
                  <span className="font-semibold">최종 정산액</span>
                  <span className="text-base font-bold text-blue-600">
                    {formatCurrency(selectedSettlement.netAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">정산 계좌</h4>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="font-semibold">
                    {selectedSettlement.bankAccount.bank}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedSettlement.bankAccount.accountNumber} (
                    {selectedSettlement.bankAccount.accountHolder})
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            {selectedSettlement.transactionId && (
              <div>
                <h4 className="mb-3 text-sm font-semibold">거래 정보</h4>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-700">
                    거래 ID: {selectedSettlement.transactionId}
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    처리일: {formatDate(selectedSettlement.processedDate!)}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        )}
      </BaseModal>

      {/* Process Confirm Modal */}
      <ConfirmModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onConfirm={confirmProcess}
        title="정산 처리"
        message={
          selectedSettlement ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4 text-left">
                <p className="mb-2 font-semibold">
                  {selectedSettlement.riderName}
                </p>
                <p className="mb-3 text-sm text-gray-600">
                  {selectedSettlement.bankAccount.bank}{' '}
                  {selectedSettlement.bankAccount.accountNumber}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedSettlement.netAmount)}
                </p>
              </div>
              <p className="text-gray-600">
                위 계좌로 정산금을 송금하시겠습니까?
              </p>
            </div>
          ) : (
            ''
          )
        }
        confirmText="정산하기"
        variant="info"
        isLoading={isProcessing}
      />
    </div>
  )
}
