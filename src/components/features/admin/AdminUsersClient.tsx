'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, ChevronRight, User, Store, Bike, Shield } from 'lucide-react'
import type { Database } from '@/types/supabase'

type UserRow = Database['public']['Tables']['users']['Row']

interface AdminUsersClientProps {
    initialUsers: UserRow[]
    totalCount: number
    currentPage: number
    searchQuery: string
    roleFilter: string
}

export default function AdminUsersClient({
    initialUsers,
    totalCount,
    currentPage,
    searchQuery,
    roleFilter,
}: AdminUsersClientProps) {
    const router = useRouter()
    const [localSearch, setLocalSearch] = useState(searchQuery)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateParams({ search: localSearch, page: 1 })
    }

    const handleRoleChange = (role: string) => {
        updateParams({ role, page: 1 })
    }

    const updateParams = (updates: Record<string, string | number>) => {
        const params = new URLSearchParams(window.location.search)
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, String(value))
            } else {
                params.delete(key)
            }
        })
        router.push(`?${params.toString()}`)
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'customer': return <User className="w-4 h-4" />
            case 'owner': return <Store className="w-4 h-4" />
            case 'rider': return <Bike className="w-4 h-4" />
            case 'admin': return <Shield className="w-4 h-4" />
            default: return <User className="w-4 h-4" />
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'customer': return '고객'
            case 'owner': return '점주'
            case 'rider': return '라이더'
            case 'admin': return '관리자'
            default: return role
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('ko-KR')
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
                <form onSubmit={handleSearch} className="px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="이름, 이메일, 전화번호 검색"
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                    </div>
                </form>

                {/* 역할 필터 */}
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
                    {['all', 'customer', 'owner', 'rider', 'admin'].map((role) => (
                        <button
                            key={role}
                            onClick={() => handleRoleChange(role)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${roleFilter === role
                                    ? 'bg-[var(--color-neutral-900)] text-white'
                                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                                }`}
                        >
                            {role === 'all' ? '전체' : getRoleLabel(role)}
                        </button>
                    ))}
                </div>
            </header>

            <main className="pb-20">
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-neutral-100)]">
                    <span className="text-sm text-[var(--color-neutral-600)]">
                        총 {totalCount}명
                    </span>
                    {/* status 필터 제거됨 */}
                </div>

                {/* 사용자 목록 */}
                <div className="divide-y divide-[var(--color-neutral-100)]">
                    {initialUsers.map((user) => (
                        <Link
                            key={user.id}
                            href={`/admin/users/${user.role}s/${user.id}`} // 개별 상세 페이지는 아직 구현 안됨
                            className="flex items-center gap-4 px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
                        >
                            <div className="w-12 h-12 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                                {getRoleIcon(user.role)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-[var(--color-neutral-900)]">{user.name}</span>
                                    {/* status 뱃지 제거 (DB 컬럼 부재) */}
                                </div>
                                <p className="text-sm text-[var(--color-neutral-500)] truncate">{user.email}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-neutral-400)]">
                                    <span className="px-1.5 py-0.5 bg-[var(--color-neutral-100)] rounded">
                                        {getRoleLabel(user.role)}
                                    </span>
                                    <span>가입: {formatDate(user.created_at)}</span>
                                </div>
                            </div>

                            <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                        </Link>
                    ))}
                </div>

                {/* 빈 상태 */}
                {initialUsers.length === 0 && (
                    <div className="py-16 text-center bg-white">
                        <User className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
                        <p className="text-[var(--color-neutral-500)]">검색 결과가 없습니다</p>
                    </div>
                )}
            </main>
        </div>
    )
}
