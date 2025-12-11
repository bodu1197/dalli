/**
 * 알림 설정 서비스
 * @description 사용자별 알림 설정 관리 (푸시, 이메일, SMS, 방해금지 등)
 */

import { createClient } from '@/lib/supabase/server'
import type {
  NotificationSettings,
  NotificationSettingsRecord,
  UpdateNotificationSettingsParams,
  GetNotificationSettingsResult,
} from '@/types/notification.types'

// ============================================================================
// 타입 변환 유틸리티
// ============================================================================

/**
 * DB 레코드를 도메인 모델로 변환
 */
function toNotificationSettings(record: NotificationSettingsRecord): NotificationSettings {
  return {
    id: record.id,
    userId: record.user_id,
    pushEnabled: record.push_enabled,
    emailEnabled: record.email_enabled,
    smsEnabled: record.sms_enabled,
    orderUpdates: record.order_updates,
    cancellationUpdates: record.cancellation_updates,
    promotionUpdates: record.promotion_updates,
    reviewReminders: record.review_reminders,
    quietHoursEnabled: record.quiet_hours_enabled,
    quietHoursStart: record.quiet_hours_start,
    quietHoursEnd: record.quiet_hours_end,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

// ============================================================================
// 기본값 정의
// ============================================================================

/**
 * 알림 설정 기본값
 */
const DEFAULT_SETTINGS: Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  orderUpdates: true,
  cancellationUpdates: true,
  promotionUpdates: true,
  reviewReminders: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
}

// ============================================================================
// 서비스 함수
// ============================================================================

/**
 * 사용자 알림 설정 조회
 *
 * @param userId 사용자 ID
 * @returns 알림 설정 또는 기본값
 */
export async function getNotificationSettings(
  userId: string
): Promise<GetNotificationSettingsResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // 설정이 없는 경우 기본값 반환
    if (error.code === 'PGRST116') {
      return {
        settings: null,
        isDefault: true,
      }
    }
    throw new Error(`알림 설정 조회 실패: ${error.message}`)
  }

  return {
    settings: toNotificationSettings(data as NotificationSettingsRecord),
    isDefault: false,
  }
}

/**
 * 사용자 알림 설정 초기화 (없으면 생성)
 *
 * @param userId 사용자 ID
 * @returns 생성/조회된 알림 설정
 */
export async function initNotificationSettings(userId: string): Promise<NotificationSettings> {
  const supabase = await createClient()

  // DB 함수 호출로 초기화 (upsert)
  const { error } = await supabase.rpc('init_notification_settings', {
    p_user_id: userId,
  })

  if (error) {
    throw new Error(`알림 설정 초기화 실패: ${error.message}`)
  }

  // 초기화 후 설정 조회
  const result = await getNotificationSettings(userId)

  if (!result.settings) {
    throw new Error('알림 설정 초기화 후 조회 실패')
  }

  return result.settings
}

/**
 * 사용자 알림 설정 업데이트
 *
 * @param params 업데이트 파라미터
 * @returns 업데이트된 알림 설정
 */
export async function updateNotificationSettings(
  params: UpdateNotificationSettingsParams
): Promise<NotificationSettings> {
  const { userId, ...updateFields } = params
  const supabase = await createClient()

  // snake_case로 변환
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updateFields.pushEnabled !== undefined) {
    updateData.push_enabled = updateFields.pushEnabled
  }
  if (updateFields.emailEnabled !== undefined) {
    updateData.email_enabled = updateFields.emailEnabled
  }
  if (updateFields.smsEnabled !== undefined) {
    updateData.sms_enabled = updateFields.smsEnabled
  }
  if (updateFields.orderUpdates !== undefined) {
    updateData.order_updates = updateFields.orderUpdates
  }
  if (updateFields.cancellationUpdates !== undefined) {
    updateData.cancellation_updates = updateFields.cancellationUpdates
  }
  if (updateFields.promotionUpdates !== undefined) {
    updateData.promotion_updates = updateFields.promotionUpdates
  }
  if (updateFields.reviewReminders !== undefined) {
    updateData.review_reminders = updateFields.reviewReminders
  }
  if (updateFields.quietHoursEnabled !== undefined) {
    updateData.quiet_hours_enabled = updateFields.quietHoursEnabled
  }
  if (updateFields.quietHoursStart !== undefined) {
    updateData.quiet_hours_start = updateFields.quietHoursStart
  }
  if (updateFields.quietHoursEnd !== undefined) {
    updateData.quiet_hours_end = updateFields.quietHoursEnd
  }

  // 먼저 설정이 존재하는지 확인
  const existing = await getNotificationSettings(userId)

  if (!existing.settings) {
    // 설정이 없으면 초기화 후 업데이트
    await initNotificationSettings(userId)
  }

  const { data, error } = await supabase
    .from('notification_settings')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`알림 설정 업데이트 실패: ${error.message}`)
  }

  return toNotificationSettings(data as NotificationSettingsRecord)
}

/**
 * 방해 금지 시간 설정
 *
 * @param userId 사용자 ID
 * @param enabled 활성화 여부
 * @param startTime 시작 시간 (HH:MM)
 * @param endTime 종료 시간 (HH:MM)
 * @returns 업데이트된 알림 설정
 */
export async function setQuietHours(
  userId: string,
  enabled: boolean,
  startTime?: string,
  endTime?: string
): Promise<NotificationSettings> {
  const params: UpdateNotificationSettingsParams = {
    userId,
    quietHoursEnabled: enabled,
  }

  if (startTime) {
    // 시간 형식 검증 (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      throw new Error('시작 시간 형식이 올바르지 않습니다 (HH:MM)')
    }
    params.quietHoursStart = startTime
  }

  if (endTime) {
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      throw new Error('종료 시간 형식이 올바르지 않습니다 (HH:MM)')
    }
    params.quietHoursEnd = endTime
  }

  return updateNotificationSettings(params)
}

/**
 * 현재 방해 금지 시간인지 확인
 *
 * @param userId 사용자 ID
 * @returns 방해 금지 시간 여부
 */
export async function isQuietHours(userId: string): Promise<boolean> {
  const result = await getNotificationSettings(userId)

  // 설정이 없거나 방해 금지 비활성화 시 false
  if (!result.settings || !result.settings.quietHoursEnabled) {
    return false
  }

  const { quietHoursStart, quietHoursEnd } = result.settings
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // 시간 비교 (자정 넘어가는 케이스 처리)
  if (quietHoursStart <= quietHoursEnd) {
    // 예: 09:00 ~ 18:00 (같은 날)
    return currentTime >= quietHoursStart && currentTime < quietHoursEnd
  } else {
    // 예: 22:00 ~ 08:00 (자정 넘어감)
    return currentTime >= quietHoursStart || currentTime < quietHoursEnd
  }
}

/**
 * 알림 발송 가능 여부 확인
 *
 * @param userId 사용자 ID
 * @param channel 알림 채널 ('push' | 'email' | 'sms')
 * @param category 알림 카테고리 ('order' | 'cancellation' | 'promotion' | 'review')
 * @returns 발송 가능 여부 및 사유
 */
export async function canSendNotification(
  userId: string,
  channel: 'push' | 'email' | 'sms',
  category: 'order' | 'cancellation' | 'promotion' | 'review'
): Promise<{ canSend: boolean; reason?: string }> {
  const result = await getNotificationSettings(userId)

  // 설정이 없으면 기본값으로 발송 허용
  if (!result.settings) {
    return { canSend: true }
  }

  const settings = result.settings

  // 1. 채널별 활성화 확인
  if (channel === 'push' && !settings.pushEnabled) {
    return { canSend: false, reason: '푸시 알림이 비활성화되어 있습니다' }
  }
  if (channel === 'email' && !settings.emailEnabled) {
    return { canSend: false, reason: '이메일 알림이 비활성화되어 있습니다' }
  }
  if (channel === 'sms' && !settings.smsEnabled) {
    return { canSend: false, reason: 'SMS 알림이 비활성화되어 있습니다' }
  }

  // 2. 카테고리별 활성화 확인
  if (category === 'order' && !settings.orderUpdates) {
    return { canSend: false, reason: '주문 알림이 비활성화되어 있습니다' }
  }
  if (category === 'cancellation' && !settings.cancellationUpdates) {
    return { canSend: false, reason: '취소 알림이 비활성화되어 있습니다' }
  }
  if (category === 'promotion' && !settings.promotionUpdates) {
    return { canSend: false, reason: '프로모션 알림이 비활성화되어 있습니다' }
  }
  if (category === 'review' && !settings.reviewReminders) {
    return { canSend: false, reason: '리뷰 알림이 비활성화되어 있습니다' }
  }

  // 3. 방해 금지 시간 확인 (긴급 알림은 예외)
  // 주문/취소는 긴급이므로 방해 금지 무시
  if (category !== 'order' && category !== 'cancellation') {
    const quiet = await isQuietHours(userId)
    if (quiet) {
      return { canSend: false, reason: '방해 금지 시간입니다' }
    }
  }

  return { canSend: true }
}

/**
 * 채널별 알림 토글
 *
 * @param userId 사용자 ID
 * @param channel 알림 채널
 * @param enabled 활성화 여부
 * @returns 업데이트된 알림 설정
 */
export async function toggleChannelNotification(
  userId: string,
  channel: 'push' | 'email' | 'sms',
  enabled: boolean
): Promise<NotificationSettings> {
  const params: UpdateNotificationSettingsParams = { userId }

  switch (channel) {
    case 'push':
      params.pushEnabled = enabled
      break
    case 'email':
      params.emailEnabled = enabled
      break
    case 'sms':
      params.smsEnabled = enabled
      break
  }

  return updateNotificationSettings(params)
}

/**
 * 카테고리별 알림 토글
 *
 * @param userId 사용자 ID
 * @param category 알림 카테고리
 * @param enabled 활성화 여부
 * @returns 업데이트된 알림 설정
 */
export async function toggleCategoryNotification(
  userId: string,
  category: 'order' | 'cancellation' | 'promotion' | 'review',
  enabled: boolean
): Promise<NotificationSettings> {
  const params: UpdateNotificationSettingsParams = { userId }

  switch (category) {
    case 'order':
      params.orderUpdates = enabled
      break
    case 'cancellation':
      params.cancellationUpdates = enabled
      break
    case 'promotion':
      params.promotionUpdates = enabled
      break
    case 'review':
      params.reviewReminders = enabled
      break
  }

  return updateNotificationSettings(params)
}

/**
 * 모든 알림 비활성화
 *
 * @param userId 사용자 ID
 * @returns 업데이트된 알림 설정
 */
export async function disableAllNotifications(userId: string): Promise<NotificationSettings> {
  return updateNotificationSettings({
    userId,
    pushEnabled: false,
    emailEnabled: false,
    smsEnabled: false,
  })
}

/**
 * 알림 설정을 기본값으로 초기화
 *
 * @param userId 사용자 ID
 * @returns 초기화된 알림 설정
 */
export async function resetNotificationSettings(userId: string): Promise<NotificationSettings> {
  return updateNotificationSettings({
    userId,
    ...DEFAULT_SETTINGS,
  })
}

/**
 * 알림 설정 기본값 조회
 *
 * @returns 기본 알림 설정 값
 */
export function getDefaultSettings(): typeof DEFAULT_SETTINGS {
  return { ...DEFAULT_SETTINGS }
}
