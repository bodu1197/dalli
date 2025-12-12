import { getUserDetail } from '@/lib/services/admin.service'
import AdminCustomerDetailClient from '@/components/features/admin/AdminCustomerDetailClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUserDetail(id)

  if (!user) {
    notFound()
  }

  // user.role이 'customer'가 아닐 경우의 처리?
  // 현재 구조상 그냥 보여주거나 리다이렉트 할 수 있음. 여기선 보여줌.

  return <AdminCustomerDetailClient user={user} />
}
