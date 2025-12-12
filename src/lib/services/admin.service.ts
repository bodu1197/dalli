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

    // 4. 입점 대기 식당
    const { count: pendingStores } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('registration_status', 'pending')

    // 5. 분쟁/클레임 (취소 요청 등)
    const { count: pendingDisputes } = await supabase
        .from('order_cancellations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'requested')

    return {
        todayOrders,
        todaySales,
        activeUsers: activeUsers ?? 0,
        activeRiders: activeRiders ?? 0,
        pendingStores: pendingStores ?? 0,
        pendingDisputes: pendingDisputes ?? 0,
    }
}
