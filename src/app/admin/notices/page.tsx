'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Search,
  Bell,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  ChevronDown,
  Calendar,
  Users,
  AlertCircle,
  Info,
  Megaphone
} from 'lucide-react'

interface NoticeItem {
  id: string
  title: string
  content: string
  category: 'general' | 'service' | 'event' | 'maintenance' | 'policy'
  target: 'all' | 'customer' | 'owner' | 'rider'
  status: 'published' | 'draft' | 'scheduled'
  isPinned: boolean
  isImportant: boolean
  viewCount: number
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  author: string
}

const mockNotices: NoticeItem[] = [
  {
    id: 'NTC001',
    title: '[공지] 설 연휴 배달 안내',
    content: '설 연휴 기간(2월 9일~12일) 동안 일부 음식점의 영업시간이 변경될 수 있습니다...',
    category: 'service',
    target: 'all',
    status: 'published',
    isPinned: true,
    isImportant: true,
    viewCount: 15234,
    publishedAt: '2024-01-20',
    scheduledAt: null,
    createdAt: '2024-01-18',
    author: '관리자'
  },
  {
    id: 'NTC002',
    title: '[이벤트] 신규 가입 50% 할인 이벤트',
    content: '달리고에 처음 가입하신 고객님께 첫 주문 50% 할인 혜택을 드립니다...',
    category: 'event',
    target: 'customer',
    status: 'published',
    isPinned: true,
    isImportant: false,
    viewCount: 8521,
    publishedAt: '2024-01-15',
    scheduledAt: null,
    createdAt: '2024-01-14',
    author: '마케팅팀'
  },
  {
    id: 'NTC003',
    title: '[점검] 시스템 정기 점검 안내',
    content: '서비스 품질 향상을 위한 시스템 정기 점검이 진행됩니다. 점검 시간: 1월 25일 02:00~06:00',
    category: 'maintenance',
    target: 'all',
    status: 'scheduled',
    isPinned: false,
    isImportant: true,
    viewCount: 0,
    publishedAt: null,
    scheduledAt: '2024-01-24',
    createdAt: '2024-01-20',
    author: '운영팀'
  },
  {
    id: 'NTC004',
    title: '[안내] 점주님 정산 일정 안내',
    content: '매주 화요일에 전주 정산이 진행됩니다. 정산 상세 내역은 사장님 앱에서 확인 가능합니다.',
    category: 'general',
    target: 'owner',
    status: 'published',
    isPinned: false,
    isImportant: false,
    viewCount: 3254,
    publishedAt: '2024-01-10',
    scheduledAt: null,
    createdAt: '2024-01-08',
    author: '정산팀'
  },
  {
    id: 'NTC005',
    title: '[정책] 개인정보 처리방침 개정 안내',
    content: '개인정보보호법 개정에 따라 개인정보 처리방침이 변경되었습니다...',
    category: 'policy',
    target: 'all',
    status: 'published',
    isPinned: false,
    isImportant: false,
    viewCount: 1234,
    publishedAt: '2024-01-05',
    scheduledAt: null,
    createdAt: '2024-01-03',
    author: '법무팀'
  },
  {
    id: 'NTC006',
    title: '[안내] 라이더 배달비 정산 안내',
    content: '배달비는 매일 정산되며, 출금 신청 후 익일 입금됩니다...',
    category: 'general',
    target: 'rider',
    status: 'draft',
    isPinned: false,
    isImportant: false,
    viewCount: 0,
    publishedAt: null,
    scheduledAt: null,
    createdAt: '2024-01-19',
    author: '운영팀'
  }
]

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>(mockNotices)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'service' | 'event' | 'maintenance' | 'policy'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')
  const [targetFilter, setTargetFilter] = useState<'all' | 'customer' | 'owner' | 'rider'>('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notice: NoticeItem | null }>({
    isOpen: false,
    notice: null
  })

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || notice.status === statusFilter
    const matchesTarget = targetFilter === 'all' || notice.target === targetFilter || notice.target === 'all'
    return matchesSearch && matchesCategory && matchesStatus && matchesTarget
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-500)' }
      case 'scheduled':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary-500)' }
      case 'draft':
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '게시됨'
      case 'scheduled': return '예약'
      case 'draft': return '임시저장'
      default: return status
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <Info size={14} />
      case 'service': return <Bell size={14} />
      case 'event': return <Megaphone size={14} />
      case 'maintenance': return <AlertCircle size={14} />
      case 'policy': return <Info size={14} />
      default: return <Bell size={14} />
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'general': return '일반'
      case 'service': return '서비스'
      case 'event': return '이벤트'
      case 'maintenance': return '점검'
      case 'policy': return '정책'
      default: return category
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

  const togglePinned = (noticeId: string) => {
    setNotices(prev => prev.map(notice =>
      notice.id === noticeId ? { ...notice, isPinned: !notice.isPinned } : notice
    ))
  }

  const handleDelete = () => {
    if (deleteModal.notice) {
      setNotices(prev => prev.filter(n => n.id !== deleteModal.notice!.id))
      setDeleteModal({ isOpen: false, notice: null })
    }
  }

  const stats = {
    total: notices.length,
    published: notices.filter(n => n.status === 'published').length,
    draft: notices.filter(n => n.status === 'draft').length,
    pinned: notices.filter(n => n.isPinned).length
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
              공지사항 관리
            </h1>
          </div>
          <Link
            href="/admin/notices/new"
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
            공지 등록
          </Link>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
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
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>전체</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success-500)' }}>
              {stats.published}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>게시됨</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>
              {stats.draft}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>임시저장</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-500)' }}>
              {stats.pinned}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>고정됨</div>
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
            placeholder="공지사항 검색..."
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
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', flexWrap: 'wrap' }}>
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
              <option value="general">일반</option>
              <option value="service">서비스</option>
              <option value="event">이벤트</option>
              <option value="maintenance">점검</option>
              <option value="policy">정책</option>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
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
              <option value="all">전체 상태</option>
              <option value="published">게시됨</option>
              <option value="draft">임시저장</option>
              <option value="scheduled">예약</option>
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

        {/* Notice List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotices.map(notice => {
            const statusStyle = getStatusStyle(notice.status)

            return (
              <div
                key={notice.id}
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '12px',
                  padding: '16px',
                  borderLeft: notice.isImportant ? '4px solid var(--color-error-500)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {notice.isPinned && (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-error-500)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Pin size={12} />
                        고정
                      </span>
                    )}
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {getStatusText(notice.status)}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: 'rgba(107, 114, 128, 0.1)',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getCategoryIcon(notice.category)}
                      {getCategoryText(notice.category)}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--color-primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Users size={12} />
                      {getTargetText(notice.target)}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {notice.id}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '6px'
                }}>
                  {notice.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {notice.content}
                </p>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="var(--color-text-tertiary)" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {notice.status === 'scheduled'
                        ? `예약: ${notice.scheduledAt}`
                        : notice.publishedAt || notice.createdAt}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} color="var(--color-text-tertiary)" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      조회 {notice.viewCount.toLocaleString()}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    작성자: {notice.author}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <button
                    onClick={() => togglePinned(notice.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: notice.isPinned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: notice.isPinned ? 'var(--color-error-500)' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <Pin size={16} />
                    {notice.isPinned ? '고정해제' : '고정'}
                  </button>
                  <Link
                    href={`/admin/notices/${notice.id}/edit`}
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
                    onClick={() => setDeleteModal({ isOpen: true, notice })}
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
            )
          })}
        </div>

        {filteredNotices.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-tertiary)'
          }}>
            <Bell size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>공지사항이 없습니다</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.notice && (
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
              공지사항 삭제
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              이 공지사항을 삭제하시겠습니까?
              <br />
              <span style={{ color: 'var(--color-error-500)', fontSize: '13px' }}>
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, notice: null })}
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
