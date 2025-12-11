'use client'

/**
 * 취소/환불 상태 뱃지 컴포넌트
 * @description 취소 상태 및 환불 상태를 시각적으로 표시합니다.
 */

import { cn } from '@/lib/utils'
import {
  CANCEL_STATUS_LABELS,
  CANCEL_STATUS_COLORS,
  REFUND_STATUS_LABELS,
  REFUND_STATUS_COLORS,
} from '@/lib/constants/order-cancellation'
import type {
  CancelStatus,
  RefundStatus,
  CancelStatusBadgeProps,
  RefundStatusBadgeProps,
} from '@/types/order-cancellation.types'

/**
 * 취소 상태 뱃지
 */
export function CancelStatusBadge({ status, className }: CancelStatusBadgeProps) {
  const label = CANCEL_STATUS_LABELS[status]
  const colorClass = CANCEL_STATUS_COLORS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}

/**
 * 환불 상태 뱃지
 */
export function RefundStatusBadge({ status, className }: RefundStatusBadgeProps) {
  const label = REFUND_STATUS_LABELS[status]
  const colorClass = REFUND_STATUS_COLORS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}

/**
 * 취소 정보 카드 컴포넌트
 * @description 주문 상세에서 취소 정보를 표시
 */
interface CancellationInfoCardProps {
  status: CancelStatus
  reason: string
  reasonDetail?: string | null
  refundAmount: number
  refundRate: number
  refundStatus?: RefundStatus
  createdAt: string
  className?: string
}

export function CancellationInfoCard({
  status,
  reason,
  reasonDetail,
  refundAmount,
  refundRate,
  refundStatus,
  createdAt,
  className,
}: CancellationInfoCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-neutral-900">취소 정보</h4>
        <CancelStatusBadge status={status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">취소 사유</span>
          <span className="text-neutral-900">{reason}</span>
        </div>

        {reasonDetail && (
          <div>
            <span className="text-neutral-500">상세 사유</span>
            <p className="mt-1 text-neutral-700 bg-neutral-50 rounded-lg p-2">
              {reasonDetail}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-neutral-500">환불율</span>
          <span className="text-neutral-900">{Math.round(refundRate * 100)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-500">환불 금액</span>
          <span className="font-bold text-primary">
            {refundAmount.toLocaleString()}원
          </span>
        </div>

        {refundStatus && (
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">환불 상태</span>
            <RefundStatusBadge status={refundStatus} />
          </div>
        )}

        <div className="flex justify-between pt-2 border-t border-neutral-100">
          <span className="text-neutral-500">취소 일시</span>
          <span className="text-neutral-700">{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
