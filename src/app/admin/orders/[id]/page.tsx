import { getOrderDetail } from '@/lib/services/admin.service'
import AdminOrderDetailClient from '@/components/features/admin/AdminOrderDetailClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrderDetail(id)

  if (!order) {
    notFound()
  }

  return <AdminOrderDetailClient order={order} />
}
