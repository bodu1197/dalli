'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Star,
  MoreVertical,
  Ban,
  CheckCircle
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  orderCount: number
  totalSpent: number
  avgRating: number
  status: 'active' | 'inactive' | 'banned'
  lastOrderDate: string
  tier: 'normal' | 'silver' | 'gold' | 'vip'
}

const mockCustomers: Customer[] = [
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
    tier: 'vip'
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
    tier: 'gold'
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
    tier: 'silver'
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
    tier: 'normal'
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
    tier: 'gold'
  }
]

const tierColors: Record<string, { bg: string; text: string }> = {
  vip: { bg: '#FEF3C7', text: '#D97706' },
  gold: { bg: '#FEF9C3', text: '#CA8A04' },
  silver: { bg: '#F3F4F6', text: '#6B7280' },
  normal: { bg: '#E5E7EB', text: '#9CA3AF' }
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
  banned: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
}

export default function AdminCustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showTierMenu, setShowTierMenu] = useState(false)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter
    return matchesSearch && matchesStatus && matchesTier
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/users" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            고객 관리
          </h1>
        </div>
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <Search size={20} color="var(--color-text-tertiary)" />
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowStatusMenu(!showStatusMenu); setShowTierMenu(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: statusFilter !== 'all' ? 'var(--color-primary-50)' : 'var(--color-white)',
                borderRadius: '8px',
                border: `1px solid ${statusFilter !== 'all' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Filter size={16} />
              상태
              <ChevronDown size={16} />
            </button>
            {showStatusMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: 'var(--color-white)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                zIndex: 20,
                minWidth: '120px'
              }}>
                {[
                  { value: 'all', label: '전체' },
                  { value: 'active', label: '활성' },
                  { value: 'inactive', label: '휴면' },
                  { value: 'banned', label: '정지' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setShowStatusMenu(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      backgroundColor: statusFilter === opt.value ? 'var(--color-background)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowTierMenu(!showTierMenu); setShowStatusMenu(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: tierFilter !== 'all' ? 'var(--color-primary-50)' : 'var(--color-white)',
                borderRadius: '8px',
                border: `1px solid ${tierFilter !== 'all' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Star size={16} />
              등급
              <ChevronDown size={16} />
            </button>
            {showTierMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: 'var(--color-white)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                zIndex: 20,
                minWidth: '120px'
              }}>
                {[
                  { value: 'all', label: '전체' },
                  { value: 'vip', label: 'VIP' },
                  { value: 'gold', label: 'Gold' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'normal', label: 'Normal' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setTierFilter(opt.value); setShowTierMenu(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      backgroundColor: tierFilter === opt.value ? 'var(--color-background)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>전체</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {customers.length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>활성</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success-500)' }}>
              {customers.filter(c => c.status === 'active').length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>휴면</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-warning-500)' }}>
              {customers.filter(c => c.status === 'inactive').length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>정지</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-error-500)' }}>
              {customers.filter(c => c.status === 'banned').length}
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              style={{
                padding: '16px 20px',
                borderBottom: index < filteredCustomers.length - 1 ? '1px solid var(--color-border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={24} color="var(--color-primary-500)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {customer.name}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: tierColors[customer.tier].bg,
                        color: tierColors[customer.tier].text,
                        textTransform: 'uppercase'
                      }}>
                        {customer.tier}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: statusConfig[customer.status].bg,
                        color: statusConfig[customer.status].text
                      }}>
                        {statusConfig[customer.status].label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                        <Mail size={14} />
                        {customer.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                        <Phone size={14} />
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActionMenuId(actionMenuId === customer.id ? null : customer.id)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  >
                    <MoreVertical size={20} color="var(--color-text-tertiary)" />
                  </button>
                  {actionMenuId === customer.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: 'var(--color-white)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      zIndex: 20,
                      minWidth: '140px'
                    }}>
                      <Link
                        href={`/admin/users/customers/${customer.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none'
                        }}
                      >
                        <User size={16} />
                        상세 보기
                      </Link>
                      {customer.status !== 'banned' ? (
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--color-error-500)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}>
                          <Ban size={16} />
                          이용 정지
                        </button>
                      ) : (
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--color-success-500)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}>
                          <CheckCircle size={16} />
                          정지 해제
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--color-border)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    가입일
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <Calendar size={14} />
                    {customer.joinDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    주문 횟수
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <ShoppingBag size={14} />
                    {customer.orderCount}회
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    총 결제
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {customer.totalSpent.toLocaleString()}원
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    평균 평점
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <Star size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" />
                    {customer.avgRating.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <User size={48} color="var(--color-text-tertiary)" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: 'var(--color-text-tertiary)' }}>
                검색 결과가 없습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
