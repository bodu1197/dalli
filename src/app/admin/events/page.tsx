'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Gift,
  Percent,
  Clock,
  Users,
  ChevronDown
} from 'lucide-react'

interface EventItem {
  id: string
  title: string
  description: string
  type: 'discount' | 'freeDelivery' | 'coupon' | 'point' | 'special'
  status: 'upcoming' | 'active' | 'ended'
  isVisible: boolean
  startDate: string
  endDate: string
  targetUsers: 'all' | 'new' | 'vip' | 'dormant'
  participantCount: number
  imageUrl: string
  createdAt: string
}

const mockEvents: EventItem[] = [
  {
    id: 'EVT001',
    title: '신규 가입 50% 할인',
    description: '신규 회원 첫 주문 50% 할인 이벤트',
    type: 'discount',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    targetUsers: 'new',
    participantCount: 1523,
    imageUrl: '/events/new-user.jpg',
    createdAt: '2024-01-01'
  },
  {
    id: 'EVT002',
    title: '무료 배달 페스티벌',
    description: '이번 주말 모든 주문 무료 배달',
    type: 'freeDelivery',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    targetUsers: 'all',
    participantCount: 3241,
    imageUrl: '/events/free-delivery.jpg',
    createdAt: '2024-01-15'
  },
  {
    id: 'EVT003',
    title: 'VIP 고객 감사 이벤트',
    description: 'VIP 등급 고객 대상 특별 쿠폰 지급',
    type: 'coupon',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    targetUsers: 'vip',
    participantCount: 245,
    imageUrl: '/events/vip.jpg',
    createdAt: '2024-01-10'
  },
  {
    id: 'EVT004',
    title: '포인트 2배 적립',
    description: '주문 금액의 2배 포인트 적립',
    type: 'point',
    status: 'upcoming',
    isVisible: false,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    targetUsers: 'all',
    participantCount: 0,
    imageUrl: '/events/double-point.jpg',
    createdAt: '2024-01-18'
  },
  {
    id: 'EVT005',
    title: '설날 특별 이벤트',
    description: '설날 연휴 특별 할인 및 쿠폰 증정',
    type: 'special',
    status: 'ended',
    isVisible: false,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    targetUsers: 'all',
    participantCount: 5621,
    imageUrl: '/events/newyear.jpg',
    createdAt: '2023-12-20'
  },
  {
    id: 'EVT006',
    title: '휴면 고객 복귀 이벤트',
    description: '3개월 이상 미이용 고객 대상 30% 할인',
    type: 'discount',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    targetUsers: 'dormant',
    participantCount: 128,
    imageUrl: '/events/comeback.jpg',
    createdAt: '2024-01-05'
  }
]

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>(mockEvents)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'ended'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'discount' | 'freeDelivery' | 'coupon' | 'point' | 'special'>('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; event: EventItem | null }>({
    isOpen: false,
    event: null
  })

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesType = typeFilter === 'all' || event.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-500)' }
      case 'upcoming':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary-500)' }
      case 'ended':
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중'
      case 'upcoming': return '예정'
      case 'ended': return '종료'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent size={16} />
      case 'freeDelivery': return <Gift size={16} />
      case 'coupon': return <Gift size={16} />
      case 'point': return <Gift size={16} />
      case 'special': return <Gift size={16} />
      default: return <Gift size={16} />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'discount': return '할인'
      case 'freeDelivery': return '무료배달'
      case 'coupon': return '쿠폰'
      case 'point': return '포인트'
      case 'special': return '특별'
      default: return type
    }
  }

  const getTargetText = (target: string) => {
    switch (target) {
      case 'all': return '전체'
      case 'new': return '신규'
      case 'vip': return 'VIP'
      case 'dormant': return '휴면'
      default: return target
    }
  }

  const toggleVisibility = (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, isVisible: !event.isVisible } : event
    ))
  }

  const handleDelete = () => {
    if (deleteModal.event) {
      setEvents(prev => prev.filter(e => e.id !== deleteModal.event!.id))
      setDeleteModal({ isOpen: false, event: null })
    }
  }

  const stats = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ended: events.filter(e => e.status === 'ended').length
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
              이벤트 관리
            </h1>
          </div>
          <Link
            href="/admin/events/new"
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
            이벤트 등록
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
              {stats.active}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>진행중</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-500)' }}>
              {stats.upcoming}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>예정</div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>
              {stats.ended}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>종료</div>
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
            placeholder="이벤트 검색..."
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
              <option value="active">진행중</option>
              <option value="upcoming">예정</option>
              <option value="ended">종료</option>
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
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
              <option value="all">전체 유형</option>
              <option value="discount">할인</option>
              <option value="freeDelivery">무료배달</option>
              <option value="coupon">쿠폰</option>
              <option value="point">포인트</option>
              <option value="special">특별</option>
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

        {/* Event List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredEvents.map(event => {
            const statusStyle = getStatusStyle(event.status)

            return (
              <div
                key={event.id}
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '12px',
                  padding: '16px',
                  opacity: event.isVisible ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {getStatusText(event.status)}
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
                      {getTypeIcon(event.type)}
                      {getTypeText(event.type)}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {event.id}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px'
                }}>
                  {event.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '12px'
                }}>
                  {event.description}
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
                      {event.startDate} ~ {event.endDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} color="var(--color-text-tertiary)" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      대상: {getTargetText(event.targetUsers)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="var(--color-text-tertiary)" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      참여: {event.participantCount.toLocaleString()}명
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <button
                    onClick={() => toggleVisibility(event.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: event.isVisible ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: event.isVisible ? 'var(--color-text-secondary)' : 'var(--color-success-500)',
                      cursor: 'pointer'
                    }}
                  >
                    {event.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    {event.isVisible ? '숨김' : '노출'}
                  </button>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
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
                    onClick={() => setDeleteModal({ isOpen: true, event })}
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

        {filteredEvents.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-tertiary)'
          }}>
            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>이벤트가 없습니다</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.event && (
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
              이벤트 삭제
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              "{deleteModal.event.title}" 이벤트를 삭제하시겠습니까?
              <br />
              <span style={{ color: 'var(--color-error-500)', fontSize: '13px' }}>
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, event: null })}
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
