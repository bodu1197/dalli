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

  return (
    <AdminOrdersClient
      initialOrders={orders}
      totalCount={count}
      currentPage={page}
      searchQuery={search}
      statusFilter={status}
    />
  )
}
