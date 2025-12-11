'use client'

import { use, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  ChevronRight,
  Store,
  Clock,
  CreditCard,
} from 'lucide-react'

import { getOrderById } from '@/lib/mock/orders'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/types/order.types'
import { CancelOrderButton } from '@/components/features/order'
import { CANCEL_REASON_LABELS } from '@/lib/constants/order-cancellation'
import type { CancelReasonCategory } from '@/types/order-cancellation.types'

interface PageProps {
  readonly params: Promise<{ orderId: string }>
}

export default function OrderDetailPage({ params }: Readonly<PageProps>) {
  const { orderId } = use(params)
  const router = useRouter()
  const order = getOrderById(orderId)

  // 취소 완료 시 페이지 새로고침
  const handleCancelComplete = useCallback(() => {
    router.refresh()
  }, [router])

  // 취소 사유 라벨 가져오기
  const getCancelReasonLabel = (reason: string): string => {
    return CANCEL_REASON_LABELS[reason as CancelReasonCategory] ?? reason
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-[var(--color-neutral-500)] mb-6">
          주문을 찾을 수 없습니다
        </p>
        <Link
          href="/orders"
          className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
        >
          주문내역으로 돌아가기
        </Link>
      </div>
    )
  }

  const statusColor = ORDER_STATUS_COLORS[order.status]
  const statusLabel = ORDER_STATUS_LABELS[order.status]
  const isActive = !['delivered', 'cancelled'].includes(order.status)

  const orderDate = new Date(order.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const estimatedTime = order.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const actualTime = order.actualDeliveryTime
    ? new Date(order.actualDeliveryTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  // 주문 금액 계산
  const totalPayment = order.totalAmount + order.deliveryFee

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </button>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            주문 상세
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main>
        {/* 주문 상태 */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-bold ${statusColor}`}>
              {statusLabel}
            </span>
            {isActive && estimatedTime && (
              <span className="text-sm text-[var(--color-neutral-500)]">
                예상 도착 {estimatedTime}
              </span>
            )}
            {order.status === 'delivered' && actualTime && (
              <span className="text-sm text-[var(--color-neutral-500)]">
                {actualTime} 도착
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-neutral-500)]">
            {orderDate}
          </p>

          {/* 진행 중인 주문: 배달 추적 버튼 */}
          {isActive && (
            <Link
              href={`/orders/${order.id}/tracking`}
              className="mt-4 flex items-center justify-between p-4 bg-[var(--color-primary-50)] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-[var(--color-primary-600)]">
                  실시간 배달 현황 보기
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-primary-500)]" />
            </Link>
          )}

          {/* 취소된 주문: 취소 사유 */}
          {order.status === 'cancelled' && order.cancelledReason && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600">
                <span className="font-semibold">취소 사유:</span>{' '}
                {getCancelReasonLabel(order.cancelledReason)}
              </p>
            </div>
          )}

          {/* 취소 가능한 주문: 취소 버튼 */}
          {isActive && (
            <div className="mt-4">
              <CancelOrderButton
                orderId={order.id}
                orderStatus={order.status}
                onCancelComplete={handleCancelComplete}
                variant="outline"
                size="lg"
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* 가게 정보 */}
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Store className="w-5 h-5 text-[var(--color-neutral-400)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">
              주문 가게
            </h3>
          </div>
          <Link
            href={`/restaurants/${order.restaurantId}`}
            className="flex items-center justify-between"
          >
            <span className="font-medium text-[var(--color-neutral-900)]">
              {order.restaurantName}
            </span>
            <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
          </Link>
        </div>

        {/* 주문 메뉴 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-4">
            주문 메뉴
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => {
              const optionsPrice = item.options.reduce((sum, opt) => sum + opt.price, 0)
              const itemTotal = (item.price + optionsPrice) * item.quantity

              return (
                <div key={item.id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[var(--color-neutral-900)]">
                      {item.menuName}
                      <span className="text-[var(--color-neutral-500)] ml-1">
                        x {item.quantity}
                      </span>
                    </p>
                    {item.options.length > 0 && (
                      <p className="text-sm text-[var(--color-neutral-400)] mt-1">
                        {item.options.map((opt) => opt.name).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-[var(--color-neutral-400)] mt-1">
                        요청: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-[var(--color-neutral-900)]">
                    {itemTotal.toLocaleString()}원
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 배달 정보 */}
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-[var(--color-neutral-400)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">
              배달 정보
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-[var(--color-neutral-900)]">
              {order.deliveryAddress}
            </p>
            {order.deliveryDetail && (
              <p className="text-sm text-[var(--color-neutral-500)]">
                {order.deliveryDetail}
              </p>
            )}
          </div>
          {order.specialInstructions && (
            <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)]">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[var(--color-neutral-400)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">
                  배달 요청사항
                </span>
              </div>
              <p className="text-[var(--color-neutral-900)]">
                {order.specialInstructions}
              </p>
            </div>
          )}
        </div>

        {/* 결제 정보 */}
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-[var(--color-neutral-400)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">
              결제 정보
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-neutral-500)]">주문 금액</span>
              <span className="text-[var(--color-neutral-900)]">
                {order.totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-neutral-500)]">배달팁</span>
              <span className="text-[var(--color-neutral-900)]">
                {order.deliveryFee === 0
                  ? '무료'
                  : `${order.deliveryFee.toLocaleString()}원`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[var(--color-neutral-100)]">
              <span className="font-bold text-[var(--color-neutral-900)]">
                총 결제금액
              </span>
              <span className="font-bold text-[var(--color-primary-500)]">
                {totalPayment.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 주문 번호 */}
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-[var(--color-neutral-400)]">
            주문번호: {order.id}
          </p>
        </div>
      </main>

      {/* 하단 액션 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
        {isActive ? (
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 text-center border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl flex items-center justify-center gap-2"
              onClick={() => {
                // Note: 가게 전화 연결 (tel: 프로토콜 사용 예정)
                alert('가게 전화 연결 기능 준비 중입니다')
              }}
            >
              <Phone className="w-4 h-4" />
              가게 전화
            </button>
            <Link
              href={`/orders/${order.id}/tracking`}
              className="flex-1 py-3 text-center bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              배달 현황
            </Link>
          </div>
        ) : order.status === 'delivered' ? (
          <div className="flex gap-3">
            <Link
              href={`/orders/${order.id}/review`}
              className="flex-1 py-3 text-center border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
            >
              리뷰 쓰기
            </Link>
            <button
              className="flex-1 py-3 text-center bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
              onClick={() => {
                // Note: 재주문 기능 (장바구니 스토어 연동 예정)
                alert('재주문 기능 준비 중입니다')
              }}
            >
              재주문
            </button>
          </div>
        ) : (
          <Link
            href="/orders"
            className="block w-full py-3 text-center bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] font-semibold rounded-xl"
          >
            주문내역으로 돌아가기
          </Link>
        )}
      </div>
    </div>
  )
}
