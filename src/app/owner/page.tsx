import { ownerService, OwnerDashboardStats, OwnerOrder } from '@/lib/services/owner.service'
import OwnerDashboardClient from '@/components/features/owner/OwnerDashboardClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/owner')
  }

  const restaurantId = await ownerService.getMyRestaurantId(user.id)
  if (!restaurantId) {
    // 가게가 없으면 가게 등록 페이지로
    redirect('/owner/register')
  }

  // 병렬로 데이터 fetching
  const [stats, recentOrders, storeInfo] = await Promise.all([
    ownerService.getDashboardStats(restaurantId),
    ownerService.getRecentOrders(restaurantId, 5),
    ownerService.getStoreInfo(restaurantId)
  ])

  return (
    <OwnerDashboardClient
      stats={stats}
      recentOrders={recentOrders}
      storeName={storeInfo?.name || '내 가게'}
      isOpen={storeInfo?.isOpen ?? true}
      restaurantId={restaurantId}
    />
  )
}
