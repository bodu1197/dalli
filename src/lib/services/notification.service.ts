/**
 * 핵심 알림 서비스
 * @description 알림 CRUD, 읽음 처리, 목록 조회 등 핵심 알림 기능
 */

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'
import type {
  Notification,
  NotificationRecord,
  NotificationListItem,
  NotificationType,
  NotificationPriority,
  NotificationData,
  CreateNotificationParams,
  GetNotificationsParams,
  GetNotificationsResult,
  CreateNotificationResult,
  MarkAsReadResult,
} from '@/types/notification.types'
import { getTemplate, renderTemplate } from './notification-template.service'

// ============================================================================
// 타입 변환 유틸리티
// ============================================================================

/**
 * DB 레코드를 도메인 모델로 변환
 */
function toNotification(record: NotificationRecord): Notification {
  return {
    id: record.id,
    userId: record.user_id,
    type: record.type,
    title: record.title,
    body: record.body,
    data: record.data,
    isRead: record.is_read,
    readAt: record.read_at,
    priority: record.priority,
    expiresAt: record.expires_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

/**
 * DB 레코드를 목록 아이템으로 변환
 */
function toNotificationListItem(record: NotificationRecord): NotificationListItem {
  const now = new Date()
  const createdAt = new Date(record.created_at)
  const unreadMinutes = record.is_read
    ? null
    : Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))

  return {
    id: record.id,
    userId: record.user_id,
    type: record.type,
    title: record.title,
    body: record.body,
    data: record.data,
    isRead: record.is_read,
    readAt: record.read_at,
    priority: record.priority,
    createdAt: record.created_at,
    unreadMinutes,
  }
}

// ============================================================================
// 알림 생성
// ============================================================================

/**
 * 알림 생성
 *
 * @param params 알림 생성 파라미터
 * @returns 생성 결과
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<CreateNotificationResult> {
  const { userId, type, title, body, data, priority, expiresAt } = params
  const supabase = await createClient()

  try {
    // DB 함수로 알림 생성
    const { data: result, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_body: body,
      p_data: (data ?? {}) as Json,
      p_priority: priority ?? 'normal',
      p_expires_at: expiresAt,
    })

    if (error) {
      return {
        success: false,
        notificationId: null,
        message: `알림 생성 실패: ${error.message}`,
      }
    }

    return {
      success: true,
      notificationId: result,
      message: '알림이 생성되었습니다',
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류'
    return {
      success: false,
      notificationId: null,
      message: `알림 생성 실패: ${errorMessage}`,
    }
  }
}

/**
 * 템플릿 기반 알림 생성
 *
 * @param userId 사용자 ID
 * @param type 알림 타입
 * @param variables 템플릿 변수
 * @param data 추가 데이터
 * @returns 생성 결과
 */
export async function createNotificationFromTemplate(
  userId: string,
  type: NotificationType,
  variables: Record<string, string | number | undefined>,
  data?: NotificationData
): Promise<CreateNotificationResult> {
  const template = getTemplate(type)

  const title = renderTemplate(template.title, variables)
  const body = renderTemplate(template.body, variables)

  return createNotification({
    userId,
    type,
    title,
    body,
    data,
    priority: template.defaultPriority,
  })
}

// ============================================================================
// 알림 조회
// ============================================================================

/**
 * 알림 단건 조회
 *
 * @param notificationId 알림 ID
 * @returns 알림 또는 null
 */
export async function getNotification(notificationId: string): Promise<Notification | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notificationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`알림 조회 실패: ${error.message}`)
  }

  return toNotification(data as NotificationRecord)
}

/**
 * 사용자 알림 목록 조회
 *
 * @param params 조회 파라미터
 * @returns 알림 목록 및 메타데이터
 */
export async function getNotifications(
  params: GetNotificationsParams
): Promise<GetNotificationsResult> {
  const { userId, unreadOnly, types, page = 1, pageSize = 20 } = params
  const supabase = await createClient()

  // 기본 쿼리
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // 읽지 않은 알림만
  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  // 타입 필터
  if (types && types.length > 0) {
    query = query.in('type', types)
  }

  // 만료되지 않은 알림만 (expires_at이 null이거나 미래)
  query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  // 페이지네이션
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`알림 목록 조회 실패: ${error.message}`)
  }

  const notifications = (data as NotificationRecord[]).map(toNotificationListItem)
  const totalCount = count ?? 0

  // 읽지 않은 알림 수 조회
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  return {
    notifications,
    totalCount,
    unreadCount: unreadCount ?? 0,
    hasMore: from + notifications.length < totalCount,
  }
}

/**
 * 읽지 않은 알림 수 조회
 *
 * @param userId 사용자 ID
 * @returns 읽지 않은 알림 수
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_unread_notification_count', {
    p_user_id: userId,
  })

  if (error) {
    throw new Error(`읽지 않은 알림 수 조회 실패: ${error.message}`)
  }

  return data ?? 0
}

/**
 * 최근 알림 조회
 *
 * @param userId 사용자 ID
 * @param limit 조회 개수
 * @returns 최근 알림 목록
 */
export async function getRecentNotifications(
  userId: string,
  limit: number = 5
): Promise<NotificationListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`최근 알림 조회 실패: ${error.message}`)
  }

  return (data as NotificationRecord[]).map(toNotificationListItem)
}

// ============================================================================
// 알림 읽음 처리
// ============================================================================

/**
 * 알림 읽음 처리
 *
 * @param notificationId 알림 ID
 * @returns 처리 결과
 */
export async function markAsRead(notificationId: string): Promise<MarkAsReadResult> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
  })

  if (error) {
    return {
      success: false,
      message: `읽음 처리 실패: ${error.message}`,
    }
  }

  return {
    success: true,
    message: '알림을 읽음 처리했습니다',
  }
}

/**
 * 여러 알림 읽음 처리
 *
 * @param notificationIds 알림 ID 배열
 * @returns 처리 결과
 */
export async function markMultipleAsRead(notificationIds: string[]): Promise<MarkAsReadResult> {
  if (notificationIds.length === 0) {
    return { success: true, message: '처리할 알림이 없습니다' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('id', notificationIds)

  if (error) {
    return {
      success: false,
      message: `읽음 처리 실패: ${error.message}`,
    }
  }

  return {
    success: true,
    message: `${notificationIds.length}개 알림을 읽음 처리했습니다`,
  }
}

/**
 * 모든 알림 읽음 처리
 *
 * @param userId 사용자 ID
 * @returns 처리 결과
 */
export async function markAllAsRead(userId: string): Promise<MarkAsReadResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('mark_all_notifications_read', {
    p_user_id: userId,
  })

  if (error) {
    return {
      success: false,
      message: `읽음 처리 실패: ${error.message}`,
    }
  }

  return {
    success: true,
    message: `${data}개 알림을 읽음 처리했습니다`,
  }
}

// ============================================================================
// 알림 삭제
// ============================================================================

/**
 * 알림 삭제
 *
 * @param notificationId 알림 ID
 * @returns 성공 여부
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('notifications').delete().eq('id', notificationId)

  if (error) {
    throw new Error(`알림 삭제 실패: ${error.message}`)
  }

  return true
}

/**
 * 여러 알림 삭제
 *
 * @param notificationIds 알림 ID 배열
 * @returns 삭제된 개수
 */
export async function deleteMultipleNotifications(notificationIds: string[]): Promise<number> {
  if (notificationIds.length === 0) return 0

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .in('id', notificationIds)
    .select('id')

  if (error) {
    throw new Error(`알림 삭제 실패: ${error.message}`)
  }

  return data?.length ?? 0
}

/**
 * 읽은 알림 모두 삭제
 *
 * @param userId 사용자 ID
 * @returns 삭제된 개수
 */
export async function deleteReadNotifications(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true)
    .select('id')

  if (error) {
    throw new Error(`알림 삭제 실패: ${error.message}`)
  }

  return data?.length ?? 0
}

/**
 * 만료된 알림 정리
 *
 * @returns 삭제된 개수
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('cleanup_expired_notifications')

  if (error) {
    throw new Error(`만료 알림 정리 실패: ${error.message}`)
  }

  return data ?? 0
}

/**
 * 오래된 알림 정리 (90일 이상)
 *
 * @returns 삭제된 개수
 */
export async function cleanupOldNotifications(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('cleanup_old_notifications')

  if (error) {
    throw new Error(`오래된 알림 정리 실패: ${error.message}`)
  }

  return data ?? 0
}

// ============================================================================
// 타입별 알림 조회
// ============================================================================

/**
 * 타입별 알림 조회
 *
 * @param userId 사용자 ID
 * @param type 알림 타입
 * @param limit 조회 개수
 * @returns 알림 목록
 */
export async function getNotificationsByType(
  userId: string,
  type: NotificationType,
  limit: number = 20
): Promise<NotificationListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`알림 조회 실패: ${error.message}`)
  }

  return (data as NotificationRecord[]).map(toNotificationListItem)
}

/**
 * 우선순위별 알림 조회
 *
 * @param userId 사용자 ID
 * @param priority 우선순위
 * @param limit 조회 개수
 * @returns 알림 목록
 */
export async function getNotificationsByPriority(
  userId: string,
  priority: NotificationPriority,
  limit: number = 20
): Promise<NotificationListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('priority', priority)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`알림 조회 실패: ${error.message}`)
  }

  return (data as NotificationRecord[]).map(toNotificationListItem)
}

/**
 * 긴급 알림 조회 (미읽음)
 *
 * @param userId 사용자 ID
 * @returns 긴급 알림 목록
 */
export async function getUrgentNotifications(userId: string): Promise<NotificationListItem[]> {
  return getNotificationsByPriority(userId, 'urgent', 10)
}

// ============================================================================
// 알림 통계
// ============================================================================

/**
 * 알림 통계 조회
 *
 * @param userId 사용자 ID
 * @returns 알림 통계
 */
export async function getNotificationStats(userId: string): Promise<{
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}> {
  const supabase = await createClient()

  // 전체 및 미읽음 수
  const { count: total } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: unread } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  // 타입별 통계
  const { data: typeData } = await supabase
    .from('notifications')
    .select('type')
    .eq('user_id', userId)

  const byType: Record<string, number> = {}
  for (const row of typeData ?? []) {
    byType[row.type] = (byType[row.type] ?? 0) + 1
  }

  // 우선순위별 통계
  const { data: priorityData } = await supabase
    .from('notifications')
    .select('priority')
    .eq('user_id', userId)
    .eq('is_read', false)

  const byPriority: Record<string, number> = {}
  for (const row of priorityData ?? []) {
    byPriority[row.priority] = (byPriority[row.priority] ?? 0) + 1
  }

  return {
    total: total ?? 0,
    unread: unread ?? 0,
    byType: byType as Record<NotificationType, number>,
    byPriority: byPriority as Record<NotificationPriority, number>,
  }
}
