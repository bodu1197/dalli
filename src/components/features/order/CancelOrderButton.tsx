'use client'

/**
 * 주문 취소 버튼 컴포넌트
 * @description 주문 상태에 따라 취소 버튼을 표시하고 취소 모달을 트리거합니다.
 */

import { useState, useCallback } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCheckCancelability } from '@/hooks/useCancelOrder'
import { CancelOrderModal } from './CancelOrderModal'
import type { OrderStatus } from '@/types/order.types'

interface CancelOrderButtonProps {
  /** 주문 ID */
  orderId: string
  /** 주문 상태 */
  orderStatus: OrderStatus
  /** 취소 완료 콜백 */
  onCancelComplete?: () => void
  /** 버튼 변형 */
  variant?: 'default' | 'outline' | 'text'
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 추가 클래스명 */
  className?: string
}

export function CancelOrderButton({
  orderId,
  orderStatus,
  onCancelComplete,
  variant = 'outline',
  size = 'md',
  className,
}: CancelOrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 이미 취소되었거나 완료된 주문은 버튼 표시 안함
  const isTerminalStatus = ['cancelled', 'delivered'].includes(orderStatus)

  // 취소 가능 여부 확인 (터미널 상태가 아닐 때만)
  const {
    data: cancelability,
    isLoading,
    error,
  } = useCheckCancelability(orderId, !isTerminalStatus)

  const handleOpenModal = useCallback(() => {
    if (cancelability?.canCancel) {
      setIsModalOpen(true)
    }
  }, [cancelability?.canCancel])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleCancelComplete = useCallback(() => {
    setIsModalOpen(false)
    onCancelComplete?.()
  }, [onCancelComplete])

  // 터미널 상태면 렌더링 안함
  if (isTerminalStatus) {
    return null
  }

  // 로딩 중
  if (isLoading) {
    return (
      <button
        disabled
        className={cn(
          getButtonStyles(variant, size),
          'cursor-not-allowed opacity-50',
          className
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>확인 중...</span>
      </button>
    )
  }

  // 에러 또는 취소 불가
  if (error || !cancelability?.canCancel) {
    return (
      <button
        disabled
        className={cn(
          getButtonStyles(variant, size),
          'cursor-not-allowed opacity-50',
          className
        )}
        title={cancelability?.message ?? '취소할 수 없습니다'}
      >
        <X className="w-4 h-4" />
        <span>취소 불가</span>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={cn(getButtonStyles(variant, size), className)}
      >
        <X className="w-4 h-4" />
        <span>주문 취소</span>
      </button>

      {cancelability && (
        <CancelOrderModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          orderId={orderId}
          cancelability={cancelability}
          onCancelComplete={handleCancelComplete}
        />
      )}
    </>
  )
}

/**
 * 버튼 스타일 생성
 */
function getButtonStyles(
  variant: 'default' | 'outline' | 'text',
  size: 'sm' | 'md' | 'lg'
): string {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-xl'

  const variantStyles = {
    default: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    outline: 'border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100',
    text: 'text-red-600 hover:bg-red-50 active:bg-red-100',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return cn(baseStyles, variantStyles[variant], sizeStyles[size])
}
