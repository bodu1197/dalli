import { getRiderDetail } from '@/lib/services/admin.service'
import AdminRiderDetailClient from '@/components/features/admin/AdminRiderDetailClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminRiderDetailPage({ params }: PageProps) {
  const { id } = await params
  const rider = await getRiderDetail(id)

  if (!rider) {
    notFound()
  }

  return <AdminRiderDetailClient rider={rider} />
}
