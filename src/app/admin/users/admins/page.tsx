'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
} from 'lucide-react'
import {
  PageHeader,
  StatsCardGrid,
  DataTable,
  StatusBadge,
  ActionMenu,
  EmptyState,
  ConfirmModal,
} from '@/components/features/admin/common'
import type {
  TableColumn,
  ActionMenuItem,
  StatusVariant,
} from '@/components/features/admin/types'
import { cn } from '@/lib/utils'

// Types
interface AdminUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly role: 'super_admin' | 'admin' | 'manager' | 'support'
  readonly status: 'active' | 'inactive' | 'suspended'
  readonly permissions: ReadonlyArray<string>
  readonly department: string
  readonly lastLogin: string | null
  readonly createdAt: string
  readonly createdBy: string
  readonly profileImage: string | null
  readonly twoFactorEnabled: boolean
}

// Mock Data
const mockAdmins: ReadonlyArray<AdminUser> = [
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
    twoFactorEnabled: true,
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
    twoFactorEnabled: true,
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
    twoFactorEnabled: false,
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
    twoFactorEnabled: true,
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
    twoFactorEnabled: false,
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
    twoFactorEnabled: true,
  },
]

const roleConfig: Record<
  AdminUser['role'],
  { label: string; variant: StatusVariant }
> = {
  super_admin: { label: '슈퍼관리자', variant: 'error' },
  admin: { label: '관리자', variant: 'primary' },
  manager: { label: '매니저', variant: 'success' },
  support: { label: '상담원', variant: 'default' },
}

const statusConfig: Record<
  AdminUser['status'],
  { label: string; variant: StatusVariant }
> = {
  active: { label: '활성', variant: 'success' },
  inactive: { label: '비활성', variant: 'default' },
  suspended: { label: '정지', variant: 'error' },
}

function getRoleIcon(role: AdminUser['role']): React.ReactNode {
  switch (role) {
    case 'super_admin':
      return <ShieldAlert className="h-4 w-4" />
    case 'admin':
      return <ShieldCheck className="h-4 w-4" />
    case 'manager':
      return <Shield className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminUsersPage(): React.ReactElement {
  const [admins] = useState<ReadonlyArray<AdminUser>>(mockAdmins)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [newStatus, setNewStatus] = useState<AdminUser['status']>('active')

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.phone.includes(searchQuery) ||
        admin.department.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter
      const matchesStatus =
        statusFilter === 'all' || admin.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [admins, searchQuery, roleFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      total: admins.length,
      active: admins.filter((a) => a.status === 'active').length,
      inactive: admins.filter((a) => a.status === 'inactive').length,
      suspended: admins.filter((a) => a.status === 'suspended').length,
    }
  }, [admins])

  const statsCards = useMemo(
    () => [
      {
        icon: Shield,
        iconColor: 'primary' as const,
        label: '전체 관리자',
        value: stats.total,
        suffix: '명',
      },
      {
        icon: CheckCircle,
        iconColor: 'success' as const,
        label: '활성',
        value: stats.active,
        suffix: '명',
      },
      {
        icon: XCircle,
        iconColor: 'default' as const,
        label: '비활성',
        value: stats.inactive,
        suffix: '명',
      },
      {
        icon: AlertTriangle,
        iconColor: 'error' as const,
        label: '정지',
        value: stats.suspended,
        suffix: '명',
      },
    ],
    [stats]
  )

  const handleStatusChange = useCallback(
    (admin: AdminUser, status: AdminUser['status']) => {
      setSelectedAdmin(admin)
      setNewStatus(status)
      setShowStatusModal(true)
    },
    []
  )

  const confirmStatusChange = useCallback(() => {
    setShowStatusModal(false)
    setSelectedAdmin(null)
  }, [])

  const getActionItems = useCallback(
    (admin: AdminUser): ReadonlyArray<ActionMenuItem> => {
      const items: ActionMenuItem[] = [
        {
          label: '상세보기',
          icon: User,
          onClick: () => {
            window.location.href = `/admin/users/admins/${admin.id}`
          },
        },
        {
          label: '수정',
          icon: Shield,
          onClick: () => {
            window.location.href = `/admin/users/admins/${admin.id}/edit`
          },
        },
      ]

      if (admin.status === 'active') {
        items.push({
          label: '비활성화',
          icon: XCircle,
          onClick: () => handleStatusChange(admin, 'inactive'),
        })
      }

      if (admin.status === 'inactive') {
        items.push({
          label: '활성화',
          icon: CheckCircle,
          onClick: () => handleStatusChange(admin, 'active'),
        })
      }

      if (admin.status !== 'suspended' && admin.role !== 'super_admin') {
        items.push({
          label: '계정 정지',
          icon: AlertTriangle,
          onClick: () => handleStatusChange(admin, 'suspended'),
          variant: 'danger',
        })
      }

      if (admin.status === 'suspended') {
        items.push({
          label: '정지 해제',
          icon: CheckCircle,
          onClick: () => handleStatusChange(admin, 'active'),
        })
      }

      return items
    },
    [handleStatusChange]
  )

  const columns: ReadonlyArray<TableColumn<AdminUser>> = useMemo(
    () => [
      {
        key: 'admin',
        header: '관리자',
        render: (admin) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/admins/${admin.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {admin.name}
                </Link>
                <StatusBadge variant={roleConfig[admin.role].variant}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(admin.role)}
                    {roleConfig[admin.role].label}
                  </span>
                </StatusBadge>
                <StatusBadge variant={statusConfig[admin.status].variant}>
                  {statusConfig[admin.status].label}
                </StatusBadge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {admin.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {admin.phone}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'department',
        header: '부서',
        render: (admin) => (
          <span className="text-sm text-gray-700">{admin.department}</span>
        ),
      },
      {
        key: 'twoFactor',
        header: '2FA',
        align: 'center',
        render: (admin) =>
          admin.twoFactorEnabled ? (
            <span className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">활성화</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1 text-gray-400">
              <XCircle className="h-4 w-4" />
              <span className="text-xs">비활성화</span>
            </span>
          ),
      },
      {
        key: 'lastLogin',
        header: '마지막 로그인',
        render: (admin) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(admin.lastLogin)}
          </div>
        ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (admin) => (
          <ActionMenu items={[...getActionItems(admin)]} />
        ),
      },
    ],
    [getActionItems]
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="관리자 관리"
          description="시스템 관리자 계정을 관리합니다"
          backLink="/admin/users"
        />
        <Link
          href="/admin/users/admins/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          관리자 등록
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid cards={statsCards} className="mb-6" />

      {/* Search and Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[300px] flex-1">
          <label htmlFor="admin-search" className="sr-only">관리자 검색</label>
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="admin-search"
            type="text"
            placeholder="이름, 이메일, 전화번호, 부서 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Role Filter */}
        <label htmlFor="admin-role-filter" className="sr-only">역할 필터</label>
        <select
          id="admin-role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            roleFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">역할 전체</option>
          <option value="super_admin">슈퍼관리자</option>
          <option value="admin">관리자</option>
          <option value="manager">매니저</option>
          <option value="support">상담원</option>
        </select>

        {/* Status Filter */}
        <label htmlFor="admin-status-filter" className="sr-only">상태 필터</label>
        <select
          id="admin-status-filter"
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
          <option value="inactive">비활성</option>
          <option value="suspended">정지</option>
        </select>
      </div>

      {/* Admin Table */}
      {filteredAdmins.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredAdmins}
          keyExtractor={(admin) => admin.id}
          emptyIcon={Shield}
          emptyMessage="검색 결과가 없습니다"
        />
      ) : (
        <EmptyState
          icon={Shield}
          title="검색 결과 없음"
          description="검색 조건에 맞는 관리자가 없습니다"
        />
      )}

      {/* Status Change Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={confirmStatusChange}
        title="상태 변경"
        message={
          selectedAdmin
            ? `${selectedAdmin.name} 관리자의 상태를 "${statusConfig[newStatus].label}"(으)로 변경하시겠습니까?${newStatus === 'suspended' ? ' 계정이 정지되면 해당 관리자는 시스템에 로그인할 수 없습니다.' : ''}`
            : ''
        }
        confirmText="확인"
        cancelText="취소"
        variant={newStatus === 'suspended' ? 'danger' : 'info'}
      />
    </div>
  )
}
