'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type {
  ChatRoom,
  ChatMessage,
  ChatRoomListItem,
  ChatParticipant,
  SendMessageInput,
  MessageType,
  ParticipantRole,
} from '@/types/chat.types'

interface UseChatRoomsReturn {
  rooms: ChatRoomListItem[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 채팅방 목록 조회 훅
 */
export function useChatRooms(): UseChatRoomsReturn {
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  const { user } = useAuthStore()
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    if (!user || !supabaseRef.current) return

    const supabase = supabaseRef.current
    setIsLoading(true)
    setError(null)

    try {
      // 1. 내가 참여한 채팅방 조회
      const { data: participations, error: partError } = await supabase
        .from('chat_participants')
        .select(`
          room_id,
          last_read_at,
          chat_rooms (
            id,
            order_id,
            type,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (partError) throw partError

      if (!participations || participations.length === 0) {
        setRooms([])
        return
      }

      const roomIds = participations
        .map((p) => (p.chat_rooms as { id: string } | null)?.id)
        .filter((id): id is string => !!id)

      // 2. 각 채팅방의 마지막 메시지 조회
      const { data: lastMessages, error: msgError } = await supabase
        .from('chat_messages')
        .select(`
          room_id,
          sender_id,
          message,
          message_type,
          created_at,
          users:sender_id (name)
        `)
        .in('room_id', roomIds)
        .order('created_at', { ascending: false })

      if (msgError) throw msgError

      // 3. 각 채팅방의 참여자 조회
      const { data: allParticipants, error: allPartError } = await supabase
        .from('chat_participants')
        .select(`
          room_id,
          user_id,
          role,
          users:user_id (name, avatar_url)
        `)
        .in('room_id', roomIds)

      if (allPartError) throw allPartError

      // 4. 주문 정보 조회 (order 타입 채팅방)
      const orderIds = participations
        .map((p) => (p.chat_rooms as { order_id: string | null } | null)?.order_id)
        .filter((id): id is string => !!id)

      let ordersMap: Map<string, { id: string; restaurantName: string; status: string }> = new Map()
      if (orderIds.length > 0) {
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            restaurants:restaurant_id (name)
          `)
          .in('id', orderIds)

        if (!orderError && orders) {
          ordersMap = new Map(
            orders.map((o) => [
              o.id,
              {
                id: o.id,
                restaurantName: (o.restaurants as { name: string } | null)?.name ?? '알 수 없음',
                status: o.status,
              },
            ])
          )
        }
      }

      // 5. 읽지 않은 메시지 수 계산 및 데이터 조합
      const roomListItems: ChatRoomListItem[] = participations.map((p) => {
        const room = p.chat_rooms as {
          id: string
          order_id: string | null
          type: 'order' | 'support'
          created_at: string
        } | null

        if (!room) {
          return null
        }

        const roomLastMessages = lastMessages
          ?.filter((m) => m.room_id === room.id)
          .sort(
            (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
          )
        const lastMessage = roomLastMessages?.[0]

        // 읽지 않은 메시지 수 계산
        const lastReadAt = new Date(p.last_read_at ?? 0).getTime()
        const unreadCount =
          lastMessages?.filter(
            (m) =>
              m.room_id === room.id &&
              new Date(m.created_at ?? 0).getTime() > lastReadAt &&
              m.sender_id !== user.id
          ).length ?? 0

        // 참여자 정보 매핑
        const roomParticipants = allParticipants
          ?.filter((ap) => ap.room_id === room.id)
          .map((ap) => {
            const userData = ap.users as { name: string; avatar_url: string | null } | null
            return {
              userId: ap.user_id,
              name: userData?.name ?? '알 수 없음',
              avatarUrl: userData?.avatar_url ?? null,
              role: ap.role as ParticipantRole,
            }
          })

        const chatRoomItem: ChatRoomListItem = {
          id: room.id,
          orderId: room.order_id,
          type: room.type,
          createdAt: room.created_at ?? new Date().toISOString(),
          lastMessage: lastMessage
            ? {
                message: lastMessage.message,
                messageType: lastMessage.message_type as MessageType,
                createdAt: lastMessage.created_at ?? new Date().toISOString(),
                senderName: (lastMessage.users as { name: string } | null)?.name ?? '알 수 없음',
              }
            : null,
          unreadCount,
          participants: roomParticipants ?? [],
          order: room.order_id ? ordersMap.get(room.order_id) : undefined,
        }
        return chatRoomItem
      }).filter((item): item is ChatRoomListItem => item !== null)

      // 마지막 메시지 시간 기준 정렬
      roomListItems.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
        return timeB - timeA
      })

      setRooms(roomListItems)
    } catch (err) {
      setError('채팅방 목록을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 초기 로드
  useEffect(() => {
    if (isClientReady && user) {
      fetchRooms()
    }
  }, [isClientReady, user, fetchRooms])

  return { rooms, isLoading, error, refetch: fetchRooms }
}

interface UseChatMessagesReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  isSending: boolean
  sendMessage: (message: string, type?: MessageType) => Promise<boolean>
  loadMore: () => Promise<void>
  markAsRead: () => Promise<void>
}

interface UseChatMessagesOptions {
  roomId: string
  pageSize?: number
}

/**
 * 채팅 메시지 조회 및 전송 훅
 */
export function useChatMessages(options: UseChatMessagesOptions): UseChatMessagesReturn {
  const { roomId, pageSize = 50 } = options

  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  // 메시지 조회
  const fetchMessages = useCallback(
    async (reset: boolean = false) => {
      if (!user || !supabaseRef.current || !roomId) return

      const supabase = supabaseRef.current
      const currentOffset = reset ? 0 : offset

      setIsLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('chat_messages')
          .select(`
            id,
            room_id,
            sender_id,
            message,
            message_type,
            created_at,
            users:sender_id (name, avatar_url)
          `)
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + pageSize - 1)

        if (fetchError) throw fetchError

        const formattedMessages: ChatMessage[] = (data ?? []).map((m) => {
          const userData = m.users as { name: string; avatar_url: string | null } | null
          return {
            id: m.id,
            roomId: m.room_id,
            senderId: m.sender_id,
            message: m.message,
            messageType: m.message_type as MessageType,
            createdAt: m.created_at ?? new Date().toISOString(),
            sender: {
              name: userData?.name ?? '알 수 없음',
              avatarUrl: userData?.avatar_url ?? null,
            },
          }
        })

        // 시간순 정렬 (오래된 것이 위)
        formattedMessages.reverse()

        if (reset) {
          setMessages(formattedMessages)
          setOffset(pageSize)
        } else {
          setMessages((prev) => [...formattedMessages, ...prev])
          setOffset((prev) => prev + pageSize)
        }

        setHasMore(formattedMessages.length === pageSize)
      } catch (err) {
        setError('메시지를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    },
    [user, roomId, offset, pageSize]
  )

  // 메시지 전송
  const sendMessage = useCallback(
    async (message: string, type: MessageType = 'text'): Promise<boolean> => {
      if (!user || !supabaseRef.current || !roomId) return false

      const supabase = supabaseRef.current
      setIsSending(true)

      try {
        const { data, error: sendError } = await supabase
          .from('chat_messages')
          .insert({
            room_id: roomId,
            sender_id: user.id,
            message,
            message_type: type,
          })
          .select(`
            id,
            room_id,
            sender_id,
            message,
            message_type,
            created_at
          `)
          .single()

        if (sendError) throw sendError

        // 로컬 상태 업데이트 (낙관적 업데이트)
        const newMessage: ChatMessage = {
          id: data.id,
          roomId: data.room_id,
          senderId: data.sender_id,
          message: data.message,
          messageType: data.message_type as MessageType,
          createdAt: data.created_at ?? new Date().toISOString(),
          sender: {
            name: '나',
            avatarUrl: null,
          },
        }

        setMessages((prev) => [...prev, newMessage])

        return true
      } catch (err) {
        return false
      } finally {
        setIsSending(false)
      }
    },
    [user, roomId]
  )

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchMessages(false)
  }, [hasMore, isLoading, fetchMessages])

  // 읽음 처리
  const markAsRead = useCallback(async () => {
    if (!user || !supabaseRef.current || !roomId) return

    const supabase = supabaseRef.current

    try {
      await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', user.id)
    } catch (err) {
      // 에러 무시
    }
  }, [user, roomId])

  // 초기 로드
  useEffect(() => {
    if (isClientReady && user && roomId) {
      fetchMessages(true)
      markAsRead()
    }
  }, [isClientReady, user, roomId])

  // 실시간 메시지 구독
  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current || !roomId) return

    const supabase = supabaseRef.current

    const subscription = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Database['public']['Tables']['chat_messages']['Row']

          // 내가 보낸 메시지는 이미 로컬에 추가됨
          if (newMsg.sender_id === user.id) return

          // 발신자 정보 조회
          const { data: senderData } = await supabase
            .from('users')
            .select('name, avatar_url')
            .eq('id', newMsg.sender_id)
            .single()

          const formattedMessage: ChatMessage = {
            id: newMsg.id,
            roomId: newMsg.room_id,
            senderId: newMsg.sender_id,
            message: newMsg.message,
            messageType: newMsg.message_type as MessageType,
            createdAt: newMsg.created_at ?? new Date().toISOString(),
            sender: {
              name: senderData?.name ?? '알 수 없음',
              avatarUrl: senderData?.avatar_url ?? null,
            },
          }

          setMessages((prev) => [...prev, formattedMessage])

          // 읽음 처리
          markAsRead()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isClientReady, user, roomId, markAsRead])

  return {
    messages,
    isLoading,
    isSending,
    error,
    hasMore,
    sendMessage,
    loadMore,
    markAsRead,
  }
}

interface ChatRoomWithParticipants {
  id: string
  orderId: string | null
  type: 'order' | 'support'
  createdAt: string
  participants: {
    userId: string
    name: string
    avatarUrl: string | null
    role: ParticipantRole
  }[]
}

interface UseChatRoomReturn {
  room: ChatRoomWithParticipants | null
  isLoading: boolean
  error: string | null
}

/**
 * 단일 채팅방 정보 조회 훅
 */
export function useChatRoom(roomId: string): UseChatRoomReturn {
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  const { user } = useAuthStore()
  const [room, setRoom] = useState<ChatRoomWithParticipants | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current || !roomId) return

    const supabase = supabaseRef.current

    const fetchRoom = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 채팅방 조회
        const { data: roomData, error: roomError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (roomError) throw roomError

        // 참여자 조회
        const { data: participantsData, error: partError } = await supabase
          .from('chat_participants')
          .select(`
            id,
            room_id,
            user_id,
            role,
            last_read_at,
            created_at,
            users:user_id (name, avatar_url)
          `)
          .eq('room_id', roomId)

        if (partError) throw partError

        const formattedParticipants = (participantsData ?? []).map((p) => {
          const userData = p.users as { name: string; avatar_url: string | null } | null
          return {
            userId: p.user_id,
            name: userData?.name ?? '알 수 없음',
            avatarUrl: userData?.avatar_url ?? null,
            role: p.role as ParticipantRole,
          }
        })

        setRoom({
          id: roomData.id,
          orderId: roomData.order_id,
          type: roomData.type as 'order' | 'support',
          createdAt: roomData.created_at ?? new Date().toISOString(),
          participants: formattedParticipants,
        })
      } catch (err) {
        setError('채팅방 정보를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoom()
  }, [isClientReady, user, roomId])

  return { room, isLoading, error }
}

/**
 * 주문에 대한 채팅방 생성 또는 조회
 */
export function useOrderChat(orderId: string | null): {
  roomId: string | null
  isLoading: boolean
  error: string | null
  createOrGetRoom: () => Promise<string | null>
} {
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  const { user } = useAuthStore()
  const [roomId, setRoomId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrGetRoom = useCallback(async (): Promise<string | null> => {
    if (!user || !supabaseRef.current || !orderId) return null

    const supabase = supabaseRef.current
    setIsLoading(true)
    setError(null)

    try {
      // 1. 기존 채팅방 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('order_id', orderId)
        .eq('type', 'order')
        .maybeSingle()

      if (existingRoom) {
        setRoomId(existingRoom.id)
        return existingRoom.id
      }

      // 2. 주문 정보 조회 (점주, 라이더 정보 포함)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          rider_id,
          restaurants:restaurant_id (owner_id)
        `)
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error('주문 정보를 찾을 수 없습니다')
      }

      // 3. 새 채팅방 생성
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          order_id: orderId,
          type: 'order',
        })
        .select()
        .single()

      if (roomError || !newRoom) throw roomError

      // 4. 참여자 추가 (고객, 점주, 라이더)
      const participants: { room_id: string; user_id: string; role: string }[] = [
        { room_id: newRoom.id, user_id: order.user_id, role: 'customer' },
      ]

      const restaurantData = order.restaurants as { owner_id: string } | null
      if (restaurantData?.owner_id) {
        participants.push({
          room_id: newRoom.id,
          user_id: restaurantData.owner_id,
          role: 'owner',
        })
      }

      if (order.rider_id) {
        participants.push({
          room_id: newRoom.id,
          user_id: order.rider_id,
          role: 'rider',
        })
      }

      await supabase.from('chat_participants').insert(participants)

      setRoomId(newRoom.id)
      return newRoom.id
    } catch (err) {
      setError('채팅방을 생성하는데 실패했습니다')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, orderId])

  // 초기 로드 시 기존 채팅방 확인
  useEffect(() => {
    if (isClientReady && user && orderId) {
      createOrGetRoom()
    }
  }, [isClientReady, user, orderId])

  return { roomId, isLoading, error, createOrGetRoom }
}

/**
 * 읽지 않은 채팅 메시지 총 개수 조회 훅
 */
export function useUnreadChatCount(): {
  count: number
  isLoading: boolean
  refetch: () => Promise<void>
} {
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  const { user } = useAuthStore()
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!user || !supabaseRef.current) return

    const supabase = supabaseRef.current
    setIsLoading(true)

    try {
      // 내가 참여한 채팅방의 last_read_at 조회
      const { data: participations } = await supabase
        .from('chat_participants')
        .select('room_id, last_read_at')
        .eq('user_id', user.id)

      if (!participations || participations.length === 0) {
        setCount(0)
        return
      }

      // 각 채팅방의 읽지 않은 메시지 수 계산
      let totalUnread = 0
      for (const p of participations) {
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', p.room_id)
          .gt('created_at', p.last_read_at ?? '1970-01-01')
          .neq('sender_id', user.id)

        totalUnread += unreadCount ?? 0
      }

      setCount(totalUnread)
    } catch (err) {
      // 에러 무시
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isClientReady && user) {
      refetch()
    }
  }, [isClientReady, user, refetch])

  // 실시간 메시지 구독 (전체)
  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current) return

    const supabase = supabaseRef.current

    const subscription = supabase
      .channel('chat-unread-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isClientReady, user, refetch])

  return { count, isLoading, refetch }
}
