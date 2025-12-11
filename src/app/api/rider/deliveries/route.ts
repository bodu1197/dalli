/**
 * 라이더 배달 목록 API 라우트
 * @description 라이더가 수락 가능한 배달 목록 및 진행 중인 배달 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_RIDER: '라이더 권한이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// GET /api/rider/deliveries - 배달 목록 조회
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

    // 2. 라이더 정보 조회
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, current_lat, current_lng, is_available')
      .eq('user_id', user.id)
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_RIDER },
        { status: 403 }
      )
    }

    // 3. 쿼리 파라미터 확인
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') ?? 'available' // available, active, completed
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset = (page - 1) * limit

    // 4. 타입별 조회
    if (type === 'active') {
      // 진행 중인 배달 (본인이 배정된 배달)
      const { data: activeDeliveries, error: activeError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          restaurant_name,
          delivery_address,
          delivery_detail,
          delivery_lat,
          delivery_lng,
          total_amount,
          delivery_fee,
          estimated_delivery_time,
          picked_up_at,
          created_at,
          restaurants (
            id,
            name,
            address,
            lat,
            lng,
            phone
          )
        `)
        .eq('rider_id', user.id)
        .in('status', ['picked_up', 'delivering'])
        .order('picked_up_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (activeError) {
        throw activeError
      }

      return NextResponse.json({
        success: true,
        data: activeDeliveries ?? [],
        pagination: {
          page,
          limit,
          hasMore: (activeDeliveries ?? []).length === limit,
        },
      })
    } else if (type === 'completed') {
      // 완료된 배달 내역
      const { data: completedDeliveries, error: completedError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          restaurant_name,
          delivery_address,
          total_amount,
          delivery_fee,
          delivered_at,
          created_at
        `)
        .eq('rider_id', user.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (completedError) {
        throw completedError
      }

      return NextResponse.json({
        success: true,
        data: completedDeliveries ?? [],
        pagination: {
          page,
          limit,
          hasMore: (completedDeliveries ?? []).length === limit,
        },
      })
    } else {
      // 수락 가능한 배달 목록 (ready 상태, 라이더 미배정)
      const { data: availableDeliveries, error: availableError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          restaurant_name,
          delivery_address,
          delivery_detail,
          delivery_lat,
          delivery_lng,
          total_amount,
          delivery_fee,
          estimated_delivery_time,
          prepared_at,
          created_at,
          restaurants (
            id,
            name,
            address,
            lat,
            lng,
            phone
          )
        `)
        .eq('status', 'ready')
        .is('rider_id', null)
        .order('prepared_at', { ascending: true })
        .range(offset, offset + limit - 1)

      if (availableError) {
        throw availableError
      }

      // 거리 계산 추가 (라이더 현재 위치가 있는 경우)
      const deliveriesWithDistance = (availableDeliveries ?? []).map((delivery) => {
        let estimatedDistance = null

        // 식당 위치와 라이더 현재 위치 사이의 거리 계산
        if (rider.current_lat && rider.current_lng) {
          const restaurant = delivery.restaurants as { lat: number; lng: number } | null
          if (restaurant) {
            estimatedDistance = calculateDistance(
              rider.current_lat,
              rider.current_lng,
              restaurant.lat,
              restaurant.lng
            )
          }
        }

        return {
          ...delivery,
          estimatedDistance,
          estimatedEarnings: calculateEarnings(delivery.delivery_fee),
        }
      })

      return NextResponse.json({
        success: true,
        data: deliveriesWithDistance,
        pagination: {
          page,
          limit,
          hasMore: (availableDeliveries ?? []).length === limit,
        },
      })
    }
  } catch (error) {
    console.error('[GET /api/rider/deliveries]', error)
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
  return Math.round(R * c)
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * 예상 수익 계산
 */
function calculateEarnings(deliveryFee: number): number {
  // 배달비의 80%를 라이더 수익으로 계산 (나머지는 플랫폼)
  return Math.round(deliveryFee * 0.8)
}
