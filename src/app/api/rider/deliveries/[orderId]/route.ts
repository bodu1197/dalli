/**
 * 라이더 배달 상세 API 라우트
 * @description 라이더가 진행 중인 배달의 상세 정보 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 에러 메시지 상수
const ERROR_MESSAGES = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_RIDER: '라이더 권한이 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  NOT_AUTHORIZED: '해당 주문에 접근할 권한이 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const

// ============================================================================
// GET /api/rider/deliveries/[orderId] - 배달 상세 조회
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

    // 2. 라이더 정보 조회
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_RIDER },
        { status: 403 }
      )
    }

    // 3. 주문 상세 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        rider_id,
        total_amount,
        delivery_fee,
        delivery_address,
        delivery_detail,
        delivery_lat,
        delivery_lng,
        delivery_instructions,
        special_instructions,
        estimated_delivery_time,
        confirmed_at,
        prepared_at,
        picked_up_at,
        rider_assigned_at,
        created_at,
        updated_at,
        restaurants (
          id,
          name,
          address,
          lat,
          lng,
          phone
        ),
        order_items (
          id,
          menu_name,
          quantity,
          price,
          options,
          special_instructions
        ),
        users!orders_user_id_fkey (
          id,
          name,
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

    // 4. 권한 확인 (배정된 라이더이거나 수락 가능한 주문인지)
    const isAssignedRider = order.rider_id === user.id
    const isAvailableOrder = order.status === 'ready' && !order.rider_id

    if (!isAssignedRider && !isAvailableOrder) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_AUTHORIZED },
        { status: 403 }
      )
    }

    // 5. 수익 계산
    const estimatedEarnings = Math.round((order.delivery_fee ?? 0) * 0.8)

    // 6. 거리 계산 (라이더 현재 위치 → 식당 → 배달지)
    const restaurant = order.restaurants as {
      lat: number
      lng: number
      name: string
      address: string
      phone: string
    } | null

    let totalDistance = null
    let pickupDistance = null
    let deliveryDistance = null

    if (restaurant && rider) {
      // 라이더 현재 위치 조회
      const { data: riderLocation } = await supabase
        .from('riders')
        .select('current_lat, current_lng')
        .eq('user_id', user.id)
        .single()

      if (riderLocation?.current_lat && riderLocation?.current_lng) {
        // 픽업 거리 (라이더 → 식당)
        pickupDistance = calculateDistance(
          riderLocation.current_lat,
          riderLocation.current_lng,
          restaurant.lat,
          restaurant.lng
        )

        // 배달 거리 (식당 → 배달지)
        deliveryDistance = calculateDistance(
          restaurant.lat,
          restaurant.lng,
          order.delivery_lat,
          order.delivery_lng
        )

        totalDistance = pickupDistance + deliveryDistance
      } else {
        // 라이더 위치 없으면 식당 → 배달지 거리만
        deliveryDistance = calculateDistance(
          restaurant.lat,
          restaurant.lng,
          order.delivery_lat,
          order.delivery_lng
        )
        totalDistance = deliveryDistance
      }
    }

    // 7. 응답 데이터 구성
    const responseData = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      isAssigned: isAssignedRider,
      restaurant: restaurant
        ? {
            name: restaurant.name,
            address: restaurant.address,
            lat: restaurant.lat,
            lng: restaurant.lng,
            phone: restaurant.phone,
          }
        : null,
      delivery: {
        address: order.delivery_address,
        detail: order.delivery_detail,
        lat: order.delivery_lat,
        lng: order.delivery_lng,
        instructions: order.delivery_instructions,
      },
      customer: isAssignedRider
        ? {
            name: (order.users as { name: string })?.name ?? null,
            phone: (order.users as { phone: string })?.phone ?? null,
          }
        : null, // 미배정 시 고객 정보 비공개
      items: (order.order_items ?? []).map((item) => ({
        menuName: item.menu_name,
        quantity: item.quantity,
        options: item.options,
        specialInstructions: item.special_instructions,
      })),
      amounts: {
        total: order.total_amount,
        deliveryFee: order.delivery_fee,
        estimatedEarnings,
      },
      distances: {
        pickup: pickupDistance,
        delivery: deliveryDistance,
        total: totalDistance,
      },
      timestamps: {
        created: order.created_at,
        confirmed: order.confirmed_at,
        prepared: order.prepared_at,
        pickedUp: order.picked_up_at,
        riderAssigned: order.rider_assigned_at,
        estimatedDelivery: order.estimated_delivery_time,
      },
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('[GET /api/rider/deliveries/[orderId]]', error)
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
