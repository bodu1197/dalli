/**
 * 알림 시스템 타입 정의
 * @description 프로덕션급 알림 시스템을 위한 모든 타입 정의
 */

// ============================================================================
// 기본 타입 (ENUM)
// ============================================================================

/**
 * 알림 타입
 * @description 모든 알림의 종류를 정의
 */
export type NotificationType =
  // 주문 관련
  | 'order_created'
  | 'order_confirmed'
  | 'order_preparing'
  | 'order_ready'
  | 'order_picked_up'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_rejected'
  | 'order_delivering'
  | 'order_reminder'
  | 'pickup_reminder'
  | 'delivery_eta_update'
  | 'rider_nearby'
  // 취소 관련
  | 'cancellation_requested_customer'
  | 'cancellation_requested_owner'
  | 'cancellation_instant_completed'
  | 'cancellation_approved'
  | 'cancellation_rejected'
  | 'cancellation_auto_approved'
  | 'cancellation_withdrawn'
  // 환불 관련
  | 'refund_processing'
  | 'refund_completed'
  | 'refund_failed'
  // 포인트/쿠폰
  | 'points_earned'
  | 'points_refunded'
  | 'coupon_restored'
  | 'coupon_expiring'
  // 프로모션
  | 'promotion_new'
  // 시스템
  | 'system_notice'
  | 'review_reminder'

/**
 * 알림 채널
 */
export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms'

/**
 * 발송 상태
 */
export type NotificationSendStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'delivered'
  | 'read'

/**
 * 디바이스 플랫폼
 */
export type DevicePlatform = 'ios' | 'android' | 'web'

/**
 * 알림 우선순위
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// ============================================================================
// 데이터 인터페이스
// ============================================================================

/**
 * 알림에 첨부되는 추가 데이터
 */
export interface NotificationData {
  /** 주문 ID */
  orderId?: string
  /** 취소 요청 ID */
  cancellationId?: string
  /** 식당 ID */
  restaurantId?: string
  /** 식당 이름 */
  restaurantName?: string
  /** 환불 금액 */
  refundAmount?: number
  /** 거절 사유 */
  rejectionReason?: string
  /** 딥링크 액션 */
  action?: string
  /** 기타 데이터 */
  [key: string]: unknown
}

/**
 * 알림 엔티티
 */
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: NotificationData
  isRead: boolean
  readAt: string | null
  priority: NotificationPriority
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * 알림 목록 아이템 (뷰용)
 */
export interface NotificationListItem {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: NotificationData
  isRead: boolean
  readAt: string | null
  priority: NotificationPriority
  createdAt: string
  /** 읽지 않은 시간 (분) */
  unreadMinutes: number | null
}

/**
 * 알림 설정
 */
export interface NotificationSettings {
  id: string
  userId: string
  /** 푸시 알림 활성화 */
  pushEnabled: boolean
  /** 이메일 알림 활성화 */
  emailEnabled: boolean
  /** SMS 알림 활성화 */
  smsEnabled: boolean
  /** 주문 관련 알림 */
  orderUpdates: boolean
  /** 취소 관련 알림 */
  cancellationUpdates: boolean
  /** 프로모션 알림 */
  promotionUpdates: boolean
  /** 리뷰 리마인더 */
  reviewReminders: boolean
  /** 방해 금지 시간 활성화 */
  quietHoursEnabled: boolean
  /** 방해 금지 시작 시간 (HH:MM) */
  quietHoursStart: string
  /** 방해 금지 종료 시간 (HH:MM) */
  quietHoursEnd: string
  createdAt: string
  updatedAt: string
}

/**
 * 푸시 토큰
 */
export interface PushToken {
  id: string
  userId: string
  token: string
  platform: DevicePlatform
  deviceId: string | null
  deviceName: string | null
  isActive: boolean
  lastUsedAt: string
  createdAt: string
  updatedAt: string
}

/**
 * 알림 발송 로그
 */
export interface NotificationLog {
  id: string
  notificationId: string
  channel: NotificationChannel
  status: NotificationSendStatus
  providerResponse: Record<string, unknown> | null
  errorMessage: string | null
  sentAt: string | null
  deliveredAt: string | null
  retryCount: number
  nextRetryAt: string | null
  createdAt: string
}

// ============================================================================
// 서비스 파라미터 타입
// ============================================================================

/**
 * 알림 생성 파라미터
 */
export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: NotificationData
  priority?: NotificationPriority
  expiresAt?: string
  /** 발송할 채널 목록 (기본: in_app만) */
  channels?: NotificationChannel[]
}

/**
 * 취소 알림 생성 파라미터
 */
export interface CreateCancellationNotificationParams {
  userId: string
  type: NotificationType
  orderId: string
  cancellationId: string
  restaurantName: string
  refundAmount?: number
  rejectionReason?: string
}

/**
 * 알림 목록 조회 파라미터
 */
export interface GetNotificationsParams {
  userId: string
  /** 읽지 않은 알림만 */
  unreadOnly?: boolean
  /** 알림 타입 필터 */
  types?: NotificationType[]
  /** 페이지 번호 (1부터 시작) */
  page?: number
  /** 페이지당 개수 */
  pageSize?: number
}

/**
 * 알림 설정 업데이트 파라미터
 */
export interface UpdateNotificationSettingsParams {
  userId: string
  pushEnabled?: boolean
  emailEnabled?: boolean
  smsEnabled?: boolean
  orderUpdates?: boolean
  cancellationUpdates?: boolean
  promotionUpdates?: boolean
  reviewReminders?: boolean
  quietHoursEnabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

/**
 * 푸시 토큰 등록 파라미터
 */
export interface RegisterPushTokenParams {
  userId: string
  token: string
  platform: DevicePlatform
  deviceId?: string
  deviceName?: string
}

// ============================================================================
// 서비스 결과 타입
// ============================================================================

/**
 * 알림 생성 결과
 */
export interface CreateNotificationResult {
  success: boolean
  notificationId: string | null
  message: string
  /** 채널별 발송 결과 */
  channelResults?: Record<
    NotificationChannel,
    {
      success: boolean
      error?: string
    }
  >
}

/**
 * 알림 목록 조회 결과
 */
export interface GetNotificationsResult {
  notifications: NotificationListItem[]
  totalCount: number
  unreadCount: number
  hasMore: boolean
}

/**
 * 알림 읽음 처리 결과
 */
export interface MarkAsReadResult {
  success: boolean
  message: string
}

/**
 * 알림 설정 조회 결과
 */
export interface GetNotificationSettingsResult {
  settings: NotificationSettings | null
  isDefault: boolean
}

/**
 * 알림 발송 가능 여부 확인 결과
 */
export interface CanSendNotificationResult {
  canSend: boolean
  reason?: string
}

// ============================================================================
// 푸시 알림 관련 타입 (FCM)
// ============================================================================

/**
 * FCM 푸시 페이로드
 */
export interface PushPayload {
  notification: {
    title: string
    body: string
    image?: string
  }
  data: Record<string, string>
  android?: {
    priority: 'high' | 'normal'
    notification?: {
      channelId: string
      icon?: string
      color?: string
      sound?: string
    }
  }
  apns?: {
    payload: {
      aps: {
        alert: {
          title: string
          body: string
        }
        sound?: string
        badge?: number
        'mutable-content'?: number
      }
    }
  }
  webpush?: {
    notification?: {
      icon?: string
      badge?: string
    }
  }
}

/**
 * 푸시 발송 결과
 */
export interface SendPushResult {
  success: boolean
  successCount: number
  failureCount: number
  responses: Array<{
    token: string
    success: boolean
    messageId?: string
    error?: string
  }>
}

// ============================================================================
// 알림 템플릿 관련 타입
// ============================================================================

/**
 * 알림 템플릿
 */
export interface NotificationTemplate {
  type: NotificationType
  title: string
  body: string
  /** 변수 목록 (예: {restaurantName}, {refundAmount}) */
  variables: string[]
  /** 기본 우선순위 */
  defaultPriority: NotificationPriority
  /** 기본 발송 채널 */
  defaultChannels: NotificationChannel[]
}

/**
 * 템플릿 변수 맵
 */
export interface TemplateVariables {
  restaurantName?: string
  customerName?: string
  orderNumber?: string
  refundAmount?: number
  rejectionReason?: string
  deadlineMinutes?: number
  pointsAmount?: number
  couponName?: string
  [key: string]: string | number | undefined
}

// ============================================================================
// DB 레코드 타입 (snake_case)
// ============================================================================

/**
 * notifications 테이블 레코드
 */
export interface NotificationRecord {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data: NotificationData
  is_read: boolean
  read_at: string | null
  priority: NotificationPriority
  expires_at: string | null
  created_at: string
  updated_at: string
}

/**
 * notification_settings 테이블 레코드
 */
export interface NotificationSettingsRecord {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  sms_enabled: boolean
  order_updates: boolean
  cancellation_updates: boolean
  promotion_updates: boolean
  review_reminders: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  created_at: string
  updated_at: string
}

/**
 * push_tokens 테이블 레코드
 */
export interface PushTokenRecord {
  id: string
  user_id: string
  token: string
  platform: DevicePlatform
  device_id: string | null
  device_name: string | null
  is_active: boolean
  last_used_at: string
  created_at: string
  updated_at: string
}

/**
 * notification_logs 테이블 레코드
 */
export interface NotificationLogRecord {
  id: string
  notification_id: string
  channel: NotificationChannel
  status: NotificationSendStatus
  provider_response: Record<string, unknown> | null
  error_message: string | null
  sent_at: string | null
  delivered_at: string | null
  retry_count: number
  next_retry_at: string | null
  created_at: string
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

/**
 * 알림 타입별 카테고리
 */
export type NotificationCategory =
  | 'order'
  | 'cancellation'
  | 'refund'
  | 'points'
  | 'promotion'
  | 'system'

/**
 * 알림 타입을 카테고리로 매핑
 */
export const NOTIFICATION_TYPE_CATEGORY: Record<
  NotificationType,
  NotificationCategory
> = {
  // 주문
  order_created: 'order',
  order_confirmed: 'order',
  order_preparing: 'order',
  order_ready: 'order',
  order_picked_up: 'order',
  order_delivered: 'order',
  order_cancelled: 'order',
  order_rejected: 'order',
  order_delivering: 'order',
  order_reminder: 'system',
  pickup_reminder: 'system',
  delivery_eta_update: 'order',
  rider_nearby: 'order',
  // 취소
  cancellation_requested_customer: 'cancellation',
  cancellation_requested_owner: 'cancellation',
  cancellation_instant_completed: 'cancellation',
  cancellation_approved: 'cancellation',
  cancellation_rejected: 'cancellation',
  cancellation_auto_approved: 'cancellation',
  cancellation_withdrawn: 'cancellation',
  // 환불
  refund_processing: 'refund',
  refund_completed: 'refund',
  refund_failed: 'refund',
  // 포인트/쿠폰
  points_earned: 'points',
  points_refunded: 'points',
  coupon_restored: 'points',
  coupon_expiring: 'promotion',
  // 프로모션
  promotion_new: 'promotion',
  // 시스템
  system_notice: 'system',
  review_reminder: 'system',
}

/**
 * 긴급 알림 타입 목록 (방해 금지 시간에도 발송)
 */
export const URGENT_NOTIFICATION_TYPES: NotificationType[] = [
  'cancellation_requested_owner',
  'refund_failed',
]

/**
 * 알림 아이콘 매핑
 */
export const NOTIFICATION_ICONS: Record<NotificationCategory, string> = {
  order: '🛵',
  cancellation: '❌',
  refund: '💰',
  points: '🎁',
  promotion: '🎉',
  system: '📢',
}

// ============================================================================
// Supabase Database 타입 (알림 시스템 전용)
// ============================================================================

/**
 * 알림 시스템 테이블 정의
 * @description Supabase 클라이언트에서 사용할 타입
 */
export interface NotificationDatabase {
  public: {
    Tables: {
      notifications: {
        Row: NotificationRecord
        Insert: Omit<NotificationRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<NotificationRecord>
      }
      notification_settings: {
        Row: NotificationSettingsRecord
        Insert: Omit<NotificationSettingsRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<NotificationSettingsRecord>
      }
      push_tokens: {
        Row: PushTokenRecord
        Insert: Omit<PushTokenRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<PushTokenRecord>
      }
      notification_logs: {
        Row: NotificationLogRecord
        Insert: Omit<NotificationLogRecord, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<NotificationLogRecord>
      }
    }
    Views: Record<string, never>
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string
          p_type: NotificationType
          p_title: string
          p_body: string
          p_data: NotificationData
          p_priority: NotificationPriority
          p_expires_at: string | null
        }
        Returns: string
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
        }
        Returns: boolean
      }
      mark_all_notifications_read: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_unread_notification_count: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      cleanup_expired_notifications: {
        Args: Record<string, never>
        Returns: number
      }
      cleanup_old_notifications: {
        Args: Record<string, never>
        Returns: number
      }
      init_notification_settings: {
        Args: {
          p_user_id: string
        }
        Returns: void
      }
      upsert_push_token: {
        Args: {
          p_user_id: string
          p_token: string
          p_platform: DevicePlatform
          p_device_id: string | null
          p_device_name: string | null
        }
        Returns: string
      }
    }
    Enums: {
      notification_type: NotificationType
      notification_channel: NotificationChannel
      notification_send_status: NotificationSendStatus
      device_platform: DevicePlatform
      notification_priority: NotificationPriority
    }
  }
}
