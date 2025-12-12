'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Store,
    Mail,
    Phone,
    Calendar,
    Star,
    CreditCard,
    Ban,
    CheckCircle,
    TrendingUp,
    ShoppingBag,
    FileText
} from 'lucide-react'

interface AdminOwnerDetailClientProps {
    owner: any
}

export default function AdminOwnerDetailClient({ owner }: AdminOwnerDetailClientProps) {
    const [showBanModal, setShowBanModal] = useState(false)

    // Status hardcoded as 'active' for now
    const status = 'active'
    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
        inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
        suspended: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
    }

    const storeStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
        true: { label: '영업중', bg: '#DCFCE7', text: '#16A34A' },
        false: { label: '준비중', bg: '#F3F4F6', text: '#6B7280' },
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
                            점주 상세
                        </h1>
                    </div>
                    {/* Ban Button placeholder */}
                </div>
            </header>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Profile Card */}
                <div style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            backgroundColor: 'var(--color-warning-100)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Store size={32} color="var(--color-warning-500)" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    {owner.name}
                                </h2>
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
                            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                {owner.businessName || '상호명 미등록'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <FileText size={16} />
                            사업자번호: {owner.businessNumber || '-'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Mail size={16} />
                            {owner.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Phone size={16} />
                            {owner.phone}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Calendar size={16} />
                            가입일: {new Date(owner.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Settlement Stats (Mocked for now as per getOwnerDetail) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>총 매출</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            - 원
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>정산 완료</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success-500)' }}>
                            - 원
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>정산 대기</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-warning-500)' }}>
                            - 원
                        </div>
                    </div>
                </div>

                {/* Bank Account (Mocked) */}
                <div style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <CreditCard size={20} color="var(--color-primary-500)" />
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            정산 계좌
                        </h3>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>은행명</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{owner.bankName}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>계좌번호</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{owner.accountNumber}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>예금주</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{owner.accountHolder}</div>
                        </div>
                    </div>
                </div>

                {/* Stores List */}
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
                            <Store size={20} color="var(--color-warning-500)" />
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                운영 가게 ({owner.stores?.length || 0})
                            </h3>
                        </div>
                    </div>

                    {owner.stores && owner.stores.map((store: any, index: number) => (
                        <Link
                            key={store.id}
                            href={`/admin/stores/${store.id}`}
                            style={{
                                display: 'block',
                                padding: '16px 20px',
                                borderBottom: index < owner.stores.length - 1 ? '1px solid var(--color-border)' : 'none',
                                textDecoration: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {store.name}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 500,
                                            backgroundColor: storeStatusConfig[String(store.is_open)]?.bg || '#F3F4F6',
                                            color: storeStatusConfig[String(store.is_open)]?.text || '#6B7280'
                                        }}>
                                            {store.is_open ? '영업중' : '준비중'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                        {store.category?.name || '미분류'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={16} fill="var(--color-warning-500)" color="var(--color-warning-500)" />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {store.rating?.toFixed(1) || 0}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    <ShoppingBag size={14} />
                                    주문 {store.orderCount.toLocaleString()}건
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    <TrendingUp size={14} />
                                    매출 - 원
                                </div>
                            </div>
                        </Link>
                    ))}
                    {(!owner.stores || owner.stores.length === 0) && (
                        <div className="p-4 text-center text-gray-500">운영 중인 가게가 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
