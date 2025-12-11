/**
 * 취소 정책 서비스
 * @description 주문 상태별 취소 정책 조회 및 취소 가능 여부 판단
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CancellationType,
  CancellationPolicyResult,
  CancellationPolicyRecord,
  CanCancelOrderResult,
} from '@/types/order-cancellation.types'

// ============================================================================
// 상수 정의
// ============================================================================

const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  POLICY_NOT_FOUND: '취소 정책을 찾을 수 없습니다.',
  ALREADY_CANCELLED: '이미 취소된 주문입니다.',
  CANCELLATION_EXISTS: '이미 취소 요청이 존재합니다.',
  UNEXPECTED_ERROR: '예기치 않은 오류가 발생했습니다.',
} as const

/**
 * 기본 취소 정책 (정책이 없을 경우 사용)
 */
const DEFAULT_POLICY: CancellationPolicyResult = {
  cancellationType: 'not_allowed',
  refundRate: 0,
  canRefundCoupon: false,
  canRefundPoints: false,
  approvalTimeoutMinutes: 0,
  description: '취소 정책이 정의되지 않았습니다.',
  messageForCustomer: '취소할 수 없는 상태입니다. 고객센터로 문의해주세요.',
}

// ============================================================================
// 취소 정책 서비스
// ============================================================================

/**
 * 주문 상태에 따른 취소 정책 조회
 *
 * @description DB에서 주문 상태별 취소 정책을 조회합니다.
 * 정책이 없는 경우 기본적으로 취소 불가로 처리합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param orderStatus 주문 상태
 * @returns 취소 정책
 */
export async function getCancellationPolicy(
  supabase: SupabaseClient,
  orderStatus: string
): Promise<CancellationPolicyResult> {
  try {
    // 1. DB 함수를 통한 정책 조회 시도
    const { data: policyJson, error: rpcError } = await supabase.rpc(
      'get_cancellation_policy',
      { p_order_status: orderStatus }
    )

    if (!rpcError && policyJson) {
      return {
        cancellationType: policyJson.cancellationType as CancellationType,
        refundRate: policyJson.refundRate,
        canRefundCoupon: policyJson.canRefundCoupon,
        canRefundPoints: policyJson.canRefundPoints,
        approvalTimeoutMinutes: policyJson.approvalTimeoutMinutes,
        description: policyJson.description ?? '',
        messageForCustomer: policyJson.messageForCustomer ?? '',
      }
    }

    // 2. DB 함수가 없는 경우 직접 테이블 조회
    const { data: policy, error: queryError } = await supabase
      .from('cancellation_policies')
      .select('*')
      .eq('order_status', orderStatus)
      .eq('is_active', true)
      .single()

    if (queryError || !policy) {
      // 정책이 없는 경우 기본값 반환
      return DEFAULT_POLICY
    }

    const policyRecord = policy as CancellationPolicyRecord

    return {
      cancellationType: policyRecord.cancellationType,
      refundRate: policyRecord.refundRate,
      canRefundCoupon: policyRecord.canRefundCoupon,
      canRefundPoints: policyRecord.canRefundPoints,
      approvalTimeoutMinutes: policyRecord.approvalTimeoutMinutes,
      description: policyRecord.description ?? '',
      messageForCustomer: policyRecord.messageForCustomer ?? '',
    }
  } catch (error) {
    console.error('[getCancellationPolicy] unexpected error:', error)
    return DEFAULT_POLICY
  }
}

/**
 * 모든 활성 취소 정책 조회
 *
 * @param supabase Supabase 클라이언트
 * @returns 모든 활성 취소 정책 목록
 */
export async function getAllCancellationPolicies(
  supabase: SupabaseClient
): Promise<CancellationPolicyRecord[]> {
  try {
    const { data, error } = await supabase
      .from('cancellation_policies')
      .select('*')
      .eq('is_active', true)
      .order('order_status')

    if (error || !data) {
      return []
    }

    return data as CancellationPolicyRecord[]
  } catch (error) {
    console.error('[getAllCancellationPolicies] unexpected error:', error)
    return []
  }
}

/**
 * 주문 취소 가능 여부 확인
 *
 * @description 주문 ID로 주문 상태를 확인하고 취소 가능 여부와
 * 예상 환불 금액을 계산합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param orderId 주문 ID
 * @returns 취소 가능 여부 및 상세 정보
 */
export async function canCancelOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<CanCancelOrderResult> {
  try {
    // 1. 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        delivery_fee,
        user_coupon_id,
        coupon_discount_amount,
        used_points
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return {
        canCancel: false,
        policy: {
          ...DEFAULT_POLICY,
          description: ERROR_MESSAGES.ORDER_NOT_FOUND,
          messageForCustomer: ERROR_MESSAGES.ORDER_NOT_FOUND,
        },
        estimatedRefund: null,
      }
    }

    // 2. 이미 취소된 주문인지 확인
    if (order.status === 'cancelled') {
      return {
        canCancel: false,
        policy: {
          cancellationType: 'not_allowed',
          refundRate: 0,
          canRefundCoupon: false,
          canRefundPoints: false,
          approvalTimeoutMinutes: 0,
          description: ERROR_MESSAGES.ALREADY_CANCELLED,
          messageForCustomer: ERROR_MESSAGES.ALREADY_CANCELLED,
        },
        estimatedRefund: null,
      }
    }

    // 3. 기존 취소 요청 확인
    const { data: existingCancellation } = await supabase
      .from('order_cancellations')
      .select('id, status')
      .eq('order_id', orderId)
      .in('status', ['pending', 'approved'])
      .single()

    if (existingCancellation) {
      return {
        canCancel: false,
        policy: {
          cancellationType: 'not_allowed',
          refundRate: 0,
          canRefundCoupon: false,
          canRefundPoints: false,
          approvalTimeoutMinutes: 0,
          description: ERROR_MESSAGES.CANCELLATION_EXISTS,
          messageForCustomer: '이미 취소 요청이 진행 중입니다.',
        },
        estimatedRefund: null,
      }
    }

    // 4. 취소 정책 조회
    const policy = await getCancellationPolicy(supabase, order.status)

    // 5. 취소 불가인 경우
    if (policy.cancellationType === 'not_allowed') {
      return {
        canCancel: false,
        policy,
        estimatedRefund: null,
      }
    }

    // 6. 예상 환불 금액 계산
    const menuAmount = order.total_amount - order.delivery_fee
    const menuRefundAmount = Math.floor(menuAmount * (policy.refundRate / 100))
    // 배달비는 조리 시작 전이면 전액 환불, 이후는 환불 없음
    const deliveryRefundAmount =
      policy.refundRate === 100 ? order.delivery_fee : 0
    const totalRefundAmount = menuRefundAmount + deliveryRefundAmount

    return {
      canCancel: true,
      policy,
      estimatedRefund: {
        amount: totalRefundAmount,
        menuRefundAmount,
        deliveryRefundAmount,
        refundRate: policy.refundRate,
        couponRefund: policy.canRefundCoupon && !!order.user_coupon_id,
        pointsRefund: policy.canRefundPoints && order.used_points > 0,
      },
    }
  } catch (error) {
    console.error('[canCancelOrder] unexpected error:', error)
    return {
      canCancel: false,
      policy: {
        ...DEFAULT_POLICY,
        description: ERROR_MESSAGES.UNEXPECTED_ERROR,
        messageForCustomer: ERROR_MESSAGES.UNEXPECTED_ERROR,
      },
      estimatedRefund: null,
    }
  }
}

/**
 * 취소 유형 라벨 반환
 *
 * @param cancellationType 취소 유형
 * @returns 한글 라벨
 */
export function getCancellationTypeLabel(
  cancellationType: CancellationType
): string {
  const labels: Record<CancellationType, string> = {
    instant: '즉시 취소',
    approval_required: '점주 승인 필요',
    not_allowed: '취소 불가',
  }
  return labels[cancellationType]
}

/**
 * 환불율에 따른 설명 메시지 생성
 *
 * @param refundRate 환불율 (0-100)
 * @param cancellationType 취소 유형
 * @returns 설명 메시지
 */
export function getRefundRateDescription(
  refundRate: number,
  cancellationType: CancellationType
): string {
  if (cancellationType === 'not_allowed') {
    return '취소가 불가능합니다.'
  }

  if (refundRate === 100) {
    return '전액 환불됩니다.'
  }

  if (refundRate === 0) {
    return '환불이 불가능합니다.'
  }

  return `${refundRate}%만 환불됩니다.`
}

/**
 * 취소 정책 유효성 검증
 *
 * @description 취소 정책 수정 시 유효성을 검증합니다.
 *
 * @param policy 취소 정책 일부 필드
 * @returns 유효성 검증 결과
 */
export function validateCancellationPolicy(
  policy: Partial<CancellationPolicyRecord>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 환불율 검증
  if (policy.refundRate !== undefined) {
    if (policy.refundRate < 0 || policy.refundRate > 100) {
      errors.push('환불율은 0에서 100 사이여야 합니다.')
    }
  }

  // 승인 타임아웃 검증
  if (policy.approvalTimeoutMinutes !== undefined) {
    if (policy.approvalTimeoutMinutes < 0) {
      errors.push('승인 타임아웃은 0 이상이어야 합니다.')
    }
    if (policy.approvalTimeoutMinutes > 1440) {
      // 24시간
      errors.push('승인 타임아웃은 24시간(1440분)을 초과할 수 없습니다.')
    }
  }

  // 취소 유형 검증
  if (policy.cancellationType !== undefined) {
    const validTypes: CancellationType[] = [
      'instant',
      'approval_required',
      'not_allowed',
    ]
    if (!validTypes.includes(policy.cancellationType)) {
      errors.push('유효하지 않은 취소 유형입니다.')
    }
  }

  // 논리적 일관성 검증
  if (
    policy.cancellationType === 'not_allowed' &&
    policy.refundRate !== undefined &&
    policy.refundRate > 0
  ) {
    errors.push('취소 불가 정책은 환불율이 0이어야 합니다.')
  }

  if (
    policy.cancellationType === 'instant' &&
    policy.approvalTimeoutMinutes !== undefined &&
    policy.approvalTimeoutMinutes > 0
  ) {
    errors.push('즉시 취소 정책은 승인 타임아웃이 0이어야 합니다.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
