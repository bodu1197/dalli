'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    Star,
    CreditCard,
    Ban,
    CheckCircle,
    MessageSquare,
    Gift,
    ChevronRight
} from 'lucide-react'

interface AdminCustomerDetailClientProps {
    user: any
}

export default function AdminCustomerDetailClient({ user }: AdminCustomerDetailClientProps) {
    // Stats calculation
    const orderCount = user.orderCount || 0
    const totalSpent = user.totalSpent || 0
    const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0

    // Tier logic: Simple threshold
    let tier = 'normal'
    if (totalSpent > 1000000) tier = 'vip'
    else if (totalSpent > 500000) tier = 'gold'
    else if (totalSpent > 200000) tier = 'silver'

    const tierColors: Record<string, { bg: string; text: string }> = {
        vip: { bg: '#FEF3C7', text: '#D97706' },
        gold: { bg: '#FEF9C3', text: '#CA8A04' },
        silver: { bg: '#F3F4F6', text: '#6B7280' },
        normal: { bg: '#E5E7EB', text: '#9CA3AF' }
    }

    // Status hardcoded as 'active' since column missing
    const status = 'active'
    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
        inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
        banned: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
    }

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/admin/users" style={{ color: 'var(--color-text-secondary)' }}>
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            고객 상세
                        </h1>
                    </div>
                    {/* Ban Button Disabled/Hidden */}
                </div>
            </header>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Profile Card */}
                <div style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <User size={40} color="var(--color-primary-500)" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {user.name}
                        </h2>
                        <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: tierColors[tier].bg,
                            color: tierColors[tier].text,
                            textTransform: 'uppercase'
                        }}>
                            {tier}
                        </span>
                        <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: statusConfig[status].bg,
                            color: statusConfig[status].text
                        }}>
                            {statusConfig[status].label}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Mail size={16} />
                            {user.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Phone size={16} />
                            {user.phone || '-'}
                        </div>
                        {/* Address if available in user object? usually in 'addresses' table but we didn't fetch it. Order has delivery_address. */}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: '12px'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>가입일</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>포인트</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-500)' }}>- P</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>보유 쿠폰</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.couponCount}장</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>가입일</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(1, 1fr)', // Simple layout for now
                    gap: '12px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <ShoppingBag size={20} color="var(--color-primary-500)" />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>주문 통계</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 주문</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{orderCount}회</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 결제</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{totalSpent.toLocaleString()}원</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>평균 주문</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{avgOrderValue.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag size={20} color="var(--color-primary-500)" />
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                최근 주문
                            </h3>
                        </div>
                        <Link href={`/admin/orders?search=${user.name}`} style={{ fontSize: '14px', color: 'var(--color-primary-500)' }}>
                            전체 보기
                        </Link>
                    </div>

                    {user.recentOrders && user.recentOrders.map((order: any, index: number) => (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                textDecoration: 'none'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                    {order.restaurant_name ?? '가게 정보 없음'}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                    {order.order_number} · {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                    {order.total_amount?.toLocaleString()}원
                                </div>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    backgroundColor: order.status === 'delivered' ? '#DCFCE7' : '#F3F4F6',
                                    color: order.status === 'delivered' ? '#16A34A' : '#6B7280'
                                }}>
                                    {order.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                    {(!user.recentOrders || user.recentOrders.length === 0) && (
                        <div className="p-4 text-center text-sm text-gray-500">주문 내역이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
