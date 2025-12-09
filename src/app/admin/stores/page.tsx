'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Star, MapPin, ChevronRight, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface StoreItem {
  id: string
  name: string
  ownerName: string
  category: string
  address: string
  phone: string
  status: 'active' | 'pending' | 'suspended' | 'rejected'
  rating: number
  reviewCount: number
  orderCount: number
  monthlyRevenue: number
  joinedAt: string
}

// Mock 데이터
const MOCK_STORES: StoreItem[] = [
  {
    id: '1',
    name: 'BBQ 치킨 강남점',
    ownerName: '이영희',
    category: '치킨',
    address: '서울시 강남구 역삼동 123-45',
    phone: '02-1234-5678',
    status: 'active',
    rating: 4.8,
    reviewCount: 234,
    orderCount: 1520,
    monthlyRevenue: 28500000,
    joinedAt: '2024-03-15',
  },
  {
    id: '2',
    name: '맘스터치 논현점',
    ownerName: '김철수',
    category: '버거',
    address: '서울시 강남구 논현동 234-56',
    phone: '02-2345-6789',
    status: 'active',
    rating: 4.5,
    reviewCount: 156,
    orderCount: 980,
    monthlyRevenue: 18200000,
    joinedAt: '2024-05-20',
  },
  {
    id: '3',
    name: '신규 피자가게',
    ownerName: '박지민',
    category: '피자',
    address: '서울시 서초구 서초동 345-67',
    phone: '02-3456-7890',
    status: 'pending',
    rating: 0,
    reviewCount: 0,
    orderCount: 0,
    monthlyRevenue: 0,
    joinedAt: '2024-12-08',
  },
  {
    id: '4',
    name: '한솥도시락 역삼점',
    ownerName: '최영수',
    category: '도시락',
    address: '서울시 강남구 역삼동 456-78',
    phone: '02-4567-8901',
    status: 'suspended',
    rating: 3.2,
    reviewCount: 45,
    orderCount: 320,
    monthlyRevenue: 5600000,
    joinedAt: '2024-01-10',
  },
  {
    id: '5',
    name: '거절된 가게',
    ownerName: '정미영',
    category: '중식',
    address: '서울시 강남구 삼성동 567-89',
    phone: '02-5678-9012',
    status: 'rejected',
    rating: 0,
    reviewCount: 0,
    orderCount: 0,
    monthlyRevenue: 0,
    joinedAt: '2024-12-01',
  },
]

type StatusFilter = 'all' | 'active' | 'pending' | 'suspended' | 'rejected'

export default function AdminStoresPage() {
  const [stores] = useState(MOCK_STORES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || store.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-[var(--color-success-500)]" />
      case 'pending':
        return <Clock className="w-4 h-4 text-[var(--color-warning-500)]" />
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-[var(--color-error-500)]" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-[var(--color-neutral-500)]" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '운영중'
      case 'pending':
        return '심사중'
      case 'suspended':
        return '정지'
      case 'rejected':
        return '거절'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[var(--color-success-500)]'
      case 'pending':
        return 'text-[var(--color-warning-500)]'
      case 'suspended':
        return 'text-[var(--color-error-500)]'
      case 'rejected':
        return 'text-[var(--color-neutral-500)]'
      default:
        return ''
    }
  }

  const pendingCount = stores.filter((s) => s.status === 'pending').length

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            가게 관리
          </h1>
          <div className="w-10" />
        </div>

        {/* 검색 */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="가게명, 점주명, 주소 검색"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {(['all', 'active', 'pending', 'suspended', 'rejected'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
              }`}
            >
              {status === 'all' ? '전체' : getStatusLabel(status)}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-1 text-[var(--color-error-500)]">({pendingCount})</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 입점 신청 알림 */}
        {pendingCount > 0 && statusFilter === 'all' && (
          <Link
            href="/admin/stores/applications"
            className="flex items-center justify-between mx-4 mt-4 p-4 bg-[var(--color-warning-50)] rounded-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
              <span className="text-sm font-medium text-[var(--color-warning-700)]">
                입점 심사 대기 {pendingCount}건
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-warning-500)]" />
          </Link>
        )}

        {/* 가게 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)] mt-4">
          {filteredStores.map((store) => (
            <Link
              key={store.id}
              href={`/admin/stores/${store.id}`}
              className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-neutral-900)]">{store.name}</h3>
                    <span className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(store.status)}`}>
                      {getStatusIcon(store.status)}
                      {getStatusLabel(store.status)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
                    {store.category} · {store.ownerName}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)] mb-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{store.address}</span>
              </div>

              {store.status === 'active' && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-[var(--color-warning-500)]">
                    <Star className="w-4 h-4 fill-current" />
                    {store.rating} ({store.reviewCount})
                  </span>
                  <span className="text-[var(--color-neutral-600)]">
                    주문 {store.orderCount.toLocaleString()}건
                  </span>
                  <span className="text-[var(--color-success-500)]">
                    월 {(store.monthlyRevenue / 10000).toFixed(0)}만원
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredStores.length === 0 && (
          <div className="py-16 text-center bg-white">
            <AlertCircle className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">검색 결과가 없습니다</p>
          </div>
        )}
      </main>
    </div>
  )
}
