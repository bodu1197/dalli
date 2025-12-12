'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { TaxInvoice, TaxInvoiceStats } from '@/lib/services/tax-invoice.service'
import { generateInvoicesAction, issueInvoicesAction } from '@/app/admin/tax-invoices/actions'
import {
    FileText,
    Search,
    Download,
    Send,
    RefreshCw,
    ChevronRight,
    Printer,
    CalendarDays,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface AdminTaxInvoicesClientProps {
    initialInvoices: TaxInvoice[]
    totalCount: number
    currentPage: number
    stats: TaxInvoiceStats
    currentStatus: string
    currentMonth?: string
}

export default function AdminTaxInvoicesClient({
    initialInvoices,
    totalCount,
    currentPage,
    stats,
    currentStatus,
    currentMonth
}: AdminTaxInvoicesClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showDetailModal, setShowDetailModal] = useState<TaxInvoice | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isIssuing, setIsIssuing] = useState(false)

    // URL 파라미터 업데이트
    const updateParams = (updates: Record<string, string>) => {
        const params = new URLSearchParams(window.location.search)
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value)
            else params.delete(key)
        })
        router.push(`?${params.toString()}`)
    }

    // Tab 변경
    const handleTabChange = (status: string) => {
        updateParams({ status, page: '1' })
    }

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.size === initialInvoices.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(initialInvoices.map(i => i.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    // 자동 집계
    const handleGenerate = async () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        if (!confirm(`${year}년 ${month}월 세금계산서를 생성하시겠습니까?`)) return

        setIsGenerating(true)
        try {
            const result = await generateInvoicesAction(year, month)
            if (result.success) {
                alert(result.message)
                startTransition(() => router.refresh())
            } else {
                alert(result.error || '생성 실패')
            }
        } finally {
            setIsGenerating(false)
        }
    }

    // 발급
    const handleIssue = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`${selectedIds.size}건의 세금계산서를 국세청으로 전송하시겠습니까?`)) return

        setIsIssuing(true)
        try {
            const result = await issueInvoicesAction(Array.from(selectedIds))
            if (result.success) {
                alert(result.message)
                setSelectedIds(new Set())
                startTransition(() => router.refresh())
            } else {
                alert(result.error || '발급 실패')
            }
        } finally {
            setIsIssuing(false)
        }
    }

    // 포맷팅
    const formatMoney = (val: number) => val.toLocaleString()
    const formatDate = (val: string) => new Date(val).toLocaleDateString('ko-KR')

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] text-[var(--color-neutral-900)]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)] px-4 sm:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <FileText className="w-6 h-6 text-[var(--color-primary-600)]" />
                    <h1 className="text-lg font-bold">세금계산서 관리</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || isPending}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-[var(--color-neutral-200)] rounded-lg text-sm font-medium hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isGenerating ? '집계 중...' : '월간 집계'}</span>
                    </button>
                    <button
                        onClick={handleIssue}
                        disabled={selectedIds.size === 0 || isIssuing || isPending}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIds.size > 0 && !isIssuing
                                ? 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
                                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] cursor-not-allowed'
                            }`}
                    >
                        {isIssuing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="hidden sm:inline">발급 ({selectedIds.size})</span>
                    </button>
                </div>
            </header>

            <main className="p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="text-sm text-[var(--color-neutral-500)] mb-1">발급 대기</div>
                        <div className="text-xl sm:text-2xl font-bold">{stats.draftCount}건</div>
                        <div className="text-xs text-[var(--color-neutral-400)] mt-1">
                            ₩{formatMoney(stats.draftAmount)}
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="text-sm text-[var(--color-neutral-500)] mb-1">발급 완료</div>
                        <div className="text-xl sm:text-2xl font-bold text-[var(--color-success-600)]">
                            {stats.issuedCount}건
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="text-sm text-[var(--color-neutral-500)] mb-1">전송 실패</div>
                        <div className="text-xl sm:text-2xl font-bold text-[var(--color-error-600)]">
                            {stats.failedCount}건
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[var(--color-neutral-100)] shadow-sm">
                        <div className="text-sm text-[var(--color-neutral-500)] mb-1">전체</div>
                        <div className="text-xl sm:text-2xl font-bold">{totalCount}건</div>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex bg-white p-1 rounded-lg border border-[var(--color-neutral-200)] w-full sm:w-auto">
                        {(['all', 'draft', 'issued'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentStatus === tab
                                        ? 'bg-[var(--color-neutral-900)] text-white shadow-sm'
                                        : 'text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)]'
                                    }`}
                            >
                                {{ all: '전체', draft: '대기', issued: '완료' }[tab]}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neutral-400)]" />
                        <input
                            type="text"
                            placeholder="상호명 검색"
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-[var(--color-neutral-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        />
                    </div>
                </div>

                {/* Invoice List - Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                    {initialInvoices.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-[var(--color-neutral-500)]">
                            세금계산서 내역이 없습니다.
                        </div>
                    ) : (
                        initialInvoices.map(inv => (
                            <div
                                key={inv.id}
                                className="bg-white rounded-xl p-4 border border-[var(--color-neutral-100)] shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(inv.id)}
                                            onChange={() => toggleSelect(inv.id)}
                                            className="rounded border-gray-300"
                                        />
                                        <div>
                                            <div className="font-medium">{inv.buyer_name}</div>
                                            <div className="text-xs text-gray-500">{inv.buyer_biz_number}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === 'issued'
                                            ? 'bg-green-100 text-green-700'
                                            : inv.status === 'draft'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                        {inv.status === 'issued' ? '완료' : '대기'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-gray-500">{formatDate(inv.write_date)}</div>
                                    <div className="text-right">
                                        <div className="font-bold">₩{formatMoney(inv.total_amount)}</div>
                                        <button
                                            onClick={() => setShowDetailModal(inv)}
                                            className="text-xs text-blue-600 mt-1"
                                        >
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Invoice List - Desktop Table */}
                <div className="hidden sm:block bg-white border border-[var(--color-neutral-200)] rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
                            <tr>
                                <th className="px-6 py-3 w-12">
                                    <input
                                        type="checkbox"
                                        checked={initialInvoices.length > 0 && selectedIds.size === initialInvoices.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                                    />
                                </th>
                                <th className="px-6 py-3 font-semibold text-[var(--color-neutral-600)]">작성일자</th>
                                <th className="px-6 py-3 font-semibold text-[var(--color-neutral-600)]">공급받는자</th>
                                <th className="px-6 py-3 font-semibold text-[var(--color-neutral-600)] text-right">공급가액</th>
                                <th className="px-6 py-3 font-semibold text-[var(--color-neutral-600)] text-right">세액</th>
                                <th className="px-6 py-3 font-semibold text-[var(--color-neutral-600)] text-right">합계</th>
                                <th className="px-6 py-3 font-semibold text-[var(--color-neutral-600)] text-center">상태</th>
                                <th className="px-6 py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-neutral-100)]">
                            {initialInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-[var(--color-neutral-500)]">
                                        세금계산서 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                initialInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-[var(--color-neutral-50)] transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(inv.id)}
                                                onChange={() => toggleSelect(inv.id)}
                                                className="rounded border-gray-300 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-neutral-600)]">{formatDate(inv.write_date)}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[var(--color-neutral-900)]">{inv.buyer_name}</div>
                                            <div className="text-xs text-[var(--color-neutral-500)]">{inv.buyer_biz_number}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums">{formatMoney(inv.supply_cost)}</td>
                                        <td className="px-6 py-4 text-right tabular-nums">{formatMoney(inv.tax)}</td>
                                        <td className="px-6 py-4 text-right tabular-nums font-bold">{formatMoney(inv.total_amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'issued'
                                                    ? 'bg-[var(--color-success-100)] text-[var(--color-success-700)]'
                                                    : inv.status === 'draft'
                                                        ? 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)]'
                                                        : 'bg-[var(--color-error-100)] text-[var(--color-error-700)]'
                                                }`}>
                                                {inv.status === 'issued' ? '발급완료' : inv.status === 'draft' ? '작성대기' : '실패'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setShowDetailModal(inv)}
                                                className="text-[var(--color-neutral-400)] hover:text-[var(--color-primary-600)] p-1 rounded hover:bg-[var(--color-primary-50)] transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > 50 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex gap-2">
                            {Array.from({ length: Math.ceil(totalCount / 50) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => updateParams({ page: page.toString() })}
                                    className={`w-8 h-8 rounded-lg text-sm ${currentPage === page
                                            ? 'bg-[var(--color-primary-600)] text-white'
                                            : 'bg-white border hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Invoice Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100">
                            <h2 className="text-lg sm:text-xl font-bold">세금계산서 상세</h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="인쇄">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="다운로드">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-8 bg-gray-50 overflow-y-auto max-h-[80vh]">
                            <div className="bg-white border-2 border-red-100 shadow-sm p-4 sm:p-8 min-h-[500px] relative">
                                {/* Invoice Header */}
                                <div className="border-b-2 border-red-500 pb-4 mb-6">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-red-500 tracking-[0.3em] sm:tracking-[0.5em] text-center">
                                        전자세금계산서
                                    </div>
                                    {showDetailModal.issue_id && (
                                        <div className="text-center text-xs text-gray-500 mt-2">
                                            승인번호: {showDetailModal.issue_id}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 border border-red-200 mb-6 text-sm">
                                    {/* Supplier */}
                                    <div className="border-b sm:border-b-0 sm:border-r border-red-200">
                                        <div className="bg-red-50 text-red-600 font-bold p-2 text-center border-b border-red-200">
                                            공급자
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">등록번호</span>
                                                {showDetailModal.supplier_biz_number}
                                            </div>
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">상호</span>
                                                {showDetailModal.supplier_name}
                                            </div>
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">성명</span>
                                                {showDetailModal.supplier_ceo_name}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Buyer */}
                                    <div>
                                        <div className="bg-red-50 text-red-600 font-bold p-2 text-center border-b border-red-200">
                                            공급받는자
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">등록번호</span>
                                                {showDetailModal.buyer_biz_number}
                                            </div>
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">상호</span>
                                                {showDetailModal.buyer_name}
                                            </div>
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">성명</span>
                                                {showDetailModal.buyer_ceo_name || '-'}
                                            </div>
                                            <div className="flex">
                                                <span className="w-16 text-gray-500">이메일</span>
                                                <span className="truncate">{showDetailModal.buyer_email || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="grid grid-cols-3 gap-0 border border-red-200 mb-6 text-center text-sm">
                                    <div className="p-2 border-r border-red-200 bg-red-50 text-red-600 font-bold">공급가액</div>
                                    <div className="p-2 border-r border-red-200 bg-red-50 text-red-600 font-bold">세액</div>
                                    <div className="p-2 bg-red-50 text-red-600 font-bold">합계금액</div>
                                    <div className="p-3 sm:p-4 border-r border-red-200 text-base sm:text-lg">
                                        {formatMoney(showDetailModal.supply_cost)}
                                    </div>
                                    <div className="p-3 sm:p-4 border-r border-red-200 text-base sm:text-lg">
                                        {formatMoney(showDetailModal.tax)}
                                    </div>
                                    <div className="p-3 sm:p-4 text-base sm:text-lg font-bold">
                                        {formatMoney(showDetailModal.total_amount)}
                                    </div>
                                </div>

                                {/* Detail Table */}
                                <div className="min-h-[120px]">
                                    <table className="w-full text-sm border-t border-b border-red-200">
                                        <thead className="bg-red-50 text-red-600">
                                            <tr>
                                                <th className="py-1 px-2 border-r border-red-100 w-16">월일</th>
                                                <th className="py-1 px-2 border-r border-red-100">품목</th>
                                                <th className="py-1 px-2 border-r border-red-100 text-right">공급가액</th>
                                                <th className="py-1 px-2 text-right">세액</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-2 px-2 border-r border-red-100 text-center">
                                                    {showDetailModal.write_date.slice(5, 10)}
                                                </td>
                                                <td className="py-2 px-2 border-r border-red-100">
                                                    {showDetailModal.remark || '플랫폼 이용 수수료'}
                                                </td>
                                                <td className="py-2 px-2 border-r border-red-100 text-right">
                                                    {formatMoney(showDetailModal.supply_cost)}
                                                </td>
                                                <td className="py-2 px-2 text-right">{formatMoney(showDetailModal.tax)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 text-center text-xs text-gray-400">
                                    {showDetailModal.status === 'issued'
                                        ? `발급일: ${showDetailModal.issued_at ? formatDate(showDetailModal.issued_at) : '-'}`
                                        : '이 문서는 아직 발급되지 않았습니다.'}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDetailModal(null)}
                                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                                닫기
                            </button>
                            {showDetailModal.status === 'draft' && (
                                <button
                                    onClick={async () => {
                                        setSelectedIds(new Set([showDetailModal.id]))
                                        setShowDetailModal(null)
                                        await handleIssue()
                                    }}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-md"
                                >
                                    발급하기
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
