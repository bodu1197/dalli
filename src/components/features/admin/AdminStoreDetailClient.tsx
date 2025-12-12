'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Store,
    Phone,
    MapPin,
    Clock,
    Star,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    MessageSquare,
    ChevronRight,
    User,
} from 'lucide-react'

interface AdminStoreDetailClientProps {
    store: any // Using any for joined complex type
}

export default function AdminStoreDetailClient({ store }: AdminStoreDetailClientProps) {
    // Removing Suspend logic as status column is missing

    if (!store) return <div className="p-8 text-center bg-white rounded-xl">가게 정보를 불러올 수 없습니다.</div>

    const categoryName = store.category?.name || '미분류'
    const ownerName = store.owner?.name || '알 수 없음'
    const ownerPhone = store.owner?.phone || '-'
    const ownerEmail = store.owner?.email || '-'

    // business_hours: DB에서 JSON으로 저장됨
    // 형태 확인 필요. 일단 안전하게 처리
    let businessHours: any[] = []
    try {
        if (Array.isArray(store.business_hours)) {
            businessHours = store.business_hours
        } else if (typeof store.business_hours === 'string') {
            businessHours = JSON.parse(store.business_hours)
        }
    } catch (e) {
        businessHours = []
    }

    const getStatusLabel = (isOpen: boolean | null) => {
        // is_open 활용
        return isOpen ? '영업중' : '준비중'
    }
    const getStatusColor = (isOpen: boolean | null) => {
        return isOpen
            ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
            : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
    }

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)]">
            {/* 헤더 */}
            <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
                <div className="flex items-center px-4 h-14">
                    <Link href="/admin/stores" className="w-10 h-10 flex items-center justify-center -ml-2">
                        <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
                    </Link>
                    <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
                        가게 상세
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="pb-20">
                {/* 가게 기본 정보 */}
                <section className="bg-white p-4">
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-[var(--color-neutral-100)] rounded-xl flex items-center justify-center">
                            {store.image_url ? (
                                <img src={store.image_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <Store className="w-10 h-10 text-[var(--color-neutral-400)]" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold text-[var(--color-neutral-900)]">{store.name}</h2>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(store.is_open)}`}>
                                    {getStatusLabel(store.is_open)}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--color-neutral-500)]">{categoryName}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{store.rating ?? 0}</span>
                                <span className="text-sm text-[var(--color-neutral-400)]">({store.review_count ?? 0})</span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-[var(--color-neutral-600)] whitespace-pre-wrap">{store.description || '소개글이 없습니다.'}</p>

                    {/* 연락처 정보 */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                            <Phone className="w-4 h-4 text-[var(--color-neutral-400)]" />
                            <span>{store.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                            <MapPin className="w-4 h-4 text-[var(--color-neutral-400)]" />
                            <span>{store.address}</span>
                        </div>
                    </div>
                </section>

                {/* 핵심 지표 */}
                <section className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag className="w-5 h-5 text-[var(--color-primary-500)]" />
                                <span className="text-sm text-[var(--color-neutral-500)]">총 주문</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                                {store.orderCount.toLocaleString()}건
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-[var(--color-success-500)]" />
                                <span className="text-sm text-[var(--color-neutral-500)]">총 매출</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                                -
                            </p>
                            <p className="text-xs text-gray-400">집계 중</p>
                        </div>
                        {/* 월 매출 제외 (데이터 없음) */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-5 h-5 text-[var(--color-info-500)]" />
                                <span className="text-sm text-[var(--color-neutral-500)]">리뷰</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                                {store.review_count?.toLocaleString() ?? 0}개
                            </p>
                        </div>
                    </div>
                </section>

                {/* 점주 정보 */}
                <section className="bg-white mt-2 p-4">
                    <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">점주 정보</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">점주명</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">{ownerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">연락처</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">{ownerPhone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">이메일</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">{ownerEmail}</span>
                        </div>
                    </div>
                    <Link
                        href={`/admin/users/${store.owner_id}`} // Assuming user detail page works or will work.
                        className="mt-4 flex items-center justify-between p-3 bg-[var(--color-neutral-50)] rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-[var(--color-neutral-500)]" />
                            <span className="text-sm text-[var(--color-neutral-700)]">점주 상세 정보 보기</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                    </Link>
                </section>

                {/* 영업 정보 */}
                <section className="bg-white mt-2 p-4">
                    <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">영업 정보</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">최소주문금액</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                                {store.min_order_amount?.toLocaleString() ?? 0}원
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">배달비</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                                {store.delivery_fee?.toLocaleString() ?? 0}원
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">평균 배달시간</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                                약 {store.estimated_delivery_time ?? 0}분
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--color-neutral-500)]">입점일</span>
                            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                                {new Date(store.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* 영업시간 */}
                    {businessHours.length > 0 && (
                        <div className="mt-4 p-3 bg-[var(--color-neutral-50)] rounded-lg">
                            {/* Simplified rendering of business hours assuming JSON array structure */}
                            <pre className="text-xs text-gray-600 overflow-auto">
                                {JSON.stringify(businessHours, null, 2)}
                            </pre>
                        </div>
                    )}
                </section>

                {/* 바로가기 */}
                <section className="p-4">
                    <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">관리</h3>
                    <div className="space-y-2">

                        <Link
                            href={`/admin/orders?search=${store.name}`} // Filter by store name (or ID if supported)
                            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-[var(--color-primary-500)]" />
                                </div>
                                <span className="font-medium text-[var(--color-neutral-900)]">주문 내역 보기</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                        </Link>

                        {/* 정산/분석 링크 유지 */}
                    </div>
                </section>
            </main>
        </div>
    )
}
