/**
 * 달리고 플랫폼 수수료 정책
 * - 주문금액 1만원 미만: 수수료 0원 (무료)
 * - 주문금액 1만원 이상: 수수료 500원 (건당 고정)
 */
export const PLATFORM_FEE_POLICY = {
  /** 기준 금액: 1만원 */
  THRESHOLD: 10000,
  /** 1만원 미만 주문: 수수료 0원 */
  FEE_BELOW: 0,
  /** 1만원 이상 주문: 수수료 500원 (건당) */
  FEE_ABOVE: 500,
} as const

/**
 * 플랫폼 수수료 계산 함수
 * 점주가 플랫폼에 지불하는 판매 수수료를 계산합니다.
 *
 * @param orderAmount - 주문 금액
 * @returns 플랫폼 수수료 (0원 또는 500원)
 *
 * @example
 * calculatePlatformFee(9000)   // 0원 (점주 수수료 없음)
 * calculatePlatformFee(10000)  // 500원
 * calculatePlatformFee(50000)  // 500원 (고정)
 */
export function calculatePlatformFee(orderAmount: number): number {
  if (orderAmount < PLATFORM_FEE_POLICY.THRESHOLD) {
    return PLATFORM_FEE_POLICY.FEE_BELOW
  }
  return PLATFORM_FEE_POLICY.FEE_ABOVE
}

/**
 * 수수료 정보 문자열 반환
 * UI에서 수수료 정책을 표시할 때 사용
 */
export function getPlatformFeeDescription(orderAmount: number): string {
  const fee = calculatePlatformFee(orderAmount)
  if (fee === 0) {
    return '수수료 무료'
  }
  return `수수료 ${fee.toLocaleString()}원`
}
