import { createClient } from '@/lib/supabase/server'

export interface OwnerDashboardStats {
    todaySales: number
    todayOrders: number
    avgRating: number
    pendingOrders: number
    newReviews: number
}

export interface OwnerOrder {
    id: string
    orderNumber: string
    status: string
    customerName: string
    items: string
    totalAmount: number
    createdAt: string
}

export interface OwnerStore {
    id: string
    name: string
    address: string
    phone: string
    description: string | null
    imageUrl: string | null
    isOpen: boolean
    rating: number | null
    reviewCount: number | null
    deliveryFee: number | null
    minOrderAmount: number | null
    estimatedDeliveryTime: number | null
    businessHours: any
    categoryName: string | null
}

export interface OwnerReview {
    id: string
    rating: number
    content: string | null
    images: string[] | null
    createdAt: string
    customerName: string
    orderNumber: string | null
    reply: string | null
    replyAt: string | null
}

export interface OwnerMenuItem {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    isAvailable: boolean
    categoryName: string | null
    sortOrder: number | null
}

// 기본값 (빌드 시 DB 연결 실패 대비)
const DEFAULT_OWNER_STATS: OwnerDashboardStats = {
    todaySales: 0,
    todayOrders: 0,
    avgRating: 0,
    pendingOrders: 0,
    newReviews: 0,
}

export const ownerService = {
    // 점주의 가게 ID 조회
    async getMyRestaurantId(userId: string): Promise<string | null> {
        try {
            const supabase = await createClient()
            const { data } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', userId)
                .single()
            return data?.id || null
        } catch (error) {
            console.warn('getMyRestaurantId: DB 연결 실패')
            return null
        }
    },

    // 대시보드 통계
    async getDashboardStats(restaurantId: string): Promise<OwnerDashboardStats> {
        try {
            const supabase = await createClient()
            const today = new Date().toISOString().split('T')[0]

            // 오늘 주문 통계
            const { data: todayOrders } = await supabase
                .from('orders')
                .select('id, total_amount, status')
                .eq('restaurant_id', restaurantId)
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`)

            const todaySales = todayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
            const todayOrderCount = todayOrders?.length || 0

            // 대기 중 주문
            const { count: pendingCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', restaurantId)
                .in('status', ['pending', 'confirmed'])

            // 가게 평점
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('rating, review_count')
                .eq('id', restaurantId)
                .single()

            // 새 리뷰 (오늘)
            const { count: newReviewCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', restaurantId)
                .gte('created_at', `${today}T00:00:00`)

            return {
                todaySales,
                todayOrders: todayOrderCount,
                avgRating: restaurant?.rating || 0,
                pendingOrders: pendingCount || 0,
                newReviews: newReviewCount || 0
            }
        } catch (error) {
            console.warn('getDashboardStats: DB 연결 실패, 기본값 반환')
            return DEFAULT_OWNER_STATS
        }
    },

    // 최근 주문 목록
    async getRecentOrders(restaurantId: string, limit = 10): Promise<OwnerOrder[]> {
        try {
            const supabase = await createClient()

            const { data } = await supabase
                .from('orders')
                .select(`
            id,
            order_number,
            status,
            total_amount,
            created_at,
            user:users(name),
            order_items(menu_name, quantity)
          `)
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false })
                .limit(limit)

            return (data || []).map(order => ({
                id: order.id,
                orderNumber: order.order_number || '',
                status: order.status || 'pending',
                customerName: (order.user as { name: string } | null)?.name || '고객',
                items: (order.order_items as { menu_name: string; quantity: number }[])?.map(i => `${i.menu_name} x${i.quantity}`).join(', ') || '',
                totalAmount: order.total_amount || 0,
                createdAt: order.created_at || ''
            }))
        } catch (error) {
            console.warn('getRecentOrders: DB 연결 실패')
            return []
        }
    },

    // 가게 정보
    async getStoreInfo(restaurantId: string): Promise<OwnerStore | null> {
        try {
            const supabase = await createClient()

            const { data, error } = await supabase
                .from('restaurants')
                .select(`
            *,
            category:categories(name)
          `)
                .eq('id', restaurantId)
                .single()

            if (error || !data) return null

            return {
                id: data.id,
                name: data.name,
                address: data.address,
                phone: data.phone,
                description: data.description,
                imageUrl: data.image_url,
                isOpen: data.is_open ?? false,
                rating: data.rating,
                reviewCount: data.review_count,
                deliveryFee: data.delivery_fee,
                minOrderAmount: data.min_order_amount,
                estimatedDeliveryTime: data.estimated_delivery_time,
                businessHours: data.business_hours,
                categoryName: (data.category as unknown as { name: string } | null)?.name || null
            }
        } catch (error) {
            console.warn('getStoreInfo: DB 연결 실패')
            return null
        }
    },

    // 주문 목록 (필터링)
    async getOrders(restaurantId: string, status?: string): Promise<OwnerOrder[]> {
        const supabase = await createClient()

        let query = supabase
            .from('orders')
            .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        user:users(name),
        order_items(menu_name, quantity)
      `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data } = await query.limit(50)

        return (data || []).map(order => ({
            id: order.id,
            orderNumber: order.order_number || '',
            status: order.status || 'pending',
            customerName: (order.user as { name: string } | null)?.name || '고객',
            items: (order.order_items as { menu_name: string; quantity: number }[])?.map(i => `${i.menu_name} x${i.quantity}`).join(', ') || '',
            totalAmount: order.total_amount || 0,
            createdAt: order.created_at || ''
        }))
    },

    // 주문 상태 변경
    async updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId)

        return !error
    },

    // 리뷰 목록
    async getReviews(restaurantId: string): Promise<OwnerReview[]> {
        const supabase = await createClient()

        const { data } = await supabase
            .from('reviews')
            .select(`
        id,
        rating,
        content,
        images,
        created_at,
        owner_reply,
        owner_reply_at,
        user:users(name),
        order:orders(order_number)
      `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
            .limit(50)

        return (data || []).map(review => ({
            id: review.id,
            rating: review.rating,
            content: review.content,
            images: review.images,
            createdAt: review.created_at || '',
            customerName: (review.user as any)?.name || '고객',
            orderNumber: (review.order as any)?.order_number || null,
            reply: review.owner_reply,
            replyAt: review.owner_reply_at
        }))
    },

    // 리뷰 답글 작성
    async replyToReview(reviewId: string, reply: string): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('reviews')
            .update({
                owner_reply: reply,
                owner_reply_at: new Date().toISOString()
            })
            .eq('id', reviewId)

        return !error
    },

    // 메뉴 목록
    async getMenuItems(restaurantId: string): Promise<OwnerMenuItem[]> {
        const supabase = await createClient()

        const { data } = await supabase
            .from('menus')
            .select(`
                id,
                name,
                description,
                price,
                image_url,
                is_available,
                sort_order,
                category_id,
                category:menu_categories!menus_category_id_fkey(id, name)
            `)
            .eq('restaurant_id', restaurantId)
            .order('sort_order', { ascending: true })

        return (data || []).map(menu => ({
            id: menu.id,
            name: menu.name,
            description: menu.description,
            price: menu.price,
            imageUrl: menu.image_url,
            isAvailable: menu.is_available ?? true,
            categoryName: (menu.category as { id: string; name: string } | null)?.name || null,
            sortOrder: menu.sort_order
        }))
    },

    // 메뉴 판매 상태 변경
    async toggleMenuAvailability(menuId: string, isAvailable: boolean): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('menus')
            .update({ is_available: isAvailable })
            .eq('id', menuId)

        return !error
    },

    // 가게 영업 상태 변경
    async toggleStoreOpen(restaurantId: string, isOpen: boolean): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('restaurants')
            .update({ is_open: isOpen })
            .eq('id', restaurantId)

        return !error
    },

    // 매출 통계 (주간)
    async getWeeklySales(restaurantId: string) {
        const supabase = await createClient()
        const today = new Date()
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

        const { data } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('restaurant_id', restaurantId)
            .gte('created_at', weekAgo.toISOString())
            .in('status', ['delivered', 'completed'])

        // 일별 집계
        const dailyMap = new Map<string, { sales: number; orders: number }>()

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
            const key = d.toISOString().split('T')[0]
            dailyMap.set(key, { sales: 0, orders: 0 })
        }

        (data || []).forEach(order => {
            const key = order.created_at?.split('T')[0]
            if (key && dailyMap.has(key)) {
                const current = dailyMap.get(key)!
                current.sales += order.total_amount || 0
                current.orders += 1
            }
        })

        return Array.from(dailyMap.entries()).map(([date, stats]) => ({
            date,
            day: ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()],
            sales: stats.sales,
            orders: stats.orders
        }))
    },

    // 인기 메뉴
    async getPopularMenus(restaurantId: string, limit = 5) {
        const supabase = await createClient()

        // order_items에서 메뉴별 주문 수 집계
        const { data } = await supabase
            .from('order_items')
            .select(`
        menu_id,
        quantity,
        menu:menus(name, price)
      `)
            .eq('restaurant_id', restaurantId)

        const menuMap = new Map<string, { name: string; count: number; revenue: number }>()

        ;(data || []).forEach(item => {
            if (!item.menu_id) return
            const existing = menuMap.get(item.menu_id)
            const menuData = item.menu as { name: string; price: number } | null
            if (existing) {
                existing.count += item.quantity || 1
                existing.revenue += (menuData?.price || 0) * (item.quantity || 1)
            } else {
                menuMap.set(item.menu_id, {
                    name: menuData?.name || '메뉴',
                    count: item.quantity || 1,
                    revenue: (menuData?.price || 0) * (item.quantity || 1)
                })
            }
        })

        const menuArray = Array.from(menuMap.values())
        return menuArray
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
    }
}
