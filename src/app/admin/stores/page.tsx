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

  // admin.service.ts에서 'owner' 관계를 join했지만,
  // TypeScript는 이를 자동으로 인지하지 못할 수 있으므로 any 캐스팅 후 타입 단언하거나
  // 서비스 함수 반환 타입을 명확히 해야 함.
  // 여기서는 AdminStoresClient가 받는 타입에 맞다고 가정.

  return (
    <AdminStoresClient
      initialStores={(stores as any) || []}
      totalCount={count}
      currentPage={page}
      searchQuery={search}
    />
  )
}
