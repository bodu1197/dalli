'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Store,
  Bike,
  Calendar,
} from 'lucide-react'

interface DisputeItem {
  id: string
  orderNumber: string
  type: 'refund' | 'complaint' | 'delay' | 'quality' | 'other'
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  customer: {
    name: string
    phone: string
  }
  restaurant: {
    name: string
  }
  rider?: {
    name: string
  }
  description: string
  amount?: number
  createdAt: string
  updatedAt: string
}

// Mock 데이터
const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: '1',
    orderNumber: 'ORD-12840',
    type: 'refund',
    status: 'pending',
    priority: 'high',
    customer: { name: '김민수', phone: '010-1234-5678' },
    restaurant: { name: 'BBQ 치킨 강남점' },
    rider: { name: '박철수' },
    description: '음식이 차갑게 도착했습니다. 전액 환불 요청드립니다.',
    amount: 28000,
    createdAt: '2024-12-09T14:30:00',
    updatedAt: '2024-12-09T14:30:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-12835',
    type: 'delay',
    status: 'in_progress',
    priority: 'medium',
    customer: { name: '이영희', phone: '010-2345-6789' },
    restaurant: { name: '맘스터치 논현점' },
    description: '1시간 넘게 배달이 지연되었습니다.',
    createdAt: '2024-12-09T12:00:00',
    updatedAt: '2024-12-09T13:30:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-12820',
    type: 'quality',
    status: 'pending',
    priority: 'high',
    customer: { name: '정수진', phone: '010-3456-7890' },
    restaurant: { name: '도미노피자 삼성점' },
    description: '피자에 이물질이 있었습니다. 사진 첨부합니다.',
    amount: 35000,
    createdAt: '2024-12-09T10:20:00',
    updatedAt: '2024-12-09T10:20:00',
  },
  {
    id: '4',
    orderNumber: 'ORD-12810',
    type: 'complaint',
    status: 'resolved',
    priority: 'low',
    customer: { name: '최영수', phone: '010-4567-8901' },
    restaurant: { name: '신전떡볶이 역삼점' },
    rider: { name: '김라이더' },
    description: '라이더 불친절 신고입니다.',
    createdAt: '2024-12-08T18:00:00',
    updatedAt: '2024-12-09T09:00:00',
  },
  {
    id: '5',
    orderNumber: 'ORD-12800',
    type: 'refund',
    status: 'rejected',
    priority: 'medium',
    customer: { name: '박지민', phone: '010-5678-9012' },
    restaurant: { name: '교촌치킨 선릉점' },
    description: '단순 변심으로 환불 요청',
    amount: 22000,
    createdAt: '2024-12-08T15:30:00',
    updatedAt: '2024-12-08T17:00:00',
  },
]

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'resolved' | 'rejected'
type TypeFilter = 'all' | 'refund' | 'complaint' | 'delay' | 'quality' | 'other'

export default function AdminDisputesPage() {
  const [disputes] = useState(MOCK_DISPUTES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
    const matchesType = typeFilter === 'all' || dispute.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-[var(--color-warning-500)]" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-[var(--color-info-500)]" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-[var(--color-success-500)]" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-[var(--color-error-500)]" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중'
      case 'in_progress':
        return '처리중'
      case 'resolved':
        return '해결됨'
      case 'rejected':
        return '거절됨'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
      case 'in_progress':
        return 'bg-[var(--color-info-100)] text-[var(--color-info-600)]'
      case 'resolved':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'rejected':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
      default:
        return ''
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'refund':
        return '환불요청'
      case 'complaint':
        return '불만신고'
      case 'delay':
        return '배달지연'
      case 'quality':
        return '품질문제'
      case 'other':
        return '기타'
      default:
        return type
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-[var(--color-error-500)]'
      case 'medium':
        return 'text-[var(--color-warning-500)]'
      case 'low':
        return 'text-[var(--color-neutral-500)]'
      default:
        return ''
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '긴급'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return priority
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diff < 60) return `${diff}분 전`
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const pendingCount = disputes.filter((d) => d.status === 'pending').length
  const inProgressCount = disputes.filter((d) => d.status === 'in_progress').length

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            분쟁 처리
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
              placeholder="주문번호, 고객명, 가게명 검색"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {(['all', 'pending', 'in_progress', 'resolved', 'rejected'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
        {/* 긴급 알림 */}
        {pendingCount > 0 && statusFilter === 'all' && (
          <div className="mx-4 mt-4 p-4 bg-[var(--color-error-50)] rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-error-500)]" />
              <span className="text-sm font-medium text-[var(--color-error-700)]">
                긴급 처리 필요: 대기중 {pendingCount}건, 처리중 {inProgressCount}건
              </span>
            </div>
          </div>
        )}

        {/* 유형 필터 */}
        <div className="px-4 py-3 bg-white mt-4 border-y border-[var(--color-neutral-100)]">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <span className="text-sm text-[var(--color-neutral-500)] flex-shrink-0">유형:</span>
            {(['all', 'refund', 'complaint', 'delay', 'quality', 'other'] as TypeFilter[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm transition-colors ${
                  typeFilter === type
                    ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                }`}
              >
                {type === 'all' ? '전체' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* 분쟁 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {filteredDisputes.map((dispute) => (
            <Link
              key={dispute.id}
              href={`/admin/disputes/${dispute.id}`}
              className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[var(--color-neutral-900)]">
                      {dispute.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {getStatusLabel(dispute.status)}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      [{getPriorityLabel(dispute.priority)}]
                    </span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] text-xs rounded">
                    {getTypeLabel(dispute.type)}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </div>

              <p className="text-sm text-[var(--color-neutral-700)] line-clamp-2 mb-2">
                {dispute.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-neutral-500)]">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {dispute.customer.name}
                </span>
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  {dispute.restaurant.name}
                </span>
                {dispute.rider && (
                  <span className="flex items-center gap-1">
                    <Bike className="w-3 h-3" />
                    {dispute.rider.name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[var(--color-neutral-400)]">
                  {formatDate(dispute.createdAt)}
                </span>
                {dispute.amount && (
                  <span className="font-bold text-[var(--color-error-500)]">
                    {dispute.amount.toLocaleString()}원
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredDisputes.length === 0 && (
          <div className="py-16 text-center bg-white">
            <MessageSquare className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">
              {statusFilter === 'pending'
                ? '대기중인 분쟁이 없습니다'
                : '검색 결과가 없습니다'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
