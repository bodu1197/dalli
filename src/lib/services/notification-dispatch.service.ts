/**
 * 알림 발송 서비스
 * @description 멀티 채널 알림 발송 (인앱, 푸시, 이메일, SMS)
 */

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  NotificationType,
  NotificationChannel,
  NotificationData,
  NotificationPriority,
  PushPayload,
  SendPushResult,
  NotificationLogRecord,
  NotificationDatabase,
} from '@/types/notification.types'

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 알림 시스템 전용 Supabase 클라이언트 타입
 */
type NotificationSupabaseClient = SupabaseClient<NotificationDatabase>

import {
  getTemplate,
  renderTemplate,
  getDefaultChannels,
  getDefaultPriority,
} from './notification-template.service'
import { canSendNotification } from './notification-settings.service'
import { getActiveTokens, updateTokensLastUsed } from './push-token.service'
import { createNotification } from './notification.service'
import { URGENT_NOTIFICATION_TYPES } from '@/types/notification.types'

// ============================================================================
// 상수 정의
// ============================================================================

/**
 * FCM API 엔드포인트 (v1 API)
 * 실제 운영 환경에서는 Firebase Admin SDK 사용 권장
 */
const FCM_API_URL = 'https://fcm.googleapis.com/v1/projects/{project_id}/messages:send'

/**
 * 푸시 알림 재시도 설정
 */
const PUSH_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1000,
}

// ============================================================================
// 발송 로그 기록
// ============================================================================

/**
 * 알림 발송 로그 기록
 */
async function logNotificationSend(
  notificationId: string,
  channel: NotificationChannel,
  status: 'pending' | 'sent' | 'failed' | 'delivered',
  providerResponse?: Record<string, unknown>,
  errorMessage?: string
): Promise<void> {
  const supabase = (await createClient()) as unknown as NotificationSupabaseClient

  await supabase.from('notification_logs').insert({
    notification_id: notificationId,
    channel,
    status,
    provider_response: providerResponse ?? null,
    error_message: errorMessage ?? null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    delivered_at: status === 'delivered' ? new Date().toISOString() : null,
    retry_count: 0,
  })
}

/**
 * 발송 로그 상태 업데이트
 */
async function updateLogStatus(
  logId: string,
  status: 'sent' | 'failed' | 'delivered',
  providerResponse?: Record<string, unknown>,
  errorMessage?: string
): Promise<void> {
  const supabase = (await createClient()) as unknown as NotificationSupabaseClient

  const updateData: Partial<NotificationLogRecord> = {
    status,
  }

  if (providerResponse) {
    updateData.provider_response = providerResponse
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString()
  }

  if (status === 'delivered') {
    updateData.delivered_at = new Date().toISOString()
  }

  await supabase.from('notification_logs').update(updateData).eq('id', logId)
}

// ============================================================================
// 푸시 알림 발송
// ============================================================================

/**
 * FCM 푸시 페이로드 생성
 */
function createPushPayload(
  title: string,
  body: string,
  data: NotificationData,
  priority: NotificationPriority
): PushPayload {
  const fcmPriority = priority === 'urgent' || priority === 'high' ? 'high' : 'normal'

  // data 객체를 문자열 값으로 변환 (FCM 요구사항)
  const stringData: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      stringData[key] = String(value)
    }
  }

  return {
    notification: {
      title,
      body,
    },
    data: stringData,
    android: {
      priority: fcmPriority,
      notification: {
        channelId: 'dalli_default',
        icon: 'ic_notification',
        color: '#00C4B4',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: 'default',
          badge: 1,
          'mutable-content': 1,
        },
      },
    },
    webpush: {
      notification: {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      },
    },
  }
}

/**
 * 단일 토큰으로 푸시 발송
 *
 * 참고: 실제 운영 환경에서는 Firebase Admin SDK 사용
 * 현재는 구조만 정의하고 실제 발송은 별도 구현 필요
 */
async function sendPushToToken(
  token: string,
  payload: PushPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // TODO: Firebase Admin SDK로 실제 푸시 발송 구현
  // 현재는 로그만 기록하고 성공으로 처리 (개발용)

  // 실제 구현 예시:
  // const message = {
  //   token,
  //   notification: payload.notification,
  //   data: payload.data,
  //   android: payload.android,
  //   apns: payload.apns,
  //   webpush: payload.webpush,
  // }
  // const response = await admin.messaging().send(message)
  // return { success: true, messageId: response }

  // 개발용 시뮬레이션
  return {
    success: true,
    messageId: `mock_${Date.now()}_${token.slice(-8)}`,
  }
}

/**
 * 사용자에게 푸시 알림 발송
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: NotificationData,
  priority: NotificationPriority
): Promise<SendPushResult> {
  const tokens = await getActiveTokens(userId)

  if (tokens.length === 0) {
    return {
      success: false,
      successCount: 0,
      failureCount: 0,
      responses: [],
    }
  }

  const payload = createPushPayload(title, body, data, priority)
  const responses: SendPushResult['responses'] = []

  const successTokens: string[] = []

  for (const pushToken of tokens) {
    const result = await sendPushToToken(pushToken.token, payload)
    responses.push({
      token: pushToken.token,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    })

    if (result.success) {
      successTokens.push(pushToken.token)
    }
  }

  // 성공한 토큰들의 마지막 사용 시간 업데이트
  if (successTokens.length > 0) {
    await updateTokensLastUsed(successTokens)
  }

  return {
    success: responses.some((r) => r.success),
    successCount: responses.filter((r) => r.success).length,
    failureCount: responses.filter((r) => !r.success).length,
    responses,
  }
}

// ============================================================================
// 이메일 알림 발송
// ============================================================================

/**
 * 이메일 알림 발송
 *
 * 참고: 실제 운영 환경에서는 이메일 서비스 연동 필요
 * (SendGrid, AWS SES, Resend 등)
 */
async function sendEmailNotification(
  userId: string,
  title: string,
  body: string,
  data: NotificationData
): Promise<{ success: boolean; error?: string }> {
  // TODO: 이메일 서비스 연동 구현
  // 현재는 로그만 기록 (개발용)

  // 실제 구현 예시:
  // const user = await getUserById(userId)
  // await sendGrid.send({
  //   to: user.email,
  //   subject: title,
  //   html: renderEmailTemplate(body, data),
  // })

  return { success: true }
}

// ============================================================================
// SMS 알림 발송
// ============================================================================

/**
 * SMS 알림 발송
 *
 * 참고: 실제 운영 환경에서는 SMS 서비스 연동 필요
 * (NHN Cloud, 알리고 등)
 */
async function sendSMSNotification(
  userId: string,
  title: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: SMS 서비스 연동 구현
  // 현재는 로그만 기록 (개발용)

  // 실제 구현 예시:
  // const user = await getUserById(userId)
  // await smsService.send({
  //   to: user.phone,
  //   message: `[달리고] ${title}\n${body}`,
  // })

  return { success: true }
}

// ============================================================================
// 통합 알림 발송
// ============================================================================

/**
 * 알림 발송 결과 타입
 */
interface DispatchResult {
  success: boolean
  notificationId: string | null
  channelResults: Record<NotificationChannel, { success: boolean; error?: string }>
}

/**
 * 멀티 채널 알림 발송
 *
 * @param userId 사용자 ID
 * @param type 알림 타입
 * @param variables 템플릿 변수
 * @param data 추가 데이터
 * @param channels 발송 채널 (미지정 시 기본 채널)
 * @returns 발송 결과
 */
export async function dispatchNotification(
  userId: string,
  type: NotificationType,
  variables: Record<string, string | number | undefined>,
  data?: NotificationData,
  channels?: NotificationChannel[]
): Promise<DispatchResult> {
  const template = getTemplate(type)
  const title = renderTemplate(template.title, variables)
  const body = renderTemplate(template.body, variables)
  const priority = getDefaultPriority(type)
  const targetChannels = channels ?? getDefaultChannels(type)
  const notificationData = data ?? {}

  const channelResults: Record<NotificationChannel, { success: boolean; error?: string }> = {
    in_app: { success: false },
    push: { success: false },
    email: { success: false },
    sms: { success: false },
  }

  let notificationId: string | null = null

  // 긴급 알림 여부 확인
  const isUrgent = URGENT_NOTIFICATION_TYPES.includes(type)

  // 카테고리 결정
  const category = type.startsWith('order_')
    ? 'order'
    : type.startsWith('cancellation_') || type.startsWith('refund_')
      ? 'cancellation'
      : type.startsWith('promotion_') || type.startsWith('coupon_')
        ? 'promotion'
        : 'review'

  for (const channel of targetChannels) {
    // 발송 가능 여부 확인 (긴급 알림은 설정 무시)
    if (!isUrgent && channel !== 'in_app') {
      const canSend = await canSendNotification(
        userId,
        channel as 'push' | 'email' | 'sms',
        category as 'order' | 'cancellation' | 'promotion' | 'review'
      )

      if (!canSend.canSend) {
        channelResults[channel] = { success: false, error: canSend.reason }
        continue
      }
    }

    try {
      switch (channel) {
        case 'in_app': {
          // 인앱 알림 생성
          const result = await createNotification({
            userId,
            type,
            title,
            body,
            data: notificationData,
            priority,
          })

          channelResults.in_app = {
            success: result.success,
            error: result.success ? undefined : result.message,
          }

          if (result.success && result.notificationId) {
            notificationId = result.notificationId
            await logNotificationSend(notificationId, 'in_app', 'sent')
          }
          break
        }

        case 'push': {
          // 푸시 알림 발송
          const pushResult = await sendPushNotification(
            userId,
            title,
            body,
            notificationData,
            priority
          )

          channelResults.push = {
            success: pushResult.success,
            error: pushResult.success
              ? undefined
              : `${pushResult.failureCount}개 토큰 발송 실패`,
          }

          if (notificationId) {
            await logNotificationSend(
              notificationId,
              'push',
              pushResult.success ? 'sent' : 'failed',
              { responses: pushResult.responses }
            )
          }
          break
        }

        case 'email': {
          // 이메일 알림 발송
          const emailResult = await sendEmailNotification(userId, title, body, notificationData)

          channelResults.email = {
            success: emailResult.success,
            error: emailResult.error,
          }

          if (notificationId) {
            await logNotificationSend(
              notificationId,
              'email',
              emailResult.success ? 'sent' : 'failed',
              undefined,
              emailResult.error
            )
          }
          break
        }

        case 'sms': {
          // SMS 알림 발송
          const smsResult = await sendSMSNotification(userId, title, body)

          channelResults.sms = {
            success: smsResult.success,
            error: smsResult.error,
          }

          if (notificationId) {
            await logNotificationSend(
              notificationId,
              'sms',
              smsResult.success ? 'sent' : 'failed',
              undefined,
              smsResult.error
            )
          }
          break
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '발송 실패'
      channelResults[channel] = { success: false, error: errorMessage }
    }
  }

  const success = Object.values(channelResults).some((r) => r.success)

  return {
    success,
    notificationId,
    channelResults,
  }
}

/**
 * 여러 사용자에게 동일한 알림 발송 (대량 발송)
 *
 * @param userIds 사용자 ID 배열
 * @param type 알림 타입
 * @param variables 템플릿 변수
 * @param data 추가 데이터
 * @param channels 발송 채널
 * @returns 발송 결과 배열
 */
export async function dispatchBulkNotification(
  userIds: string[],
  type: NotificationType,
  variables: Record<string, string | number | undefined>,
  data?: NotificationData,
  channels?: NotificationChannel[]
): Promise<{ userId: string; result: DispatchResult }[]> {
  const results: { userId: string; result: DispatchResult }[] = []

  // 병렬 처리 (최대 10개씩 배치)
  const batchSize = 10

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (userId) => ({
        userId,
        result: await dispatchNotification(userId, type, variables, data, channels),
      }))
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * 긴급 알림 발송 (설정 무시, 모든 채널로 발송)
 *
 * @param userId 사용자 ID
 * @param type 알림 타입
 * @param variables 템플릿 변수
 * @param data 추가 데이터
 * @returns 발송 결과
 */
export async function dispatchUrgentNotification(
  userId: string,
  type: NotificationType,
  variables: Record<string, string | number | undefined>,
  data?: NotificationData
): Promise<DispatchResult> {
  // 모든 채널로 발송
  return dispatchNotification(userId, type, variables, data, ['in_app', 'push', 'email', 'sms'])
}

/**
 * 실패한 알림 재발송
 *
 * @param logId 발송 로그 ID
 * @returns 재발송 결과
 */
export async function retryFailedNotification(
  logId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = (await createClient()) as unknown as NotificationSupabaseClient

  // 로그 조회
  const { data: log, error: logError } = await supabase
    .from('notification_logs')
    .select('*, notification:notifications(*)')
    .eq('id', logId)
    .single()

  if (logError || !log) {
    return { success: false, error: '발송 로그를 찾을 수 없습니다' }
  }

  // 재시도 횟수 확인
  const retryCount = (log.retry_count as number) ?? 0
  if (retryCount >= PUSH_RETRY_CONFIG.maxRetries) {
    return { success: false, error: '최대 재시도 횟수를 초과했습니다' }
  }

  // 재시도 횟수 증가
  await supabase
    .from('notification_logs')
    .update({
      retry_count: retryCount + 1,
      next_retry_at: null,
    })
    .eq('id', logId)

  // 채널별 재발송
  const notification = log.notification as NotificationData
  const userId = notification.userId as string
  const channel = log.channel as NotificationChannel

  try {
    switch (channel) {
      case 'push': {
        const result = await sendPushNotification(
          userId,
          notification.title as string,
          notification.body as string,
          notification as NotificationData,
          'normal'
        )
        await updateLogStatus(logId, result.success ? 'sent' : 'failed')
        return { success: result.success }
      }

      case 'email': {
        const result = await sendEmailNotification(
          userId,
          notification.title as string,
          notification.body as string,
          notification as NotificationData
        )
        await updateLogStatus(logId, result.success ? 'sent' : 'failed')
        return { success: result.success }
      }

      case 'sms': {
        const result = await sendSMSNotification(
          userId,
          notification.title as string,
          notification.body as string
        )
        await updateLogStatus(logId, result.success ? 'sent' : 'failed')
        return { success: result.success }
      }

      default:
        return { success: false, error: '지원하지 않는 채널입니다' }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '재발송 실패'
    await updateLogStatus(logId, 'failed', undefined, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * 실패한 알림 일괄 재발송
 *
 * @returns 재발송 결과 요약
 */
export async function retryAllFailedNotifications(): Promise<{
  total: number
  success: number
  failed: number
}> {
  const supabase = (await createClient()) as unknown as NotificationSupabaseClient

  // 실패한 로그 조회 (재시도 가능한 것만)
  const { data: logs, error } = await supabase
    .from('notification_logs')
    .select('id')
    .eq('status', 'failed')
    .lt('retry_count', PUSH_RETRY_CONFIG.maxRetries)
    .limit(100)

  if (error || !logs) {
    return { total: 0, success: 0, failed: 0 }
  }

  let successCount = 0
  let failedCount = 0

  for (const log of logs) {
    const result = await retryFailedNotification(log.id)
    if (result.success) {
      successCount++
    } else {
      failedCount++
    }
  }

  return {
    total: logs.length,
    success: successCount,
    failed: failedCount,
  }
}
