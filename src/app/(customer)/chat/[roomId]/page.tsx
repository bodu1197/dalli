'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Image, MoreVertical, Loader2 } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { useChatMessages, useChatRoom } from '@/hooks/useChat'
import type { ChatMessage, ParticipantRole } from '@/types/chat.types'

/**
 * 채팅방 제목 생성
 */
function getRoomTitle(room: { type: string; orderId: string | null; participants: { name: string; role: ParticipantRole }[] } | null): string {
  if (!room) return '채팅방'

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

export default function ChatRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  const { user } = useAuthStore()
  const { room, isLoading: roomLoading } = useChatRoom(roomId)
  const { messages, isLoading: messagesLoading, sendMessage, isSending } = useChatMessages({ roomId })

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = user?.id || ''

  // 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (inputValue.trim() && !isSending) {
      const message = inputValue.trim()
      setInputValue('')
      await sendMessage(message)
    }
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
  const groupedMessages = messages.reduce<{ date: string; messages: ChatMessage[] }[]>((groups, msg) => {
    const msgDate = new Date(msg.createdAt).toDateString()
    const lastGroup = groups.at(-1)

    if (lastGroup && new Date(lastGroup.date).toDateString() === msgDate) {
      lastGroup.messages.push(msg)
    } else {
      groups.push({ date: msg.createdAt, messages: [msg] })
    }

    return groups
  }, [])

  const getRoleColor = (role: ParticipantRole | undefined) => {
    switch (role) {
      case 'owner':
        return 'text-[var(--color-primary-600)]'
      case 'rider':
        return 'text-[var(--color-success-600)]'
      case 'admin':
        return 'text-[var(--color-info-600)]'
      default:
        return 'text-[var(--color-neutral-600)]'
    }
  }

  const getRoleLabel = (role: ParticipantRole | undefined) => {
    switch (role) {
      case 'owner':
        return '사장님'
      case 'rider':
        return '라이더'
      case 'admin':
        return '고객센터'
      default:
        return ''
    }
  }

  // 로딩 상태
  if (roomLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-100)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-primary-500)] animate-spin" />
      </div>
    )
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
              {getRoomTitle(room)}
            </h1>
            {room?.orderId && (
              <p className="text-xs text-[var(--color-neutral-500)]">
                주문번호: {room.orderId.slice(0, 8)}...
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
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--color-neutral-500)]">아직 메시지가 없습니다</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
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
                      {showSender ? (
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`text-xs font-medium ${getRoleColor(
                              message.sender?.role
                            )}`}
                          >
                            {message.sender?.name || '알 수 없음'}
                          </span>
                          {getRoleLabel(message.sender?.role) ? (
                            <span className="text-xs text-[var(--color-neutral-400)]">
                              ({getRoleLabel(message.sender?.role)})
                            </span>
                          ) : null}
                        </div>
                      ) : null}

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
                            {message.message}
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
          ))
        )}
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
              disabled={isSending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              inputValue.trim() && !isSending
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)]'
            }`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
