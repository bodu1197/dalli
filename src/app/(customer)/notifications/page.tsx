'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, ShoppingBag, Ticket, Star, Megaphone, Trash2, Check } from 'lucide-react'

interface Notification {
  id: string
  type: 'order' | 'coupon' | 'review' | 'event' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

// Mock 알림 데이터
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: '배달이 완료되었습니다',
    message: 'BBQ 치킨 강남점에서 주문하신 음식이 도착했습니다.',
    link: '/orders/ORD001',
    isRead: false,
    createdAt: '2024-12-09T10:45:00',
  },
  {
    id: '2',
    type: 'order',
    title: '라이더가 출발했습니다',
    message: '김라이더님이 음식을 픽업하여 배달 중입니다. 곧 도착 예정입니다!',
    link: '/orders/ORD001/tracking',
    isRead: false,
    createdAt: '2024-12-09T10:30:00',
  },
  {
    id: '3',
    type: 'coupon',
    title: '새 쿠폰이 도착했습니다!',
    message: '첫 주문 3,000원 할인 쿠폰이 발급되었습니다.',
    link: '/my/coupons',
    isRead: true,
    createdAt: '2024-12-08T14:00:00',
  },
  {
    id: '4',
    type: 'review',
    title: '사장님이 답글을 남겼습니다',
    message: 'BBQ 치킨 강남점 사장님이 회원님의 리뷰에 답글을 남겼습니다.',
    link: '/my/reviews',
    isRead: true,
    createdAt: '2024-12-07T16:30:00',
  },
  {
    id: '5',
    type: 'event',
    title: '12월 특별 이벤트!',
    message: '12월 한 달간 전 메뉴 10% 할인! 놓치지 마세요.',
    isRead: true,
    createdAt: '2024-12-01T09:00:00',
  },
  {
    id: '6',
    type: 'system',
    title: '달리고 앱 업데이트 안내',
    message: '새로운 기능이 추가되었습니다. 지금 업데이트하세요!',
    isRead: true,
    createdAt: '2024-11-28T10:00:00',
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5" />
      case 'coupon':
        return <Ticket className="w-5 h-5" />
      case 'review':
        return <Star className="w-5 h-5" />
      case 'event':
        return <Megaphone className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
      case 'coupon':
        return 'bg-[var(--color-success-100)] text-[var(--color-success-600)]'
      case 'review':
        return 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]'
      case 'event':
        return 'bg-[var(--color-info-100)] text-[var(--color-info-600)]'
      default:
        return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}분 전`
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            알림
          </h1>
          <Link
            href="/settings/notifications"
            className="w-10 h-10 flex items-center justify-center -mr-2"
          >
            <Bell className="w-5 h-5 text-[var(--color-neutral-500)]" />
          </Link>
        </div>

        {/* 모두 읽음 처리 */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-t border-[var(--color-neutral-100)] flex items-center justify-between">
            <span className="text-sm text-[var(--color-neutral-500)]">
              읽지 않은 알림 {unreadCount}개
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-[var(--color-primary-500)]"
            >
              모두 읽음
            </button>
          </div>
        )}
      </header>

      {/* 알림 목록 */}
      <main className="pb-20">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Bell className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)]">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDelete={() => handleDelete(notification.id)}
                onMarkRead={() => handleMarkRead(notification.id)}
                getIcon={getIcon}
                getIconBgColor={getIconBgColor}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function NotificationItem({
  notification,
  onDelete,
  onMarkRead,
  getIcon,
  getIconBgColor,
  formatTime,
}: {
  notification: Notification
  onDelete: () => void
  onMarkRead: () => void
  getIcon: (type: string) => React.ReactNode
  getIconBgColor: (type: string) => string
  formatTime: (date: string) => string
}) {
  const [showActions, setShowActions] = useState(false)

  const content = (
    <div
      className={`flex items-start gap-3 px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)] transition-colors ${
        !notification.isRead ? 'bg-[var(--color-primary-50)]/30' : ''
      }`}
      onClick={() => {
        if (!notification.isRead) onMarkRead()
      }}
    >
      {/* 아이콘 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(
          notification.type
        )}`}
      >
        {getIcon(notification.type)}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-medium ${
              notification.isRead
                ? 'text-[var(--color-neutral-700)]'
                : 'text-[var(--color-neutral-900)]'
            }`}
          >
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full flex-shrink-0 mt-2" />
          )}
        </div>
        <p className="text-sm text-[var(--color-neutral-500)] mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-[var(--color-neutral-400)] mt-2">
          {formatTime(notification.createdAt)}
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }}
        className="p-2 -mr-2 text-[var(--color-neutral-400)] hover:text-[var(--color-error-500)]"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    )
  }

  return content
}
