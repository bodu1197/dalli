/**
 * 푸시 토큰 서비스
 * @description FCM 푸시 토큰 등록, 관리, 조회
 */

import { createClient } from '@/lib/supabase/server'
import type {
  PushToken,
  PushTokenRecord,
  DevicePlatform,
  RegisterPushTokenParams,
} from '@/types/notification.types'

// ============================================================================
// 타입 변환 유틸리티
// ============================================================================

/**
 * DB 레코드를 도메인 모델로 변환
 */
function toPushToken(record: PushTokenRecord): PushToken {
  return {
    id: record.id,
    userId: record.user_id,
    token: record.token,
    platform: record.platform,
    deviceId: record.device_id,
    deviceName: record.device_name,
    isActive: record.is_active,
    lastUsedAt: record.last_used_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

// ============================================================================
// 서비스 함수
// ============================================================================

/**
 * 푸시 토큰 등록 (기존 토큰 있으면 업데이트)
 *
 * @param params 등록 파라미터
 * @returns 등록/업데이트된 푸시 토큰
 */
export async function registerPushToken(params: RegisterPushTokenParams): Promise<PushToken> {
  const { userId, token, platform, deviceId, deviceName } = params
  const supabase = await createClient()

  // DB 함수로 upsert 처리
  const { error } = await supabase.rpc('upsert_push_token', {
    p_user_id: userId,
    p_token: token,
    p_platform: platform,
    p_device_id: deviceId,
    p_device_name: deviceName,
  })

  if (error) {
    throw new Error(`푸시 토큰 등록 실패: ${error.message}`)
  }

  // 등록된 토큰 조회
  const { data: tokenData, error: fetchError } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (fetchError) {
    throw new Error(`푸시 토큰 조회 실패: ${fetchError.message}`)
  }

  return toPushToken(tokenData as PushTokenRecord)
}

/**
 * 사용자의 모든 활성 푸시 토큰 조회
 *
 * @param userId 사용자 ID
 * @returns 활성 푸시 토큰 목록
 */
export async function getActiveTokens(userId: string): Promise<PushToken[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_used_at', { ascending: false })

  if (error) {
    throw new Error(`푸시 토큰 조회 실패: ${error.message}`)
  }

  return (data as PushTokenRecord[]).map(toPushToken)
}

/**
 * 사용자의 플랫폼별 활성 푸시 토큰 조회
 *
 * @param userId 사용자 ID
 * @param platform 디바이스 플랫폼
 * @returns 플랫폼별 활성 푸시 토큰 목록
 */
export async function getTokensByPlatform(
  userId: string,
  platform: DevicePlatform
): Promise<PushToken[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('is_active', true)
    .order('last_used_at', { ascending: false })

  if (error) {
    throw new Error(`푸시 토큰 조회 실패: ${error.message}`)
  }

  return (data as PushTokenRecord[]).map(toPushToken)
}

/**
 * 토큰 문자열로 푸시 토큰 조회
 *
 * @param token 토큰 문자열
 * @returns 푸시 토큰 또는 null
 */
export async function getTokenByValue(token: string): Promise<PushToken | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`푸시 토큰 조회 실패: ${error.message}`)
  }

  return toPushToken(data as PushTokenRecord)
}

/**
 * 푸시 토큰 비활성화
 *
 * @param tokenId 토큰 ID
 * @returns 성공 여부
 */
export async function deactivateToken(tokenId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('push_tokens')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tokenId)

  if (error) {
    throw new Error(`푸시 토큰 비활성화 실패: ${error.message}`)
  }

  return true
}

/**
 * 토큰 문자열로 푸시 토큰 비활성화
 *
 * @param token 토큰 문자열
 * @returns 성공 여부
 */
export async function deactivateTokenByValue(token: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('push_tokens')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('token', token)

  if (error) {
    throw new Error(`푸시 토큰 비활성화 실패: ${error.message}`)
  }

  return true
}

/**
 * 사용자의 모든 푸시 토큰 비활성화 (로그아웃 시)
 *
 * @param userId 사용자 ID
 * @returns 비활성화된 토큰 수
 */
export async function deactivateAllUserTokens(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_active', true)
    .select('id')

  if (error) {
    throw new Error(`푸시 토큰 비활성화 실패: ${error.message}`)
  }

  return data?.length ?? 0
}

/**
 * 푸시 토큰 삭제
 *
 * @param tokenId 토큰 ID
 * @returns 성공 여부
 */
export async function deleteToken(tokenId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('push_tokens').delete().eq('id', tokenId)

  if (error) {
    throw new Error(`푸시 토큰 삭제 실패: ${error.message}`)
  }

  return true
}

/**
 * 토큰 문자열로 푸시 토큰 삭제
 *
 * @param token 토큰 문자열
 * @returns 성공 여부
 */
export async function deleteTokenByValue(token: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('push_tokens').delete().eq('token', token)

  if (error) {
    throw new Error(`푸시 토큰 삭제 실패: ${error.message}`)
  }

  return true
}

/**
 * 토큰 마지막 사용 시간 업데이트
 *
 * @param token 토큰 문자열
 * @returns 성공 여부
 */
export async function updateTokenLastUsed(token: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('push_tokens')
    .update({
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('token', token)

  if (error) {
    throw new Error(`토큰 사용 시간 업데이트 실패: ${error.message}`)
  }

  return true
}

/**
 * 여러 토큰 마지막 사용 시간 일괄 업데이트
 *
 * @param tokens 토큰 문자열 배열
 * @returns 성공 여부
 */
export async function updateTokensLastUsed(tokens: string[]): Promise<boolean> {
  if (tokens.length === 0) return true

  const supabase = await createClient()

  const { error } = await supabase
    .from('push_tokens')
    .update({
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('token', tokens)

  if (error) {
    throw new Error(`토큰 사용 시간 업데이트 실패: ${error.message}`)
  }

  return true
}

/**
 * 사용자의 토큰 수 조회
 *
 * @param userId 사용자 ID
 * @returns 활성 토큰 수
 */
export async function getActiveTokenCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('push_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`토큰 수 조회 실패: ${error.message}`)
  }

  return count ?? 0
}

/**
 * 오래된 비활성 토큰 정리 (30일 이상)
 *
 * @returns 삭제된 토큰 수
 */
export async function cleanupInactiveTokens(): Promise<number> {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('is_active', false)
    .lt('updated_at', thirtyDaysAgo.toISOString())
    .select('id')

  if (error) {
    throw new Error(`비활성 토큰 정리 실패: ${error.message}`)
  }

  return data?.length ?? 0
}

/**
 * 오래된 미사용 토큰 정리 (90일 이상 미사용)
 *
 * @returns 삭제된 토큰 수
 */
export async function cleanupUnusedTokens(): Promise<number> {
  const supabase = await createClient()

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data, error } = await supabase
    .from('push_tokens')
    .delete()
    .lt('last_used_at', ninetyDaysAgo.toISOString())
    .select('id')

  if (error) {
    throw new Error(`미사용 토큰 정리 실패: ${error.message}`)
  }

  return data?.length ?? 0
}

/**
 * 특정 디바이스의 토큰 조회
 *
 * @param deviceId 디바이스 ID
 * @returns 푸시 토큰 또는 null
 */
export async function getTokenByDeviceId(deviceId: string): Promise<PushToken | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('device_id', deviceId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`푸시 토큰 조회 실패: ${error.message}`)
  }

  return toPushToken(data as PushTokenRecord)
}

/**
 * 여러 사용자의 활성 토큰 일괄 조회 (대량 발송용)
 *
 * @param userIds 사용자 ID 배열
 * @returns 사용자별 토큰 맵
 */
export async function getTokensForUsers(
  userIds: string[]
): Promise<Map<string, PushToken[]>> {
  if (userIds.length === 0) return new Map()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .in('user_id', userIds)
    .eq('is_active', true)

  if (error) {
    throw new Error(`푸시 토큰 조회 실패: ${error.message}`)
  }

  const tokenMap = new Map<string, PushToken[]>()

  for (const record of data as PushTokenRecord[]) {
    const token = toPushToken(record)
    const existing = tokenMap.get(token.userId) ?? []
    existing.push(token)
    tokenMap.set(token.userId, existing)
  }

  return tokenMap
}

/**
 * 토큰 유효성 검증 (FCM 토큰 형식)
 *
 * @param token 토큰 문자열
 * @returns 유효 여부
 */
export function isValidFCMToken(token: string): boolean {
  // FCM 토큰은 일반적으로 150-250자 정도의 문자열
  if (!token || token.length < 100 || token.length > 500) {
    return false
  }

  // FCM 토큰은 영숫자, 하이픈, 언더스코어, 콜론으로 구성
  const fcmTokenPattern = /^[a-zA-Z0-9_:-]+$/
  return fcmTokenPattern.test(token)
}
