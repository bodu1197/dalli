'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
    TrendingUp,
    Package,
    Star,
    Bell,
    Store,
    Clock,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
    RefreshCw
} from 'lucide-react'
import type { OwnerDashboardStats, OwnerOrder } from '@/lib/services/owner.service'

interface OwnerDashboardClientProps {
    stats: OwnerDashboardStats
    recentOrders: OwnerOrder[]
    storeName: string
    isOpen: boolean
    restaurantId: string
}

export default function OwnerDashboardClient({
    stats,
    recentOrders,
    storeName,
    isOpen: initialIsOpen,
    restaurantId
}: OwnerDashboardClientProps) {
    const [isOpen, setIsOpen] = useState(initialIsOpen)
    const [isPending, startTransition] = useTransition()

    const handleToggleOpen = async () => {
        startTransition(async () => {
            try {
                const response = await fetch('/api/owner/store/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ restaurantId, isOpen: !isOpen })
                })
                if (response.ok) {
                    setIsOpen(!isOpen)
                }
            } catch {
                // Error handling
            }
        })
    }

    const formatMoney = (amount: number) => amount.toLocaleString()
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: '신규',
            confirmed: '접수',
            preparing: '조리중',
            ready: '조리완료',
            picked_up: '배달중',
            delivered: '완료',
            cancelled: '취소'
        }
        return labels[status] || status
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-red-100 text-red-700',
            confirmed: 'bg-blue-100 text-blue-700',
            preparing: 'bg-yellow-100 text-yellow-700',
            ready: 'bg-green-100 text-green-700',
            picked_up: 'bg-purple-100 text-purple-700',
            delivered: 'bg-gray-100 text-gray-600',
            cancelled: 'bg-gray-100 text-gray-400'
        }
        return colors[status] || 'bg-gray-100 text-gray-600'
    }

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--color-neutral-100)] px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Store className="w-6 h-6 text-[var(--color-primary-600)]" />
                        <div>
                            <h1 className="font-bold text-lg">{storeName}</h1>
                            <div className="flex items-center gap-2 text-sm">
                                <span className={isOpen ? 'text-green-600' : 'text-gray-500'}>
                                    {isOpen ? '영업중' : '영업종료'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleOpen}
                        disabled={isPending}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {isPending ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : isOpen ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm font-medium">
                            {isOpen ? '영업중' : '영업종료'}
                        </span>
                    </button>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            오늘 매출
                        </div>
                        <div className="text-2xl font-bold text-[var(--color-primary-600)]">
                            ₩{formatMoney(stats.todaySales)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Package className="w-4 h-4" />
                            오늘 주문
                        </div>
                        <div className="text-2xl font-bold">
                            {stats.todayOrders}건
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Star className="w-4 h-4" />
                            평균 평점
                        </div>
                        <div className="text-2xl font-bold text-yellow-500">
                            {stats.avgRating.toFixed(1)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Bell className="w-4 h-4" />
                            대기 주문
                        </div>
                        <div className="text-2xl font-bold text-red-500">
                            {stats.pendingOrders}건
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/owner/orders"
                        className="flex items-center justify-center gap-2 bg-[var(--color-primary-600)] text-white rounded-xl py-4 font-medium hover:bg-[var(--color-primary-700)] transition-colors"
                    >
                        <Package className="w-5 h-5" />
                        주문 관리
                    </Link>
                    <Link
                        href="/owner/menus"
                        className="flex items-center justify-center gap-2 bg-white border border-[var(--color-neutral-200)] rounded-xl py-4 font-medium hover:bg-gray-50 transition-colors"
                    >
                        <Store className="w-5 h-5" />
                        메뉴 관리
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-[var(--color-neutral-100)] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">최근 주문</h2>
                        <Link
                            href="/owner/orders"
                            className="flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:underline"
                        >
                            전체보기
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            최근 주문이 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href={`/owner/orders/${order.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {order.items || '메뉴 정보 없음'}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="font-bold text-gray-900">
                                            ₩{formatMoney(order.totalAmount)}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(order.createdAt)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Reviews Alert */}
                {stats.newReviews > 0 && (
                    <Link
                        href="/owner/reviews"
                        className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <div className="font-medium text-yellow-800">
                                    새 리뷰 {stats.newReviews}개
                                </div>
                                <div className="text-sm text-yellow-600">
                                    고객 리뷰에 답변해 주세요
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-yellow-600" />
                    </Link>
                )}
            </main>
        </div>
    )
}
