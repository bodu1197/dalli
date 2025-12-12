'use server'

import { revalidatePath } from 'next/cache'
import { taxInvoiceService } from '@/lib/services/tax-invoice.service'

export async function generateInvoicesAction(year: number, month: number) {
    try {
        const result = await taxInvoiceService.generateMonthlyInvoices(year, month)
        revalidatePath('/admin/tax-invoices')
        return { ...result, success: true }
    } catch (error) {
        console.error('Generate invoices action error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '세금계산서 생성 실패'
        }
    }
}

export async function issueInvoicesAction(invoiceIds: string[]) {
    try {
        const result = await taxInvoiceService.issueInvoices(invoiceIds)
        revalidatePath('/admin/tax-invoices')
        return result
    } catch (error) {
        console.error('Issue invoices action error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '세금계산서 발급 실패'
        }
    }
}

export async function cancelInvoiceAction(invoiceId: string, reason: string) {
    try {
        const result = await taxInvoiceService.cancelInvoice(invoiceId, reason)
        revalidatePath('/admin/tax-invoices')
        return result
    } catch (error) {
        console.error('Cancel invoice action error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '세금계산서 취소 실패'
        }
    }
}
