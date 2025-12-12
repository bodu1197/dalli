'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Filter, ChevronRight, User, Bike, Store, Clock } from 'lucide-react'
import type { Database } from '@/types/supabase'

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderWithCustomer = OrderRow & {
    customer: { name: string } | null
}

interface AdminOrdersClientProps {
    initialOrders: OrderWithCustomer[]
    totalCount: number
    currentPage: number
    searchQuery: string
    statusFilter: string
}

export default function AdminOrdersClient({
    initialOrders,
    totalCount,
    currentPage,
    searchQuery,
    statusFilter,
}: AdminOrdersClientProps) {
    const router = useRouter()
    const [localSearch, setLocalSearch] = useState(searchQuery)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateParams({ search: localSearch, page: 1 })
    }

    const handleStatusChange = (status: string) => {
        updateParams({ status, page: 1 })
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

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            pending: '주문대기',
            confirmed: '주문수락',
            preparing: '제조중',
            delivering: '배달중',
            delivered: '배달완료',
            cancelled: '취소됨',
        }
        return map[status] || status
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'confirmed': return 'bg-blue-100 text-blue-800'
            case 'preparing': return 'bg-purple-100 text-purple-800'
            case 'delivering': return 'bg-indigo-100 text-indigo-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
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
                        주문 관리
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
                            placeholder="주문번호, 가게명 검색"
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                    </div>
                </form>

                {/* 상태 필터 */}
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
                    {['all', 'pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-[var(--color-neutral-900)] text-white'
                                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                                }`}
                        >
                            {status === 'all' ? '전체' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </header>

            <main className="pb-20">
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-neutral-100)]">
                    <span className="text-sm text-[var(--color-neutral-600)]">
                        총 {totalCount}건
                    </span>
                </div>

                {/* 주문 목록 */}
                <div className="divide-y divide-[var(--color-neutral-100)]">
                    {initialOrders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`} // 추후 상세 페이지 연결
                            className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[var(--color-neutral-900)]">
                                        #{order.order_number}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(order.created_at)}
                                </div>
                            </div>

                            <div className="mb-2">
                                <h3 className="flex items-center gap-1.5 font-semibold text-[var(--color-neutral-800)]">
                                    <Store className="w-4 h-4 text-[var(--color-neutral-400)]" />
                                    {order.restaurant_name}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[var(--color-neutral-600)]">
                                        <User className="w-4 h-4 text-[var(--color-neutral-400)]" />
                                        {order.customer?.name ?? '알 수 없음'}
                                    </div>
                                    {order.rider_name && (
                                        <div className="flex items-center gap-1.5 text-[var(--color-neutral-600)]">
                                            <Bike className="w-4 h-4 text-[var(--color-neutral-400)]" />
                                            {order.rider_name}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-[var(--color-neutral-900)]">
                                        {order.total_amount?.toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 빈 상태 */}
                {initialOrders.length === 0 && (
                    <div className="py-16 text-center bg-white">
                        <Filter className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
                        <p className="text-[var(--color-neutral-500)]">검색된 주문이 없습니다</p>
                    </div>
                )}
            </main>
        </div>
    )
}
