/**
 * 라이더 위치 API 라우트
 * @description 라이더의 현재 위치 업데이트 및 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateRiderLocationInput } from '@/types/delivery.types'
import { notifyRiderNearby } from '@/lib/services/order-notification.service'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_RIDER: '라이더 권한이 없습니다.',
  INVALID_COORDINATES: '유효하지 않은 좌표입니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// 근접 알림 거리 임계값 (미터)
const NEARBY_NOTIFICATION_THRESHOLDS = {
  FIRST_NOTIFY: 500, // 500m 이내 시 첫 알림
  ARRIVED_NOTIFY: 100, // 100m 이내 시 거의 도착 알림
} as const

// ============================================================================
// POST /api/rider/location - 라이더 위치 업데이트
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // 1. 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // 2. 라이더 확인
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, user_id, is_available')
      .eq('user_id', user.id)
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_RIDER },
        { status: 403 }
      )
    }

    // 3. 요청 본문 파싱
    const body: UpdateRiderLocationInput = await request.json()
    const { lat, lng, heading, speed, accuracy } = body

    // 4. 좌표 유효성 검사
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_COORDINATES },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // 5. riders 테이블의 현재 위치 업데이트
    const { error: updateRiderError } = await supabase
      .from('riders')
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: now,
      })
      .eq('user_id', user.id)

    if (updateRiderError) {
      throw updateRiderError
    }

    // 6. rider_locations 테이블에 위치 기록 (실시간 추적용)
    await supabase.from('rider_locations').upsert(
      {
        rider_id: user.id,
        lat,
        lng,
        heading: heading ?? null,
        speed: speed ?? null,
        accuracy: accuracy ?? null,
        updated_at: now,
      },
      {
        onConflict: 'rider_id',
      }
    )

    // 7. 현재 배달 중인 주문이 있으면 ETA 업데이트
    const { data: activeDelivery } = await supabase
      .from('orders')
      .select('id, delivery_lat, delivery_lng, status')
      .eq('rider_id', user.id)
      .eq('status', 'delivering')
      .single()

    let eta = null
    if (activeDelivery) {
      // 거리 계산 (Haversine 공식)
      const distance = calculateDistance(
        lat,
        lng,
        activeDelivery.delivery_lat,
        activeDelivery.delivery_lng
      )

      // 평균 속도 기반 ETA 계산 (오토바이 평균 20km/h 가정)
      const avgSpeedMps = speed && speed > 0 ? speed : 5.56 // 5.56 m/s = 20 km/h
      const remainingSeconds = distance / avgSpeedMps
      const remainingMinutes = Math.ceil(remainingSeconds / 60)

      const etaTime = new Date()
      etaTime.setSeconds(etaTime.getSeconds() + remainingSeconds)

      eta = {
        orderId: activeDelivery.id,
        remainingDistance: Math.round(distance),
        remainingMinutes,
        estimatedArrival: etaTime.toISOString(),
      }

      // 주문의 ETA 업데이트
      await supabase
        .from('orders')
        .update({
          estimated_delivery_time: etaTime.toISOString(),
          updated_at: now,
        })
        .eq('id', activeDelivery.id)

      // 근접 알림 발송 (500m 이내 또는 100m 이내)
      await checkAndSendNearbyNotification(
        supabase,
        activeDelivery.id,
        distance,
        remainingMinutes
      )
    }

    // 8. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        lat,
        lng,
        heading,
        speed,
        accuracy,
        updatedAt: now,
        eta,
      },
    })
  } catch (error) {
    console.error('[POST /api/rider/location]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET /api/rider/location - 라이더 현재 위치 조회
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // 1. 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // 2. 라이더 확인
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, user_id, current_lat, current_lng, is_available')
      .eq('user_id', user.id)
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_RIDER },
        { status: 403 }
      )
    }

    // 3. 상세 위치 정보 조회
    const { data: location } = await supabase
      .from('rider_locations')
      .select('*')
      .eq('rider_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        lat: location?.lat ?? rider.current_lat,
        lng: location?.lng ?? rider.current_lng,
        heading: location?.heading ?? null,
        speed: location?.speed ?? null,
        accuracy: location?.accuracy ?? null,
        updatedAt: location?.updated_at ?? null,
        isAvailable: rider.is_available,
      },
    })
  } catch (error) {
    console.error('[GET /api/rider/location]', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 두 지점 사이의 거리 계산 (미터)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // 지구 반지름 (미터)
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * 근접 알림 발송 체크 및 발송
 * 500m 이내 진입 시 첫 알림, 100m 이내 진입 시 거의 도착 알림
 */
async function checkAndSendNearbyNotification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  distance: number,
  remainingMinutes: number
): Promise<void> {
  // 알림 발송 기록 테이블에서 이미 발송했는지 확인
  const { data: notificationRecord } = await supabase
    .from('order_delivery_notifications')
    .select('id, notified_500m, notified_100m')
    .eq('order_id', orderId)
    .single()

  // 레코드가 없으면 생성
  if (!notificationRecord) {
    await supabase.from('order_delivery_notifications').insert({
      order_id: orderId,
      notified_500m: false,
      notified_100m: false,
    })
  }

  const notified500m = notificationRecord?.notified_500m ?? false
  const notified100m = notificationRecord?.notified_100m ?? false

  // 100m 이내이고 아직 100m 알림을 보내지 않은 경우
  if (distance <= NEARBY_NOTIFICATION_THRESHOLDS.ARRIVED_NOTIFY && !notified100m) {
    // 알림 발송
    notifyRiderNearby(orderId, remainingMinutes).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('[checkAndSendNearbyNotification] 100m 알림 발송 실패:', error)
    })

    // 발송 기록 업데이트
    await supabase
      .from('order_delivery_notifications')
      .update({ notified_100m: true })
      .eq('order_id', orderId)
  }
  // 500m 이내이고 아직 500m 알림을 보내지 않은 경우
  else if (
    distance <= NEARBY_NOTIFICATION_THRESHOLDS.FIRST_NOTIFY &&
    distance > NEARBY_NOTIFICATION_THRESHOLDS.ARRIVED_NOTIFY &&
    !notified500m
  ) {
    // 알림 발송
    notifyRiderNearby(orderId, remainingMinutes).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('[checkAndSendNearbyNotification] 500m 알림 발송 실패:', error)
    })

    // 발송 기록 업데이트
    await supabase
      .from('order_delivery_notifications')
      .update({ notified_500m: true })
      .eq('order_id', orderId)
  }
}
