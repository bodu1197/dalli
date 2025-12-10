'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Bike,
  FileText,
  RefreshCw
} from 'lucide-react'

// Types
interface SettlementHistory {
  id: string
  type: 'owner' | 'rider'
  recipientId: string
  recipientName: string
  businessName?: string
  amount: number
  status: 'completed' | 'failed' | 'refunded'
  bankAccount: {
    bank: string
    accountNumber: string
  }
  processedAt: string
  transactionId: string | null
  failReason?: string
  period: { start: string; end: string }
}

// Mock Data
const mockHistory: SettlementHistory[] = [
  {
    id: 'TXN001',
    type: 'owner',
    recipientId: 'OWN003',
    recipientName: '박지성',
    businessName: '성원 중국집',
    amount: 3557300,
    status: 'completed',
    bankAccount: {
      bank: '우리은행',
      accountNumber: '456-789-012345'
    },
    processedAt: '2024-01-12T10:30:00',
    transactionId: 'TXN123456789',
    period: { start: '2024-01-01', end: '2024-01-07' }
  },
  {
    id: 'TXN002',
    type: 'owner',
    recipientId: 'OWN004',
    recipientName: '최수연',
    businessName: '스시마루',
    amount: 6193000,
    status: 'completed',
    bankAccount: {
      bank: 'NH농협',
      accountNumber: '789-012-345678'
    },
    processedAt: '2024-01-12T10:35:00',
    transactionId: 'TXN987654321',
    period: { start: '2024-01-01', end: '2024-01-07' }
  },
  {
    id: 'TXN003',
    type: 'rider',
    recipientId: 'RID003',
    recipientName: '이달리',
    amount: 445000,
    status: 'completed',
    bankAccount: {
      bank: '국민은행',
      accountNumber: '123-456-789012'
    },
    processedAt: '2024-01-15T14:20:00',
    transactionId: 'RTXN123456',
    period: { start: '2024-01-08', end: '2024-01-14' }
  },
  {
    id: 'TXN004',
    type: 'rider',
    recipientId: 'RID004',
    recipientName: '최스피드',
    amount: 237000,
    status: 'completed',
    bankAccount: {
      bank: '신한은행',
      accountNumber: '987-654-321098'
    },
    processedAt: '2024-01-15T14:25:00',
    transactionId: 'RTXN789012',
    period: { start: '2024-01-08', end: '2024-01-14' }
  },
  {
    id: 'TXN005',
    type: 'rider',
    recipientId: 'RID005',
    recipientName: '정라이더',
    amount: 164000,
    status: 'failed',
    bankAccount: {
      bank: '우리은행',
      accountNumber: '456-789-012345'
    },
    processedAt: '2024-01-15T14:30:00',
    transactionId: null,
    failReason: '계좌번호 오류',
    period: { start: '2024-01-08', end: '2024-01-14' }
  },
  {
    id: 'TXN006',
    type: 'owner',
    recipientId: 'OWN001',
    recipientName: '김민수',
    businessName: '맛있는 치킨',
    amount: 4150000,
    status: 'completed',
    bankAccount: {
      bank: '국민은행',
      accountNumber: '123-456-789012'
    },
    processedAt: '2024-01-08T09:00:00',
    transactionId: 'TXN111222333',
    period: { start: '2023-12-25', end: '2023-12-31' }
  },
  {
    id: 'TXN007',
    type: 'owner',
    recipientId: 'OWN002',
    recipientName: '이영희',
    businessName: '행복한 분식',
    amount: 2100000,
    status: 'refunded',
    bankAccount: {
      bank: '신한은행',
      accountNumber: '987-654-321098'
    },
    processedAt: '2024-01-08T09:05:00',
    transactionId: 'TXN444555666',
    failReason: '중복 송금으로 인한 환불',
    period: { start: '2023-12-25', end: '2023-12-31' }
  }
]

const statusLabels: Record<SettlementHistory['status'], string> = {
  completed: '완료',
  failed: '실패',
  refunded: '환불'
}

const statusColors: Record<SettlementHistory['status'], string> = {
  completed: 'var(--color-success-500)',
  failed: 'var(--color-error-500)',
  refunded: 'var(--color-warning-500)'
}

export default function SettlementHistoryPage() {
  const [history] = useState<SettlementHistory[]>(mockHistory)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Filter history
  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.recipientName.includes(searchQuery) ||
      item.businessName?.includes(searchQuery) ||
      item.id.includes(searchQuery) ||
      item.transactionId?.includes(searchQuery)

    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Stats
  const stats = {
    totalTransactions: history.length,
    completedAmount: history.filter(h => h.status === 'completed').reduce((sum, h) => sum + h.amount, 0),
    failedCount: history.filter(h => h.status === 'failed').length,
    refundedAmount: history.filter(h => h.status === 'refunded').reduce((sum, h) => sum + h.amount, 0),
    ownerCount: history.filter(h => h.type === 'owner').length,
    riderCount: history.filter(h => h.type === 'rider').length
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusIcon = (status: SettlementHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} />
      case 'failed':
        return <XCircle size={14} />
      case 'refunded':
        return <RefreshCw size={14} />
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>정산 내역</h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', marginTop: '4px' }}>
              모든 정산 거래 내역을 확인합니다
            </p>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <Download size={18} />
            내보내기
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={24} color="var(--color-success-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>정산 완료액</p>
              <p style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(stats.completedAmount)}</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={24} color="var(--color-primary-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>총 거래 건수</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.totalTransactions}건</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-error-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <XCircle size={24} color="var(--color-error-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>실패 건수</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.failedCount}건</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-warning-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RefreshCw size={24} color="var(--color-warning-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>환불액</p>
              <p style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(stats.refundedAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--color-gray-200)',
        paddingBottom: '16px'
      }}>
        <Link
          href="/admin/settlements/owners"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-gray-100)',
            color: 'var(--color-gray-700)',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          점주 정산
        </Link>
        <Link
          href="/admin/settlements/riders"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-gray-100)',
            color: 'var(--color-gray-700)',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          라이더 정산
        </Link>
        <Link
          href="/admin/settlements/history"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary-500)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          정산 내역
        </Link>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          minWidth: '300px',
          position: 'relative'
        }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-gray-400)'
            }}
          />
          <input
            type="text"
            placeholder="수령인명, 상호명, 거래ID로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="정산 내역 검색"
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <Filter size={18} />
            필터
            <ChevronDown size={16} />
          </button>

          {showFilterMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: '16px',
              minWidth: '280px',
              zIndex: 100
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="filter-type" style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-gray-600)'
                }}>
                  유형
                </label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">전체</option>
                  <option value="owner">점주</option>
                  <option value="rider">라이더</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="filter-status" style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-gray-600)'
                }}>
                  상태
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">전체</option>
                  <option value="completed">완료</option>
                  <option value="failed">실패</option>
                  <option value="refunded">환불</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="filter-period" style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-gray-600)'
                }}>
                  기간
                </label>
                <select
                  id="filter-period"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">전체</option>
                  <option value="today">오늘</option>
                  <option value="this_week">이번 주</option>
                  <option value="this_month">이번 달</option>
                  <option value="last_month">지난 달</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFilterType('all')
                  setFilterStatus('all')
                  setFilterPeriod('all')
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>거래 ID</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>유형</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>수령인</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>계좌정보</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>금액</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>상태</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>처리일시</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid var(--color-gray-100)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                tabIndex={0}
              >
                <td style={{ padding: '16px' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
                      {item.id}
                    </span>
                    {item.transactionId && (
                      <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                        {item.transactionId}
                      </p>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: item.type === 'owner' ? 'var(--color-primary-50)' : 'var(--color-success-50)',
                    color: item.type === 'owner' ? 'var(--color-primary-600)' : 'var(--color-success-600)'
                  }}>
                    {item.type === 'owner' ? <Building2 size={14} /> : <Bike size={14} />}
                    {item.type === 'owner' ? '점주' : '라이더'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{item.recipientName}</p>
                    {item.businessName && (
                      <p style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                        {item.businessName}
                      </p>
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: '2px' }}>
                      {formatDate(item.period.start)} ~ {formatDate(item.period.end)}
                    </p>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <p style={{ fontWeight: 500 }}>{item.bankAccount.bank}</p>
                    <p style={{ color: 'var(--color-gray-500)' }}>{item.bankAccount.accountNumber}</p>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: item.status === 'refunded' ? 'var(--color-warning-600)' : 'var(--color-gray-900)'
                  }}>
                    {item.status === 'refunded' ? '-' : ''}{formatCurrency(item.amount)}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: statusColors[item.status],
                      backgroundColor: `${statusColors[item.status]}15`
                    }}>
                      {getStatusIcon(item.status)}
                      {statusLabels[item.status]}
                    </span>
                    {item.failReason && (
                      <p style={{
                        fontSize: '11px',
                        color: item.status === 'failed' ? 'var(--color-error-500)' : 'var(--color-warning-500)',
                        marginTop: '4px'
                      }}>
                        {item.failReason}
                      </p>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-600)', fontSize: '13px' }}>
                    <Clock size={14} />
                    {formatDateTime(item.processedAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHistory.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--color-gray-500)'
          }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>검색 조건에 맞는 정산 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* Summary by Type */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} color="var(--color-primary-500)" />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>점주 정산</p>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{stats.ownerCount}건</p>
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--color-gray-50)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>완료</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                {formatCurrency(history.filter(h => h.type === 'owner' && h.status === 'completed').reduce((sum, h) => sum + h.amount, 0))}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>실패/환불</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-error-500)' }}>
                {formatCurrency(history.filter(h => h.type === 'owner' && (h.status === 'failed' || h.status === 'refunded')).reduce((sum, h) => sum + h.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-success-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bike size={20} color="var(--color-success-500)" />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>라이더 정산</p>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{stats.riderCount}건</p>
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--color-gray-50)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>완료</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                {formatCurrency(history.filter(h => h.type === 'rider' && h.status === 'completed').reduce((sum, h) => sum + h.amount, 0))}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>실패/환불</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-error-500)' }}>
                {formatCurrency(history.filter(h => h.type === 'rider' && (h.status === 'failed' || h.status === 'refunded')).reduce((sum, h) => sum + h.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {showFilterMenu && (
        <button
          type="button"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            background: 'transparent',
            border: 'none',
            cursor: 'default'
          }}
          onClick={() => setShowFilterMenu(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowFilterMenu(false)
          }}
          aria-label="메뉴 닫기"
        />
      )}
    </div>
  )
}
