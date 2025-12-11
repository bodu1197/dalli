/**
 * 쿠폰 복구 서비스
 * @description 주문 취소 시 사용된 쿠폰을 복구하는 서비스
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CouponRecoveryResult,
  RecoverCouponParams,
} from '@/types/order-cancellation.types'

// ============================================================================
// 상수 정의
// ============================================================================

const ERROR_MESSAGES = {
  COUPON_NOT_FOUND: '쿠폰을 찾을 수 없습니다.',
  COUPON_ALREADY_RECOVERED: '이미 복구된 쿠폰입니다.',
  RECOVERY_FAILED: '쿠폰 복구에 실패했습니다.',
  CANCELLATION_UPDATE_FAILED: '취소 정보 업데이트에 실패했습니다.',
} as const

// ============================================================================
// 쿠폰 복구 서비스
// ============================================================================

/**
 * 쿠폰 복구 처리
 *
 * @description 주문에 사용된 쿠폰을 복구합니다.
 * - user_coupons.used_at, order_id를 NULL로 설정
 * - coupons.used_quantity를 1 감소
 * - order_cancellations.coupon_refunded를 true로 설정
 *
 * @param supabase Supabase 클라이언트
 * @param params 복구 파라미터
 * @returns 복구 결과
 */
export async function recoverCoupon(
  supabase: SupabaseClient,
  params: RecoverCouponParams
): Promise<CouponRecoveryResult> {
  const { cancellationId, userCouponId } = params

  try {
    // 1. 사용자 쿠폰 조회 (마스터 쿠폰 ID 포함)
    const { data: userCoupon, error: fetchError } = await supabase
      .from('user_coupons')
      .select('id, coupon_id, used_at, order_id')
      .eq('id', userCouponId)
      .single()

    if (fetchError || !userCoupon) {
      return {
        success: false,
        userCouponId,
        couponId: null,
        errorMessage: ERROR_MESSAGES.COUPON_NOT_FOUND,
      }
    }

    // 2. 이미 복구된 쿠폰인지 확인 (used_at이 NULL이면 이미 복구됨)
    if (userCoupon.used_at === null) {
      return {
        success: true,
        userCouponId,
        couponId: userCoupon.coupon_id,
        errorMessage: ERROR_MESSAGES.COUPON_ALREADY_RECOVERED,
      }
    }

    // 3. 쿠폰 복구: used_at, order_id를 NULL로 설정
    const { error: updateError } = await supabase
      .from('user_coupons')
      .update({
        used_at: null,
        order_id: null,
      })
      .eq('id', userCouponId)

    if (updateError) {
      console.error('[recoverCoupon] user_coupons update failed:', updateError)
      return {
        success: false,
        userCouponId,
        couponId: userCoupon.coupon_id,
        errorMessage: ERROR_MESSAGES.RECOVERY_FAILED,
      }
    }

    // 4. 마스터 쿠폰 사용량 감소 (DB 함수 호출)
    const { error: decrementError } = await supabase.rpc(
      'decrement_coupon_used_quantity',
      { p_coupon_id: userCoupon.coupon_id }
    )

    if (decrementError) {
      console.error('[recoverCoupon] decrement_coupon_used_quantity failed:', decrementError)
      // 사용량 감소 실패해도 쿠폰 복구 자체는 성공으로 처리
      // 사용량은 정합성 이슈이므로 로그만 남김
    }

    // 5. 취소 레코드 업데이트 (coupon_refunded = true)
    const { error: cancellationError } = await supabase
      .from('order_cancellations')
      .update({
        coupon_refunded: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancellationId)

    if (cancellationError) {
      console.error('[recoverCoupon] cancellation update failed:', cancellationError)
      // 취소 레코드 업데이트 실패해도 쿠폰 복구 자체는 성공으로 처리
    }

    return {
      success: true,
      userCouponId,
      couponId: userCoupon.coupon_id,
      errorMessage: null,
    }
  } catch (error) {
    console.error('[recoverCoupon] unexpected error:', error)
    return {
      success: false,
      userCouponId,
      couponId: null,
      errorMessage:
        error instanceof Error ? error.message : ERROR_MESSAGES.RECOVERY_FAILED,
    }
  }
}

/**
 * 주문에서 쿠폰 복구 처리
 *
 * @description 주문 ID로 사용된 쿠폰을 조회하고 복구합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param orderId 주문 ID
 * @param cancellationId 취소 ID
 * @returns 복구 결과
 */
export async function recoverCouponFromOrder(
  supabase: SupabaseClient,
  orderId: string,
  cancellationId: string
): Promise<CouponRecoveryResult> {
  try {
    // 1. 주문에서 사용된 쿠폰 ID 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_coupon_id, coupon_discount_amount')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return {
        success: true,
        userCouponId: null,
        couponId: null,
        errorMessage: null, // 주문을 찾을 수 없어도 에러로 처리하지 않음
      }
    }

    // 2. 쿠폰이 사용되지 않은 경우
    if (!order.user_coupon_id || order.coupon_discount_amount === 0) {
      return {
        success: true,
        userCouponId: null,
        couponId: null,
        errorMessage: null,
      }
    }

    // 3. 쿠폰 복구 실행
    return recoverCoupon(supabase, {
      orderId,
      cancellationId,
      userCouponId: order.user_coupon_id,
    })
  } catch (error) {
    console.error('[recoverCouponFromOrder] unexpected error:', error)
    return {
      success: false,
      userCouponId: null,
      couponId: null,
      errorMessage:
        error instanceof Error ? error.message : ERROR_MESSAGES.RECOVERY_FAILED,
    }
  }
}

/**
 * 쿠폰 복구 가능 여부 확인
 *
 * @param supabase Supabase 클라이언트
 * @param userCouponId 사용자 쿠폰 ID
 * @returns 복구 가능 여부
 */
export async function canRecoverCoupon(
  supabase: SupabaseClient,
  userCouponId: string
): Promise<boolean> {
  try {
    const { data: userCoupon, error } = await supabase
      .from('user_coupons')
      .select('used_at')
      .eq('id', userCouponId)
      .single()

    if (error || !userCoupon) {
      return false
    }

    // used_at이 NULL이 아니면 복구 가능 (아직 사용 중)
    return userCoupon.used_at !== null
  } catch {
    return false
  }
}
