'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Bike,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Star,
    CreditCard,
    Ban,
    CheckCircle,
    Package,
    Clock,
    FileCheck,
} from 'lucide-react'

interface AdminRiderDetailClientProps {
    rider: any
}

export default function AdminRiderDetailClient({ rider }: AdminRiderDetailClientProps) {
    const [showBanModal, setShowBanModal] = useState(false)

    // Status hardcoded
    const status = 'active'
    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
        inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
        suspended: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
    }

    const vehicleConfig: Record<string, { label: string; icon: string }> = {
        motorcycle: { label: '오토바이', icon: '🏍️' },
        bicycle: { label: '자전거', icon: '🚴' },
        car: { label: '자동차', icon: '🚗' },
        foot: { label: '도보', icon: '🚶' }
    }

    const vehicleType = rider.vehicle_type || 'motorcycle'
    const isOnline = rider.is_available ?? false

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
                            라이더 상세
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
                            borderRadius: '50%',
                            backgroundColor: isOnline ? 'var(--color-success-100)' : 'var(--color-neutral-100)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <Bike size={32} color={isOnline ? 'var(--color-success-500)' : 'var(--color-text-tertiary)'} />
                            {isOnline && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-success-500)',
                                    border: '2px solid white'
                                }} />
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    {rider.name}
                                </h2>
                                <span style={{ fontSize: '20px' }}>
                                    {vehicleConfig[vehicleType]?.icon}
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
                            {isOnline && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-success-500)' }}>
                                    <MapPin size={16} />
                                    위치 정보 없음
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Mail size={16} />
                            {rider.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Phone size={16} />
                            {rider.phone || '-'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            <Calendar size={16} />
                            가입일: {new Date(rider.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Package size={20} color="var(--color-primary-500)" />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>배달 통계</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 배달</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.totalDeliveries?.toLocaleString() ?? 0}건</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>평균 평점</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                    <Star size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" style={{ marginRight: '4px' }} />
                                    {rider.avgRating?.toFixed(1) ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <CreditCard size={20} color="var(--color-success-500)" />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>수입 통계</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 수입</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>- 원</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle & Documents */}
                <div style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <FileCheck size={20} color="var(--color-primary-500)" />
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            차량 및 서류 정보
                        </h3>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>이동수단</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {vehicleConfig[vehicleType]?.label || vehicleType}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>차량번호</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.vehicle_number || '-'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>면허번호</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.license_number || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Bank Account */}
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
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.bankName}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>계좌번호</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.accountNumber}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>예금주</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.accountHolder}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Deliveries */}
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
                            <Clock size={20} color="var(--color-primary-500)" />
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                최근 배달
                            </h3>
                        </div>
                    </div>

                    {rider.recentDeliveries && rider.recentDeliveries.map((delivery: any, index: number) => (
                        <Link
                            key={delivery.id}
                            href={`/admin/orders/${delivery.id}`}
                            style={{
                                display: 'block',
                                padding: '16px 20px',
                                borderBottom: index < rider.recentDeliveries.length - 1 ? '1px solid var(--color-border)' : 'none',
                                textDecoration: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                                        {delivery.restaurant_name ?? '가게 정보 없음'}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                        {new Date(delivery.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-500)', marginBottom: '2px' }}>
                                        +{delivery.delivery_fee?.toLocaleString() ?? 0}원
                                    </div>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        backgroundColor: delivery.status === 'delivered' ? '#DCFCE7' : '#F3F4F6',
                                        color: delivery.status === 'delivered' ? '#16A34A' : '#6B7280'
                                    }}>
                                        {delivery.status}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {(!rider.recentDeliveries || rider.recentDeliveries.length === 0) && (
                        <div className="p-4 text-center text-gray-500">배달 내역이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
