'use client'

import Link from 'next/link'
import { ArrowLeft, Bell, ShoppingBag, Ticket, Star, Megaphone, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { useNotifications, getNotificationCategory } from '@/hooks/useNotifications'
import type { NotificationListItem, NotificationType } from '@/types/notification.types'

/**
 * 알림 타입을 UI 타입으로 매핑
 */
function getUIType(type: NotificationType): 'order' | 'coupon' | 'review' | 'event' | 'system' {
  const category = getNotificationCategory(type)
  switch (category) {
    case 'order':
    case 'cancellation':
    case 'refund':
      return 'order'
    case 'points':
      return 'coupon'
    case 'promotion':
      return 'event'
    case 'system':
    default:
      return 'system'
  }
}

/**
 * 알림 타입에 따른 링크 생성
 */
function getNotificationLink(notification: NotificationListItem): string | undefined {
  const data = notification.data as Record<string, unknown>
  const orderId = data?.orderId as string | undefined

  switch (notification.type) {
    case 'order_created':
    case 'order_confirmed':
    case 'order_preparing':
    case 'order_ready':
    case 'order_picked_up':
    case 'order_delivered':
    case 'order_cancelled':
      return orderId ? `/orders/${orderId}` : '/orders'
    case 'cancellation_requested_customer':
    case 'cancellation_requested_owner':
    case 'cancellation_instant_completed':
    case 'cancellation_approved':
    case 'cancellation_rejected':
    case 'cancellation_auto_approved':
    case 'cancellation_withdrawn':
      return orderId ? `/orders/${orderId}` : '/orders'
    case 'refund_processing':
    case 'refund_completed':
    case 'refund_failed':
      return orderId ? `/orders/${orderId}` : '/orders'
    case 'points_earned':
    case 'points_refunded':
      return '/my/points'
    case 'coupon_restored':
    case 'coupon_expiring':
      return '/my/coupons'
    case 'promotion_new':
      return '/'
    case 'review_reminder':
      return orderId ? `/orders/${orderId}/review` : '/my/reviews'
    case 'system_notice':
    default:
      return undefined
  }
}

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications()

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
  }

  const handleMarkRead = async (id: string) => {
    await markAsRead(id)
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
          <div className="flex items-center gap-1">
            <button
              onClick={() => refetch()}
              className="w-10 h-10 flex items-center justify-center"
              disabled={isLoading}
              aria-label="새로고침"
            >
              <RefreshCw className={`w-5 h-5 text-[var(--color-neutral-500)] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/settings/notifications"
              className="w-10 h-10 flex items-center justify-center -mr-2"
            >
              <Bell className="w-5 h-5 text-[var(--color-neutral-500)]" />
            </Link>
          </div>
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
        {/* 로딩 상태 */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-[var(--color-primary-500)] animate-spin mb-4" />
            <p className="text-[var(--color-neutral-500)]">알림을 불러오는 중...</p>
          </div>
        ) : error ? (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Bell className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)] mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium"
            >
              다시 시도
            </button>
          </div>
        ) : notifications.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Bell className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)]">알림이 없습니다</p>
          </div>
        ) : (
          /* 알림 목록 */
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
  notification: NotificationListItem
  onDelete: () => void
  onMarkRead: () => void
  getIcon: (type: string) => React.ReactNode
  getIconBgColor: (type: string) => string
  formatTime: (date: string) => string
}) {
  const uiType = getUIType(notification.type)
  const link = getNotificationLink(notification)

  const content = (
    <button
      type="button"
      className={`flex items-start gap-3 px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)] transition-colors w-full text-left ${
        !notification.isRead ? 'bg-[var(--color-primary-50)]/30' : ''
      }`}
      onClick={() => {
        if (!notification.isRead) onMarkRead()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!notification.isRead) onMarkRead()
        }
      }}
    >
      {/* 아이콘 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(
          uiType
        )}`}
      >
        {getIcon(uiType)}
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
          {notification.body}
        </p>
        <p className="text-xs text-[var(--color-neutral-400)] mt-2">
          {formatTime(notification.createdAt)}
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }}
        className="p-2 -mr-2 text-[var(--color-neutral-400)] hover:text-[var(--color-error-500)]"
        aria-label="알림 삭제"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </button>
  )

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    )
  }

  return content
}
