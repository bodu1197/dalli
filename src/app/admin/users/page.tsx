import { getUsers } from '@/lib/services/admin.service'
import AdminUsersClient from '@/components/features/admin/AdminUsersClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    role?: string
    status?: string // status param might exist in URL but ignored by service
  }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const search = resolvedSearchParams.search || ''
  const role = resolvedSearchParams.role || 'all'

  const { data: users, count } = await getUsers({
    page,
    limit: 20,
    search,
    role,
  })

  return (
    <AdminUsersClient
      initialUsers={users || []}
      totalCount={count}
      currentPage={page}
      searchQuery={search}
      roleFilter={role}
    />
  )
}
