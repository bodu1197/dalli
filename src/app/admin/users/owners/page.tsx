'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  Store,
  Mail,
  Phone,
  Calendar,
  Star,
  MoreVertical,
  Ban,
  CheckCircle,
  TrendingUp
} from 'lucide-react'

interface Owner {
  id: string
  name: string
  email: string
  phone: string
  businessNumber: string
  joinDate: string
  storeCount: number
  totalRevenue: number
  avgRating: number
  status: 'active' | 'inactive' | 'suspended'
  settlementStatus: 'normal' | 'pending' | 'overdue'
}

const mockOwners: Owner[] = [
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
    settlementStatus: 'normal'
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
    settlementStatus: 'pending'
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
    settlementStatus: 'normal'
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
    settlementStatus: 'overdue'
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
    settlementStatus: 'overdue'
  }
]

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
  suspended: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
}

const settlementConfig: Record<string, { label: string; bg: string; text: string }> = {
  normal: { label: '정상', bg: '#DCFCE7', text: '#16A34A' },
  pending: { label: '대기', bg: '#FEF3C7', text: '#D97706' },
  overdue: { label: '연체', bg: '#FEE2E2', text: '#DC2626' }
}

export default function AdminOwnersPage() {
  const [owners] = useState<Owner[]>(mockOwners)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const filteredOwners = owners.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery) ||
      o.businessNumber.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
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
            점주 관리
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
            placeholder="이름, 이메일, 전화번호, 사업자번호 검색"
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

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
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
                  { value: 'suspended', label: '정지' }
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
              {owners.length}
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
              {owners.filter(o => o.status === 'active').length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>총 가게</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary-500)' }}>
              {owners.reduce((sum, o) => sum + o.storeCount, 0)}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>연체</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-error-500)' }}>
              {owners.filter(o => o.settlementStatus === 'overdue').length}
            </div>
          </div>
        </div>

        {/* Owner List */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {filteredOwners.map((owner) => {
            const ownerIndex = filteredOwners.indexOf(owner)
            return (
              <div
                key={owner.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: ownerIndex < filteredOwners.length - 1 ? '1px solid var(--color-border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-warning-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Store size={24} color="var(--color-warning-500)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {owner.name}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: statusConfig[owner.status].bg,
                        color: statusConfig[owner.status].text
                      }}>
                        {statusConfig[owner.status].label}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: settlementConfig[owner.settlementStatus].bg,
                        color: settlementConfig[owner.settlementStatus].text
                      }}>
                        정산 {settlementConfig[owner.settlementStatus].label}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                      사업자번호: {owner.businessNumber}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} />
                        {owner.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} />
                        {owner.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActionMenuId(actionMenuId === owner.id ? null : owner.id)}
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
                  {actionMenuId === owner.id && (
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
                        href={`/admin/users/owners/${owner.id}`}
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
                        <Store size={16} />
                        상세 보기
                      </Link>
                      {owner.status !== 'suspended' ? (
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
                    {owner.joinDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    운영 가게
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <Store size={14} />
                    {owner.storeCount}개
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    총 매출
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    <TrendingUp size={14} />
                    {(owner.totalRevenue / 10000).toLocaleString()}만원
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    평균 평점
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <Star size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" />
                    {owner.avgRating.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
            )
          })}

          {filteredOwners.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <Store size={48} color="var(--color-text-tertiary)" style={{ marginBottom: '16px' }} />
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
