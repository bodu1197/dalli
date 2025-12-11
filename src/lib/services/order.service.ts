/**
 * 주문 서비스
 * @description 주문 생성 및 조회 관련 비즈니스 로직
 */

import { createClient } from '@/lib/supabase/server'
import { calculatePlatformFee } from '@/lib/utils/platform-fee'
import type {
  Order,
  OrderItem,
  CreateOrderInput,
  OrderListItem,
  OrderRecord,
  OrderItemRecord,
} from '@/types/order.types'

// ============================================================================
// 주문 번호 생성
// ============================================================================

/**
 * 주문 번호 생성
 * @description 형식: D{YYMMDD}-{6자리 시퀀스}
 * @example D241209-000001
 */
export async function generateOrderNumber(): Promise<string> {
  const supabase = await createClient()

  const now = new Date()
  const dateStr = now
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, '') // YYMMDD

  // 오늘 날짜로 시작하는 마지막 주문 번호 조회
  const { data: lastOrder } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', `D${dateStr}-%`)
    .order('order_number', { ascending: false })
    .limit(1)
    .single()

  let sequence = 1
  if (lastOrder?.order_number) {
    const lastSequence = parseInt(lastOrder.order_number.split('-')[1], 10)
    sequence = lastSequence + 1
  }

  return `D${dateStr}-${sequence.toString().padStart(6, '0')}`
}

// ============================================================================
// 주문 생성
// ============================================================================

export interface CreateOrderResult {
  success: boolean
  order: Order | null
  error: string | null
}

/**
 * 주문 생성
 * @param userId 주문자 ID
 * @param input 주문 입력 정보
 */
export async function createOrder(
  userId: string,
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const supabase = await createClient()

  try {
    // 1. 식당 정보 조회
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, image_url, phone, delivery_fee, min_order_amount, is_open')
      .eq('id', input.restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return {
        success: false,
        order: null,
        error: '식당 정보를 찾을 수 없습니다',
      }
    }

    // 2. 영업 상태 확인
    if (!restaurant.is_open) {
      return {
        success: false,
        order: null,
        error: '현재 영업 중이 아닌 식당입니다',
      }
    }

    // 3. 금액 계산
    const menuAmount = input.items.reduce((sum, item) => {
      const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price, 0)
      return sum + (item.price + optionsPrice) * item.quantity
    }, 0)

    // 4. 최소 주문 금액 확인
    const minOrderAmount = restaurant.min_order_amount ?? 0
    if (menuAmount < minOrderAmount) {
      return {
        success: false,
        order: null,
        error: `최소 주문 금액은 ${minOrderAmount.toLocaleString()}원입니다`,
      }
    }

    // 5. 쿠폰 할인 계산
    let discountAmount = 0
    let couponName: string | null = null

    if (input.couponId) {
      const { data: userCoupon } = await supabase
        .from('user_coupons')
        .select(`
          id,
          coupon:coupons (
            id,
            name,
            discount_type,
            discount_value,
            max_discount_amount,
            min_order_amount
          )
        `)
        .eq('id', input.couponId)
        .eq('user_id', userId)
        .eq('is_used', false)
        .single()

      if (userCoupon?.coupon) {
        const coupon = userCoupon.coupon as {
          name: string
          discount_type: 'fixed' | 'percentage'
          discount_value: number
          max_discount_amount: number | null
          min_order_amount: number | null
        }

        // 최소 주문 금액 확인
        if (coupon.min_order_amount && menuAmount < coupon.min_order_amount) {
          return {
            success: false,
            order: null,
            error: `이 쿠폰은 ${coupon.min_order_amount.toLocaleString()}원 이상 주문 시 사용 가능합니다`,
          }
        }

        // 할인 금액 계산
        if (coupon.discount_type === 'fixed') {
          discountAmount = coupon.discount_value
        } else {
          discountAmount = Math.floor(menuAmount * (coupon.discount_value / 100))
          if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
            discountAmount = coupon.max_discount_amount
          }
        }

        couponName = coupon.name
      }
    }

    // 6. 포인트 사용 확인
    let pointsUsed = 0
    if (input.pointsToUse > 0) {
      const { data: userInfo } = await supabase
        .from('users')
        .select('point_balance')
        .eq('id', userId)
        .single()

      if (userInfo && (userInfo.point_balance ?? 0) >= input.pointsToUse) {
        pointsUsed = input.pointsToUse
      }
    }

    // 7. 배달비 계산
    const deliveryFee = restaurant.delivery_fee ?? 0

    // 8. 총 금액 계산
    const totalAmount = menuAmount - discountAmount - pointsUsed + deliveryFee

    // 9. 플랫폼 수수료 계산 (점주 부담)
    const platformFee = calculatePlatformFee(menuAmount)

    // 10. 주문 번호 생성
    const orderNumber = await generateOrderNumber()

    // 11. 주문 생성 (트랜잭션)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        restaurant_id: input.restaurantId,
        restaurant_name: restaurant.name,
        restaurant_image: restaurant.image_url,
        restaurant_phone: restaurant.phone,
        status: 'pending',
        menu_amount: menuAmount,
        discount_amount: discountAmount,
        points_used: pointsUsed,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        total_amount: totalAmount,
        delivery_address: input.deliveryAddress.address,
        delivery_detail: input.deliveryAddress.detail,
        delivery_lat: input.deliveryAddress.lat,
        delivery_lng: input.deliveryAddress.lng,
        special_instructions: input.specialInstructions,
        delivery_instructions: input.deliveryInstructions,
        disposable_items: input.disposableItems,
        payment_method: input.paymentMethod,
        coupon_id: input.couponId,
        coupon_name: couponName,
      })
      .select()
      .single()

    if (orderError || !orderData) {
      return {
        success: false,
        order: null,
        error: '주문 생성에 실패했습니다',
      }
    }

    // 12. 주문 항목 생성
    const orderItems = input.items.map((item) => ({
      order_id: orderData.id,
      menu_id: item.menuId,
      menu_name: item.menuName,
      menu_image: item.menuImage,
      quantity: item.quantity,
      price: item.price,
      options: item.options as unknown as any,
      special_instructions: item.specialInstructions,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // 주문 항목 생성 실패 시 주문도 삭제
      await supabase.from('orders').delete().eq('id', orderData.id)
      return {
        success: false,
        order: null,
        error: '주문 항목 생성에 실패했습니다',
      }
    }

    // 13. 쿠폰 사용 처리
    if (input.couponId && discountAmount > 0) {
      await supabase
        .from('user_coupons')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          used_order_id: orderData.id,
        })
        .eq('id', input.couponId)
    }

    // 14. 포인트 차감 처리
    if (pointsUsed > 0) {
      await supabase.rpc('use_points', {
        p_user_id: userId,
        p_amount: pointsUsed,
        p_order_id: orderData.id,
        p_description: `주문 사용 (${orderNumber})`,
      })
    }

    // 15. 주문 상태 이력 기록
    await supabase.from('order_status_history').insert({
      order_id: orderData.id,
      new_status: 'pending',
      note: '주문이 생성되었습니다',
      changed_by: 'customer',
      changed_by_user_id: userId,
    })

    // 16. 주문 정보 재조회 (items 포함)
    const order = await getOrderById(orderData.id)

    return {
      success: true,
      order,
      error: null,
    }
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return {
      success: false,
      order: null,
      error: '주문 생성 중 오류가 발생했습니다',
    }
  }
}

// ============================================================================
// 주문 조회
// ============================================================================

/**
 * 주문 ID로 상세 조회
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data: orderRecord, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !orderRecord) {
    return null
  }

  // 주문 항목 조회
  const { data: itemsRecord } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  return transformOrderRecord(orderRecord as unknown as OrderRecord, itemsRecord as unknown as OrderItemRecord[] ?? [])
}

/**
 * 사용자의 주문 목록 조회
 */
export async function getOrdersByUserId(
  userId: string,
  options?: {
    status?: string
    limit?: number
    offset?: number
  }
): Promise<OrderListItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      restaurant_id,
      restaurant_name,
      restaurant_image,
      status,
      total_amount,
      created_at,
      order_items (
        menu_name,
        quantity
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data.map((order) => {
    const items = order.order_items as Array<{ menu_name: string; quantity: number }>
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const firstItem = items[0]?.menu_name ?? ''
    const otherCount = items.length - 1

    return {
      id: order.id,
      orderNumber: order.order_number ?? '',
      restaurantId: order.restaurant_id,
      restaurantName: order.restaurant_name ?? '',
      restaurantImage: order.restaurant_image,
      status: order.status as any,
      totalAmount: order.total_amount,
      itemCount,
      itemSummary: otherCount > 0 ? `${firstItem} 외 ${otherCount}개` : firstItem,
      createdAt: order.created_at ?? '',
    }
  })
}

/**
 * 식당의 주문 목록 조회 (점주용)
 */
export async function getOrdersByRestaurantId(
  restaurantId: string,
  options?: {
    status?: string
    limit?: number
    offset?: number
  }
): Promise<OrderRecord[]> {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data as unknown as OrderRecord[]
}

// ============================================================================
// 데이터 변환 함수
// ============================================================================

/**
 * DB 레코드를 Order 타입으로 변환
 */
function transformOrderRecord(
  record: OrderRecord,
  items: OrderItemRecord[]
): Order {
  return {
    id: record.id,
    orderNumber: record.order_number,
    userId: record.user_id,
    restaurantId: record.restaurant_id,
    restaurantName: record.restaurant_name,
    restaurantImage: record.restaurant_image,
    restaurantPhone: record.restaurant_phone,
    riderId: record.rider_id,
    riderName: record.rider_name,
    riderPhone: record.rider_phone,
    status: record.status,
    menuAmount: record.menu_amount,
    discountAmount: record.discount_amount,
    pointsUsed: record.points_used,
    deliveryFee: record.delivery_fee,
    platformFee: record.platform_fee,
    totalAmount: record.total_amount,
    deliveryAddress: record.delivery_address,
    deliveryDetail: record.delivery_detail,
    deliveryLat: record.delivery_lat,
    deliveryLng: record.delivery_lng,
    specialInstructions: record.special_instructions,
    deliveryInstructions: record.delivery_instructions,
    disposableItems: record.disposable_items,
    estimatedPrepTime: record.estimated_prep_time,
    estimatedDeliveryTime: record.estimated_delivery_time,
    actualDeliveryTime: record.actual_delivery_time,
    confirmedAt: record.confirmed_at,
    preparedAt: record.prepared_at,
    pickedUpAt: record.picked_up_at,
    deliveredAt: record.delivered_at,
    rejectionReason: record.rejection_reason,
    rejectionDetail: record.rejection_detail,
    cancelledReason: record.cancelled_reason,
    cancelledAt: record.cancelled_at,
    cancelledBy: record.cancelled_by,
    paymentMethod: record.payment_method,
    paymentId: record.payment_id,
    couponId: record.coupon_id,
    couponName: record.coupon_name,
    items: items.map((item) => ({
      id: item.id,
      orderId: item.order_id,
      menuId: item.menu_id,
      menuName: item.menu_name,
      menuImage: item.menu_image,
      quantity: item.quantity,
      price: item.price,
      options: item.options,
      specialInstructions: item.special_instructions,
    })),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}
