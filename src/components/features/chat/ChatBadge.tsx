'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useUnreadChatCount } from '@/hooks/useChat'

interface ChatBadgeProps {
  className?: string
}

/**
 * 채팅 아이콘 컴포넌트 (읽지 않은 메시지 수 배지 표시)
 */
export function ChatBadge({ className = '' }: ChatBadgeProps) {
  const { count, isLoading } = useUnreadChatCount()

  return (
    <Link
      href="/chat"
      className={`relative w-10 h-10 flex items-center justify-center ${className}`}
      aria-label={`채팅 ${count > 0 ? `(${count}개 읽지 않음)` : ''}`}
    >
      <MessageCircle className="w-6 h-6 text-[var(--color-neutral-700)]" />
      {!isLoading && count > 0 && (
        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--color-error-500)] text-white text-xs font-bold rounded-full">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
