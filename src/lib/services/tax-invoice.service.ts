import { createClient } from '@/lib/supabase/server'

export interface TaxInvoice {
    id: string
    issue_id: string | null
    supplier_biz_number: string
    supplier_name: string
    supplier_ceo_name: string
    supplier_address: string | null
    restaurant_id: string | null
    buyer_biz_number: string
    buyer_name: string
    buyer_ceo_name: string | null
    buyer_email: string | null
    buyer_address: string | null
    supply_cost: number
    tax: number
    total_amount: number
    write_date: string
    issue_type: string
    remark: string | null
    status: 'draft' | 'issued' | 'failed' | 'cancelled'
    issued_at: string | null
    failed_reason: string | null
    period_start: string | null
    period_end: string | null
    created_at: string
    updated_at: string
}

export interface TaxInvoiceStats {
    draftCount: number
    draftAmount: number
    issuedCount: number
    failedCount: number
}

// 빌드 시 DB 연결 실패 대비 기본값
const DEFAULT_TAX_INVOICE_STATS: TaxInvoiceStats = {
    draftCount: 0,
    draftAmount: 0,
    issuedCount: 0,
    failedCount: 0
}

// 플랫폼 정보 (상수)
const PLATFORM_INFO = {
    bizNumber: '123-45-67890',
    name: '(주)달리플랫폼',
    ceoName: '김대표',
    address: '서울시 강남구 테헤란로 123',
    businessType: '서비스업',
    businessItem: '배달대행'
}

export const taxInvoiceService = {
    // 1. 세금계산서 목록 조회
    async getTaxInvoices(params?: {
        status?: string
        month?: string
        page?: number
        limit?: number
    }) {
        try {
            const supabase = await createClient()
            const page = params?.page || 1
            const limit = params?.limit || 50
            const offset = (page - 1) * limit

            let query = supabase
                .from('tax_invoices')
                .select('*', { count: 'exact' })
                .order('write_date', { ascending: false })
                .range(offset, offset + limit - 1)

            if (params?.status && params.status !== 'all') {
                query = query.eq('status', params.status)
            }

            if (params?.month) {
                // month format: "2024-12"
                const startDate = `${params.month}-01`
                const [year, month] = params.month.split('-').map(Number)
                const endDate = new Date(year, month, 0).toISOString().split('T')[0]
                query = query.gte('write_date', startDate).lte('write_date', endDate)
            }

            const { data, error, count } = await query

            if (error) {
                console.error('Error fetching tax invoices:', error)
                return { data: [] as TaxInvoice[], count: 0, page: params?.page || 1, limit: params?.limit || 50 }
            }

            return {
                data: data as TaxInvoice[],
                count: count || 0,
                page,
                limit
            }
        } catch (error) {
            console.warn('getTaxInvoices: DB 연결 실패, 기본값 반환')
            return { data: [] as TaxInvoice[], count: 0, page: params?.page || 1, limit: params?.limit || 50 }
        }
    },

    // 2. 통계 조회
    async getStats(): Promise<TaxInvoiceStats> {
        try {
            const supabase = await createClient()

            // Draft 통계
            const { data: draftData, count: draftCount } = await supabase
                .from('tax_invoices')
                .select('total_amount', { count: 'exact' })
                .eq('status', 'draft')

            const draftAmount = draftData?.reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0

            // Issued 통계
            const { count: issuedCount } = await supabase
                .from('tax_invoices')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'issued')

            // Failed 통계
            const { count: failedCount } = await supabase
                .from('tax_invoices')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'failed')

            return {
                draftCount: draftCount || 0,
                draftAmount,
                issuedCount: issuedCount || 0,
                failedCount: failedCount || 0
            }
        } catch (error) {
            console.warn('getStats: DB 연결 실패, 기본값 반환')
            return DEFAULT_TAX_INVOICE_STATS
        }
    },

    // 3. 월간 세금계산서 자동 생성 (정산 데이터 집계)
    async generateMonthlyInvoices(year: number, month: number) {
        const supabase = await createClient()

        // 해당 월의 시작일/종료일
        const periodStart = `${year}-${month.toString().padStart(2, '0')}-01`
        const periodEnd = new Date(year, month, 0).toISOString().split('T')[0]
        const writeDate = periodEnd // 작성일자는 해당 월 말일

        // 이미 해당 월에 생성된 세금계산서가 있는지 확인
        const { data: existing } = await supabase
            .from('tax_invoices')
            .select('restaurant_id')
            .eq('period_start', periodStart)
            .eq('period_end', periodEnd)

        const existingRestaurantIds = new Set(existing?.map(e => e.restaurant_id) || [])

        // 해당 월 정산 데이터 집계 (가게별)
        const { data: settlements, error: settleError } = await supabase
            .from('settlements')
            .select(`
        restaurant_id,
        fee,
        restaurant:restaurants(id, name, phone, address, business_number, owner:users!restaurants_owner_id_fkey(name, email))
      `)
            .gte('created_at', `${periodStart}T00:00:00`)
            .lte('created_at', `${periodEnd}T23:59:59`)
            .eq('settlement_type', 'restaurant')

        if (settleError) {
            console.error('Error fetching settlements:', settleError)
            throw new Error('정산 데이터 조회 실패')
        }

        // 가게별 수수료 합산
        const aggregated = new Map<string, {
            restaurantId: string
            name: string
            bizNumber: string
            ceoName: string
            email: string
            address: string
            totalFee: number
        }>()

        for (const s of settlements || []) {
            if (!s.restaurant_id || !s.restaurant) continue
            if (existingRestaurantIds.has(s.restaurant_id)) continue // 이미 생성됨

            const rest = s.restaurant as any
            const existing = aggregated.get(s.restaurant_id)

            if (existing) {
                existing.totalFee += s.fee || 0
            } else {
                aggregated.set(s.restaurant_id, {
                    restaurantId: s.restaurant_id,
                    name: rest.name || '상호 미입력',
                    bizNumber: rest.business_number || '000-00-00000',
                    ceoName: rest.owner?.name || '대표 미입력',
                    email: rest.owner?.email || '',
                    address: rest.address || '',
                    totalFee: s.fee || 0
                })
            }
        }

        // INSERT 준비
        const newInvoices = Array.from(aggregated.values())
            .filter(a => a.totalFee > 0)
            .map(a => {
                const supplyCost = a.totalFee
                const tax = Math.round(supplyCost * 0.1) // VAT 10%

                return {
                    supplier_biz_number: PLATFORM_INFO.bizNumber,
                    supplier_name: PLATFORM_INFO.name,
                    supplier_ceo_name: PLATFORM_INFO.ceoName,
                    supplier_address: PLATFORM_INFO.address,
                    restaurant_id: a.restaurantId,
                    buyer_biz_number: a.bizNumber,
                    buyer_name: a.name,
                    buyer_ceo_name: a.ceoName,
                    buyer_email: a.email,
                    buyer_address: a.address,
                    supply_cost: supplyCost,
                    tax: tax,
                    total_amount: supplyCost + tax,
                    write_date: writeDate,
                    remark: `${month}월 플랫폼 이용 수수료`,
                    status: 'draft',
                    period_start: periodStart,
                    period_end: periodEnd
                }
            })

        if (newInvoices.length === 0) {
            return { created: 0, message: '생성할 세금계산서가 없습니다.' }
        }

        const { data: inserted, error: insertError } = await supabase
            .from('tax_invoices')
            .insert(newInvoices)
            .select()

        if (insertError) {
            console.error('Error inserting tax invoices:', insertError)
            throw new Error('세금계산서 생성 실패: ' + insertError.message)
        }

        return {
            created: inserted?.length || 0,
            message: `${inserted?.length}건의 세금계산서가 생성되었습니다.`
        }
    },

    // 4. 세금계산서 발급 (국세청 전송 시뮬레이션)
    async issueInvoices(invoiceIds: string[]) {
        const supabase = await createClient()

        // 실제 구현에서는 여기서 국세청 ASP API 호출
        // 예: Popbill, 바로빌 등의 API 연동
        // const result = await popbillApi.issueTaxInvoice(invoiceData)

        // 시뮬레이션: 승인번호 생성 및 상태 업데이트
        const now = new Date()
        const issueId = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`

        const { error } = await supabase
            .from('tax_invoices')
            .update({
                status: 'issued',
                issued_at: now.toISOString(),
                issue_id: issueId
            })
            .in('id', invoiceIds)
            .eq('status', 'draft') // 이미 발급된건 제외

        if (error) {
            console.error('Error issuing invoices:', error)
            throw new Error('세금계산서 발급 실패')
        }

        return {
            success: true,
            issuedCount: invoiceIds.length,
            message: `${invoiceIds.length}건이 발급되었습니다.`
        }
    },

    // 5. 세금계산서 취소
    async cancelInvoice(invoiceId: string, reason: string) {
        const supabase = await createClient()

        const { error } = await supabase
            .from('tax_invoices')
            .update({
                status: 'cancelled',
                failed_reason: reason
            })
            .eq('id', invoiceId)

        if (error) {
            console.error('Error cancelling invoice:', error)
            throw new Error('세금계산서 취소 실패')
        }

        return { success: true }
    },

    // 6. 단건 조회
    async getInvoiceById(id: string) {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('tax_invoices')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching invoice:', error)
            return null
        }

        return data as TaxInvoice
    }
}
