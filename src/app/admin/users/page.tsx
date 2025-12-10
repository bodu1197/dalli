'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, ChevronRight, User, Store, Bike, Shield } from 'lucide-react'

interface UserItem {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'owner' | 'rider' | 'admin'
  status: 'active' | 'suspended' | 'withdrawn'
  joinedAt: string
  lastActiveAt: string
  ordersCount?: number
  storesCount?: number
  deliveriesCount?: number
}

// Mock 데이터
const MOCK_USERS: UserItem[] = [
  {
    id: '1',
    name: '김민수',
    email: 'minsu@email.com',
    phone: '010-1234-5678',
    role: 'customer',
    status: 'active',
    joinedAt: '2024-06-15',
    lastActiveAt: '2024-12-09T10:30:00',
    ordersCount: 45,
  },
  {
    id: '2',
    name: '이영희',
    email: 'younghee@email.com',
    phone: '010-2345-6789',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-03-20',
    lastActiveAt: '2024-12-09T11:00:00',
    storesCount: 2,
  },
  {
    id: '3',
    name: '박철수',
    email: 'cheolsu@email.com',
    phone: '010-3456-7890',
    role: 'rider',
    status: 'active',
    joinedAt: '2024-08-10',
    lastActiveAt: '2024-12-09T09:45:00',
    deliveriesCount: 520,
  },
  {
    id: '4',
    name: '정수진',
    email: 'sujin@email.com',
    phone: '010-4567-8901',
    role: 'customer',
    status: 'suspended',
    joinedAt: '2024-01-05',
    lastActiveAt: '2024-11-20T15:20:00',
    ordersCount: 12,
  },
  {
    id: '5',
    name: '최관리자',
    email: 'admin@dalligo.com',
    phone: '010-5678-9012',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-01',
    lastActiveAt: '2024-12-09T11:30:00',
  },
]

type RoleFilter = 'all' | 'customer' | 'owner' | 'rider' | 'admin'
type StatusFilter = 'all' | 'active' | 'suspended' | 'withdrawn'

export default function AdminUsersPage() {
  const [users] = useState(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <User className="w-4 h-4" />
      case 'owner':
        return <Store className="w-4 h-4" />
      case 'rider':
        return <Bike className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer':
        return '고객'
      case 'owner':
        return '점주'
      case 'rider':
        return '라이더'
      case 'admin':
        return '관리자'
      default:
        return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'suspended':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
      case 'withdrawn':
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
      default:
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'suspended':
        return '정지'
      case 'withdrawn':
        return '탈퇴'
      default:
        return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const formatLastActive = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diff < 60) return `${diff}분 전`
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`
    return `${Math.floor(diff / 1440)}일 전`
  }

  const totalCount = {
    all: users.length,
    customer: users.filter((u) => u.role === 'customer').length,
    owner: users.filter((u) => u.role === 'owner').length,
    rider: users.filter((u) => u.role === 'rider').length,
    admin: users.filter((u) => u.role === 'admin').length,
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            회원 관리
          </h1>
          <div className="w-10" />
        </div>

        {/* 검색 */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 이메일, 전화번호 검색"
              aria-label="회원 검색"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 역할 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {(['all', 'customer', 'owner', 'rider', 'admin'] as RoleFilter[]).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
              }`}
            >
              {role === 'all' ? '전체' : getRoleLabel(role)} ({totalCount[role]})
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 상태 필터 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-neutral-100)]">
          <span className="text-sm text-[var(--color-neutral-600)]">
            총 {filteredUsers.length}명
          </span>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="회원 상태 필터"
              className="px-3 py-1.5 bg-[var(--color-neutral-100)] rounded-lg text-sm focus:outline-none"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
              <option value="withdrawn">탈퇴</option>
            </select>
          </div>
        </div>

        {/* 사용자 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {filteredUsers.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.role}s/${user.id}`}
              className="flex items-center gap-4 px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
            >
              {/* 아바타 */}
              <div className="w-12 h-12 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                {getRoleIcon(user.role)}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[var(--color-neutral-900)]">{user.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-neutral-500)] truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-neutral-400)]">
                  <span className="px-1.5 py-0.5 bg-[var(--color-neutral-100)] rounded">
                    {getRoleLabel(user.role)}
                  </span>
                  <span>가입: {formatDate(user.joinedAt)}</span>
                  <span>활동: {formatLastActive(user.lastActiveAt)}</span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredUsers.length === 0 && (
          <div className="py-16 text-center bg-white">
            <User className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">검색 결과가 없습니다</p>
          </div>
        )}
      </main>
    </div>
  )
}
