'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  Bike,
  Phone,
  Calendar,
  Star,
  MoreVertical,
  Ban,
  CheckCircle,
  MapPin,
  Package
} from 'lucide-react'

interface Rider {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  vehicleType: 'motorcycle' | 'bicycle' | 'car'
  deliveryCount: number
  totalEarnings: number
  avgRating: number
  status: 'active' | 'inactive' | 'suspended'
  isOnline: boolean
  currentArea: string
}

const mockRiders: Rider[] = [
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
    currentArea: '강남구'
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
    currentArea: '서초구'
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
    currentArea: '마포구'
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
    currentArea: '송파구'
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
    currentArea: '영등포구'
  }
]

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
  suspended: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
}

const vehicleConfig: Record<string, { label: string; icon: string }> = {
  motorcycle: { label: '오토바이', icon: '🏍️' },
  bicycle: { label: '자전거', icon: '🚴' },
  car: { label: '자동차', icon: '🚗' }
}

export default function AdminRidersPage() {
  const [riders] = useState<Rider[]>(mockRiders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vehicleFilter, setVehicleFilter] = useState<string>('all')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showVehicleMenu, setShowVehicleMenu] = useState(false)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const filteredRiders = riders.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesVehicle = vehicleFilter === 'all' || r.vehicleType === vehicleFilter
    return matchesSearch && matchesStatus && matchesVehicle
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
            라이더 관리
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
              onClick={() => { setShowStatusMenu(!showStatusMenu); setShowVehicleMenu(false) }}
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

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowVehicleMenu(!showVehicleMenu); setShowStatusMenu(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: vehicleFilter !== 'all' ? 'var(--color-primary-50)' : 'var(--color-white)',
                borderRadius: '8px',
                border: `1px solid ${vehicleFilter !== 'all' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Bike size={16} />
              이동수단
              <ChevronDown size={16} />
            </button>
            {showVehicleMenu && (
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
                  { value: 'motorcycle', label: '오토바이' },
                  { value: 'bicycle', label: '자전거' },
                  { value: 'car', label: '자동차' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setVehicleFilter(opt.value); setShowVehicleMenu(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      backgroundColor: vehicleFilter === opt.value ? 'var(--color-background)' : 'transparent',
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
              {riders.length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>온라인</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success-500)' }}>
              {riders.filter(r => r.isOnline).length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>오프라인</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>
              {riders.filter(r => !r.isOnline).length}
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
              {riders.filter(r => r.status === 'suspended').length}
            </div>
          </div>
        </div>

        {/* Rider List */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {filteredRiders.map((rider) => {
            const riderIndex = filteredRiders.indexOf(rider)
            return (
              <div
                key={rider.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: riderIndex < filteredRiders.length - 1 ? '1px solid var(--color-border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: rider.isOnline ? 'var(--color-success-100)' : 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Bike size={24} color={rider.isOnline ? 'var(--color-success-500)' : 'var(--color-text-tertiary)'} />
                    {rider.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success-500)',
                        border: '2px solid white'
                      }} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {rider.name}
                      </span>
                      <span style={{ fontSize: '16px' }}>
                        {vehicleConfig[rider.vehicleType].icon}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: statusConfig[rider.status].bg,
                        color: statusConfig[rider.status].text
                      }}>
                        {statusConfig[rider.status].label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} />
                        {rider.phone}
                      </span>
                      {rider.isOnline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          {rider.currentArea}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActionMenuId(actionMenuId === rider.id ? null : rider.id)}
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
                  {actionMenuId === rider.id && (
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
                        href={`/admin/users/riders/${rider.id}`}
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
                        <Bike size={16} />
                        상세 보기
                      </Link>
                      {rider.status !== 'suspended' ? (
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
                    {rider.joinDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    배달 건수
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <Package size={14} />
                    {rider.deliveryCount.toLocaleString()}건
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    총 수입
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {(rider.totalEarnings / 10000).toLocaleString()}만원
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    평균 평점
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    <Star size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" />
                    {rider.avgRating.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
            )
          })}

          {filteredRiders.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <Bike size={48} color="var(--color-text-tertiary)" style={{ marginBottom: '16px' }} />
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
