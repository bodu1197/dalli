'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Image, MoreVertical } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: 'customer' | 'owner' | 'rider' | 'support'
  content: string
  imageUrl?: string
  createdAt: string
  isRead: boolean
}

interface ChatRoomInfo {
  id: string
  title: string
  type: 'order' | 'support'
  orderId?: string
  participants: {
    id: string
    name: string
    role: 'customer' | 'owner' | 'rider' | 'support'
  }[]
}

// Mock 채팅방 정보
const MOCK_ROOM_INFO: ChatRoomInfo = {
  id: '1',
  title: 'BBQ 치킨 강남점',
  type: 'order',
  orderId: 'ORD001',
  participants: [
    { id: 'user1', name: '나', role: 'customer' },
    { id: 'owner1', name: 'BBQ 치킨 강남점', role: 'owner' },
    { id: 'rider1', name: '김라이더', role: 'rider' },
  ],
}

// Mock 메시지 데이터
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'owner1',
    senderName: 'BBQ 치킨 강남점',
    senderRole: 'owner',
    content: '주문 접수되었습니다! 조리 시작할게요~',
    createdAt: '2024-12-09T10:00:00',
    isRead: true,
  },
  {
    id: '2',
    senderId: 'user1',
    senderName: '나',
    senderRole: 'customer',
    content: '감사합니다! 얼마나 걸릴까요?',
    createdAt: '2024-12-09T10:05:00',
    isRead: true,
  },
  {
    id: '3',
    senderId: 'owner1',
    senderName: 'BBQ 치킨 강남점',
    senderRole: 'owner',
    content: '약 20분 정도 소요될 것 같습니다!',
    createdAt: '2024-12-09T10:06:00',
    isRead: true,
  },
  {
    id: '4',
    senderId: 'rider1',
    senderName: '김라이더',
    senderRole: 'rider',
    content: '안녕하세요, 배달 담당 김라이더입니다. 곧 출발하겠습니다!',
    createdAt: '2024-12-09T10:20:00',
    isRead: true,
  },
  {
    id: '5',
    senderId: 'user1',
    senderName: '나',
    senderRole: 'customer',
    content: '네 감사합니다~',
    createdAt: '2024-12-09T10:21:00',
    isRead: true,
  },
  {
    id: '6',
    senderId: 'rider1',
    senderName: '김라이더',
    senderRole: 'rider',
    content: '네, 곧 도착할 예정입니다!',
    createdAt: '2024-12-09T10:30:00',
    isRead: false,
  },
]

export default function ChatRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const { user } = useAuthStore()

  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = user?.id || 'user1'

  // 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: '나',
      senderRole: 'customer',
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  // 날짜별 그룹화
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString()
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msg.createdAt, messages: [msg] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg)
    }
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-[var(--color-primary-600)]'
      case 'rider':
        return 'text-[var(--color-success-600)]'
      case 'support':
        return 'text-[var(--color-info-600)]'
      default:
        return 'text-[var(--color-neutral-600)]'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return '사장님'
      case 'rider':
        return '라이더'
      case 'support':
        return '고객센터'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)] flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/chat"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-[var(--color-neutral-900)]">
              {MOCK_ROOM_INFO.title}
            </h1>
            {MOCK_ROOM_INFO.orderId && (
              <p className="text-xs text-[var(--color-neutral-500)]">
                주문번호: {MOCK_ROOM_INFO.orderId}
              </p>
            )}
          </div>
          <button className="w-10 h-10 flex items-center justify-center -mr-2">
            <MoreVertical className="w-5 h-5 text-[var(--color-neutral-500)]" />
          </button>
        </div>
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* 날짜 구분선 */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)] text-xs rounded-full">
                {formatDate(group.date)}
              </span>
            </div>

            {/* 메시지들 */}
            {group.messages.map((message, msgIndex) => {
              const isMe = message.senderId === currentUserId
              const showSender =
                !isMe &&
                (msgIndex === 0 ||
                  group.messages[msgIndex - 1].senderId !== message.senderId)

              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isMe ? 'order-2' : 'order-1'
                    }`}
                  >
                    {/* 발신자 이름 (상대방 메시지만) */}
                    {showSender && (
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className={`text-xs font-medium ${getRoleColor(
                            message.senderRole
                          )}`}
                        >
                          {message.senderName}
                        </span>
                        {getRoleLabel(message.senderRole) && (
                          <span className="text-xs text-[var(--color-neutral-400)]">
                            ({getRoleLabel(message.senderRole)})
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {/* 메시지 버블 */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-[var(--color-primary-500)] text-white rounded-br-md'
                            : 'bg-white text-[var(--color-neutral-800)] rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>

                      {/* 시간 */}
                      <span className="text-xs text-[var(--color-neutral-400)] flex-shrink-0">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* 입력 영역 */}
      <div className="sticky bottom-0 bg-white border-t border-[var(--color-neutral-100)] px-4 py-3">
        <div className="flex items-end gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]">
            <Image className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요"
              rows={1}
              className="w-full px-4 py-2.5 bg-[var(--color-neutral-100)] rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] max-h-24"
              style={{ minHeight: '42px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              inputValue.trim()
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)]'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
