'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    CreditCard,
    BarChart3,
    Bell,
    Settings,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ChevronRight,
    ShoppingBag,
    Bike,
    FileText,
} from 'lucide-react'
import type { AdminStats } from '@/lib/services/admin.service'

interface RecentActivity {
    id: string
    type: 'order' | 'store' | 'user' | 'dispute'
    message: string
    time: string
}

// Mock Activities (To be replaced later)
const MOCK_ACTIVITIES: RecentActivity[] = [
    { id: '1', type: 'order', message: '신규 주문 접수 #ORD-12847', time: '방금' },
    { id: '2', type: 'store', message: 'BBQ 치킨 강남점 입점 신청', time: '5분 전' },
    { id: '3', type: 'dispute', message: '환불 요청 접수 #DISP-234', time: '12분 전' },
    { id: '4', type: 'user', message: '신규 회원 가입 (고객)', time: '15분 전' },
    { id: '5', type: 'order', message: '배달 완료 #ORD-12846', time: '18분 전' },
]

interface AdminDashboardClientProps {
    initialStats: AdminStats
}

export default function AdminDashboardClient({ initialStats }: AdminDashboardClientProps) {
    const [stats] = useState<AdminStats>(initialStats)
    const [activities] = useState(MOCK_ACTIVITIES)

    const menuItems = [
        { icon: <Users className="w-6 h-6" />, label: '회원 관리', href: '/admin/users', count: stats.activeUsers },
        { icon: <Store className="w-6 h-6" />, label: '가게 관리', href: '/admin/stores', badge: stats.pendingStores },
        { icon: <Package className="w-6 h-6" />, label: '주문 관리', href: '/admin/orders' },
        { icon: <Bike className="w-6 h-6" />, label: '라이더 관리', href: '/admin/riders' },
        { icon: <FileText className="w-6 h-6" />, label: '세금계산서', href: '/admin/tax-invoices' },
        { icon: <CreditCard className="w-6 h-6" />, label: '정산 관리', href: '/admin/settlements' },
        { icon: <BarChart3 className="w-6 h-6" />, label: '통계/분석', href: '/admin/analytics' },
        { icon: <Settings className="w-6 h-6" />, label: '설정', href: '/admin/settings' },
    ]


    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <ShoppingBag className="w-4 h-4 text-[var(--color-primary-500)]" />
            case 'store':
                return <Store className="w-4 h-4 text-[var(--color-success-500)]" />
            case 'user':
                return <Users className="w-4 h-4 text-[var(--color-info-500)]" />
            case 'dispute':
                return <AlertCircle className="w-4 h-4 text-[var(--color-error-500)]" />
            default:
                return <Bell className="w-4 h-4 text-[var(--color-neutral-500)]" />
        }
    }

    // 전일 대비 데이터가 없으므로 임시로 0으로 처리하거나, API에서 계산해서 내려줘야 함.
    // 현재 서비스에서는 todayOrders만 내려주므로 compared는 임시값 사용.
    const compared = {
        orders: 0,
        sales: 0
    }

    return (
        <div className="min-h-screen bg-[var(--color-neutral-100)]">
            {/* 헤더 */}
            <header className="bg-[var(--color-neutral-900)] text-white">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6" />
                        <span className="font-bold text-lg">달리고 관리자</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/notifications" className="relative p-2">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error-500)] rounded-full" />
                        </Link>
                        <Link href="/admin/settings" className="p-2">
                            <Settings className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pb-20">
                {/* 핵심 지표 */}
                <section className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {/* 오늘 주문 */}
                        <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-[var(--color-neutral-500)]">오늘 주문</p>
                            <p className="text-2xl font-bold text-[var(--color-neutral-900)] mt-1">
                                {stats.todayOrders.toLocaleString()}건
                            </p>
                            <div className={`flex items-center gap-1 mt-2 text-sm ${compared.orders >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-error-500)]'
                                }`}>
                                {compared.orders >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                <span>전일 대비 {compared.orders >= 0 ? '+' : ''}{compared.orders}%</span>
                            </div>
                        </div>

                        {/* 오늘 매출 */}
                        <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-[var(--color-neutral-500)]">오늘 매출</p>
                            <p className="text-2xl font-bold text-[var(--color-neutral-900)] mt-1">
                                {(stats.todaySales / 10000).toFixed(0)}만원
                            </p>
                            <div className={`flex items-center gap-1 mt-2 text-sm ${compared.sales >= 0 ? 'text-[var(--color-success-500)]' : 'text-[var(--color-error-500)]'
                                }`}>
                                {compared.sales >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                <span>전일 대비 {compared.sales >= 0 ? '+' : ''}{compared.sales}%</span>
                            </div>
                        </div>

                        {/* 활성 사용자 */}
                        <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-[var(--color-neutral-500)]">활성 사용자</p>
                            <p className="text-2xl font-bold text-[var(--color-primary-500)] mt-1">
                                {stats.activeUsers.toLocaleString()}명
                            </p>
                            <p className="text-sm text-[var(--color-neutral-400)] mt-2">총 가입자</p>
                        </div>

                        {/* 활성 라이더 */}
                        <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-[var(--color-neutral-500)]">활성 라이더</p>
                            <p className="text-2xl font-bold text-[var(--color-success-500)] mt-1">
                                {stats.activeRiders.toLocaleString()}명
                            </p>
                            <p className="text-sm text-[var(--color-neutral-400)] mt-2">등록된 라이더</p>
                        </div>
                    </div>
                </section>

                {/* 빠른 알림 */}
                {(stats.pendingStores > 0 || stats.pendingDisputes > 0) && (
                    <section className="px-4 mb-4">
                        <div className="bg-[var(--color-warning-50)] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
                                <span className="font-medium text-[var(--color-warning-700)]">처리 필요</span>
                            </div>
                            <div className="space-y-2">
                                {stats.pendingStores > 0 && (
                                    <Link
                                        href="/admin/stores/applications"
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span className="text-sm text-[var(--color-warning-700)]">
                                            입점 신청 대기 {stats.pendingStores}건
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-[var(--color-warning-500)]" />
                                    </Link>
                                )}
                                {stats.pendingDisputes > 0 && (
                                    <Link
                                        href="/admin/disputes"
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span className="text-sm text-[var(--color-warning-700)]">
                                            분쟁 처리 대기 {stats.pendingDisputes}건
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-[var(--color-warning-500)]" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 관리 메뉴 */}
                <section className="px-4">
                    <h2 className="font-bold text-[var(--color-neutral-900)] mb-3">관리 메뉴</h2>
                    <div className="grid grid-cols-4 gap-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center gap-2 p-4 bg-white rounded-xl"
                            >
                                <span className="text-[var(--color-neutral-700)]">{item.icon}</span>
                                <span className="text-xs font-medium text-[var(--color-neutral-700)] text-center">
                                    {item.label}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 최근 활동 */}
                <section className="mt-4">
                    <div className="flex items-center justify-between px-4 py-3">
                        <h2 className="font-bold text-[var(--color-neutral-900)]">최근 활동</h2>
                        <Link
                            href="/admin/activities"
                            className="text-sm text-[var(--color-primary-500)] flex items-center gap-1"
                        >
                            전체보기
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-white divide-y divide-[var(--color-neutral-100)]">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-8 h-8 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-[var(--color-neutral-800)]">{activity.message}</p>
                                    <p className="text-xs text-[var(--color-neutral-400)]">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 실시간 모니터링 바로가기 */}
                <section className="p-4">
                    <Link
                        href="/admin/realtime"
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl text-white"
                    >
                        <div>
                            <h3 className="font-semibold">실시간 모니터링</h3>
                            <p className="text-sm opacity-80 mt-1">주문 현황 및 라이더 위치</p>
                        </div>
                        <ChevronRight className="w-6 h-6" />
                    </Link>
                </section>
            </main>

            {/* 하단 네비게이션 */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-200)]">
                <div className="flex items-center justify-around h-16">
                    <Link
                        href="/admin"
                        className="flex flex-col items-center justify-center gap-1 text-[var(--color-primary-500)]"
                    >
                        <LayoutDashboard className="w-6 h-6" />
                        <span className="text-xs font-medium">대시보드</span>
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="flex flex-col items-center justify-center gap-1 text-[var(--color-neutral-400)]"
                    >
                        <Package className="w-6 h-6" />
                        <span className="text-xs">주문</span>
                    </Link>
                    <Link
                        href="/admin/stores"
                        className="flex flex-col items-center justify-center gap-1 text-[var(--color-neutral-400)]"
                    >
                        <Store className="w-6 h-6" />
                        <span className="text-xs">가게</span>
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="flex flex-col items-center justify-center gap-1 text-[var(--color-neutral-400)]"
                    >
                        <BarChart3 className="w-6 h-6" />
                        <span className="text-xs">통계</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
