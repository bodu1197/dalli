/**
 * 포인트 시스템 타입 정의
 */

// 포인트 거래 타입
export type PointTransactionType =
  | 'earn' // 적립
  | 'use' // 사용
  | 'expire' // 만료
  | 'admin_add' // 관리자 수동 지급
  | 'admin_deduct' // 관리자 수동 차감

// 포인트 거래 내역
export interface PointTransaction {
  id: string
  userId: string
  orderId: string | null
  type: PointTransactionType
  amount: number // 양수: 적립/지급, 음수: 사용/차감/만료
  balanceAfter: number // 거래 후 잔액
  description: string | null
  expiresAt: string | null // 포인트 만료일 (적립 시)
  createdAt: string
}

// 사용자 포인트 정보
export interface UserPointInfo {
  balance: number // 현재 잔액
  totalEarned: number // 총 적립
  totalUsed: number // 총 사용
  expiringThisMonth: number // 이번달 만료 예정
}

// 포인트 적립 입력
export interface EarnPointInput {
  userId: string
  orderId: string
  amount: number
  description?: string
  expiresAt?: string // 기본 1년 후 만료
}

// 포인트 사용 입력
export interface UsePointInput {
  userId: string
  orderId: string
  amount: number
  description?: string
}

// 포인트 정책
export const POINT_POLICY = {
  // 주문 금액 대비 적립률 (%)
  EARN_RATE: 1,
  // 최소 적립 금액
  MIN_EARN_AMOUNT: 100,
  // 포인트 유효 기간 (일)
  EXPIRY_DAYS: 365,
  // 최소 사용 포인트
  MIN_USE_AMOUNT: 1000,
  // 포인트 사용 단위
  USE_UNIT: 100,
} as const

/**
 * 주문 금액에 대한 적립 포인트 계산
 */
export function calculateEarnPoints(orderAmount: number): number {
  const points = Math.floor(orderAmount * (POINT_POLICY.EARN_RATE / 100))
  return points >= POINT_POLICY.MIN_EARN_AMOUNT ? points : 0
}

/**
 * 포인트 사용 가능 여부 확인
 */
export function canUsePoints(balance: number, useAmount: number): boolean {
  if (useAmount < POINT_POLICY.MIN_USE_AMOUNT) {
    return false
  }
  if (useAmount % POINT_POLICY.USE_UNIT !== 0) {
    return false
  }
  return balance >= useAmount
}

/**
 * 포인트 만료일 계산
 */
export function getPointExpiryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + POINT_POLICY.EXPIRY_DAYS)
  return date.toISOString()
}
