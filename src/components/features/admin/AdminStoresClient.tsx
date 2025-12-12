'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Star, MapPin, ChevronRight, AlertCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'

type RestaurantRow = Database['public']['Tables']['restaurants']['Row']
type RestaurantWithOwner = RestaurantRow & {
    owner: { name: string | null } | null
}

interface AdminStoresClientProps {
    initialStores: RestaurantWithOwner[]
    totalCount: number
    currentPage: number
    searchQuery: string
}

export default function AdminStoresClient({
    initialStores,
    totalCount,
    currentPage,
    searchQuery,
}: AdminStoresClientProps) {
    const router = useRouter()
    const [localSearch, setLocalSearch] = useState(searchQuery)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateParams({ search: localSearch, page: 1 })
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
                        가게 관리
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
                            placeholder="가게명, 주소 검색"
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                    </div>
                </form>
            </header>

            <main className="pb-20">
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-neutral-100)]">
                    <span className="text-sm text-[var(--color-neutral-600)]">
                        총 {totalCount}개
                    </span>
                </div>

                {/* 가게 목록 */}
                <div className="divide-y divide-[var(--color-neutral-100)]">
                    {initialStores.map((store) => (
                        <Link
                            key={store.id}
                            href={`/admin/stores/${store.id}`} // 상세 페이지 미구현
                            className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-[var(--color-neutral-900)]">{store.name}</h3>
                                        {/* Status Badge removed due to missing DB column */}
                                    </div>
                                    <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
                                        점주: {store.owner?.name ?? '알 수 없음'}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{store.address}</span>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-[var(--color-warning-500)]">
                                    <Star className="w-4 h-4 fill-current" />
                                    {store.rating ?? 0} ({store.review_count ?? 0})
                                </span>
                                <span className="text-[var(--color-neutral-600)]">
                                    배달비 {store.delivery_fee?.toLocaleString()}원
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 빈 상태 */}
                {initialStores.length === 0 && (
                    <div className="py-16 text-center bg-white">
                        <AlertCircle className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
                        <p className="text-[var(--color-neutral-500)]">검색 결과가 없습니다</p>
                    </div>
                )}
            </main>
        </div>
    )
}
