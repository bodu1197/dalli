/**
 * 주문 실시간 추적 API 라우트
 * @description 고객이 배달 중인 주문의 라이더 위치와 ETA를 실시간 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  NOT_AUTHORIZED: '해당 주문에 접근할 권한이 없습니다.',
  NOT_DELIVERING: '배달 중인 주문이 아닙니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// 주문 상태별 추적 가능 여부
const TRACKABLE_STATUSES = ['accepted', 'preparing', 'ready', 'picked_up', 'delivering'] as const
type TrackableStatus = (typeof TRACKABLE_STATUSES)[number]

// 상태별 표시 메시지
const STATUS_MESSAGES: Record<TrackableStatus, string> = {
  accepted: '주문이 접수되었습니다.',
  preparing: '음식을 조리 중입니다.',
  ready: '음식 조리가 완료되었습니다. 라이더 배차 대기 중입니다.',
  picked_up: '라이더가 음식을 픽업했습니다.',
  delivering: '배달 중입니다.',
}

// ============================================================================
// GET /api/orders/[orderId]/tracking - 주문 실시간 추적
// ============================================================================

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { orderId } = await params

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

    // 2. 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        restaurant_id,
        rider_id,
        status,
        delivery_lat,
        delivery_lng,
        delivery_address,
        estimated_delivery_time,
        actual_delivery_time,
        created_at,
        updated_at,
        restaurants (
          id,
          name,
          address,
          lat,
          lng,
          phone
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ORDER_NOT_FOUND },
        { status: 404 }
      )
    }

    // order_number 생성 (id의 처음 8자리 사용)
    const orderNumber = order.id.slice(0, 8).toUpperCase()

    // 3. 권한 확인 (주문자 본인만 추적 가능)
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_AUTHORIZED },
        { status: 403 }
      )
    }

    // 4. 추적 가능한 상태인지 확인
    const isTrackable = TRACKABLE_STATUSES.includes(order.status as TrackableStatus)

    if (!isTrackable) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber,
          status: order.status,
          isTrackable: false,
          message: getStatusMessage(order.status),
          restaurant: formatRestaurant(order.restaurants),
          deliveryAddress: order.delivery_address,
          createdAt: order.created_at,
        },
      })
    }

    // 5. 라이더 정보 및 위치 조회
    let riderInfo = null
    let riderLocation = null
    let eta = null

    if (order.rider_id) {
      // 라이더 기본 정보
      const { data: rider } = await supabase
        .from('riders')
        .select(`
          id,
          user_id,
          current_lat,
          current_lng,
          users!riders_user_id_fkey (
            id,
            name,
            phone
          )
        `)
        .eq('user_id', order.rider_id)
        .single()

      if (rider) {
        // 라이더 상세 위치 정보
        const { data: location } = await supabase
          .from('rider_locations')
          .select('lat, lng, heading, speed, updated_at')
          .eq('rider_id', order.rider_id)
          .single()

        const riderUser = rider.users as { id: string; name: string; phone: string } | null

        riderInfo = {
          id: rider.id,
          name: riderUser?.name ?? '라이더',
          phone: maskPhoneNumber(riderUser?.phone ?? ''),
        }

        // 위치 정보 (배달 중일 때만 제공)
        if (order.status === 'delivering' || order.status === 'picked_up') {
          const lat = location?.lat ?? rider.current_lat
          const lng = location?.lng ?? rider.current_lng

          if (lat && lng) {
            riderLocation = {
              lat,
              lng,
              heading: location?.heading ?? null,
              updatedAt: location?.updated_at ?? null,
            }

            // ETA 계산
            if (order.delivery_lat && order.delivery_lng) {
              const distance = calculateDistance(
                lat,
                lng,
                order.delivery_lat,
                order.delivery_lng
              )

              // 속도 기반 ETA 계산 (기본 5.56 m/s = 20km/h)
              const speed = location?.speed && location.speed > 0 ? location.speed : 5.56
              const remainingSeconds = distance / speed
              const remainingMinutes = Math.ceil(remainingSeconds / 60)

              const estimatedArrival = new Date()
              estimatedArrival.setSeconds(estimatedArrival.getSeconds() + remainingSeconds)

              eta = {
                remainingDistance: Math.round(distance),
                remainingMinutes,
                estimatedArrival: estimatedArrival.toISOString(),
                // DB에 저장된 예상 시간도 함께 제공
                originalEstimate: order.estimated_delivery_time,
              }
            }
          }
        }
      }
    }

    // 6. 주문 상태 타임라인 조회
    const { data: statusHistory } = await supabase
      .from('order_status_history')
      .select('id, previous_status, new_status, changed_by, change_reason, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    const timeline = (statusHistory ?? []).map((history) => ({
      status: history.new_status,
      timestamp: history.created_at,
      message: getStatusMessage(history.new_status),
    }))

    // 7. 응답 구성
    const responseData = {
      orderId: order.id,
      orderNumber,
      status: order.status,
      statusMessage: STATUS_MESSAGES[order.status as TrackableStatus] ?? '주문 처리 중입니다.',
      isTrackable: true,
      restaurant: formatRestaurant(order.restaurants),
      deliveryAddress: order.delivery_address,
      deliveryLocation: order.delivery_lat && order.delivery_lng
        ? { lat: order.delivery_lat, lng: order.delivery_lng }
        : null,
      rider: riderInfo,
      riderLocation,
      eta,
      timeline,
      actualDeliveryTime: order.actual_delivery_time,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('[GET /api/orders/[orderId]/tracking]', error)
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
 * 상태별 메시지 반환
 */
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: '주문 대기 중입니다.',
    accepted: '주문이 접수되었습니다.',
    preparing: '음식을 조리 중입니다.',
    ready: '음식 조리가 완료되었습니다.',
    picked_up: '라이더가 음식을 픽업했습니다.',
    delivering: '배달 중입니다.',
    delivered: '배달이 완료되었습니다.',
    cancelled: '주문이 취소되었습니다.',
    refunded: '환불이 완료되었습니다.',
  }
  return messages[status] ?? '주문 처리 중입니다.'
}

/**
 * 식당 정보 포맷
 */
function formatRestaurant(
  restaurant: {
    id: string
    name: string
    address: string
    lat: number | null
    lng: number | null
    phone: string | null
  } | null
): {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number } | null
  phone: string | null
} | null {
  if (!restaurant) return null

  return {
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address,
    location: restaurant.lat && restaurant.lng
      ? { lat: restaurant.lat, lng: restaurant.lng }
      : null,
    phone: restaurant.phone,
  }
}

/**
 * 전화번호 마스킹 (개인정보 보호)
 */
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return phone

  // 010-1234-5678 -> 010-****-5678
  const cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`
  }
  return phone
}

/**
 * 두 지점 사이의 거리 계산 (미터)
 * Haversine 공식 사용
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
