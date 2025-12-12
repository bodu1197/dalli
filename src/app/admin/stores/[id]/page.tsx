import { getStoreDetail } from '@/lib/services/admin.service'
import AdminStoreDetailClient from '@/components/features/admin/AdminStoreDetailClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminStoreDetailPage({ params }: PageProps) {
  const { id } = await params
  const store = await getStoreDetail(id)

  if (!store) {
    notFound()
  }

  return <AdminStoreDetailClient store={store} />
}
