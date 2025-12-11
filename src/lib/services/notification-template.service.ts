/**
 * 알림 템플릿 서비스
 * @description 알림 타입별 템플릿 관리 및 메시지 생성
 */

import type {
  NotificationType,
  NotificationTemplate,
  NotificationPriority,
  NotificationChannel,
  TemplateVariables,
} from '@/types/notification.types'

// ============================================================================
// 알림 템플릿 정의
// ============================================================================

/**
 * 모든 알림 타입별 템플릿 정의
 */
const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  // ========================================
  // 주문 관련 알림
  // ========================================
  order_created: {
    type: 'order_created',
    title: '주문이 접수되었습니다',
    body: '{restaurantName}에 주문이 접수되었습니다. 가게에서 확인 중입니다.',
    variables: ['restaurantName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  order_confirmed: {
    type: 'order_confirmed',
    title: '주문이 확인되었습니다',
    body: '{restaurantName}에서 주문을 확인했습니다. 조리를 시작합니다.',
    variables: ['restaurantName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  order_preparing: {
    type: 'order_preparing',
    title: '조리가 시작되었습니다',
    body: '{restaurantName}에서 음식 조리를 시작했습니다.',
    variables: ['restaurantName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  order_ready: {
    type: 'order_ready',
    title: '조리가 완료되었습니다',
    body: '{restaurantName}에서 음식 조리가 완료되었습니다. 라이더가 픽업을 준비 중입니다.',
    variables: ['restaurantName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  order_picked_up: {
    type: 'order_picked_up',
    title: '라이더가 음식을 픽업했습니다',
    body: '라이더가 {restaurantName}에서 음식을 픽업했습니다. 배달이 시작됩니다.',
    variables: ['restaurantName'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  order_delivered: {
    type: 'order_delivered',
    title: '배달이 완료되었습니다',
    body: '{restaurantName} 주문이 배달 완료되었습니다. 맛있게 드세요! 🍽️',
    variables: ['restaurantName'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  order_cancelled: {
    type: 'order_cancelled',
    title: '주문이 취소되었습니다',
    body: '{restaurantName} 주문이 취소되었습니다.',
    variables: ['restaurantName'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  order_rejected: {
    type: 'order_rejected',
    title: '주문이 거절되었습니다',
    body: '{restaurantName}에서 주문을 거절했습니다. (사유: {rejectionReason})',
    variables: ['restaurantName', 'rejectionReason'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  order_delivering: {
    type: 'order_delivering',
    title: '배달이 시작되었습니다',
    body: '라이더가 {restaurantName}에서 음식을 픽업하여 배달을 시작했습니다.',
    variables: ['restaurantName'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  order_reminder: {
    type: 'order_reminder',
    title: '신규 주문 알림',
    body: '{orderNumber} 신규 주문이 있습니다. 5분 내로 접수해주세요.',
    variables: ['orderNumber'],
    defaultPriority: 'urgent',
    defaultChannels: ['in_app', 'push'],
  },
  pickup_reminder: {
    type: 'pickup_reminder',
    title: '픽업 대기 알림',
    body: '{orderNumber} 조리가 완료되었습니다. 픽업해주세요.',
    variables: ['orderNumber'],
    defaultPriority: 'urgent',
    defaultChannels: ['in_app', 'push'],
  },
  delivery_eta_update: {
    type: 'delivery_eta_update',
    title: '배달 예상 시간 변경',
    body: '배달 예상 시간이 {estimatedDeliveryTime}으로 변경되었습니다.',
    variables: ['estimatedDeliveryTime'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  rider_nearby: {
    type: 'rider_nearby',
    title: '라이더가 곧 도착합니다',
    body: '라이더가 도착지 근처에 있습니다. ({remainingMinutes}분 전)',
    variables: ['remainingMinutes'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },

  // ========================================
  // 취소 관련 알림
  // ========================================
  cancellation_requested_customer: {
    type: 'cancellation_requested_customer',
    title: '취소 요청이 접수되었습니다',
    body: '{restaurantName} 주문 취소 요청이 접수되었습니다. 점주님 승인 후 환불이 진행됩니다.',
    variables: ['restaurantName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  cancellation_requested_owner: {
    type: 'cancellation_requested_owner',
    title: '🔔 취소 요청이 도착했습니다',
    body: '{customerName}님이 주문 취소를 요청했습니다. {deadlineMinutes}분 내 응답이 필요합니다.',
    variables: ['customerName', 'deadlineMinutes'],
    defaultPriority: 'urgent',
    defaultChannels: ['in_app', 'push'],
  },
  cancellation_instant_completed: {
    type: 'cancellation_instant_completed',
    title: '주문이 취소되었습니다',
    body: '{restaurantName} 주문이 취소되었습니다. {refundAmount}원이 환불 처리됩니다.',
    variables: ['restaurantName', 'refundAmount'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  cancellation_approved: {
    type: 'cancellation_approved',
    title: '취소가 승인되었습니다',
    body: '{restaurantName} 주문 취소가 승인되었습니다. {refundAmount}원이 환불 처리됩니다.',
    variables: ['restaurantName', 'refundAmount'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  cancellation_rejected: {
    type: 'cancellation_rejected',
    title: '취소가 거절되었습니다',
    body: '{restaurantName}에서 취소 요청을 거절했습니다. 사유: {rejectionReason}',
    variables: ['restaurantName', 'rejectionReason'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  cancellation_auto_approved: {
    type: 'cancellation_auto_approved',
    title: '취소가 자동 승인되었습니다',
    body: '미응답으로 취소가 자동 승인 처리되었습니다. {refundAmount}원이 환불 처리됩니다.',
    variables: ['refundAmount'],
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'push'],
  },
  cancellation_withdrawn: {
    type: 'cancellation_withdrawn',
    title: '취소 요청이 철회되었습니다',
    body: '고객님이 취소 요청을 철회했습니다. 주문이 계속 진행됩니다.',
    variables: [],
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
  },

  // ========================================
  // 환불 관련 알림
  // ========================================
  refund_processing: {
    type: 'refund_processing',
    title: '환불이 진행 중입니다',
    body: '{refundAmount}원 환불이 진행 중입니다. 잠시만 기다려주세요.',
    variables: ['refundAmount'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
  },
  refund_completed: {
    type: 'refund_completed',
    title: '환불이 완료되었습니다',
    body: '{refundAmount}원이 환불되었습니다. 카드사에 따라 2-3일 소요될 수 있습니다.',
    variables: ['refundAmount'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },
  refund_failed: {
    type: 'refund_failed',
    title: '환불 처리 중 문제가 발생했습니다',
    body: '환불 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.',
    variables: [],
    defaultPriority: 'urgent',
    defaultChannels: ['in_app', 'push'],
  },

  // ========================================
  // 포인트/쿠폰 관련 알림
  // ========================================
  points_earned: {
    type: 'points_earned',
    title: '포인트가 적립되었습니다',
    body: '{pointsAmount}P가 적립되었습니다. 다음 주문 시 사용해보세요!',
    variables: ['pointsAmount'],
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
  },
  points_refunded: {
    type: 'points_refunded',
    title: '포인트가 복구되었습니다',
    body: '주문 취소로 사용하신 {pointsAmount}P가 복구되었습니다.',
    variables: ['pointsAmount'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
  },
  coupon_restored: {
    type: 'coupon_restored',
    title: '쿠폰이 복구되었습니다',
    body: '주문 취소로 사용하신 쿠폰({couponName})이 복구되었습니다.',
    variables: ['couponName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
  },
  coupon_expiring: {
    type: 'coupon_expiring',
    title: '쿠폰이 곧 만료됩니다',
    body: '{couponName} 쿠폰이 곧 만료됩니다. 서둘러 사용해보세요!',
    variables: ['couponName'],
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'push'],
  },

  // ========================================
  // 프로모션 알림
  // ========================================
  promotion_new: {
    type: 'promotion_new',
    title: '새로운 이벤트가 시작되었습니다! 🎉',
    body: '지금 바로 확인하고 혜택을 받아보세요.',
    variables: [],
    defaultPriority: 'low',
    defaultChannels: ['in_app', 'push'],
  },

  // ========================================
  // 시스템 알림
  // ========================================
  system_notice: {
    type: 'system_notice',
    title: '공지사항',
    body: '새로운 공지사항이 있습니다.',
    variables: [],
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
  },
  review_reminder: {
    type: 'review_reminder',
    title: '리뷰를 남겨주세요 ⭐',
    body: '{restaurantName} 주문은 어떠셨나요? 리뷰를 남기면 포인트를 드려요!',
    variables: ['restaurantName'],
    defaultPriority: 'low',
    defaultChannels: ['in_app', 'push'],
  },
}

// ============================================================================
// 템플릿 서비스 함수
// ============================================================================

/**
 * 알림 타입에 해당하는 템플릿 조회
 *
 * @param type 알림 타입
 * @returns 알림 템플릿
 */
export function getTemplate(type: NotificationType): NotificationTemplate {
  return NOTIFICATION_TEMPLATES[type]
}

/**
 * 모든 템플릿 조회
 *
 * @returns 모든 알림 템플릿
 */
export function getAllTemplates(): NotificationTemplate[] {
  return Object.values(NOTIFICATION_TEMPLATES)
}

/**
 * 템플릿 변수 치환하여 메시지 생성
 *
 * @param template 텍스트 템플릿 (예: "{restaurantName}에서 주문")
 * @param variables 변수 맵
 * @returns 치환된 텍스트
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      const placeholder = `{${key}}`
      const displayValue =
        typeof value === 'number' ? value.toLocaleString() : String(value)
      result = result.replaceAll(placeholder, displayValue)
    }
  }

  // 치환되지 않은 변수는 빈 문자열로 대체
  result = result.replaceAll(/\{[^}]+\}/g, '')

  return result.trim()
}

/**
 * 알림 메시지 생성 (제목 + 본문)
 *
 * @param type 알림 타입
 * @param variables 변수 맵
 * @returns 제목과 본문
 */
export function renderNotificationMessage(
  type: NotificationType,
  variables: TemplateVariables
): { title: string; body: string } {
  const template = getTemplate(type)

  return {
    title: renderTemplate(template.title, variables),
    body: renderTemplate(template.body, variables),
  }
}

/**
 * 템플릿 데이터 유효성 검증
 *
 * @param type 알림 타입
 * @param variables 변수 맵
 * @returns 유효성 검증 결과
 */
export function validateTemplateData(
  type: NotificationType,
  variables: TemplateVariables
): { valid: boolean; missingVariables: string[] } {
  const template = getTemplate(type)
  const missingVariables: string[] = []

  for (const variable of template.variables) {
    if (variables[variable] === undefined || variables[variable] === null) {
      missingVariables.push(variable)
    }
  }

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  }
}

/**
 * 알림 타입의 기본 우선순위 조회
 *
 * @param type 알림 타입
 * @returns 우선순위
 */
export function getDefaultPriority(type: NotificationType): NotificationPriority {
  return getTemplate(type).defaultPriority
}

/**
 * 알림 타입의 기본 발송 채널 조회
 *
 * @param type 알림 타입
 * @returns 발송 채널 목록
 */
export function getDefaultChannels(type: NotificationType): NotificationChannel[] {
  return getTemplate(type).defaultChannels
}

/**
 * 취소 알림용 메시지 생성 헬퍼
 *
 * @param type 취소 알림 타입
 * @param params 파라미터
 * @returns 제목과 본문
 */
export function renderCancellationMessage(
  type: NotificationType,
  params: {
    restaurantName?: string
    customerName?: string
    refundAmount?: number
    rejectionReason?: string
    deadlineMinutes?: number
  }
): { title: string; body: string } {
  const variables: TemplateVariables = {
    restaurantName: params.restaurantName,
    customerName: params.customerName,
    refundAmount: params.refundAmount,
    rejectionReason: params.rejectionReason ?? '거절 사유 없음',
    deadlineMinutes: params.deadlineMinutes ?? 30,
  }

  return renderNotificationMessage(type, variables)
}

/**
 * 환불 알림용 메시지 생성 헬퍼
 *
 * @param type 환불 알림 타입
 * @param refundAmount 환불 금액
 * @returns 제목과 본문
 */
export function renderRefundMessage(
  type: 'refund_processing' | 'refund_completed' | 'refund_failed',
  refundAmount?: number
): { title: string; body: string } {
  return renderNotificationMessage(type, { refundAmount })
}

/**
 * 포인트/쿠폰 알림용 메시지 생성 헬퍼
 *
 * @param type 포인트/쿠폰 알림 타입
 * @param params 파라미터
 * @returns 제목과 본문
 */
export function renderPointsCouponMessage(
  type: 'points_earned' | 'points_refunded' | 'coupon_restored' | 'coupon_expiring',
  params: {
    pointsAmount?: number
    couponName?: string
  }
): { title: string; body: string } {
  return renderNotificationMessage(type, params)
}
