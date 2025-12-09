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
  Bike,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Eye,
  X,
  Send,
  MapPin,
  TrendingUp
} from 'lucide-react'

// Types
interface RiderSettlement {
  id: string
  riderId: string
  riderName: string
  phone: string
  period: { start: string; end: string }
  deliveryCount: number
  totalDeliveryFee: number
  incentive: number
  deductions: number
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
  avgRating: number
  activeArea: string
}

// Mock Data
const mockSettlements: RiderSettlement[] = [
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
      accountHolder: '박배달'
    },
    scheduledDate: '2024-01-17',
    processedDate: null,
    transactionId: null,
    avgRating: 4.9,
    activeArea: '강남구'
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
      accountHolder: '김빠른'
    },
    scheduledDate: '2024-01-17',
    processedDate: null,
    transactionId: null,
    avgRating: 4.7,
    activeArea: '서초구'
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
      accountHolder: '이달리'
    },
    scheduledDate: '2024-01-15',
    processedDate: '2024-01-15',
    transactionId: 'RTXN123456',
    avgRating: 4.95,
    activeArea: '송파구'
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
      accountHolder: '최스피드'
    },
    scheduledDate: '2024-01-15',
    processedDate: '2024-01-15',
    transactionId: 'RTXN789012',
    avgRating: 4.5,
    activeArea: '마포구'
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
      accountHolder: '정라이더'
    },
    scheduledDate: '2024-01-15',
    processedDate: null,
    transactionId: null,
    avgRating: 4.3,
    activeArea: '영등포구'
  }
]

const statusLabels: Record<RiderSettlement['status'], string> = {
  pending: '대기중',
  processing: '처리중',
  completed: '완료',
  failed: '실패'
}

const statusColors: Record<RiderSettlement['status'], string> = {
  pending: 'var(--color-warning-500)',
  processing: 'var(--color-primary-500)',
  completed: 'var(--color-success-500)',
  failed: 'var(--color-error-500)'
}

export default function RiderSettlementsPage() {
  const [settlements] = useState<RiderSettlement[]>(mockSettlements)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('this_week')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<RiderSettlement | null>(null)

  // Filter settlements
  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch =
      settlement.riderName.includes(searchQuery) ||
      settlement.phone.includes(searchQuery) ||
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
    totalDeliveries: settlements.reduce((sum, s) => sum + s.deliveryCount, 0),
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

  const handleViewDetail = (settlement: RiderSettlement) => {
    setSelectedSettlement(settlement)
    setShowDetailModal(true)
    setActiveMenu(null)
  }

  const handleProcess = (settlement: RiderSettlement) => {
    setSelectedSettlement(settlement)
    setShowProcessModal(true)
    setActiveMenu(null)
  }

  const confirmProcess = () => {
    console.log('Processing settlement:', selectedSettlement?.id)
    setShowProcessModal(false)
    setSelectedSettlement(null)
  }

  const getStatusIcon = (status: RiderSettlement['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />
      case 'processing':
        return <TrendingUp size={14} />
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
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>라이더 정산</h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', marginTop: '4px' }}>
              라이더별 배달비 정산 현황을 관리합니다
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
              backgroundColor: 'var(--color-success-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bike size={24} color="var(--color-success-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>총 배달 건수</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.totalDeliveries}건</p>
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
              backgroundColor: 'var(--color-error-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} color="var(--color-error-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>정산 실패</p>
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
            backgroundColor: 'var(--color-primary-500)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
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
            placeholder="라이더명, 전화번호, 정산ID로 검색"
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
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>라이더</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>정산기간</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>배달 건수</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>배달비</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>인센티브</th>
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
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-success-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bike size={20} color="var(--color-success-600)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '2px' }}>{settlement.riderName}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                          {settlement.phone}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--color-gray-500)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <MapPin size={10} />
                          {settlement.activeArea}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-600)', fontSize: '13px' }}>
                    <Calendar size={14} />
                    {formatDate(settlement.period.start)} ~ {formatDate(settlement.period.end)}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{settlement.deliveryCount}건</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(settlement.totalDeliveryFee)}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {settlement.incentive > 0 ? (
                    <span style={{ color: 'var(--color-success-600)', fontSize: '13px' }}>
                      +{formatCurrency(settlement.incentive)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-gray-400)', fontSize: '13px' }}>-</span>
                  )}
                  {settlement.deductions < 0 && (
                    <p style={{ fontSize: '11px', color: 'var(--color-error-500)', marginTop: '2px' }}>
                      공제: {formatCurrency(settlement.deductions)}
                    </p>
                  )}
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
            <Bike size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
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

            {/* Rider Info */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bike size={24} color="var(--color-success-600)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '16px' }}>{selectedSettlement.riderName}</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>{selectedSettlement.phone}</p>
                  </div>
                </div>
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
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  {selectedSettlement.activeArea}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>
                  평점: ⭐ {selectedSettlement.avgRating}
                </span>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>정산 내역</h4>
              <div style={{ border: '1px solid var(--color-gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <span>배달 건수</span>
                  <span style={{ fontWeight: 600 }}>{selectedSettlement.deliveryCount}건</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <span>배달비 합계</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(selectedSettlement.totalDeliveryFee)}</span>
                </div>
                {selectedSettlement.incentive > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)', color: 'var(--color-success-600)' }}>
                    <span>인센티브</span>
                    <span>+{formatCurrency(selectedSettlement.incentive)}</span>
                  </div>
                )}
                {selectedSettlement.deductions < 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-gray-100)', color: 'var(--color-error-600)' }}>
                    <span>공제액</span>
                    <span>{formatCurrency(selectedSettlement.deductions)}</span>
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
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>{selectedSettlement.riderName}</p>
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
