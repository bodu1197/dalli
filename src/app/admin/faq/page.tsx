'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Search,
  HelpCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'order' | 'payment' | 'delivery' | 'account' | 'coupon' | 'other'
  target: 'all' | 'customer' | 'owner' | 'rider'
  isVisible: boolean
  order: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

const mockFAQs: FAQItem[] = [
  {
    id: 'FAQ001',
    question: '주문 취소는 어떻게 하나요?',
    answer: '주문 후 음식점에서 주문을 확인하기 전까지 취소가 가능합니다. 마이페이지 > 주문내역에서 취소 버튼을 눌러주세요. 음식점에서 이미 조리를 시작한 경우 취소가 불가능할 수 있습니다.',
    category: 'order',
    target: 'customer',
    isVisible: true,
    order: 1,
    viewCount: 15234,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 'FAQ002',
    question: '결제 수단은 어떤 것이 있나요?',
    answer: '신용카드, 체크카드, 카카오페이, 네이버페이, 토스페이 등 다양한 결제 수단을 지원합니다. 현금 결제는 지원하지 않습니다.',
    category: 'payment',
    target: 'all',
    isVisible: true,
    order: 2,
    viewCount: 12453,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10'
  },
  {
    id: 'FAQ003',
    question: '배달 예상 시간은 정확한가요?',
    answer: '배달 예상 시간은 음식점의 조리 시간과 배달 거리를 기반으로 계산됩니다. 주문량이 많거나 교통 상황에 따라 실제 시간과 차이가 날 수 있습니다.',
    category: 'delivery',
    target: 'customer',
    isVisible: true,
    order: 3,
    viewCount: 9876,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12'
  },
  {
    id: 'FAQ004',
    question: '쿠폰은 어떻게 사용하나요?',
    answer: '결제 단계에서 쿠폰 적용 버튼을 누르면 보유한 쿠폰 목록이 표시됩니다. 사용 가능한 쿠폰을 선택하면 자동으로 할인이 적용됩니다.',
    category: 'coupon',
    target: 'customer',
    isVisible: true,
    order: 4,
    viewCount: 8521,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-08'
  },
  {
    id: 'FAQ005',
    question: '점주 가입은 어떻게 하나요?',
    answer: '달리고 점주 앱을 다운로드하신 후 회원가입을 진행해주세요. 사업자등록증, 영업신고증, 통장사본 등의 서류가 필요하며, 서류 검토 후 승인이 완료되면 영업이 가능합니다.',
    category: 'account',
    target: 'owner',
    isVisible: true,
    order: 5,
    viewCount: 3254,
    createdAt: '2024-01-04',
    updatedAt: '2024-01-14'
  },
  {
    id: 'FAQ006',
    question: '라이더 등록 조건이 어떻게 되나요?',
    answer: '만 18세 이상이며, 이륜차 운전면허와 개인 오토바이가 있으신 분이라면 누구나 라이더로 등록 가능합니다. 라이더 앱에서 신청서를 작성해주세요.',
    category: 'account',
    target: 'rider',
    isVisible: true,
    order: 6,
    viewCount: 2341,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-16'
  },
  {
    id: 'FAQ007',
    question: '환불은 언제 처리되나요?',
    answer: '주문 취소 시 결제 수단에 따라 환불 시점이 다릅니다. 신용카드는 3~5영업일, 체크카드는 2~3영업일, 간편결제는 1~2영업일 내에 환불됩니다.',
    category: 'payment',
    target: 'customer',
    isVisible: false,
    order: 7,
    viewCount: 0,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  }
]

export default function AdminFAQPage() {
  const [faqs, setFAQs] = useState<FAQItem[]>(mockFAQs)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'order' | 'payment' | 'delivery' | 'account' | 'coupon' | 'other'>('all')
  const [targetFilter, setTargetFilter] = useState<'all' | 'customer' | 'owner' | 'rider'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; faq: FAQItem | null }>({
    isOpen: false,
    faq: null
  })

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter
    const matchesTarget = targetFilter === 'all' || faq.target === targetFilter || faq.target === 'all'
    return matchesSearch && matchesCategory && matchesTarget
  }).sort((a, b) => a.order - b.order)

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'order': return '주문'
      case 'payment': return '결제'
      case 'delivery': return '배달'
      case 'account': return '계정'
      case 'coupon': return '쿠폰'
      case 'other': return '기타'
      default: return category
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'order':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary-500)' }
      case 'payment':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-500)' }
      case 'delivery':
        return { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }
      case 'account':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }
      case 'coupon':
        return { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
    }
  }

  const getTargetText = (target: string) => {
    switch (target) {
      case 'all': return '전체'
      case 'customer': return '고객'
      case 'owner': return '점주'
      case 'rider': return '라이더'
      default: return target
    }
  }

  const toggleVisibility = (faqId: string) => {
    setFAQs(prev => prev.map(faq =>
      faq.id === faqId ? { ...faq, isVisible: !faq.isVisible } : faq
    ))
  }

  const handleDelete = () => {
    if (deleteModal.faq) {
      setFAQs(prev => prev.filter(f => f.id !== deleteModal.faq!.id))
      setDeleteModal({ isOpen: false, faq: null })
    }
  }

  const stats = {
    total: faqs.length,
    visible: faqs.filter(f => f.isVisible).length,
    totalViews: faqs.reduce((sum, f) => sum + f.viewCount, 0)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/admin" style={{ color: 'var(--color-text-secondary)' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              FAQ 관리
            </h1>
          </div>
          <Link
            href="/admin/faq/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary-500)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Plus size={18} />
            FAQ 등록
          </Link>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>전체 FAQ</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success-500)' }}>
              {stats.visible}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>노출중</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-500)' }}>
              {(stats.totalViews / 1000).toFixed(1)}K
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>총 조회수</div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Search size={20} color="var(--color-text-tertiary)" />
          <input
            type="text"
            placeholder="FAQ 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">전체 카테고리</option>
              <option value="order">주문</option>
              <option value="payment">결제</option>
              <option value="delivery">배달</option>
              <option value="account">계정</option>
              <option value="coupon">쿠폰</option>
              <option value="other">기타</option>
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--color-text-tertiary)'
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value as typeof targetFilter)}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">전체 대상</option>
              <option value="customer">고객</option>
              <option value="owner">점주</option>
              <option value="rider">라이더</option>
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--color-text-tertiary)'
              }}
            />
          </div>
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredFAQs.map(faq => {
            const categoryStyle = getCategoryStyle(faq.category)
            const isExpanded = expandedId === faq.id

            return (
              <div
                key={faq.id}
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  opacity: faq.isVisible ? 1 : 0.6
                }}
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setExpandedId(isExpanded ? null : faq.id)
                    }
                  }}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    padding: '4px',
                    cursor: 'grab',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    <GripVertical size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: categoryStyle.bg,
                        color: categoryStyle.color
                      }}>
                        {getCategoryText(faq.category)}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {getTargetText(faq.target)}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        조회 {faq.viewCount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HelpCircle size={18} color="var(--color-primary-500)" />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)'
                      }}>
                        {faq.question}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} color="var(--color-text-tertiary)" />
                  ) : (
                    <ChevronDown size={20} color="var(--color-text-tertiary)" />
                  )}
                </button>

                {/* Answer */}
                {isExpanded && (
                  <div style={{
                    padding: '0 16px 16px 48px',
                    borderTop: '1px solid var(--color-border)'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      padding: '16px 0',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {faq.answer}
                    </p>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--color-border)'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVisibility(faq.id)
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          backgroundColor: faq.isVisible ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: faq.isVisible ? 'var(--color-text-secondary)' : 'var(--color-success-500)',
                          cursor: 'pointer'
                        }}
                      >
                        {faq.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        {faq.isVisible ? '숨김' : '노출'}
                      </button>
                      <Link
                        href={`/admin/faq/${faq.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--color-primary-500)',
                          textDecoration: 'none'
                        }}
                      >
                        <Edit size={16} />
                        수정
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteModal({ isOpen: true, faq })
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--color-error-500)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-tertiary)'
          }}>
            <HelpCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>FAQ가 없습니다</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.faq && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '340px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              FAQ 삭제
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              이 FAQ를 삭제하시겠습니까?
              <br />
              <span style={{ color: 'var(--color-error-500)', fontSize: '13px' }}>
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, faq: null })}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-white)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--color-error-500)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
