'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  X,
  User
} from 'lucide-react'

// Types
interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'super_admin' | 'admin' | 'manager' | 'support'
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  department: string
  lastLogin: string | null
  createdAt: string
  createdBy: string
  profileImage: string | null
  twoFactorEnabled: boolean
}

// Mock Data
const mockAdmins: AdminUser[] = [
  {
    id: 'ADM001',
    name: '김철수',
    email: 'admin@dalligo.com',
    phone: '010-1234-5678',
    role: 'super_admin',
    status: 'active',
    permissions: ['all'],
    department: '기술팀',
    lastLogin: '2024-01-15T14:30:00',
    createdAt: '2023-01-01',
    createdBy: 'SYSTEM',
    profileImage: null,
    twoFactorEnabled: true
  },
  {
    id: 'ADM002',
    name: '이영희',
    email: 'manager@dalligo.com',
    phone: '010-2345-6789',
    role: 'admin',
    status: 'active',
    permissions: ['users', 'orders', 'stores', 'support'],
    department: '운영팀',
    lastLogin: '2024-01-15T10:20:00',
    createdAt: '2023-03-15',
    createdBy: 'ADM001',
    profileImage: null,
    twoFactorEnabled: true
  },
  {
    id: 'ADM003',
    name: '박지민',
    email: 'support1@dalligo.com',
    phone: '010-3456-7890',
    role: 'support',
    status: 'active',
    permissions: ['support', 'orders.view'],
    department: '고객지원팀',
    lastLogin: '2024-01-15T09:00:00',
    createdAt: '2023-06-01',
    createdBy: 'ADM002',
    profileImage: null,
    twoFactorEnabled: false
  },
  {
    id: 'ADM004',
    name: '최민수',
    email: 'manager2@dalligo.com',
    phone: '010-4567-8901',
    role: 'manager',
    status: 'inactive',
    permissions: ['stores', 'riders', 'settlements'],
    department: '정산팀',
    lastLogin: '2024-01-10T16:45:00',
    createdAt: '2023-08-20',
    createdBy: 'ADM001',
    profileImage: null,
    twoFactorEnabled: true
  },
  {
    id: 'ADM005',
    name: '정수연',
    email: 'support2@dalligo.com',
    phone: '010-5678-9012',
    role: 'support',
    status: 'suspended',
    permissions: ['support'],
    department: '고객지원팀',
    lastLogin: '2024-01-05T11:30:00',
    createdAt: '2023-09-10',
    createdBy: 'ADM002',
    profileImage: null,
    twoFactorEnabled: false
  },
  {
    id: 'ADM006',
    name: '강동현',
    email: 'marketing@dalligo.com',
    phone: '010-6789-0123',
    role: 'manager',
    status: 'active',
    permissions: ['content', 'promotions', 'analytics'],
    department: '마케팅팀',
    lastLogin: '2024-01-15T13:15:00',
    createdAt: '2023-10-01',
    createdBy: 'ADM001',
    profileImage: null,
    twoFactorEnabled: true
  }
]

const roleLabels: Record<AdminUser['role'], string> = {
  super_admin: '슈퍼관리자',
  admin: '관리자',
  manager: '매니저',
  support: '상담원'
}

const roleColors: Record<AdminUser['role'], string> = {
  super_admin: 'var(--color-error-500)',
  admin: 'var(--color-primary-500)',
  manager: 'var(--color-success-500)',
  support: 'var(--color-gray-500)'
}

const statusLabels: Record<AdminUser['status'], string> = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지'
}

const statusColors: Record<AdminUser['status'], string> = {
  active: 'var(--color-success-500)',
  inactive: 'var(--color-gray-500)',
  suspended: 'var(--color-error-500)'
}

export default function AdminUsersPage() {
  const [admins] = useState<AdminUser[]>(mockAdmins)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [newStatus, setNewStatus] = useState<AdminUser['status']>('active')

  // Filter admins
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch =
      admin.name.includes(searchQuery) ||
      admin.email.includes(searchQuery) ||
      admin.phone.includes(searchQuery) ||
      admin.department.includes(searchQuery)

    const matchesRole = filterRole === 'all' || admin.role === filterRole
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  // Stats
  const stats = {
    total: admins.length,
    active: admins.filter(a => a.status === 'active').length,
    inactive: admins.filter(a => a.status === 'inactive').length,
    suspended: admins.filter(a => a.status === 'suspended').length
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = (admin: AdminUser, status: AdminUser['status']) => {
    setSelectedAdmin(admin)
    setNewStatus(status)
    setShowStatusModal(true)
    setActiveMenu(null)
  }

  const confirmStatusChange = () => {
    // API call would go here
    console.log('Changing status:', selectedAdmin?.id, newStatus)
    setShowStatusModal(false)
    setSelectedAdmin(null)
  }

  const getRoleIcon = (role: AdminUser['role']) => {
    switch (role) {
      case 'super_admin':
        return <ShieldAlert size={16} />
      case 'admin':
        return <ShieldCheck size={16} />
      case 'manager':
        return <Shield size={16} />
      default:
        return <User size={16} />
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>관리자 관리</h1>
          <Link
            href="/admin/users/admins/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--color-primary-500)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <Plus size={18} />
            관리자 등록
          </Link>
        </div>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '14px' }}>
          시스템 관리자 계정을 관리합니다
        </p>
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
              <Shield size={24} color="var(--color-primary-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>전체 관리자</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.total}명</p>
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
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>활성</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.active}명</p>
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
              backgroundColor: 'var(--color-gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <XCircle size={24} color="var(--color-gray-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>비활성</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.inactive}명</p>
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
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>정지</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.suspended}명</p>
            </div>
          </div>
        </div>
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
            placeholder="이름, 이메일, 전화번호, 부서로 검색"
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
                  역할
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">전체</option>
                  <option value="super_admin">슈퍼관리자</option>
                  <option value="admin">관리자</option>
                  <option value="manager">매니저</option>
                  <option value="support">상담원</option>
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
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="suspended">정지</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFilterRole('all')
                  setFilterStatus('all')
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

      {/* Admin List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>관리자</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>역할</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>부서</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>상태</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>2FA</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>마지막 로그인</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin) => (
              <tr
                key={admin.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-gray-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gray-500)'
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <Link
                        href={`/admin/users/admins/${admin.id}`}
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-gray-900)',
                          textDecoration: 'none'
                        }}
                      >
                        {admin.name}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--color-gray-500)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Mail size={12} />
                          {admin.email}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--color-gray-500)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Phone size={12} />
                          {admin.phone}
                        </span>
                      </div>
                    </div>
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
                    color: roleColors[admin.role],
                    backgroundColor: `${roleColors[admin.role]}15`
                  }}>
                    {getRoleIcon(admin.role)}
                    {roleLabels[admin.role]}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {admin.department}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: statusColors[admin.status],
                    backgroundColor: `${statusColors[admin.status]}15`
                  }}>
                    {statusLabels[admin.status]}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {admin.twoFactorEnabled ? (
                    <span style={{ color: 'var(--color-success-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontSize: '12px' }}>활성화</span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={16} />
                      <span style={{ fontSize: '12px' }}>비활성화</span>
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-gray-600)' }}>
                    <Clock size={14} />
                    {formatDateTime(admin.lastLogin)}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === admin.id ? null : admin.id)}
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

                    {activeMenu === admin.id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        minWidth: '160px',
                        zIndex: 100,
                        overflow: 'hidden'
                      }}>
                        <Link
                          href={`/admin/users/admins/${admin.id}`}
                          style={{
                            display: 'block',
                            padding: '12px 16px',
                            fontSize: '14px',
                            color: 'var(--color-gray-700)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--color-gray-100)'
                          }}
                        >
                          상세보기
                        </Link>
                        <Link
                          href={`/admin/users/admins/${admin.id}/edit`}
                          style={{
                            display: 'block',
                            padding: '12px 16px',
                            fontSize: '14px',
                            color: 'var(--color-gray-700)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--color-gray-100)'
                          }}
                        >
                          수정
                        </Link>
                        {admin.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(admin, 'inactive')}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              color: 'var(--color-gray-700)',
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--color-gray-100)'
                            }}
                          >
                            비활성화
                          </button>
                        )}
                        {admin.status === 'inactive' && (
                          <button
                            onClick={() => handleStatusChange(admin, 'active')}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              color: 'var(--color-success-500)',
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--color-gray-100)'
                            }}
                          >
                            활성화
                          </button>
                        )}
                        {admin.status !== 'suspended' && admin.role !== 'super_admin' && (
                          <button
                            onClick={() => handleStatusChange(admin, 'suspended')}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              color: 'var(--color-error-500)',
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            계정 정지
                          </button>
                        )}
                        {admin.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(admin, 'active')}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              color: 'var(--color-success-500)',
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            정지 해제
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

        {filteredAdmins.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--color-gray-500)'
          }}>
            <Shield size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>검색 조건에 맞는 관리자가 없습니다</p>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedAdmin && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>상태 변경</h3>
              <button
                onClick={() => setShowStatusModal(false)}
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

            <p style={{ marginBottom: '20px', color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
              <strong>{selectedAdmin.name}</strong> 관리자의 상태를{' '}
              <strong style={{ color: statusColors[newStatus] }}>
                {statusLabels[newStatus]}
              </strong>
              (으)로 변경하시겠습니까?
            </p>

            {newStatus === 'suspended' && (
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-error-50)',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={18} color="var(--color-error-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: 'var(--color-error-700)', lineHeight: 1.5 }}>
                  계정이 정지되면 해당 관리자는 시스템에 로그인할 수 없습니다.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowStatusModal(false)}
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
                onClick={confirmStatusChange}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: newStatus === 'suspended' ? 'var(--color-error-500)' : 'var(--color-primary-500)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showFilterMenu || activeMenu) && (
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
          onClick={() => {
            setShowFilterMenu(false)
            setActiveMenu(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowFilterMenu(false)
              setActiveMenu(null)
            }
          }}
          aria-label="메뉴 닫기"
        />
      )}
    </div>
  )
}
