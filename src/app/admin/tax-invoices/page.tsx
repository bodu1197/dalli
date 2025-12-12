import { taxInvoiceService } from '@/lib/services/tax-invoice.service'
import AdminTaxInvoicesClient from '@/components/features/admin/AdminTaxInvoicesClient'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ status?: string; month?: string; page?: string }>
}

export default async function TaxInvoicesPage({ searchParams }: PageProps) {
    const params = await searchParams
    const status = params.status || 'all'
    const month = params.month
    const page = parseInt(params.page || '1', 10)

    const [invoicesResult, stats] = await Promise.all([
        taxInvoiceService.getTaxInvoices({ status, month, page, limit: 50 }),
        taxInvoiceService.getStats()
    ])

    return (
        <AdminTaxInvoicesClient
            initialInvoices={invoicesResult.data}
            totalCount={invoicesResult.count}
            currentPage={page}
            stats={stats}
            currentStatus={status}
            currentMonth={month}
        />
    )
}
