import { createClient } from '@/lib/supabase/server'

export interface RiderTodayStats {
    deliveries: number
    earnings: number
    avgDeliveryTime: number
    rating: number
}

export interface DeliveryRequest {
    id: string
    orderNumber: string
    restaurantName: string
    restaurantAddress: string
    customerAddress: string
    distance: string
    estimatedTime: number
    deliveryFee: number
    createdAt: string
    status: string
}

export interface ActiveDelivery {
    id: string
    orderNumber: string
    status: string
    restaurantName: string
    restaurantAddress: string
    restaurantPhone: string
    customerName: string
    customerAddress: string
    customerPhone: string
    items: string
    deliveryFee: number
    pickupTime: string | null
    createdAt: string
}

export interface DeliveryHistory {
    id: string
    orderNumber: string
    restaurantName: string
    customerAddress: string
    deliveryFee: number
    completedAt: string
    rating: number | null
}

export interface RiderEarnings {
    totalEarnings: number
    deliveryCount: number
    avgPerDelivery: number
    dailyBreakdown: { date: string; earnings: number; count: number }[]
}

export const riderService = {
    // 라이더 프로필 ID 조회
    async getMyRiderId(userId: string): Promise<string | null> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('riders')
            .select('id')
            .eq('user_id', userId)
            .single()
        return data?.id || null
    },

    // 오늘 통계
    async getTodayStats(riderId: string): Promise<RiderTodayStats> {
        const supabase = await createClient()
        const today = new Date().toISOString().split('T')[0]

        // 오늘 완료한 배달
        const { data: todayDeliveries } = await supabase
            .from('orders')
            .select('id, delivery_fee, actual_delivery_time, picked_up_at')
            .eq('rider_id', riderId)
            .eq('status', 'delivered')
            .gte('actual_delivery_time', `${today}T00:00:00`)

        const deliveryCount = todayDeliveries?.length || 0
        const totalEarnings = todayDeliveries?.reduce((sum, d) => sum + (d.delivery_fee || 0), 0) || 0

        // 평균 배달 시간 계산
        let avgTime = 0
        if (todayDeliveries && todayDeliveries.length > 0) {
            const times = todayDeliveries
                .filter(d => d.picked_up_at && d.actual_delivery_time)
                .map(d => {
                    const pickup = new Date(d.picked_up_at!).getTime()
                    const delivered = new Date(d.actual_delivery_time!).getTime()
                    return (delivered - pickup) / 60000 // minutes
                })
            if (times.length > 0) {
                avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
            }
        }

        // 라이더 평점
        const { data: rider } = await supabase
            .from('riders')
            .select('rating')
            .eq('id', riderId)
            .single()

        return {
            deliveries: deliveryCount,
            earnings: totalEarnings,
            avgDeliveryTime: avgTime || 25,
            rating: rider?.rating || 0
        }
    },

    // 배달 요청 목록 (수락 대기)
    async getDeliveryRequests(riderId: string): Promise<DeliveryRequest[]> {
        const supabase = await createClient()

        // 현재 라이더 위치 기반 필터링은 복잡하므로
        // 우선 rider_id가 null이고 status가 ready인 주문 조회
        const { data } = await supabase
            .from('orders')
            .select(`
        id,
        order_number,
        restaurant_name,
        delivery_address,
        delivery_fee,
        created_at,
        status,
        restaurant:restaurants(address)
      `)
            .is('rider_id', null)
            .eq('status', 'ready')
            .order('created_at', { ascending: false })
            .limit(20)

        return (data || []).map(order => ({
            id: order.id,
            orderNumber: order.order_number || '',
            restaurantName: order.restaurant_name || '가게',
            restaurantAddress: (order.restaurant as { address: string } | null)?.address || '',
            customerAddress: order.delivery_address || '',
            distance: '2.0km', // 실제로는 계산 필요
            estimatedTime: 25,
            deliveryFee: order.delivery_fee || 0,
            createdAt: order.created_at || '',
            status: order.status || ''
        }))
    },

    // 배달 수락
    async acceptDelivery(orderId: string, riderId: string): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('orders')
            .update({
                rider_id: riderId,
                status: 'picked_up',
                picked_up_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .is('rider_id', null) // 다른 라이더가 이미 수락했는지 확인

        return !error
    },

    // 현재 진행 중인 배달
    async getActiveDelivery(riderId: string): Promise<ActiveDelivery | null> {
        const supabase = await createClient()

        const { data } = await supabase
            .from('orders')
            .select(`
        id,
        order_number,
        status,
        restaurant_name,
        restaurant_phone,
        delivery_address,
        delivery_fee,
        picked_up_at,
        created_at,
        user:users(name, phone),
        restaurant:restaurants(address),
        order_items(menu_name, quantity)
      `)
            .eq('rider_id', riderId)
            .in('status', ['picked_up', 'delivering'])
            .order('picked_up_at', { ascending: false })
            .limit(1)
            .single()

        if (!data) return null

        return {
            id: data.id,
            orderNumber: data.order_number || '',
            status: data.status || '',
            restaurantName: data.restaurant_name || '',
            restaurantAddress: (data.restaurant as { address: string } | null)?.address || '',
            restaurantPhone: data.restaurant_phone || '',
            customerName: (data.user as { name: string; phone: string } | null)?.name || '',
            customerAddress: data.delivery_address || '',
            customerPhone: (data.user as { name: string; phone: string } | null)?.phone || '',
            items: (data.order_items as { menu_name: string; quantity: number }[])?.map(i => `${i.menu_name} x${i.quantity}`).join(', ') || '',
            deliveryFee: data.delivery_fee || 0,
            pickupTime: data.picked_up_at,
            createdAt: data.created_at || ''
        }
    },

    // 배달 상태 업데이트
    async updateDeliveryStatus(orderId: string, status: string): Promise<boolean> {
        const supabase = await createClient()

        const updateData: Record<string, string> = {
            status,
            updated_at: new Date().toISOString()
        }

        if (status === 'delivered') {
            updateData.actual_delivery_time = new Date().toISOString()
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)

        return !error
    },

    // 배달 완료
    async completeDelivery(orderId: string): Promise<boolean> {
        return await this.updateDeliveryStatus(orderId, 'delivered')
    },

    // 배달 이력
    async getDeliveryHistory(riderId: string, limit = 50): Promise<DeliveryHistory[]> {
        const supabase = await createClient()

        const { data } = await supabase
            .from('orders')
            .select(`
        id,
        order_number,
        restaurant_name,
        delivery_address,
        delivery_fee,
        actual_delivery_time
      `)
            .eq('rider_id', riderId)
            .eq('status', 'delivered')
            .order('actual_delivery_time', { ascending: false })
            .limit(limit)

        // 리뷰는 별도 조회 필요 (배달 리뷰 테이블이 있다면)
        return (data || []).map(order => ({
            id: order.id,
            orderNumber: order.order_number || '',
            restaurantName: order.restaurant_name || '',
            customerAddress: order.delivery_address || '',
            deliveryFee: order.delivery_fee || 0,
            completedAt: order.actual_delivery_time || '',
            rating: null // 라이더 리뷰 기능 구현 시 연동
        }))
    },

    // 수입 통계
    async getEarnings(riderId: string, days = 7): Promise<RiderEarnings> {
        const supabase = await createClient()
        const today = new Date()
        const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

        const { data } = await supabase
            .from('orders')
            .select('delivery_fee, actual_delivery_time')
            .eq('rider_id', riderId)
            .eq('status', 'delivered')
            .gte('actual_delivery_time', startDate.toISOString())

        // 일별 집계
        const dailyMap = new Map<string, { earnings: number; count: number }>()

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
            const key = d.toISOString().split('T')[0]
            dailyMap.set(key, { earnings: 0, count: 0 })
        }

        let totalEarnings = 0
        let totalCount = 0

        ;(data || []).forEach(order => {
            const key = order.actual_delivery_time?.split('T')[0]
            if (key && dailyMap.has(key)) {
                const current = dailyMap.get(key)!
                current.earnings += order.delivery_fee || 0
                current.count += 1
            }
            totalEarnings += order.delivery_fee || 0
            totalCount += 1
        })

        return {
            totalEarnings,
            deliveryCount: totalCount,
            avgPerDelivery: totalCount > 0 ? Math.round(totalEarnings / totalCount) : 0,
            dailyBreakdown: Array.from(dailyMap.entries()).map(([date, stats]) => ({
                date,
                earnings: stats.earnings,
                count: stats.count
            }))
        }
    },

    // 라이더 온라인 상태 변경
    async setAvailability(riderId: string, isAvailable: boolean): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('riders')
            .update({ is_available: isAvailable })
            .eq('id', riderId)

        return !error
    },

    // 라이더 프로필 조회
    async getRiderProfile(riderId: string) {
        const supabase = await createClient()

        const { data } = await supabase
            .from('riders')
            .select(`
        *,
        user:users(name, email, phone)
      `)
            .eq('id', riderId)
            .single()

        return data
    }
}
