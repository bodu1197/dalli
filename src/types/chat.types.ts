/**
 * 채팅 시스템 타입 정의
 */

/**
 * 채팅방 타입
 */
export type ChatRoomType = 'order' | 'support'

/**
 * 메시지 타입
 */
export type MessageType = 'text' | 'image' | 'system'

/**
 * 참여자 역할
 */
export type ParticipantRole = 'customer' | 'owner' | 'rider' | 'admin'

/**
 * 채팅방 정보
 */
export interface ChatRoom {
  id: string
  orderId: string | null
  type: ChatRoomType
  createdAt: string
}

/**
 * 채팅 참여자 정보
 */
export interface ChatParticipant {
  id: string
  roomId: string
  userId: string
  role: ParticipantRole
  lastReadAt: string
  createdAt: string
  // 조인된 사용자 정보
  user?: {
    name: string
    avatarUrl: string | null
  }
}

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  message: string
  messageType: MessageType
  createdAt: string
  // 조인된 발신자 정보
  sender?: {
    name: string
    avatarUrl: string | null
    role?: ParticipantRole
  }
}

/**
 * 채팅방 목록 아이템 (미리보기 포함)
 */
export interface ChatRoomListItem {
  id: string
  orderId: string | null
  type: ChatRoomType
  createdAt: string
  // 마지막 메시지
  lastMessage: {
    message: string
    messageType: MessageType
    createdAt: string
    senderName: string
  } | null
  // 읽지 않은 메시지 수
  unreadCount: number
  // 참여자 정보
  participants: {
    userId: string
    name: string
    avatarUrl: string | null
    role: ParticipantRole
  }[]
  // 주문 정보 (order 타입일 때)
  order?: {
    id: string
    restaurantName: string
    status: string
  }
}

/**
 * 메시지 전송 입력
 */
export interface SendMessageInput {
  roomId: string
  message: string
  messageType?: MessageType
}

/**
 * 채팅방 생성 입력
 */
export interface CreateChatRoomInput {
  orderId: string
  type: ChatRoomType
  participantIds: string[]
}
