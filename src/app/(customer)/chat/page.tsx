'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, RefreshCw, Loader2 } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { useChatRooms } from '@/hooks/useChat'
import type { ChatRoomListItem } from '@/types/chat.types'

/**
 * 채팅방 제목 생성
 */
function getChatRoomTitle(room: ChatRoomListItem): string {
  // 주문 관련 채팅방인 경우 주문 정보에서 가게명 사용
  if (room.order?.restaurantName) {
    return room.order.restaurantName
  }
  // 고객센터 채팅방
  if (room.type === 'support') {
    return '달리고 고객센터'
  }
  // 참여자 이름으로 제목 생성 (자신 제외)
  const otherParticipants = room.participants.filter(p => p.role !== 'customer')
  if (otherParticipants.length > 0) {
    return otherParticipants.map(p => p.name).join(', ')
  }
  return '채팅방'
}

export default function ChatListPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { rooms, isLoading, error, refetch } = useChatRooms()

  useEffect(() => {
    if (authLoading || isAuthenticated) {
      return
    }
    router.push('/login?redirect=/chat')
  }, [authLoading, isAuthenticated, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffDays === 1) {
      return '어제'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('ko-KR', { weekday: 'short' })
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
            채팅
          </h1>
          <button
            onClick={() => refetch()}
            className="w-10 h-10 flex items-center justify-center -mr-2"
            disabled={isLoading}
            aria-label="새로고침"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--color-neutral-500)] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 채팅 목록 */}
      <main className="pb-20">
        {/* 로딩 상태 */}
        {isLoading && rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-[var(--color-primary-500)] animate-spin mb-4" />
            <p className="text-[var(--color-neutral-500)]">채팅방을 불러오는 중...</p>
          </div>
        ) : error ? (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <MessageCircle className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)] mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium"
            >
              다시 시도
            </button>
          </div>
        ) : rooms.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <MessageCircle className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)]">
              채팅 내역이 없습니다
            </p>
          </div>
        ) : (
          /* 채팅방 목록 */
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center gap-3 px-4 py-4 bg-white hover:bg-[var(--color-neutral-50)] transition-colors"
              >
                {/* 아바타 */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center">
                    {room.type === 'support' ? (
                      <span className="text-xl">💬</span>
                    ) : (
                      <span className="text-xl">🍽️</span>
                    )}
                  </div>
                  {room.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </span>
                  )}
                </div>

                {/* 채팅 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] truncate">
                      {getChatRoomTitle(room)}
                    </h3>
                    {room.lastMessage && (
                      <span className="text-xs text-[var(--color-neutral-400)] flex-shrink-0 ml-2">
                        {formatTime(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm truncate ${
                      room.unreadCount > 0
                        ? 'text-[var(--color-neutral-700)] font-medium'
                        : 'text-[var(--color-neutral-500)]'
                    }`}
                  >
                    {room.lastMessage?.message || '메시지가 없습니다'}
                  </p>
                  {room.orderId && (
                    <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                      주문번호: {room.orderId.slice(0, 8)}...
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
