'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Wallet,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  ArrowUpRight,
  XCircle,
  Download,
  Send,
  Eye,
  CreditCard,
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
  StatsCardProps,
  TabItem,
  FilterConfig,
  TableColumn,
  StatusVariant,
  ActionMenuItem,
} from '@/components/features/admin/types'

// ========================================
// Types
// ========================================
interface OwnerSettlement {
  id: string
  ownerId: string
  ownerName: string
  businessName: string
  stores: ReadonlyArray<{ id: string; name: string }>
  period: { start: string; end: string }
  totalSales: number
  platformFee: number
  deliveryFee: number
  adjustments: number
  netAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  bankAccount: {
    bank: string
    accountNumber: string
    accountHolder: string
  }
  scheduledDate: string
  processedDate: string | null
  transactionId: string | null
}

type SettlementStatus = OwnerSettlement['status']

// ========================================
// Constants
// ========================================
const STATUS_CONFIG: Record<SettlementStatus, { label: string; variant: StatusVariant }> = {
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

const STATUS_FILTER_OPTIONS: FilterConfig['options'] = [
  { label: '대기중', value: 'pending' },
  { label: '처리중', value: 'processing' },
  { label: '완료', value: 'completed' },
  { label: '실패', value: 'failed' },
]

// ========================================
// Mock Data
// ========================================
const MOCK_SETTLEMENTS: ReadonlyArray<OwnerSettlement> = [
  {
    id: 'SET001',
    ownerId: 'OWN001',
    ownerName: '김민수',
    businessName: '맛있는 치킨',
    stores: [
      { id: 'STR001', name: '맛있는 치킨 강남점' },
      { id: 'STR002', name: '맛있는 치킨 서초점' },
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 4560000,
    platformFee: 228000,
    deliveryFee: 152000,
    adjustments: -15000,
    netAmount: 4165000,
    status: 'pending',
    bankAccount: { bank: '국민은행', accountNumber: '123-456-789012', accountHolder: '김민수' },
    scheduledDate: '2024-01-15',
    processedDate: null,
    transactionId: null,
  },
  {
    id: 'SET002',
    ownerId: 'OWN002',
    ownerName: '이영희',
    businessName: '행복한 분식',
    stores: [{ id: 'STR003', name: '행복한 분식' }],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 2340000,
    platformFee: 117000,
    deliveryFee: 78000,
    adjustments: 0,
    netAmount: 2145000,
    status: 'processing',
    bankAccount: { bank: '신한은행', accountNumber: '987-654-321098', accountHolder: '이영희' },
    scheduledDate: '2024-01-15',
    processedDate: null,
    transactionId: null,
  },
  {
    id: 'SET003',
    ownerId: 'OWN003',
    ownerName: '박지성',
    businessName: '성원 중국집',
    stores: [{ id: 'STR004', name: '성원 중국집' }],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 3890000,
    platformFee: 194500,
    deliveryFee: 129700,
    adjustments: -8500,
    netAmount: 3557300,
    status: 'completed',
    bankAccount: { bank: '우리은행', accountNumber: '456-789-012345', accountHolder: '박지성' },
    scheduledDate: '2024-01-12',
    processedDate: '2024-01-12',
    transactionId: 'TXN123456789',
  },
  {
    id: 'SET004',
    ownerId: 'OWN004',
    ownerName: '최수연',
    businessName: '스시마루',
    stores: [
      { id: 'STR005', name: '스시마루 본점' },
      { id: 'STR006', name: '스시마루 역삼점' },
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 6780000,
    platformFee: 339000,
    deliveryFee: 226000,
    adjustments: -22000,
    netAmount: 6193000,
    status: 'completed',
    bankAccount: { bank: 'NH농협', accountNumber: '789-012-345678', accountHolder: '최수연' },
    scheduledDate: '2024-01-12',
    processedDate: '2024-01-12',
    transactionId: 'TXN987654321',
  },
  {
    id: 'SET005',
    ownerId: 'OWN005',
    ownerName: '정동욱',
    businessName: '피자나라',
    stores: [{ id: 'STR007', name: '피자나라 송파점' }],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 1890000,
    platformFee: 94500,
    deliveryFee: 63000,
    adjustments: 0,
    netAmount: 1732500,
    status: 'failed',
    bankAccount: { bank: '하나은행', accountNumber: '012-345-678901', accountHolder: '정동욱' },
    scheduledDate: '2024-01-12',
    processedDate: null,
    transactionId: null,
  },
]

// ========================================
// Utilities
// ========================================
function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(amount)}원`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getStatusIcon(status: SettlementStatus): React.ReactNode {
  const iconProps = { size: 14 }
  switch (status) {
    case 'pending':
      return <Clock {...iconProps} />
    case 'processing':
      return <ArrowUpRight {...iconProps} />
    case 'completed':
      return <CheckCircle {...iconProps} />
    case 'failed':
      return <XCircle {...iconProps} />
  }
}

// ========================================
// Main Component
// ========================================
export default function OwnerSettlementsPage(): React.ReactElement {
  const [settlements] = useState<ReadonlyArray<OwnerSettlement>>(MOCK_SETTLEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<OwnerSettlement | null>(null)

  // Filtered data
  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      const matchesSearch =
        settlement.ownerName.includes(searchQuery) ||
        settlement.businessName.includes(searchQuery) ||
        settlement.id.includes(searchQuery)
      const matchesStatus = !filterStatus || settlement.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [settlements, searchQuery, filterStatus])

  // Stats calculation
  const stats = useMemo(() => {
    const completed = settlements.filter((s) => s.status === 'completed').length
    const failed = settlements.filter((s) => s.status === 'failed').length
    const totalAmount = settlements.reduce((sum, s) => sum + s.netAmount, 0)
    const pendingAmount = settlements
      .filter((s) => s.status === 'pending' || s.status === 'processing')
      .reduce((sum, s) => sum + s.netAmount, 0)
    return { completed, failed, totalAmount, pendingAmount }
  }, [settlements])

  // Stats cards config
  const statsCards: ReadonlyArray<StatsCardProps> = useMemo(
    () => [
      { icon: Wallet, iconColor: 'primary', label: '총 정산액', value: formatCurrency(stats.totalAmount) },
      { icon: Clock, iconColor: 'warning', label: '미정산액', value: formatCurrency(stats.pendingAmount) },
      { icon: CheckCircle, iconColor: 'success', label: '완료', value: stats.completed, suffix: '건' },
      { icon: AlertTriangle, iconColor: 'error', label: '실패', value: stats.failed, suffix: '건' },
    ],
    [stats]
  )

  // Filter config
  const filters: ReadonlyArray<FilterConfig> = useMemo(
    () => [{ name: 'status', label: '상태', options: STATUS_FILTER_OPTIONS, value: filterStatus }],
    [filterStatus]
  )

  // Handlers
  const handleFilterChange = useCallback((name: string, value: string): void => {
    if (name === 'status') setFilterStatus(value)
  }, [])

  const handleFilterReset = useCallback((): void => {
    setFilterStatus('')
  }, [])

  const handleViewDetail = useCallback((settlement: OwnerSettlement): void => {
    setSelectedSettlement(settlement)
    setShowDetailModal(true)
  }, [])

  const handleProcess = useCallback((settlement: OwnerSettlement): void => {
    setSelectedSettlement(settlement)
    setShowProcessModal(true)
  }, [])

  const handleConfirmProcess = useCallback((): void => {
    setShowProcessModal(false)
    setSelectedSettlement(null)
  }, [])

  // Action menu items generator
  const getActionItems = useCallback(
    (settlement: OwnerSettlement): ReadonlyArray<ActionMenuItem> => {
      const items: ActionMenuItem[] = [{ label: '상세보기', onClick: () => handleViewDetail(settlement), icon: Eye }]
      if (settlement.status === 'pending' || settlement.status === 'failed') {
        items.push({ label: '정산하기', onClick: () => handleProcess(settlement), icon: Send })
      }
      return items
    },
    [handleViewDetail, handleProcess]
  )

  // Table columns
  const columns: ReadonlyArray<TableColumn<OwnerSettlement>> = useMemo(
    () => [
      {
        key: 'business',
        header: '점주/상호',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Building2 size={20} className="text-gray-500" />
            </div>
            <div>
              <p className="font-semibold">{row.businessName}</p>
              <p className="text-xs text-gray-500">
                {row.ownerName} · {row.stores.length}개 매장
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'period',
        header: '정산기간',
        render: (row) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar size={14} />
            {formatDate(row.period.start)} ~ {formatDate(row.period.end)}
          </div>
        ),
      },
      {
        key: 'totalSales',
        header: '총매출',
        align: 'right',
        render: (row) => <span className="font-semibold">{formatCurrency(row.totalSales)}</span>,
      },
      {
        key: 'fee',
        header: '수수료',
        align: 'right',
        render: (row) => (
          <div>
            <span className="text-sm text-red-500">-{formatCurrency(row.platformFee + row.deliveryFee)}</span>
            {row.adjustments !== 0 && (
              <p className={`mt-0.5 text-xs ${row.adjustments > 0 ? 'text-green-500' : 'text-red-500'}`}>
                조정: {row.adjustments > 0 ? '+' : ''}
                {formatCurrency(row.adjustments)}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'netAmount',
        header: '정산액',
        align: 'right',
        render: (row) => <span className="text-base font-bold text-primary">{formatCurrency(row.netAmount)}</span>,
      },
      {
        key: 'status',
        header: '상태',
        align: 'center',
        render: (row) => (
          <StatusBadge variant={STATUS_CONFIG[row.status].variant} className="inline-flex items-center gap-1">
            {getStatusIcon(row.status)}
            {STATUS_CONFIG[row.status].label}
          </StatusBadge>
        ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (row) => <ActionMenu items={getActionItems(row)} />,
      },
    ],
    [getActionItems]
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <PageHeader
        title="점주 정산"
        description="점주별 정산 현황을 관리합니다"
        actions={[
          { label: '내보내기', onClick: () => {}, icon: Download, variant: 'outline' },
          { label: '일괄 정산', onClick: () => {}, icon: Send, variant: 'primary' },
        ]}
        className="mb-6"
      />

      {/* Stats */}
      <StatsCardGrid cards={statsCards} className="mb-6" />

      {/* Tabs */}
      <TabNavigation tabs={SETTLEMENT_TABS} activeHref="/admin/settlements/owners" className="mb-6" />

      {/* Search & Filter */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="점주명, 상호명, 정산ID로 검색"
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        className="mb-6"
      />

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={filteredSettlements}
          keyExtractor={(row) => row.id}
          emptyIcon={Wallet}
          emptyMessage="검색 조건에 맞는 정산 내역이 없습니다"
        />
      </div>

      {/* Detail Modal */}
      <BaseModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="정산 상세"
        maxWidth="lg"
      >
        {selectedSettlement && (
          <SettlementDetailContent settlement={selectedSettlement} onClose={() => setShowDetailModal(false)} />
        )}
      </BaseModal>

      {/* Process Confirmation Modal */}
      <ConfirmModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onConfirm={handleConfirmProcess}
        title="정산 처리"
        message={
          selectedSettlement
            ? `${selectedSettlement.businessName}에 ${formatCurrency(selectedSettlement.netAmount)}을 송금하시겠습니까?`
            : ''
        }
        confirmText="정산하기"
        variant="info"
      />
    </div>
  )
}

// ========================================
// Sub Components
// ========================================
function SettlementDetailContent({
  settlement,
  onClose,
}: {
  readonly settlement: OwnerSettlement
  readonly onClose: () => void
}): React.ReactElement {
  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base font-semibold">{settlement.businessName}</span>
          <StatusBadge variant={STATUS_CONFIG[settlement.status].variant} className="inline-flex items-center gap-1">
            {getStatusIcon(settlement.status)}
            {STATUS_CONFIG[settlement.status].label}
          </StatusBadge>
        </div>
        <p className="text-sm text-gray-600">
          점주: {settlement.ownerName} · 정산ID: {settlement.id}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          정산기간: {formatDate(settlement.period.start)} ~ {formatDate(settlement.period.end)}
        </p>
      </div>

      {/* Amount Breakdown */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">정산 내역</h4>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="flex justify-between border-b border-gray-100 px-4 py-3">
            <span>총 매출</span>
            <span className="font-semibold">{formatCurrency(settlement.totalSales)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 px-4 py-3 text-red-600">
            <span>플랫폼 수수료 (5%)</span>
            <span>-{formatCurrency(settlement.platformFee)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 px-4 py-3 text-red-600">
            <span>배달비 공제</span>
            <span>-{formatCurrency(settlement.deliveryFee)}</span>
          </div>
          {settlement.adjustments !== 0 && (
            <div
              className={`flex justify-between border-b border-gray-100 px-4 py-3 ${settlement.adjustments > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>조정액</span>
              <span>
                {settlement.adjustments > 0 ? '+' : ''}
                {formatCurrency(settlement.adjustments)}
              </span>
            </div>
          )}
          <div className="flex justify-between bg-primary/5 px-4 py-3.5">
            <span className="font-semibold">최종 정산액</span>
            <span className="text-base font-bold text-primary">{formatCurrency(settlement.netAmount)}</span>
          </div>
        </div>
      </div>

      {/* Bank Info */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">정산 계좌</h4>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
          <CreditCard size={24} className="text-gray-400" />
          <div>
            <p className="font-semibold">{settlement.bankAccount.bank}</p>
            <p className="text-sm text-gray-600">
              {settlement.bankAccount.accountNumber} ({settlement.bankAccount.accountHolder})
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Info */}
      {settlement.transactionId && settlement.processedDate && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">거래 정보</h4>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">거래 ID: {settlement.transactionId}</p>
            <p className="mt-1 text-sm text-green-700">처리일: {formatDate(settlement.processedDate)}</p>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-lg border border-gray-200 bg-white py-3 text-sm font-medium transition-colors hover:bg-gray-50"
      >
        닫기
      </button>
    </div>
  )
}
