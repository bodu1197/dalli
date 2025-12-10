'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Wallet,
  Store,
  Bike,
  Calendar,
} from 'lucide-react'

interface SettlementItem {
  id: string
  type: 'owner' | 'rider'
  name: string
  storeName?: string
  bankName: string
  accountNumber: string
  amount: number
  fee: number
  netAmount: number
  status: 'pending' | 'completed'
  periodStart: string
  periodEnd: string
  settledAt?: string
}

// Mock 데이터
const MOCK_SETTLEMENTS: SettlementItem[] = [
  {
    id: '1',
    type: 'owner',
    name: '이영희',
    storeName: 'BBQ 치킨 강남점',
    bankName: '국민은행',
    accountNumber: '***-***-1234',
    amount: 2850000,
    fee: 14250,
    netAmount: 2835750,
    status: 'pending',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-08',
  },
  {
    id: '2',
    type: 'owner',
    name: '김철수',
    storeName: '맘스터치 논현점',
    bankName: '신한은행',
    accountNumber: '***-***-5678',
    amount: 1820000,
    fee: 9100,
    netAmount: 1810900,
    status: 'pending',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-08',
  },
  {
    id: '3',
    type: 'rider',
    name: '박철수',
    bankName: '카카오뱅크',
    accountNumber: '***-***-9012',
    amount: 523000,
    fee: 0,
    netAmount: 523000,
    status: 'pending',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-08',
  },
  {
    id: '4',
    type: 'owner',
    name: '최영수',
    storeName: '한솥도시락 역삼점',
    bankName: '우리은행',
    accountNumber: '***-***-3456',
    amount: 560000,
    fee: 2800,
    netAmount: 557200,
    status: 'completed',
    periodStart: '2024-11-24',
    periodEnd: '2024-12-01',
    settledAt: '2024-12-02',
  },
  {
    id: '5',
    type: 'rider',
    name: '김라이더',
    bankName: '토스뱅크',
    accountNumber: '***-***-7890',
    amount: 387000,
    fee: 0,
    netAmount: 387000,
    status: 'completed',
    periodStart: '2024-11-24',
    periodEnd: '2024-12-01',
    settledAt: '2024-12-02',
  },
]

type TypeFilter = 'all' | 'owner' | 'rider'
type StatusFilter = 'all' | 'pending' | 'completed'

export default function AdminSettlementsPage() {
  const [settlements] = useState(MOCK_SETTLEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredSettlements = settlements.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const pendingTotal = settlements
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.netAmount, 0)

  const pendingCount = settlements.filter((s) => s.status === 'pending').length

  const ownerPendingTotal = settlements
    .filter((s) => s.status === 'pending' && s.type === 'owner')
    .reduce((sum, s) => sum + s.netAmount, 0)

  const riderPendingTotal = settlements
    .filter((s) => s.status === 'pending' && s.type === 'rider')
    .reduce((sum, s) => sum + s.netAmount, 0)

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            정산 관리
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-20">
        {/* 정산 요약 */}
        <section className="p-4">
          <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm opacity-80">이번 주 정산 대기</span>
            </div>
            <p className="text-3xl font-bold mb-4">
              {pendingTotal.toLocaleString()}원
            </p>
            <div className="flex gap-6">
              <div>
                <p className="text-sm opacity-70">점주 정산</p>
                <p className="font-semibold">{ownerPendingTotal.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm opacity-70">라이더 정산</p>
                <p className="font-semibold">{riderPendingTotal.toLocaleString()}원</p>
              </div>
            </div>
          </div>
        </section>

        {/* 바로가기 */}
        <section className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/settlements/owners"
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="w-10 h-10 bg-[var(--color-success-100)] rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-[var(--color-success-500)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-neutral-900)]">점주 정산</p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  {settlements.filter((s) => s.type === 'owner' && s.status === 'pending').length}건 대기
                </p>
              </div>
            </Link>
            <Link
              href="/admin/settlements/riders"
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
                <Bike className="w-5 h-5 text-[var(--color-primary-500)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-neutral-900)]">라이더 정산</p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  {settlements.filter((s) => s.type === 'rider' && s.status === 'pending').length}건 대기
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* 필터 */}
        <div className="px-4 py-3 bg-white border-y border-[var(--color-neutral-100)]">
          {/* 검색 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 가게명 검색"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-neutral-100)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>

          {/* 타입 & 상태 필터 */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 bg-[var(--color-neutral-100)] rounded-lg text-sm focus:outline-none"
            >
              <option value="all">전체 유형</option>
              <option value="owner">점주</option>
              <option value="rider">라이더</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-[var(--color-neutral-100)] rounded-lg text-sm focus:outline-none"
            >
              <option value="all">전체 상태</option>
              <option value="pending">대기중</option>
              <option value="completed">완료</option>
            </select>
          </div>
        </div>

        {/* 정산 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {filteredSettlements.map((item) => (
            <Link
              key={item.id}
              href={`/admin/settlements/${item.id}`}
              className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.type === 'owner'
                      ? 'bg-[var(--color-success-100)]'
                      : 'bg-[var(--color-primary-100)]'
                  }`}>
                    {item.type === 'owner' ? (
                      <Store className="w-5 h-5 text-[var(--color-success-500)]" />
                    ) : (
                      <Bike className="w-5 h-5 text-[var(--color-primary-500)]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-neutral-900)]">
                        {item.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'pending'
                          ? 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
                          : 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
                      }`}>
                        {item.status === 'pending' ? '대기중' : '완료'}
                      </span>
                    </div>
                    {item.storeName && (
                      <p className="text-sm text-[var(--color-neutral-500)]">{item.storeName}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </div>

              <div className="ml-13 pl-13">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-[var(--color-neutral-500)]">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.periodStart)} ~ {formatDate(item.periodEnd)}</span>
                  </div>
                  <span className="text-[var(--color-neutral-400)]">|</span>
                  <span className="text-[var(--color-neutral-600)]">
                    {item.bankName} {item.accountNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[var(--color-neutral-500)]">
                      매출 {item.amount.toLocaleString()}원
                    </span>
                    {item.fee > 0 && (
                      <span className="text-[var(--color-error-500)]">
                        -수수료 {item.fee.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[var(--color-primary-500)]">
                    {item.netAmount.toLocaleString()}원
                  </span>
                </div>

                {item.settledAt && (
                  <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                    정산일: {new Date(item.settledAt).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredSettlements.length === 0 && (
          <div className="py-16 text-center bg-white">
            <Wallet className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">검색 결과가 없습니다</p>
          </div>
        )}

        {/* 일괄 정산 버튼 */}
        {pendingCount > 0 && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
            <button className="w-full py-4 bg-[var(--color-primary-500)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-600)] transition-colors">
              대기중인 정산 일괄 처리 ({pendingCount}건)
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
