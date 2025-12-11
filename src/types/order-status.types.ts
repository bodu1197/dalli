/**
 * 주문 상태 전환 규칙 타입 정의
 * @description 역할별 주문 상태 변경 권한 및 전환 규칙 정의
 */

import type { OrderStatus } from './order.types'

// ============================================================================
// 역할 타입
// ============================================================================

/**
 * 상태 변경 가능 역할
 */
export type OrderStatusChangeRole = 'customer' | 'owner' | 'rider' | 'system'

// ============================================================================
// 상태 전환 규칙
// ============================================================================

/**
 * 상태 전환 규칙
 */
export interface StatusTransitionRule {
  /** 출발 상태 */
  from: OrderStatus
  /** 도착 상태 */
  to: OrderStatus
  /** 전환 가능 역할들 */
  allowedRoles: OrderStatusChangeRole[]
  /** 전환 조건 설명 */
  description: string
}

/**
 * 주문 상태 전환 규칙 정의
 * @description 각 상태에서 어떤 역할이 어떤 상태로 전환할 수 있는지 정의
 */
export const ORDER_STATUS_TRANSITIONS: StatusTransitionRule[] = [
  // pending (주문 대기) → 다른 상태
  {
    from: 'pending',
    to: 'confirmed',
    allowedRoles: ['owner'],
    description: '점주가 주문을 접수합니다',
  },
  {
    from: 'pending',
    to: 'rejected',
    allowedRoles: ['owner'],
    description: '점주가 주문을 거절합니다',
  },
  {
    from: 'pending',
    to: 'cancelled',
    allowedRoles: ['customer', 'system'],
    description: '고객이 주문을 취소하거나 시스템에서 자동 취소합니다',
  },

  // confirmed (주문 접수) → 다른 상태
  {
    from: 'confirmed',
    to: 'preparing',
    allowedRoles: ['owner'],
    description: '점주가 조리를 시작합니다',
  },
  {
    from: 'confirmed',
    to: 'cancelled',
    allowedRoles: ['customer', 'owner', 'system'],
    description: '주문이 취소됩니다 (취소 요청 승인 필요)',
  },

  // preparing (조리 중) → 다른 상태
  {
    from: 'preparing',
    to: 'ready',
    allowedRoles: ['owner'],
    description: '조리가 완료되어 라이더 픽업 대기 상태가 됩니다',
  },
  {
    from: 'preparing',
    to: 'cancelled',
    allowedRoles: ['owner', 'system'],
    description: '주문이 취소됩니다 (점주 승인 또는 시스템 처리)',
  },

  // ready (조리 완료) → 다른 상태
  {
    from: 'ready',
    to: 'picked_up',
    allowedRoles: ['rider'],
    description: '라이더가 음식을 픽업합니다',
  },
  {
    from: 'ready',
    to: 'cancelled',
    allowedRoles: ['owner', 'system'],
    description: '주문이 취소됩니다 (점주 승인 또는 시스템 처리)',
  },

  // picked_up (픽업 완료) → 다른 상태
  {
    from: 'picked_up',
    to: 'delivering',
    allowedRoles: ['rider', 'system'],
    description: '라이더가 배달을 시작합니다',
  },
  {
    from: 'picked_up',
    to: 'cancelled',
    allowedRoles: ['system'],
    description: '시스템에서 주문을 취소합니다 (특수 상황)',
  },

  // delivering (배달 중) → 다른 상태
  {
    from: 'delivering',
    to: 'delivered',
    allowedRoles: ['rider'],
    description: '라이더가 배달을 완료합니다',
  },
  {
    from: 'delivering',
    to: 'cancelled',
    allowedRoles: ['system'],
    description: '시스템에서 주문을 취소합니다 (특수 상황)',
  },

  // rejected, delivered, cancelled는 최종 상태이므로 전환 없음
]

// ============================================================================
// 상태 전환 유틸리티 함수
// ============================================================================

/**
 * 특정 역할이 현재 상태에서 목표 상태로 전환 가능한지 확인
 * @param from 현재 상태
 * @param to 목표 상태
 * @param role 역할
 * @returns 전환 가능 여부
 */
export function canTransitionStatus(
  from: OrderStatus,
  to: OrderStatus,
  role: OrderStatusChangeRole
): boolean {
  const rule = ORDER_STATUS_TRANSITIONS.find(
    (r) => r.from === from && r.to === to
  )

  if (!rule) {
    return false
  }

  return rule.allowedRoles.includes(role)
}

/**
 * 특정 역할이 현재 상태에서 전환 가능한 모든 상태 목록 반환
 * @param from 현재 상태
 * @param role 역할
 * @returns 전환 가능한 상태 목록
 */
export function getAvailableTransitions(
  from: OrderStatus,
  role: OrderStatusChangeRole
): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS
    .filter((r) => r.from === from && r.allowedRoles.includes(role))
    .map((r) => r.to)
}

/**
 * 상태가 최종 상태인지 확인 (더 이상 전환 불가)
 * @param status 주문 상태
 * @returns 최종 상태 여부
 */
export function isFinalStatus(status: OrderStatus): boolean {
  const finalStatuses: OrderStatus[] = ['rejected', 'delivered', 'cancelled']
  return finalStatuses.includes(status)
}

/**
 * 상태가 활성 상태인지 확인 (진행 중인 주문)
 * @param status 주문 상태
 * @returns 활성 상태 여부
 */
export function isActiveStatus(status: OrderStatus): boolean {
  const activeStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'picked_up',
    'delivering',
  ]
  return activeStatuses.includes(status)
}

/**
 * 고객이 취소 가능한 상태인지 확인
 * @param status 주문 상태
 * @returns 취소 가능 여부
 */
export function canCustomerCancel(status: OrderStatus): boolean {
  // 고객은 pending 상태에서만 즉시 취소 가능
  // confirmed 이후는 점주 승인 필요
  return status === 'pending'
}

/**
 * 점주가 취소 승인/거절 필요한 상태인지 확인
 * @param status 주문 상태
 * @returns 점주 승인 필요 여부
 */
export function requiresOwnerApproval(status: OrderStatus): boolean {
  const requiresApprovalStatuses: OrderStatus[] = [
    'confirmed',
    'preparing',
    'ready',
  ]
  return requiresApprovalStatuses.includes(status)
}

/**
 * 라이더가 배정된 상태인지 확인
 * @param status 주문 상태
 * @returns 라이더 배정 상태 여부
 */
export function hasRiderAssigned(status: OrderStatus): boolean {
  const riderAssignedStatuses: OrderStatus[] = [
    'picked_up',
    'delivering',
    'delivered',
  ]
  return riderAssignedStatuses.includes(status)
}

/**
 * 배달 요청이 필요한 상태인지 확인
 * @param status 주문 상태
 * @returns 배달 요청 필요 여부
 */
export function needsDeliveryRequest(status: OrderStatus): boolean {
  return status === 'ready'
}

// ============================================================================
// 상태별 다음 액션 정의
// ============================================================================

/**
 * 역할별 다음 액션 정보
 */
export interface NextAction {
  /** 액션 키 */
  action: string
  /** 액션 라벨 */
  label: string
  /** 버튼 스타일 */
  variant: 'primary' | 'secondary' | 'danger'
  /** 목표 상태 */
  targetStatus: OrderStatus | null
}

/**
 * 점주의 상태별 다음 액션
 */
export const OWNER_NEXT_ACTIONS: Record<OrderStatus, NextAction[]> = {
  pending: [
    { action: 'confirm', label: '주문 접수', variant: 'primary', targetStatus: 'confirmed' },
    { action: 'reject', label: '주문 거절', variant: 'danger', targetStatus: 'rejected' },
  ],
  confirmed: [
    { action: 'start_preparing', label: '조리 시작', variant: 'primary', targetStatus: 'preparing' },
  ],
  preparing: [
    { action: 'mark_ready', label: '조리 완료', variant: 'primary', targetStatus: 'ready' },
  ],
  ready: [
    // 라이더 배정 대기 중 - 점주는 별도 액션 없음
  ],
  rejected: [],
  picked_up: [],
  delivering: [],
  delivered: [],
  cancelled: [],
}

/**
 * 라이더의 상태별 다음 액션
 */
export const RIDER_NEXT_ACTIONS: Record<OrderStatus, NextAction[]> = {
  pending: [],
  confirmed: [],
  preparing: [],
  ready: [
    { action: 'pickup', label: '픽업 완료', variant: 'primary', targetStatus: 'picked_up' },
  ],
  rejected: [],
  picked_up: [
    { action: 'start_delivering', label: '배달 출발', variant: 'primary', targetStatus: 'delivering' },
  ],
  delivering: [
    { action: 'complete_delivery', label: '배달 완료', variant: 'primary', targetStatus: 'delivered' },
  ],
  delivered: [],
  cancelled: [],
}

// ============================================================================
// 상태 변경 이벤트 타입
// ============================================================================

/**
 * 상태 변경 이벤트
 */
export interface OrderStatusChangeEvent {
  orderId: string
  orderNumber: string
  previousStatus: OrderStatus
  newStatus: OrderStatus
  changedBy: OrderStatusChangeRole
  changedByUserId: string
  changedAt: string
  note: string | null
  metadata: {
    // confirmed
    estimatedPrepTime?: number
    // rejected
    rejectionReason?: string
    rejectionDetail?: string
    // ready
    preparedAt?: string
    // picked_up
    riderId?: string
    riderName?: string
    pickedUpAt?: string
    // delivered
    deliveredAt?: string
    // cancelled
    cancelledReason?: string
    cancelledBy?: string
  }
}

// ============================================================================
// 알림 트리거 맵
// ============================================================================

/**
 * 상태 변경 시 발송할 알림 대상
 */
export const STATUS_CHANGE_NOTIFICATION_TARGETS: Record<
  OrderStatus,
  Array<'customer' | 'owner' | 'rider'>
> = {
  pending: ['owner'], // 새 주문 → 점주에게 알림
  confirmed: ['customer'], // 접수 완료 → 고객에게 알림
  rejected: ['customer'], // 거절 → 고객에게 알림
  preparing: ['customer'], // 조리 시작 → 고객에게 알림
  ready: ['customer', 'rider'], // 조리 완료 → 고객, 라이더에게 알림
  picked_up: ['customer'], // 픽업 → 고객에게 알림
  delivering: ['customer'], // 배달 시작 → 고객에게 알림
  delivered: ['customer', 'owner'], // 배달 완료 → 고객, 점주에게 알림
  cancelled: ['customer', 'owner'], // 취소 → 고객, 점주에게 알림
}
