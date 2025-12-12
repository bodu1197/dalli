import { getAdminStats } from '@/lib/services/admin.service'
import AdminDashboardClient from '@/components/features/admin/AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return <AdminDashboardClient initialStats={stats} />
}
