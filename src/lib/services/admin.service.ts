/**
 * 관리자 서비스
 * @description 관리자 전용 비즈니스 로직 (통계, 유저/식당 관리)
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

export type AdminStats = {
    todayOrders: number
    todaySales: number
    activeUsers: number
    activeRiders: number
    pendingStores: number
    pendingDisputes: number
}

/**
 * 대시보드 통계 조회
 */
export async function getAdminStats(): Promise<AdminStats> {
    const supabase = await createClient()

    // 1. 오늘 주문 수 & 매출
    const today = new Date().toISOString().split('T')[0]
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', `${today}T00:00:00`)

    const todayOrders = orders?.length ?? 0
    const todaySales = orders?.reduce((sum, order) => sum + order.total_amount, 0) ?? 0

    // 2. 활성 유저 (임시: 최근 24시간 접속 - 로그인 로그가 없으므로 전체 수로 대체하거나 추후 구현)
    // 여기서는 단순히 전체 유저 수를 가져옵니다.
    const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

    // 3. 활성 라이더 (현재 배달 가능한 라이더)
    // 라이더 배달 가능 상태 테이블이 있다면 조회, 없다면 role='rider' 카운트
    const { count: activeRiders } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'rider')

    // 4. 입점 대기 식당 (status 컬럼 부재로 전체 식당 수로 대체하거나 로직 변경)
    // 일단 전체 식당 수를 반환
    const { count: totalStores } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })

    // 5. 분쟁/클레임
    const { count: pendingDisputes } = await supabase
        .from('order_cancellations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'requested')

    return {
        todayOrders,
        todaySales,
        activeUsers: activeUsers ?? 0,
        activeRiders: activeRiders ?? 0,
        pendingStores: totalStores ?? 0, // 대기 중인 식당 대신 전체 식당 수 표시
        pendingDisputes: pendingDisputes ?? 0,
    }
}

export type AdminStoreFilter = {
    page?: number
    limit?: number
    search?: string
    status?: string
}

export async function getStores(filter: AdminStoreFilter) {
    const supabase = await createClient()
    const { page = 1, limit = 20, search } = filter
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('restaurants')
        .select('*, owner:users!restaurants_owner_id_fkey(name)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

    if (search) {
        // 가게명, 주소 검색
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    // status 필터링 불가 (컬럼 부재)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching stores:', error)
        throw new Error('가게 목록을 불러오지 못했습니다.')
    }

    return {
        data,
        count: count ?? 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
    }
}

export type AdminUserFilter = {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
}

export async function getUsers(filter: AdminUserFilter) {
    const supabase = await createClient()
    const { page = 1, limit = 20, search, role, status } = filter
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

    if (search) {
        // 검색: 이름, 이메일, 전화번호 (Supabase doesn't support OR across columns easily without RPC or specific syntax, 
        // using 'or' filter string)
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (role && role !== 'all') {
        query = query.eq('role', role)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching users:', error)
        throw new Error('회원 목록을 불러오지 못했습니다.')
    }

    return {
        data,
        count: count ?? 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
    }
}

// status 컬럼이 없으므로 일시적으로 주석 처리 또는 제거
// 추후 DB 스키마 업데이트 후 재구현 필요
/*
export async function updateUserStatus(userId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId)

  if (error) throw new Error('회원 상태 변경 실패')
}
*/

export type AdminOrderFilter = {
    page?: number
    limit?: number
    search?: string
    status?: string
}

export async function getOrders(filter: AdminOrderFilter) {
    const supabase = await createClient()
    const { page = 1, limit = 20, search, status } = filter
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('orders')
        .select('*, customer:users!orders_user_id_fkey(name)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

    if (search) {
        // 주문번호, 가게명 검색
        query = query.or(`order_number.ilike.%${search}%,restaurant_name.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching orders:', error)
        throw new Error('주문 목록을 불러오지 못했습니다.')
    }

    return {
        data,
        count: count ?? 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
    }
}

export async function getOrderDetail(orderId: string) {
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      customer:users!orders_user_id_fkey(name, phone, email),
      restaurant:restaurants!orders_restaurant_id_fkey(name, phone, address),
      items:order_items(*),
      timeline:order_status_history(*)
    `)
        .eq('id', orderId)
        .single()

    if (error) {
        console.error('Error fetching order detail:', error)
        return null
    }

    return order
}

export async function cancelOrder(orderId: string, reason: string, adminUserId: string) {
    const supabase = await createClient()

    const { error } = await supabase.rpc('process_order_cancellation', {
        p_order_id: orderId,
        p_reason: 'admin_cancelled',
        p_reason_detail: reason,
        p_user_id: adminUserId,
    })

    if (error) {
        console.error('Error cancelling order:', error)
        throw new Error(error.message || '주문 취소 실패')
    }
}
