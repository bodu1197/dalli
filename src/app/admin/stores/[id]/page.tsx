'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Store,
  Phone,
  MapPin,
  Clock,
  Star,
  Edit,
  Ban,
  CheckCircle,
  BarChart3,
  ShoppingBag,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
} from 'lucide-react'

interface StoreDetail {
  id: string
  name: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  phone: string
  address: string
  category: string
  description: string
  businessNumber: string
  status: 'active' | 'suspended' | 'closed'
  rating: number
  reviewCount: number
  orderCount: number
  totalRevenue: number
  monthlyRevenue: number
  deliveryFee: number
  minOrderAmount: number
  avgDeliveryTime: number
  businessHours: {
    day: string
    open: string
    close: string
    isHoliday: boolean
  }[]
  createdAt: string
  lastOrderAt: string
}

// Mock 데이터
const MOCK_STORE: StoreDetail = {
  id: '1',
  name: 'BBQ 치킨 강남점',
  ownerName: '김사장',
  ownerPhone: '010-1234-5678',
  ownerEmail: 'bbq_gangnam@email.com',
  phone: '02-1234-5678',
  address: '서울시 강남구 삼성동 123-45 1층',
  category: '치킨',
  description: '바삭한 후라이드와 양념치킨 전문점입니다. 신선한 재료만 사용합니다.',
  businessNumber: '123-45-67890',
  status: 'active',
  rating: 4.8,
  reviewCount: 1247,
  orderCount: 5680,
  totalRevenue: 285400000,
  monthlyRevenue: 24500000,
  deliveryFee: 3000,
  minOrderAmount: 15000,
  avgDeliveryTime: 35,
  businessHours: [
    { day: '월', open: '11:00', close: '22:00', isHoliday: false },
    { day: '화', open: '11:00', close: '22:00', isHoliday: false },
    { day: '수', open: '11:00', close: '22:00', isHoliday: false },
    { day: '목', open: '11:00', close: '22:00', isHoliday: false },
    { day: '금', open: '11:00', close: '23:00', isHoliday: false },
    { day: '토', open: '11:00', close: '23:00', isHoliday: false },
    { day: '일', open: '12:00', close: '21:00', isHoliday: false },
  ],
  createdAt: '2023-06-15T10:00:00',
  lastOrderAt: '2024-12-09T14:30:00',
}

const MOCK_RECENT_ORDERS = [
  { id: '1', orderNumber: 'ORD-12850', amount: 32000, status: 'delivering', createdAt: '2024-12-09T14:30:00' },
  { id: '2', orderNumber: 'ORD-12845', amount: 28000, status: 'completed', createdAt: '2024-12-09T13:15:00' },
  { id: '3', orderNumber: 'ORD-12840', amount: 45000, status: 'completed', createdAt: '2024-12-09T12:00:00' },
]

const MOCK_RECENT_REVIEWS = [
  { id: '1', rating: 5, content: '항상 맛있어요!', userName: '김**', createdAt: '2024-12-09T14:00:00' },
  { id: '2', rating: 4, content: '배달이 빨라서 좋아요', userName: '이**', createdAt: '2024-12-09T10:30:00' },
]

export default function AdminStoreDetailPage() {
  const params = useParams()
  const [store] = useState(MOCK_STORE)
  const [showSuspendModal, setShowSuspendModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'suspended':
        return 'bg-[var(--color-error-100)] text-[var(--color-error-600)]'
      case 'closed':
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
      default:
        return ''
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '영업중'
      case 'suspended':
        return '영업정지'
      case 'closed':
        return '폐업'
      default:
        return status
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivering':
        return 'text-[var(--color-primary-500)]'
      case 'completed':
        return 'text-[var(--color-success-500)]'
      default:
        return 'text-[var(--color-neutral-500)]'
    }
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'delivering':
        return '배달중'
      case 'completed':
        return '완료'
      default:
        return status
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
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
            가게 상세
          </h1>
          <button className="w-10 h-10 flex items-center justify-center -mr-2">
            <Edit className="w-5 h-5 text-[var(--color-neutral-500)]" />
          </button>
        </div>
      </header>

      <main className="pb-20">
        {/* 가게 기본 정보 */}
        <section className="bg-white p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-[var(--color-neutral-100)] rounded-xl flex items-center justify-center">
              <Store className="w-10 h-10 text-[var(--color-neutral-400)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[var(--color-neutral-900)]">{store.name}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(store.status)}`}>
                  {getStatusLabel(store.status)}
                </span>
              </div>
              <p className="text-sm text-[var(--color-neutral-500)]">{store.category}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{store.rating}</span>
                <span className="text-sm text-[var(--color-neutral-400)]">({store.reviewCount})</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--color-neutral-600)]">{store.description}</p>

          {/* 연락처 정보 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <Phone className="w-4 h-4 text-[var(--color-neutral-400)]" />
              <span>{store.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <MapPin className="w-4 h-4 text-[var(--color-neutral-400)]" />
              <span>{store.address}</span>
            </div>
          </div>
        </section>

        {/* 핵심 지표 */}
        <section className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-primary-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">총 주문</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {store.orderCount.toLocaleString()}건
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-[var(--color-success-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">총 매출</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {(store.totalRevenue / 100000000).toFixed(1)}억
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-warning-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">월 매출</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {(store.monthlyRevenue / 10000).toLocaleString()}만
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-[var(--color-info-500)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">리뷰</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-neutral-900)]">
                {store.reviewCount.toLocaleString()}개
              </p>
            </div>
          </div>
        </section>

        {/* 점주 정보 */}
        <section className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">점주 정보</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">점주명</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{store.ownerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">연락처</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{store.ownerPhone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">이메일</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{store.ownerEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">사업자등록번호</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{store.businessNumber}</span>
            </div>
          </div>
          <Link
            href={`/admin/users/owners/${store.id}`}
            className="mt-4 flex items-center justify-between p-3 bg-[var(--color-neutral-50)] rounded-lg"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--color-neutral-500)]" />
              <span className="text-sm text-[var(--color-neutral-700)]">점주 상세 정보 보기</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
          </Link>
        </section>

        {/* 영업 정보 */}
        <section className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">영업 정보</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">최소주문금액</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                {store.minOrderAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">배달비</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                {store.deliveryFee.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">평균 배달시간</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                약 {store.avgDeliveryTime}분
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">입점일</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                {formatDate(store.createdAt)}
              </span>
            </div>
          </div>

          {/* 영업시간 */}
          <div className="mt-4 p-3 bg-[var(--color-neutral-50)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[var(--color-neutral-500)]" />
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">영업시간</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {store.businessHours.map((hours) => (
                <div
                  key={hours.day}
                  className={`flex justify-between ${hours.isHoliday ? 'text-[var(--color-error-500)]' : 'text-[var(--color-neutral-600)]'}`}
                >
                  <span>{hours.day}</span>
                  <span>{hours.isHoliday ? '휴무' : `${hours.open} - ${hours.close}`}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 최근 주문 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[var(--color-neutral-900)]">최근 주문</h3>
            <Link
              href={`/admin/orders?store=${store.id}`}
              className="text-sm text-[var(--color-primary-500)]"
            >
              전체 보기
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_ORDERS.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-3 bg-[var(--color-neutral-50)] rounded-lg"
              >
                <div>
                  <p className="font-medium text-[var(--color-neutral-900)]">{order.orderNumber}</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">{formatTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--color-neutral-900)]">
                    {order.amount.toLocaleString()}원
                  </p>
                  <p className={`text-xs ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 최근 리뷰 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[var(--color-neutral-900)]">최근 리뷰</h3>
            <Link
              href={`/admin/stores/${store.id}/reviews`}
              className="text-sm text-[var(--color-primary-500)]"
            >
              전체 보기
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_REVIEWS.map((review) => (
              <div key={review.id} className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-neutral-300)]'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-neutral-500)]">{review.userName}</span>
                </div>
                <p className="text-sm text-[var(--color-neutral-700)]">{review.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 바로가기 */}
        <section className="p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">관리</h3>
          <div className="space-y-2">
            <Link
              href={`/admin/stores/${store.id}/menus`}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[var(--color-primary-500)]" />
                </div>
                <span className="font-medium text-[var(--color-neutral-900)]">메뉴 관리</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>

            <Link
              href={`/admin/settlements?store=${store.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-success-100)] rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[var(--color-success-500)]" />
                </div>
                <span className="font-medium text-[var(--color-neutral-900)]">정산 내역</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>

            <Link
              href={`/admin/analytics?store=${store.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-info-100)] rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[var(--color-info-500)]" />
                </div>
                <span className="font-medium text-[var(--color-neutral-900)]">매출 분석</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
          </div>
        </section>

        {/* 관리 액션 */}
        <section className="px-4 pb-4">
          {store.status === 'active' ? (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="w-full py-4 bg-[var(--color-error-50)] text-[var(--color-error-600)] font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <Ban className="w-5 h-5" />
              영업 정지
            </button>
          ) : (
            <button
              onClick={() => {}}
              className="w-full py-4 bg-[var(--color-success-50)] text-[var(--color-success-600)] font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              영업 재개
            </button>
          )}
        </section>
      </main>

      {/* 영업 정지 모달 */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-error-100)] rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[var(--color-error-500)]" />
            </div>
            <h3 className="text-lg font-bold text-center text-[var(--color-neutral-900)] mb-2">
              영업 정지
            </h3>
            <p className="text-sm text-center text-[var(--color-neutral-500)] mb-4">
              이 가게의 영업을 정지하시겠습니까?<br />
              정지된 가게는 고객에게 노출되지 않습니다.
            </p>
            <textarea
              placeholder="정지 사유를 입력하세요"
              className="w-full p-3 border border-[var(--color-neutral-200)] rounded-lg text-sm resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 py-3 bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] font-medium rounded-xl"
              >
                취소
              </button>
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 py-3 bg-[var(--color-error-500)] text-white font-medium rounded-xl"
              >
                정지
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
