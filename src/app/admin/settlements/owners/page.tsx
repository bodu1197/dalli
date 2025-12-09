'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  MoreVertical,
  Building2,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  X,
  Send
} from 'lucide-react'

// Types
interface OwnerSettlement {
  id: string
  ownerId: string
  ownerName: string
  businessName: string
  stores: { id: string; name: string }[]
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

// Mock Data
const mockSettlements: OwnerSettlement[] = [
  {
    id: 'SET001',
    ownerId: 'OWN001',
    ownerName: '김민수',
    businessName: '맛있는 치킨',
    stores: [
      { id: 'STR001', name: '맛있는 치킨 강남점' },
      { id: 'STR002', name: '맛있는 치킨 서초점' }
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 4560000,
    platformFee: 228000,
    deliveryFee: 152000,
    adjustments: -15000,
    netAmount: 4165000,
    status: 'pending',
    bankAccount: {
      bank: '국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '김민수'
    },
    scheduledDate: '2024-01-15',
    processedDate: null,
    transactionId: null
  },
  {
    id: 'SET002',
    ownerId: 'OWN002',
    ownerName: '이영희',
    businessName: '행복한 분식',
    stores: [
      { id: 'STR003', name: '행복한 분식' }
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 2340000,
    platformFee: 117000,
    deliveryFee: 78000,
    adjustments: 0,
    netAmount: 2145000,
    status: 'processing',
    bankAccount: {
      bank: '신한은행',
      accountNumber: '987-654-321098',
      accountHolder: '이영희'
    },
    scheduledDate: '2024-01-15',
    processedDate: null,
    transactionId: null
  },
  {
    id: 'SET003',
    ownerId: 'OWN003',
    ownerName: '박지성',
    businessName: '성원 중국집',
    stores: [
      { id: 'STR004', name: '성원 중국집' }
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 3890000,
    platformFee: 194500,
    deliveryFee: 129700,
    adjustments: -8500,
    netAmount: 3557300,
    status: 'completed',
    bankAccount: {
      bank: '우리은행',
      accountNumber: '456-789-012345',
      accountHolder: '박지성'
    },
    scheduledDate: '2024-01-12',
    processedDate: '2024-01-12',
    transactionId: 'TXN123456789'
  },
  {
    id: 'SET004',
    ownerId: 'OWN004',
    ownerName: '최수연',
    businessName: '스시마루',
    stores: [
      { id: 'STR005', name: '스시마루 본점' },
      { id: 'STR006', name: '스시마루 역삼점' }
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 6780000,
    platformFee: 339000,
    deliveryFee: 226000,
    adjustments: -22000,
    netAmount: 6193000,
    status: 'completed',
    bankAccount: {
      bank: 'NH농협',
      accountNumber: '789-012-345678',
      accountHolder: '최수연'
    },
    scheduledDate: '2024-01-12',
    processedDate: '2024-01-12',
    transactionId: 'TXN987654321'
  },
  {
    id: 'SET005',
    ownerId: 'OWN005',
    ownerName: '정동욱',
    businessName: '피자나라',
    stores: [
      { id: 'STR007', name: '피자나라 송파점' }
    ],
    period: { start: '2024-01-01', end: '2024-01-07' },
    totalSales: 1890000,
    platformFee: 94500,
    deliveryFee: 63000,
    adjustments: 0,
    netAmount: 1732500,
    status: 'failed',
    bankAccount: {
      bank: '하나은행',
      accountNumber: '012-345-678901',
      accountHolder: '정동욱'
    },
    scheduledDate: '2024-01-12',
    processedDate: null,
    transactionId: null
  }
]

const statusLabels: Record<OwnerSettlement['status'], string> = {
  pending: '대기중',
  processing: '처리중',
  completed: '완료',
  failed: '실패'
}

const statusColors: Record<OwnerSettlement['status'], string> = {
  pending: 'var(--color-warning-500)',
  processing: 'var(--color-primary-500)',
  completed: 'var(--color-success-500)',
  failed: 'var(--color-error-500)'
}

export default function OwnerSettlementsPage() {
  const [settlements] = useState<OwnerSettlement[]>(mockSettlements)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('this_week')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<OwnerSettlement | null>(null)

  // Filter settlements
  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch =
      settlement.ownerName.includes(searchQuery) ||
      settlement.businessName.includes(searchQuery) ||
      settlement.id.includes(searchQuery)

    const matchesStatus = filterStatus === 'all' || settlement.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: settlements.length,
    pending: settlements.filter(s => s.status === 'pending').length,
    processing: settlements.filter(s => s.status === 'processing').length,
    completed: settlements.filter(s => s.status === 'completed').length,
    failed: settlements.filter(s => s.status === 'failed').length,
    totalAmount: settlements.reduce((sum, s) => sum + s.netAmount, 0),
    pendingAmount: settlements
      .filter(s => s.status === 'pending' || s.status === 'processing')
      .reduce((sum, s) => sum + s.netAmount, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handleViewDetail = (settlement: OwnerSettlement) => {
    setSelectedSettlement(settlement)
    setShowDetailModal(true)
    setActiveMenu(null)
  }

  const handleProcess = (settlement: OwnerSettlement) => {
    setSelectedSettlement(settlement)
    setShowProcessModal(true)
    setActiveMenu(null)
  }

  const confirmProcess = () => {
    // API call would go here
    console.log('Processing settlement:', selectedSettlement?.id)
    setShowProcessModal(false)
    setSelectedSettlement(null)
  }

  const getStatusIcon = (status: OwnerSettlement['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />
      case 'processing':
        return <ArrowUpRight size={14} />
      case 'completed':
        return <CheckCircle size={14} />
      case 'failed':
        return <XCircle size={14} />
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>점주 정산</h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', marginTop: '4px' }}>
              점주별 정산 현황을 관리합니다
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--color-primary-500)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <Send size={18} />
              일괄 정산
            </button>
          </div>
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
              backgroundColor: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={24} color="var(--color-primary-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>총 정산액</p>
              <p style={{ fontSize: '20px', fontWeight: 700 }}>{formatCurrency(stats.totalAmount)}</p>
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
              <Clock size={24} color="var(--color-warning-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>미정산액</p>
              <p style={{ fontSize: '20px', fontWeight: 700 }}>{formatCurrency(stats.pendingAmount)}</p>
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
              backgroundColor: 'var(--color-success-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={24} color="var(--color-success-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>완료</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.completed}건</p>
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
              <AlertTriangle size={24} color="var(--color-error-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>실패</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.failed}건</p>
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
            backgroundColor: 'var(--color-primary-500)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
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
            backgroundColor: 'var(--color-gray-100)',
            color: 'var(--color-gray-700)',
            textDecoration: 'none',
            fontSize: '14px'
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
            placeholder="점주명, 상호명, 정산ID로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-gray-600)'
                }}>
                  상태
                </label>
                <select
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
                  <option value="pending">대기중</option>
                  <option value="processing">처리중</option>
                  <option value="completed">완료</option>
                  <option value="failed">실패</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-gray-600)'
                }}>
                  기간
                </label>
                <select
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
                  <option value="this_week">이번 주</option>
                  <option value="last_week">지난 주</option>
                  <option value="this_month">이번 달</option>
                  <option value="last_month">지난 달</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFilterStatus('all')
                  setFilterPeriod('this_week')
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

      {/* Settlements List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>점주/상호</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>정산기간</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>총매출</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>수수료</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>정산액</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>상태</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredSettlements.map((settlement) => (
              <tr
                key={settlement.id}
                style={{
                  borderBottom: '1px solid var(--color-gray-100)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-gray-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building2 size={20} color="var(--color-gray-500)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '2px' }}>{settlement.businessName}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                        {settlement.ownerName} · {settlement.stores.length}개 매장
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-600)', fontSize: '13px' }}>
                    <Calendar size={14} />
                    {formatDate(settlement.period.start)} ~ {formatDate(settlement.period.end)}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(settlement.totalSales)}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div>
                    <span style={{ color: 'var(--color-error-500)', fontSize: '13px' }}>
                      -{formatCurrency(settlement.platformFee + settlement.deliveryFee)}
                    </span>
                    {settlement.adjustments !== 0 && (
                      <p style={{
                        fontSize: '11px',
                        color: settlement.adjustments > 0 ? 'var(--color-success-500)' : 'var(--color-error-500)',
                        marginTop: '2px'
                      }}>
                        조정: {settlement.adjustments > 0 ? '+' : ''}{formatCurrency(settlement.adjustments)}
                      </p>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-600)', fontSize: '15px' }}>
                    {formatCurrency(settlement.netAmount)}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: statusColors[settlement.status],
                    backgroundColor: `${statusColors[settlement.status]}15`
                  }}>
                    {getStatusIcon(settlement.status)}
                    {statusLabels[settlement.status]}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === settlement.id ? null : settlement.id)}
                      style={{
                        padding: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '8px'
                      }}
                    >
                      <MoreVertical size={18} color="var(--color-gray-500)" />
                    </button>

                    {activeMenu === settlement.id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        minWidth: '140px',
                        zIndex: 100,
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => handleViewDetail(settlement)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--color-gray-700)'
                          }}
                        >
                          <Eye size={16} />
                          상세보기
                        </button>
                        {(settlement.status === 'pending' || settlement.status === 'failed') && (
                          <button
                            onClick={() => handleProcess(settlement)}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: 'var(--color-primary-600)',
                              borderTop: '1px solid var(--color-gray-100)'
                            }}
                          >
                            <Send size={16} />
                            정산하기
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSettlements.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--color-gray-500)'
          }}>
            <Wallet size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>검색 조건에 맞는 정산 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSettlement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>정산 상세</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Settlement Info */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>{selectedSettlement.businessName}</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: statusColors[selectedSettlement.status],
                  backgroundColor: `${statusColors[selectedSettlement.status]}15`
                }}>
                  {getStatusIcon(selectedSettlement.status)}
                  {statusLabels[selectedSettlement.status]}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>
                점주: {selectedSettlement.ownerName} · 정산ID: {selectedSettlement.id}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                정산기간: {formatDate(selectedSettlement.period.start)} ~ {formatDate(selectedSettlement.period.end)}
              </p>
            </div>

            {/* Amount Breakdown */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>정산 내역</h4>
              <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <span>총 매출</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(selectedSettlement.totalSales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)', color: 'var(--color-error-600)' }}>
                  <span>플랫폼 수수료 (5%)</span>
                  <span>-{formatCurrency(selectedSettlement.platformFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)', color: 'var(--color-error-600)' }}>
                  <span>배달비 공제</span>
                  <span>-{formatCurrency(selectedSettlement.deliveryFee)}</span>
                </div>
                {selectedSettlement.adjustments !== 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-gray-100)',
                    color: selectedSettlement.adjustments > 0 ? 'var(--color-success-600)' : 'var(--color-error-600)'
                  }}>
                    <span>조정액</span>
                    <span>{selectedSettlement.adjustments > 0 ? '+' : ''}{formatCurrency(selectedSettlement.adjustments)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--color-primary-50)' }}>
                  <span style={{ fontWeight: 600 }}>최종 정산액</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-600)', fontSize: '16px' }}>
                    {formatCurrency(selectedSettlement.netAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>정산 계좌</h4>
              <div style={{
                padding: '16px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CreditCard size={24} color="var(--color-gray-400)" />
                <div>
                  <p style={{ fontWeight: 600 }}>{selectedSettlement.bankAccount.bank}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>
                    {selectedSettlement.bankAccount.accountNumber} ({selectedSettlement.bankAccount.accountHolder})
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            {selectedSettlement.transactionId && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>거래 정보</h4>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-success-50)',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-success-700)' }}>
                    거래 ID: {selectedSettlement.transactionId}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-success-700)', marginTop: '4px' }}>
                    처리일: {formatDate(selectedSettlement.processedDate!)}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedSettlement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>정산 처리</h3>
              <button
                onClick={() => setShowProcessModal(false)}
                style={{
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>{selectedSettlement.businessName}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
                {selectedSettlement.bankAccount.bank} {selectedSettlement.bankAccount.accountNumber}
              </p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                {formatCurrency(selectedSettlement.netAmount)}
              </p>
            </div>

            <p style={{ marginBottom: '20px', color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: 1.6 }}>
              위 계좌로 정산금을 송금하시겠습니까?
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowProcessModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                취소
              </button>
              <button
                onClick={confirmProcess}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-500)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                정산하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showFilterMenu || activeMenu) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50
          }}
          onClick={() => {
            setShowFilterMenu(false)
            setActiveMenu(null)
          }}
        />
      )}
    </div>
  )
}
