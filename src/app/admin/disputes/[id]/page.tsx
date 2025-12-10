'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Store,
  Bike,
  Phone,
  Image as ImageIcon,
  ChevronRight,
  Send,
  DollarSign,
  Calendar,
  ShoppingBag,
} from 'lucide-react'

interface DisputeDetail {
  id: string
  orderNumber: string
  orderId: string
  type: 'refund' | 'complaint' | 'delay' | 'quality' | 'other'
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  customer: {
    id: string
    name: string
    phone: string
    email: string
  }
  restaurant: {
    id: string
    name: string
    phone: string
  }
  rider?: {
    id: string
    name: string
    phone: string
  }
  order: {
    amount: number
    deliveryFee: number
    items: string[]
    createdAt: string
  }
  description: string
  images?: string[]
  requestedAmount?: number
  resolvedAmount?: number
  resolution?: string
  messages: {
    id: string
    sender: 'customer' | 'admin' | 'system'
    senderName: string
    content: string
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

// Mock 데이터
const MOCK_DISPUTE: DisputeDetail = {
  id: '1',
  orderNumber: 'ORD-12840',
  orderId: 'order-1',
  type: 'refund',
  status: 'in_progress',
  priority: 'high',
  customer: {
    id: 'cust-1',
    name: '김민수',
    phone: '010-1234-5678',
    email: 'minsu@email.com',
  },
  restaurant: {
    id: 'rest-1',
    name: 'BBQ 치킨 강남점',
    phone: '02-1234-5678',
  },
  rider: {
    id: 'rider-1',
    name: '박철수',
    phone: '010-9876-5432',
  },
  order: {
    amount: 28000,
    deliveryFee: 3000,
    items: ['황금올리브 치킨 1', '콜라 1.25L 1'],
    createdAt: '2024-12-09T12:30:00',
  },
  description: '음식이 차갑게 도착했습니다. 배달이 1시간 이상 지연되어 치킨이 완전히 식어버렸습니다. 전액 환불 요청드립니다.',
  images: ['/dispute-1.jpg', '/dispute-2.jpg'],
  requestedAmount: 28000,
  messages: [
    {
      id: '1',
      sender: 'customer',
      senderName: '김민수',
      content: '음식이 차갑게 도착했습니다. 배달이 1시간 이상 지연되어 치킨이 완전히 식어버렸습니다.',
      createdAt: '2024-12-09T14:30:00',
    },
    {
      id: '2',
      sender: 'system',
      senderName: '시스템',
      content: '분쟁이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.',
      createdAt: '2024-12-09T14:30:05',
    },
    {
      id: '3',
      sender: 'admin',
      senderName: '관리자',
      content: '안녕하세요, 불편을 드려 죄송합니다. 배달 기록을 확인하고 있습니다.',
      createdAt: '2024-12-09T14:45:00',
    },
  ],
  createdAt: '2024-12-09T14:30:00',
  updatedAt: '2024-12-09T14:45:00',
}

export default function AdminDisputeDetailPage() {
  const [dispute] = useState(MOCK_DISPUTE)
  const [newMessage, setNewMessage] = useState('')
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolveType, setResolveType] = useState<'full' | 'partial' | 'reject'>('full')
  const [resolveAmount, setResolveAmount] = useState(dispute.requestedAmount || 0)
  const [resolveNote, setResolveNote] = useState('')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[var(--color-warning-500)]" />
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-[var(--color-info-500)]" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-[var(--color-error-500)]" />
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
    return date.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // API 호출 로직
    setNewMessage('')
  }

  const handleResolve = () => {
    // API 호출 로직
    setShowResolveModal(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin/disputes" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            분쟁 상세
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 분쟁 요약 */}
        <section className="bg-white p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[var(--color-neutral-900)]">{dispute.orderNumber}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(dispute.status)}`}>
                  {getStatusLabel(dispute.status)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] text-xs rounded">
                  {getTypeLabel(dispute.type)}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                  [{getPriorityLabel(dispute.priority)}]
                </span>
              </div>
            </div>
            {getStatusIcon(dispute.status)}
          </div>

          <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
            <p className="text-sm text-[var(--color-neutral-700)]">{dispute.description}</p>
          </div>

          {dispute.images && dispute.images.length > 0 && (
            <div className="mt-3 flex gap-2">
              {dispute.images.map((imageUrl) => (
                <div
                  key={`${dispute.id}-img-${imageUrl}`}
                  className="w-20 h-20 bg-[var(--color-neutral-200)] rounded-lg flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-[var(--color-neutral-400)]" />
                </div>
              ))}
            </div>
          )}

          {dispute.requestedAmount && (
            <div className="mt-3 flex items-center justify-between p-3 bg-[var(--color-error-50)] rounded-lg">
              <span className="text-sm text-[var(--color-error-600)]">요청 환불금액</span>
              <span className="font-bold text-[var(--color-error-600)]">
                {dispute.requestedAmount.toLocaleString()}원
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>접수: {formatDate(dispute.createdAt)}</span>
          </div>
        </section>

        {/* 주문 정보 */}
        <section className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">주문 정보</h3>
          <Link
            href={`/admin/orders/${dispute.orderId}`}
            className="flex items-center justify-between p-3 bg-[var(--color-neutral-50)] rounded-lg"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[var(--color-neutral-500)]" />
              <div>
                <p className="font-medium text-[var(--color-neutral-900)]">{dispute.orderNumber}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {dispute.order.items.join(', ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[var(--color-neutral-900)]">
                {(dispute.order.amount + dispute.order.deliveryFee).toLocaleString()}원
              </p>
              <ChevronRight className="w-4 h-4 text-[var(--color-neutral-400)] ml-auto" />
            </div>
          </Link>
        </section>

        {/* 관련자 정보 */}
        <section className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">관련자 정보</h3>
          <div className="space-y-3">
            {/* 고객 */}
            <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--color-info-500)]" />
                  <span className="text-sm font-medium text-[var(--color-neutral-700)]">고객</span>
                </div>
                <Link
                  href={`/admin/users/customers/${dispute.customer.id}`}
                  className="text-xs text-[var(--color-primary-500)]"
                >
                  상세보기
                </Link>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-[var(--color-neutral-900)]">{dispute.customer.name}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
                  <Phone className="w-3 h-3" />
                  <a href={`tel:${dispute.customer.phone}`}>{dispute.customer.phone}</a>
                </div>
              </div>
            </div>

            {/* 가게 */}
            <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-[var(--color-warning-500)]" />
                  <span className="text-sm font-medium text-[var(--color-neutral-700)]">가게</span>
                </div>
                <Link
                  href={`/admin/stores/${dispute.restaurant.id}`}
                  className="text-xs text-[var(--color-primary-500)]"
                >
                  상세보기
                </Link>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-[var(--color-neutral-900)]">{dispute.restaurant.name}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
                  <Phone className="w-3 h-3" />
                  <a href={`tel:${dispute.restaurant.phone}`}>{dispute.restaurant.phone}</a>
                </div>
              </div>
            </div>

            {/* 라이더 */}
            {dispute.rider && (
              <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bike className="w-5 h-5 text-[var(--color-success-500)]" />
                    <span className="text-sm font-medium text-[var(--color-neutral-700)]">라이더</span>
                  </div>
                  <Link
                    href={`/admin/users/riders/${dispute.rider.id}`}
                    className="text-xs text-[var(--color-primary-500)]"
                  >
                    상세보기
                  </Link>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-[var(--color-neutral-900)]">{dispute.rider.name}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${dispute.rider.phone}`}>{dispute.rider.phone}</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 대화 내역 */}
        <section className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">대화 내역</h3>
          <div className="space-y-3">
            {dispute.messages.map((message) => {
              const getMessageBgClass = (): string => {
                if (message.sender === 'admin') return 'bg-[var(--color-primary-50)] ml-8'
                if (message.sender === 'system') return 'bg-[var(--color-neutral-100)]'
                return 'bg-[var(--color-neutral-50)] mr-8'
              }

              const getSenderTextClass = (): string => {
                if (message.sender === 'admin') return 'text-[var(--color-primary-600)]'
                if (message.sender === 'system') return 'text-[var(--color-neutral-500)]'
                return 'text-[var(--color-neutral-700)]'
              }

              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${getMessageBgClass()}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${getSenderTextClass()}`}>
                      {message.senderName}
                    </span>
                    <span className="text-xs text-[var(--color-neutral-400)]">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-neutral-700)]">{message.content}</p>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* 하단 액션 영역 */}
      {dispute.status !== 'resolved' && dispute.status !== 'rejected' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 space-y-3">
          {/* 메시지 입력 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
              className="flex-1 px-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-[var(--color-primary-500)] rounded-xl flex items-center justify-center disabled:bg-[var(--color-neutral-300)]"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 처리 버튼 */}
          <button
            onClick={() => setShowResolveModal(true)}
            className="w-full py-4 bg-[var(--color-primary-500)] text-white font-bold rounded-xl"
          >
            분쟁 처리
          </button>
        </div>
      )}

      {/* 처리 모달 */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 border-b border-[var(--color-neutral-100)]">
              <h3 className="text-lg font-bold text-center text-[var(--color-neutral-900)]">
                분쟁 처리
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* 처리 유형 선택 */}
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">처리 유형</p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setResolveType('full')
                      setResolveAmount(dispute.requestedAmount || 0)
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left ${
                      resolveType === 'full'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--color-neutral-900)]">전액 환불</p>
                    <p className="text-sm text-[var(--color-neutral-500)]">
                      요청 금액 전액 환불
                    </p>
                  </button>
                  <button
                    onClick={() => setResolveType('partial')}
                    className={`w-full p-4 rounded-xl border-2 text-left ${
                      resolveType === 'partial'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--color-neutral-900)]">부분 환불</p>
                    <p className="text-sm text-[var(--color-neutral-500)]">
                      협의된 금액만 환불
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      setResolveType('reject')
                      setResolveAmount(0)
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left ${
                      resolveType === 'reject'
                        ? 'border-[var(--color-error-500)] bg-[var(--color-error-50)]'
                        : 'border-[var(--color-neutral-200)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--color-neutral-900)]">요청 거절</p>
                    <p className="text-sm text-[var(--color-neutral-500)]">
                      환불 불가 사유와 함께 거절
                    </p>
                  </button>
                </div>
              </div>

              {/* 환불 금액 */}
              {resolveType !== 'reject' && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">환불 금액</p>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
                    <input
                      type="number"
                      value={resolveAmount}
                      onChange={(e) => setResolveAmount(Number(e.target.value))}
                      disabled={resolveType === 'full'}
                      className="w-full pl-12 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] disabled:opacity-50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]">원</span>
                  </div>
                </div>
              )}

              {/* 처리 내용 */}
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  {resolveType === 'reject' ? '거절 사유' : '처리 내용'}
                </p>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder={resolveType === 'reject' ? '거절 사유를 입력하세요' : '처리 내용을 입력하세요'}
                  className="w-full p-4 bg-[var(--color-neutral-100)] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  rows={4}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t border-[var(--color-neutral-100)] flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 py-4 bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] font-medium rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleResolve}
                className={`flex-1 py-4 font-bold rounded-xl ${
                  resolveType === 'reject'
                    ? 'bg-[var(--color-error-500)] text-white'
                    : 'bg-[var(--color-primary-500)] text-white'
                }`}
              >
                {resolveType === 'reject' ? '거절하기' : '처리완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
