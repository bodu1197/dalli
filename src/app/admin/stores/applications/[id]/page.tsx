'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Image as ImageIcon,
  Building,
  CreditCard,
  Calendar,
  ChevronRight,
} from 'lucide-react'

interface ApplicationDetail {
  id: string
  storeName: string
  storeDescription: string
  category: string
  address: string
  addressDetail: string
  phone: string
  owner: {
    name: string
    phone: string
    email: string
    idNumber: string
  }
  business: {
    number: string
    name: string
    type: string
    item: string
  }
  bank: {
    name: string
    accountNumber: string
    accountHolder: string
  }
  documents: {
    businessLicense: {
      submitted: boolean
      url?: string
      verified: boolean
    }
    bankAccount: {
      submitted: boolean
      url?: string
      verified: boolean
    }
    identityCard: {
      submitted: boolean
      url?: string
      verified: boolean
    }
  }
  deliverySettings: {
    minOrderAmount: number
    deliveryFee: number
    deliveryRadius: number
    avgDeliveryTime: number
  }
  businessHours: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  rejectionReason?: string
  appliedAt: string
  reviewedAt?: string
}

// Mock 데이터
const MOCK_APPLICATION: ApplicationDetail = {
  id: '1',
  storeName: '맛있는 파스타집',
  storeDescription: '신선한 재료로 만든 정통 이탈리안 파스타 전문점입니다.',
  category: '양식',
  address: '서울시 강남구 역삼동 123-45',
  addressDetail: '1층 101호',
  phone: '02-1234-5678',
  owner: {
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'hong@email.com',
    idNumber: '900101-*******',
  },
  business: {
    number: '123-45-67890',
    name: '맛있는 파스타',
    type: '음식점업',
    item: '파스타, 피자',
  },
  bank: {
    name: '국민은행',
    accountNumber: '123456-78-901234',
    accountHolder: '홍길동',
  },
  documents: {
    businessLicense: {
      submitted: true,
      url: '/docs/business-license.pdf',
      verified: false,
    },
    bankAccount: {
      submitted: true,
      url: '/docs/bank-account.pdf',
      verified: false,
    },
    identityCard: {
      submitted: true,
      url: '/docs/identity-card.pdf',
      verified: false,
    },
  },
  deliverySettings: {
    minOrderAmount: 15000,
    deliveryFee: 3000,
    deliveryRadius: 3,
    avgDeliveryTime: 35,
  },
  businessHours: '평일 11:00-22:00, 주말 12:00-21:00',
  status: 'reviewing',
  appliedAt: '2024-12-08T15:30:00',
}

export default function AdminApplicationDetailPage() {
  const params = useParams()
  const [application] = useState(MOCK_APPLICATION)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [documentsVerified, setDocumentsVerified] = useState({
    businessLicense: application.documents.businessLicense.verified,
    bankAccount: application.documents.bankAccount.verified,
    identityCard: application.documents.identityCard.verified,
  })

  const allDocumentsVerified =
    documentsVerified.businessLicense &&
    documentsVerified.bankAccount &&
    documentsVerified.identityCard

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[var(--color-warning-500)]" />
      case 'reviewing':
        return <FileText className="w-5 h-5 text-[var(--color-info-500)]" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-[var(--color-error-500)]" />
      default:
        return null
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleVerifyDocument = (docType: keyof typeof documentsVerified) => {
    setDocumentsVerified((prev) => ({
      ...prev,
      [docType]: !prev[docType],
    }))
  }

  const handleApprove = () => {
    // API 호출 로직
    setShowApproveModal(false)
  }

  const handleReject = () => {
    // API 호출 로직
    setShowRejectModal(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/admin/stores/applications" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            입점 심사
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {/* 상태 배너 */}
        <div className={`p-4 ${
          application.status === 'reviewing'
            ? 'bg-[var(--color-info-50)]'
            : application.status === 'pending'
            ? 'bg-[var(--color-warning-50)]'
            : application.status === 'approved'
            ? 'bg-[var(--color-success-50)]'
            : 'bg-[var(--color-error-50)]'
        }`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(application.status)}
            <div>
              <p className={`font-medium ${
                application.status === 'reviewing'
                  ? 'text-[var(--color-info-700)]'
                  : application.status === 'pending'
                  ? 'text-[var(--color-warning-700)]'
                  : application.status === 'approved'
                  ? 'text-[var(--color-success-700)]'
                  : 'text-[var(--color-error-700)]'
              }`}>
                {getStatusLabel(application.status)}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">
                신청일: {formatDate(application.appliedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* 가게 정보 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-5 h-5 text-[var(--color-primary-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">가게 정보</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">가게명</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.storeName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">카테고리</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">전화번호</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.phone}</span>
            </div>
            <div>
              <span className="text-sm text-[var(--color-neutral-500)]">주소</span>
              <p className="text-sm font-medium text-[var(--color-neutral-700)] mt-1">
                {application.address} {application.addressDetail}
              </p>
            </div>
            <div>
              <span className="text-sm text-[var(--color-neutral-500)]">소개</span>
              <p className="text-sm font-medium text-[var(--color-neutral-700)] mt-1">
                {application.storeDescription}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">영업시간</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.businessHours}</span>
            </div>
          </div>
        </section>

        {/* 점주 정보 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-[var(--color-info-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">점주 정보</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">이름</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.owner.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">연락처</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.owner.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">이메일</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.owner.email}</span>
            </div>
          </div>
        </section>

        {/* 사업자 정보 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building className="w-5 h-5 text-[var(--color-warning-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">사업자 정보</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">사업자등록번호</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.business.number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">상호</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.business.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">업태</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.business.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">업종</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.business.item}</span>
            </div>
          </div>
        </section>

        {/* 정산 계좌 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-[var(--color-success-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">정산 계좌</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">은행</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.bank.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">계좌번호</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.bank.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-neutral-500)]">예금주</span>
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">{application.bank.accountHolder}</span>
            </div>
          </div>
        </section>

        {/* 배달 설정 */}
        <section className="bg-white mt-2 p-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">배달 설정</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
              <p className="text-xs text-[var(--color-neutral-500)]">최소 주문금액</p>
              <p className="font-medium text-[var(--color-neutral-900)]">
                {application.deliverySettings.minOrderAmount.toLocaleString()}원
              </p>
            </div>
            <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
              <p className="text-xs text-[var(--color-neutral-500)]">배달비</p>
              <p className="font-medium text-[var(--color-neutral-900)]">
                {application.deliverySettings.deliveryFee.toLocaleString()}원
              </p>
            </div>
            <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
              <p className="text-xs text-[var(--color-neutral-500)]">배달 반경</p>
              <p className="font-medium text-[var(--color-neutral-900)]">
                {application.deliverySettings.deliveryRadius}km
              </p>
            </div>
            <div className="p-3 bg-[var(--color-neutral-50)] rounded-lg">
              <p className="text-xs text-[var(--color-neutral-500)]">예상 배달시간</p>
              <p className="font-medium text-[var(--color-neutral-900)]">
                약 {application.deliverySettings.avgDeliveryTime}분
              </p>
            </div>
          </div>
        </section>

        {/* 제출 서류 */}
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-[var(--color-neutral-500)]" />
            <h3 className="font-bold text-[var(--color-neutral-900)]">제출 서류</h3>
          </div>
          <div className="space-y-3">
            {/* 사업자등록증 */}
            <div className="p-3 border border-[var(--color-neutral-200)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {application.documents.businessLicense.submitted ? (
                    <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
                  )}
                  <span className="font-medium text-[var(--color-neutral-700)]">사업자등록증</span>
                </div>
                {application.documents.businessLicense.submitted && (
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[var(--color-neutral-100)] rounded-lg">
                      <Download className="w-4 h-4 text-[var(--color-neutral-500)]" />
                    </button>
                    <button
                      onClick={() => handleVerifyDocument('businessLicense')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        documentsVerified.businessLicense
                          ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
                          : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                      }`}
                    >
                      {documentsVerified.businessLicense ? '확인완료' : '확인'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 통장사본 */}
            <div className="p-3 border border-[var(--color-neutral-200)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {application.documents.bankAccount.submitted ? (
                    <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
                  )}
                  <span className="font-medium text-[var(--color-neutral-700)]">통장사본</span>
                </div>
                {application.documents.bankAccount.submitted && (
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[var(--color-neutral-100)] rounded-lg">
                      <Download className="w-4 h-4 text-[var(--color-neutral-500)]" />
                    </button>
                    <button
                      onClick={() => handleVerifyDocument('bankAccount')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        documentsVerified.bankAccount
                          ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
                          : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                      }`}
                    >
                      {documentsVerified.bankAccount ? '확인완료' : '확인'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 신분증 */}
            <div className="p-3 border border-[var(--color-neutral-200)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {application.documents.identityCard.submitted ? (
                    <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
                  )}
                  <span className="font-medium text-[var(--color-neutral-700)]">신분증</span>
                </div>
                {application.documents.identityCard.submitted && (
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[var(--color-neutral-100)] rounded-lg">
                      <Download className="w-4 h-4 text-[var(--color-neutral-500)]" />
                    </button>
                    <button
                      onClick={() => handleVerifyDocument('identityCard')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        documentsVerified.identityCard
                          ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
                          : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                      }`}
                    >
                      {documentsVerified.identityCard ? '확인완료' : '확인'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!allDocumentsVerified && (
            <p className="mt-3 text-xs text-[var(--color-warning-500)]">
              * 모든 서류 확인이 완료되어야 승인할 수 있습니다.
            </p>
          )}
        </section>
      </main>

      {/* 하단 액션 버튼 */}
      {(application.status === 'pending' || application.status === 'reviewing') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 flex gap-3">
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 py-4 bg-[var(--color-error-50)] text-[var(--color-error-600)] font-medium rounded-xl"
          >
            거절
          </button>
          <button
            onClick={() => setShowApproveModal(true)}
            disabled={!allDocumentsVerified}
            className="flex-1 py-4 bg-[var(--color-primary-500)] text-white font-bold rounded-xl disabled:bg-[var(--color-neutral-300)] disabled:cursor-not-allowed"
          >
            승인
          </button>
        </div>
      )}

      {/* 승인 모달 */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-success-100)] rounded-full mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-[var(--color-success-500)]" />
            </div>
            <h3 className="text-lg font-bold text-center text-[var(--color-neutral-900)] mb-2">
              입점 승인
            </h3>
            <p className="text-sm text-center text-[var(--color-neutral-500)] mb-4">
              <strong>{application.storeName}</strong>의<br />
              입점 신청을 승인하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-3 bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] font-medium rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-3 bg-[var(--color-success-500)] text-white font-medium rounded-xl"
              >
                승인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 거절 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-error-100)] rounded-full mx-auto mb-4">
              <XCircle className="w-6 h-6 text-[var(--color-error-500)]" />
            </div>
            <h3 className="text-lg font-bold text-center text-[var(--color-neutral-900)] mb-2">
              입점 거절
            </h3>
            <p className="text-sm text-center text-[var(--color-neutral-500)] mb-4">
              거절 사유를 입력해주세요.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="거절 사유를 입력하세요"
              className="w-full p-3 border border-[var(--color-neutral-200)] rounded-lg text-sm resize-none mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] font-medium rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 py-3 bg-[var(--color-error-500)] text-white font-medium rounded-xl disabled:bg-[var(--color-neutral-300)]"
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
