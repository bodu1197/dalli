'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  MapPin,
  Phone,
} from 'lucide-react'

interface ApplicationItem {
  id: string
  storeName: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  category: string
  address: string
  businessNumber: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  appliedAt: string
  documents: {
    businessLicense: boolean
    bankAccount: boolean
    identityCard: boolean
  }
}

// Mock 데이터
const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    id: '1',
    storeName: '신규 피자가게',
    ownerName: '박지민',
    ownerPhone: '010-3456-7890',
    ownerEmail: 'jimin@email.com',
    category: '피자',
    address: '서울시 서초구 서초동 345-67',
    businessNumber: '123-45-67890',
    status: 'pending',
    appliedAt: '2024-12-08T15:30:00',
    documents: {
      businessLicense: true,
      bankAccount: true,
      identityCard: true,
    },
  },
  {
    id: '2',
    storeName: '맛있는 중화요리',
    ownerName: '이중식',
    ownerPhone: '010-4567-8901',
    ownerEmail: 'chinese@email.com',
    category: '중식',
    address: '서울시 강남구 역삼동 456-78',
    businessNumber: '234-56-78901',
    status: 'reviewing',
    appliedAt: '2024-12-07T10:20:00',
    documents: {
      businessLicense: true,
      bankAccount: true,
      identityCard: false,
    },
  },
  {
    id: '3',
    storeName: '건강한 샐러드',
    ownerName: '김건강',
    ownerPhone: '010-5678-9012',
    ownerEmail: 'healthy@email.com',
    category: '샐러드',
    address: '서울시 강남구 논현동 567-89',
    businessNumber: '345-67-89012',
    status: 'pending',
    appliedAt: '2024-12-09T09:15:00',
    documents: {
      businessLicense: true,
      bankAccount: false,
      identityCard: true,
    },
  },
  {
    id: '4',
    storeName: '프리미엄 스테이크',
    ownerName: '최스테이크',
    ownerPhone: '010-6789-0123',
    ownerEmail: 'steak@email.com',
    category: '양식',
    address: '서울시 강남구 청담동 678-90',
    businessNumber: '456-78-90123',
    status: 'approved',
    appliedAt: '2024-12-05T14:00:00',
    documents: {
      businessLicense: true,
      bankAccount: true,
      identityCard: true,
    },
  },
  {
    id: '5',
    storeName: '불량 가게',
    ownerName: '정거절',
    ownerPhone: '010-7890-1234',
    ownerEmail: 'reject@email.com',
    category: '기타',
    address: '서울시 강남구 삼성동 789-01',
    businessNumber: '567-89-01234',
    status: 'rejected',
    appliedAt: '2024-12-04T11:30:00',
    documents: {
      businessLicense: false,
      bankAccount: false,
      identityCard: false,
    },
  },
]

type StatusFilter = 'all' | 'pending' | 'reviewing' | 'approved' | 'rejected'

export default function AdminStoreApplicationsPage() {
  const [applications] = useState(MOCK_APPLICATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-[var(--color-warning-500)]" />
      case 'reviewing':
        return <FileText className="w-4 h-4 text-[var(--color-info-500)]" />
      case 'approved':
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
      case 'reviewing':
        return '심사중'
      case 'approved':
        return '승인됨'
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
      case 'reviewing':
        return 'bg-[var(--color-info-100)] text-[var(--color-info-600)]'
      case 'approved':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'rejected':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
      default:
        return ''
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDocumentStatus = (docs: ApplicationItem['documents']) => {
    const total = Object.keys(docs).length
    const submitted = Object.values(docs).filter(Boolean).length
    return { submitted, total }
  }

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin/stores" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            입점 신청 관리
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
              placeholder="가게명, 점주명 검색"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {(['all', 'pending', 'reviewing', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
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
              {status === 'pending' && statusCounts.pending > 0 && (
                <span className="ml-1 text-[var(--color-error-500)]">({statusCounts.pending})</span>
              )}
              {status !== 'pending' && status !== 'all' && (
                <span className="ml-1">({statusCounts[status]})</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-20">
        {/* 신청 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {filteredApplications.map((app) => {
            const docStatus = getDocumentStatus(app.documents)
            return (
              <Link
                key={app.id}
                href={`/admin/stores/applications/${app.id}`}
                className="block px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--color-neutral-900)]">
                        {app.storeName}
                      </h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                      {app.category} · {app.ownerName}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                </div>

                <div className="space-y-1 text-sm text-[var(--color-neutral-500)]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{app.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{app.ownerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>신청일: {formatDate(app.appliedAt)}</span>
                  </div>
                </div>

                {/* 서류 제출 현황 */}
                <div className="mt-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--color-neutral-400)]" />
                  <span className={`text-sm ${
                    docStatus.submitted === docStatus.total
                      ? 'text-[var(--color-success-500)]'
                      : 'text-[var(--color-warning-500)]'
                  }`}>
                    서류 {docStatus.submitted}/{docStatus.total}건 제출
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* 빈 상태 */}
        {filteredApplications.length === 0 && (
          <div className="py-16 text-center bg-white">
            <Store className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-4" />
            <p className="text-[var(--color-neutral-500)]">
              {statusFilter === 'pending'
                ? '대기중인 입점 신청이 없습니다'
                : '검색 결과가 없습니다'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
