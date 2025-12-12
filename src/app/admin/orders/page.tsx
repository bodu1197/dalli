import { getOrders } from '@/lib/services/admin.service'
import AdminOrdersClient from '@/components/features/admin/AdminOrdersClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const search = resolvedSearchParams.search || ''
  const status = resolvedSearchParams.status || 'all'

  const { data: orders, count } = await getOrders({
    page,
    limit: 20,
    search,
    status,
  })

  // admin.service.ts에서 'customer' 관계를 join했지만,
  // TypeScript는 이를 자동으로 인지하지 못할 수 있으므로 any 캐스팅 후 전달.

  return (
    <AdminOrdersClient
      initialOrders={(orders as any) || []}
      totalCount={count}
      currentPage={page}
      searchQuery={search}
      statusFilter={status}
    />
  )
}
