import { getStores } from '@/lib/services/admin.service'
import AdminStoresClient from '@/components/features/admin/AdminStoresClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export default async function AdminStoresPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const search = resolvedSearchParams.search || ''

  const { data: stores, count } = await getStores({
    page,
    limit: 20,
    search,
  })

  return (
    <AdminStoresClient
      initialStores={stores}
      totalCount={count}
      currentPage={page}
      searchQuery={search}
    />
  )
}
