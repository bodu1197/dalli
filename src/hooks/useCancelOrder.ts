/**
 * 주문 취소 관련 React Hooks
 * @description 주문 취소 기능에 필요한 커스텀 훅들
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CancelabilityCheck,
  CancelOrderResponse,
  CancelReasonCategory,
  OrderCancellation,
  Refund,
} from '@/types/order-cancellation.types'

// ============================================================================
// Query Keys
// ============================================================================

export const cancelOrderKeys = {
  all: ['order-cancellation'] as const,
  cancelability: (orderId: string) =>
    [...cancelOrderKeys.all, 'cancelability', orderId] as const,
  history: (orderId: string) =>
    [...cancelOrderKeys.all, 'history', orderId] as const,
}

// ============================================================================
// API 함수
// ============================================================================

/**
 * 취소 가능 여부 조회 API 호출
 */
async function fetchCancelability(orderId: string): Promise<CancelabilityCheck> {
  const response = await fetch(`/api/orders/${orderId}/cancel/check`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? '취소 가능 여부를 확인할 수 없습니다.')
  }

  return result.data
}

/**
 * 주문 취소 API 호출
 */
async function cancelOrder(
  orderId: string,
  reasonCategory: CancelReasonCategory,
  reasonDetail?: string
): Promise<CancelOrderResponse['data']> {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reasonCategory, reasonDetail }),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? '주문 취소에 실패했습니다.')
  }

  return result.data
}

/**
 * 취소 내역 조회 API 호출
 */
async function fetchCancelHistory(orderId: string): Promise<{
  cancellations: OrderCancellation[]
  refunds: Refund[]
}> {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? '취소 내역을 불러올 수 없습니다.')
  }

  return result.data
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 취소 가능 여부 조회 훅
 * @param orderId 주문 ID
 * @param enabled 쿼리 활성화 여부
 */
export function useCheckCancelability(orderId: string, enabled = true) {
  return useQuery({
    queryKey: cancelOrderKeys.cancelability(orderId),
    queryFn: () => fetchCancelability(orderId),
    enabled: !!orderId && enabled,
    staleTime: 30 * 1000, // 30초
    retry: 1,
  })
}

/**
 * 주문 취소 실행 훅 옵션
 */
interface UseCancelOrderOptions {
  onSuccess?: () => void
}

/**
 * 주문 취소 실행 훅
 */
export function useCancelOrder(options?: UseCancelOrderOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      reasonCategory,
      reasonDetail,
    }: {
      orderId: string
      reasonCategory: CancelReasonCategory
      reasonDetail?: string
    }) => cancelOrder(orderId, reasonCategory, reasonDetail),
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: cancelOrderKeys.cancelability(variables.orderId),
      })
      queryClient.invalidateQueries({
        queryKey: cancelOrderKeys.history(variables.orderId),
      })
      // 주문 목록 쿼리도 무효화 (있다면)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      // 외부 onSuccess 콜백 호출
      options?.onSuccess?.()
    },
  })
}

/**
 * 취소 내역 조회 훅
 * @param orderId 주문 ID
 * @param enabled 쿼리 활성화 여부
 */
export function useCancelHistory(orderId: string, enabled = true) {
  return useQuery({
    queryKey: cancelOrderKeys.history(orderId),
    queryFn: () => fetchCancelHistory(orderId),
    enabled: !!orderId && enabled,
    staleTime: 60 * 1000, // 1분
  })
}

// ============================================================================
// 유틸리티 훅
// ============================================================================

/**
 * 취소 버튼 상태 관리 훅
 * 취소 가능 여부와 로딩 상태를 통합 관리
 */
export function useCancelButton(orderId: string) {
  const {
    data: cancelability,
    isLoading: isCheckingCancelability,
    error: cancelabilityError,
    refetch: recheckCancelability,
  } = useCheckCancelability(orderId)

  const {
    mutate: cancelOrder,
    isPending: isCancelling,
    error: cancelError,
    isSuccess: isCancelled,
    reset: resetCancelState,
  } = useCancelOrder()

  return {
    // 취소 가능 여부 정보
    cancelability,
    canCancel: cancelability?.canCancel ?? false,
    cancelMessage: cancelability?.message ?? '',

    // 로딩 상태
    isLoading: isCheckingCancelability || isCancelling,
    isCheckingCancelability,
    isCancelling,

    // 결과 상태
    isCancelled,
    error: cancelabilityError ?? cancelError,

    // 액션
    cancelOrder: (reasonCategory: CancelReasonCategory, reasonDetail?: string) => {
      cancelOrder({ orderId, reasonCategory, reasonDetail })
    },
    recheckCancelability,
    resetCancelState,
  }
}
