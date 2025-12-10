'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'

interface ChatRoom {
  id: string
  type: 'order' | 'support'
  title: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  participants: {
    id: string
    name: string
    role: 'customer' | 'owner' | 'rider' | 'support'
    avatarUrl?: string
  }[]
  orderId?: string
  restaurantName?: string
}

// Mock 채팅방 데이터
const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: '1',
    type: 'order',
    title: 'BBQ 치킨 강남점',
    lastMessage: '네, 곧 도착할 예정입니다!',
    lastMessageAt: '2024-12-09T10:30:00',
    unreadCount: 2,
    participants: [
      { id: 'owner1', name: 'BBQ 치킨 강남점', role: 'owner' },
      { id: 'rider1', name: '김라이더', role: 'rider' },
    ],
    orderId: 'ORD001',
    restaurantName: 'BBQ 치킨 강남점',
  },
  {
    id: '2',
    type: 'order',
    title: '맥도날드 역삼점',
    lastMessage: '주문 접수되었습니다. 감사합니다!',
    lastMessageAt: '2024-12-08T14:20:00',
    unreadCount: 0,
    participants: [
      { id: 'owner2', name: '맥도날드 역삼점', role: 'owner' },
    ],
    orderId: 'ORD002',
    restaurantName: '맥도날드 역삼점',
  },
  {
    id: '3',
    type: 'support',
    title: '달리고 고객센터',
    lastMessage: '문의해 주셔서 감사합니다. 확인 후 답변드리겠습니다.',
    lastMessageAt: '2024-12-07T09:15:00',
    unreadCount: 1,
    participants: [
      { id: 'support1', name: '고객센터', role: 'support' },
    ],
  },
]

export default function ChatListPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return
    }
    router.push('/login?redirect=/chat')
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    // Continue rendering
  } else {
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
          <div className="w-10" />
        </div>
      </header>

      {/* 채팅 목록 */}
      <main className="pb-20">
        {MOCK_CHAT_ROOMS.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <MessageCircle className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)]">
              채팅 내역이 없습니다
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {MOCK_CHAT_ROOMS.map((room) => (
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
                      {room.title}
                    </h3>
                    <span className="text-xs text-[var(--color-neutral-400)] flex-shrink-0 ml-2">
                      {formatTime(room.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      room.unreadCount > 0
                        ? 'text-[var(--color-neutral-700)] font-medium'
                        : 'text-[var(--color-neutral-500)]'
                    }`}
                  >
                    {room.lastMessage}
                  </p>
                  {room.orderId && (
                    <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                      주문번호: {room.orderId}
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
