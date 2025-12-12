import { getOwnerDetail } from '@/lib/services/admin.service'
import AdminOwnerDetailClient from '@/components/features/admin/AdminOwnerDetailClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOwnerDetailPage({ params }: PageProps) {
  const { id } = await params
  const owner = await getOwnerDetail(id)

  if (!owner) {
    notFound()
  }

  return <AdminOwnerDetailClient owner={owner} />
}
