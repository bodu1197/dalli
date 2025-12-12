'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Store,
    User,
    CreditCard,
    MessageSquare,
} from 'lucide-react'
import { cancelOrderAction } from '@/app/admin/orders/[id]/actions'

// Define types based on implicit return from service
// In real world, we should export this type from service or shared types
// For now, I'll define interface matching the joined data structure manually or use 'any' if complex
// But let's try to be specific.

interface OrderDetailProps {
    order: any // Using any for complex joined types to save time, as we just want to display
}

export default function AdminOrderDetailClient({ order }: OrderDetailProps) {
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-[var(--color-warning-500)]" />
            case 'confirmed': return <CheckCircle className="w-5 h-5 text-[var(--color-info-500)]" />
            case 'preparing': return <Package className="w-5 h-5 text-[var(--color-primary-500)]" />
            case 'delivering': return <Truck className="w-5 h-5 text-[var(--color-success-500)]" />
            case 'completed':
            case 'delivered': return <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
            case 'cancelled': return <XCircle className="w-5 h-5 text-[var(--color-error-500)]" />
            default: return null
        }
    }

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            pending: '대기중',
            confirmed: '접수됨',
            preparing: '조리중',
            ready: '조리완료',
            delivering: '배달중',
            delivered: '배달완료',
            completed: '완료',
            cancelled: '취소',
        }
        return map[status] || status
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
            case 'confirmed': return 'bg-[var(--color-info-100)] text-[var(--color-info-600)]'
            case 'preparing':
            case 'ready': return 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
            case 'delivering': return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
            case 'completed':
            case 'delivered': return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            case 'cancelled': return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    const handleCancel = async () => {
        if (!cancelReason.trim()) return alert('취소 사유를 입력해주세요')
        if (!confirm('정말 취소하시겠습니까?')) return

        setIsCancelling(true)
        try {
            const result = await cancelOrderAction(order.id, cancelReason)
            if (result.success) {
                alert('주문이 취소되었습니다.')
                setShowCancelModal(false)
                // Page automtically revalidated
            } else {
                alert('취소 실패: ' + result.error)
            }
        } catch (e: any) {
            alert('오류 발생: ' + e.message)
        } finally {
            setIsCancelling(false)
        }
    }

    if (!order) return <div className="p-8 text-center">주문 정보를 불러올 수 없습니다.</div>

    // Data mapping from DB structure to UI
    const customerName = order.customer?.name || '알 수 없음'
    const customerPhone = order.customer?.phone || '-'
    const customerEmail = order.customer?.email || '-'
    const address = order.delivery_address || '-'
    const detail = order.delivery_detail || ''

    const restaurantName = order.restaurant?.name || order.restaurant_name || '-'
    const restaurantPhone = order.restaurant?.phone || order.restaurant_phone || '-'
    const restaurantAddress = order.restaurant?.address || '-'

    const riderName = order.rider_name || '-' // Assuming we use denormalized name or join if needed
    const riderPhone = order.rider_phone || '-'

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)]">
            {/* 헤더 */}
            <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
                <div className="flex items-center px-4 h-14">
                    <Link href="/admin/orders" className="w-10 h-10 flex items-center justify-center -ml-2">
                        <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
                    </Link>
                    <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
                        주문 상세
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="pb-32">
                {/* 주문 상태 */}
                <section className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-neutral-900)]">
                                #{order.order_number}
                            </h2>
                            <p className="text-sm text-[var(--color-neutral-500)]">
                                {new Date(order.created_at).toLocaleString('ko-KR')}
                            </p>
                        </div>
                        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                        </span>
                    </div>

                    {/* 타임라인 */}
                    <div className="border-t border-[var(--color-neutral-100)] pt-4">
                        <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">주문 진행</h3>
                        <div className="space-y-3">
                            {order.timeline && order.timeline.length > 0 ? (
                                order.timeline.map((item: any, index: number) => (
                                    <div key={item.id} className="flex items-start gap-3">
                                        <div className={`w-2 h-2 mt-1.5 rounded-full ${index === 0 ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-neutral-300)]'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                                                {getStatusLabel(item.new_status)}
                                                {item.note && ` (${item.note})`}
                                            </p>
                                            <p className="text-xs text-[var(--color-neutral-400)]">
                                                {new Date(item.created_at).toLocaleString('ko-KR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">기록된 이력이 없습니다.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 고객 정보 */}
                <section className="mt-2 p-4 bg-white">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
                        <User className="w-5 h-5 inline mr-2" />
                        고객 정보
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-neutral-500)]">이름</span>
                            <span className="font-medium">{customerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-neutral-500)]">연락처</span>
                            <a href={`tel:${customerPhone}`} className="font-medium text-[var(--color-primary-500)]">
                                {customerPhone}
                            </a>
                        </div>
                        <div className="flex items-start justify-between">
                            <span className="text-[var(--color-neutral-500)]">주소</span>
                            <div className="text-right">
                                <p className="font-medium text-sm">{address}</p>
                                <p className="text-sm text-[var(--color-neutral-500)]">{detail}</p>
                            </div>
                        </div>
                        <div className="flex items-start justify-between">
                            <span className="text-[var(--color-neutral-500)]">요청사항</span>
                            <span className="font-medium text-right text-sm whitespace-pre-wrap">{order.delivery_instructions || '-'}</span>
                        </div>
                    </div>
                </section>

                {/* 가게 정보 */}
                <section className="mt-2 p-4 bg-white">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
                        <Store className="w-5 h-5 inline mr-2" />
                        가게 정보
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-neutral-500)]">가게명</span>
                            <Link href={`/admin/stores/${order.restaurant_id}`} className="font-medium text-[var(--color-primary-500)]">
                                {restaurantName}
                            </Link>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-neutral-500)]">연락처</span>
                            <a href={`tel:${restaurantPhone}`} className="font-medium text-[var(--color-primary-500)]">
                                {restaurantPhone}
                            </a>
                        </div>
                        <div className="flex items-start justify-between">
                            <span className="text-[var(--color-neutral-500)]">주소</span>
                            <span className="font-medium text-right text-sm">{restaurantAddress}</span>
                        </div>
                    </div>
                </section>

                {/* 라이더 정보 */}
                {riderName !== '-' && (
                    <section className="mt-2 p-4 bg-white">
                        <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
                            <Truck className="w-5 h-5 inline mr-2" />
                            라이더 정보
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-neutral-500)]">이름</span>
                                <span className="font-medium">{riderName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-neutral-500)]">연락처</span>
                                <a href={`tel:${riderPhone}`} className="font-medium text-[var(--color-primary-500)]">
                                    {riderPhone}
                                </a>
                            </div>
                        </div>
                    </section>
                )}

                {/* 주문 내역 */}
                <section className="mt-2 p-4 bg-white">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
                        <Package className="w-5 h-5 inline mr-2" />
                        주문 내역
                    </h3>
                    <div className="space-y-3">
                        {order.items && order.items.map((item: any) => {
                            const options = typeof item.options === 'string'
                                ? JSON.parse(item.options)
                                : item.options
                            // item.options might be complex structure depending on how it's stored. 
                            // Usually it's an array of objects or strings.
                            // Assuming basic display stringification if possible.

                            return (
                                <div key={item.id} className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-[var(--color-neutral-900)]">
                                            {item.menu_name} x {item.quantity}
                                        </p>
                                        {/* Option display logic simplified */}
                                    </div>
                                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* 결제 정보 */}
                <section className="mt-2 p-4 bg-white">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] mb-3">
                        <CreditCard className="w-5 h-5 inline mr-2" />
                        결제 정보
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-neutral-500)]">주문금액</span>
                            <span>{order.menu_amount?.toLocaleString() ?? 0}원</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-neutral-500)]">배달비</span>
                            <span>{order.delivery_fee?.toLocaleString() ?? 0}원</span>
                        </div>
                        {order.discount_amount && order.discount_amount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-neutral-500)]">할인</span>
                                <span className="text-[var(--color-error-500)]">-{order.discount_amount.toLocaleString()}원</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutral-100)]">
                            <span className="font-semibold">총 결제금액</span>
                            <span className="font-bold text-lg">{order.total_amount?.toLocaleString() ?? 0}원</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-neutral-500)]">결제수단</span>
                            <span>{order.payment_method || '정보없음'}</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* 하단 액션 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
                <div className="flex gap-3">
                    <Link
                        href={`/chat/order/${order.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-700)] font-medium"
                    >
                        <MessageSquare className="w-5 h-5" />
                        채팅방 보기
                    </Link>
                    {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-error-500)] text-white rounded-xl font-medium"
                        >
                            <XCircle className="w-5 h-5" />
                            주문 취소
                        </button>
                    )}
                </div>
            </div>

            {/* 취소 모달 */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-[var(--color-neutral-900)] mb-2">
                            주문을 취소하시겠습니까?
                        </h3>
                        <p className="text-sm text-[var(--color-neutral-500)] mb-4">
                            취소 시 고객에게 알림이 전송되며 환불 프로세스가 시작됩니다.
                        </p>

                        <textarea
                            className="w-full p-3 border border-[var(--color-neutral-200)] rounded-lg mb-4 text-sm"
                            placeholder="취소 사유를 입력하세요 (예: 고객 요청, 재료 소진 등)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 border border-[var(--color-neutral-200)] rounded-xl font-medium"
                                disabled={isCancelling}
                            >
                                닫기
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1 py-3 bg-[var(--color-error-500)] text-white rounded-xl font-medium flex justify-center items-center"
                            >
                                {isCancelling ? '처리중...' : '취소하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
