'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import {
  type NotificationListItem,
  type NotificationType,
  type NotificationCategory,
  NOTIFICATION_TYPE_CATEGORY,
} from '@/types/notification.types'

interface UseNotificationsReturn {
  notifications: NotificationListItem[]
  isLoading: boolean
  error: string | null
  unreadCount: number
  totalCount: number
  hasMore: boolean
  fetchNotifications: (reset?: boolean) => Promise<void>
  markAsRead: (notificationId: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  deleteNotification: (notificationId: string) => Promise<boolean>
  refetch: () => Promise<void>
}

interface UseNotificationsOptions {
  unreadOnly?: boolean
  types?: NotificationType[]
  pageSize?: number
  autoFetch?: boolean
}

/**
 * 알림 관리 훅
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { unreadOnly = false, types, pageSize = 20, autoFetch = true } = options

  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  // 클라이언트 사이드에서만 Supabase 클라이언트 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  const { user } = useAuthStore()

  const [notifications, setNotifications] = useState<NotificationListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 알림 목록 조회
  const fetchNotifications = useCallback(
    async (reset: boolean = false) => {
      if (!user || !supabaseRef.current) return

      const supabase = supabaseRef.current
      const currentPage = reset ? 1 : page

      setIsLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

        if (unreadOnly) {
          query = query.eq('is_read', false)
        }

        if (types && types.length > 0) {
          query = query.in('type', types)
        }

        const { data, error: fetchError, count } = await query

        if (fetchError) throw fetchError

        const formattedNotifications: NotificationListItem[] = (data ?? []).map(
          (item) => ({
            id: item.id,
            userId: item.user_id,
            type: item.type as NotificationType,
            title: item.title,
            body: item.body,
            data: (item.data as Record<string, unknown>) ?? {},
            isRead: item.is_read ?? false,
            readAt: item.read_at,
            priority: item.priority as NotificationListItem['priority'],
            createdAt: item.created_at ?? new Date().toISOString(),
            unreadMinutes: item.is_read
              ? null
              : Math.floor(
                (Date.now() - new Date(item.created_at ?? '').getTime()) /
                (1000 * 60)
              ),
          })
        )

        if (reset) {
          setNotifications(formattedNotifications)
          setPage(1)
        } else {
          setNotifications((prev) => [...prev, ...formattedNotifications])
        }

        setTotalCount(count ?? 0)
        setHasMore(formattedNotifications.length === pageSize)

        // 읽지 않은 알림 수 조회
        const { count: unreadCountResult } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)

        setUnreadCount(unreadCountResult ?? 0)
      } catch (err) {
        console.error('알림 조회 실패:', err)
        setError('알림을 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    },
    [user, page, pageSize, unreadOnly, types]
  )

  // 알림 읽음 처리
  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      if (!user || !supabaseRef.current) return false

      const supabase = supabaseRef.current

      try {
        const { error: updateError } = await supabase
          .from('notifications')
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq('id', notificationId)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))

        return true
      } catch (err) {
        console.error('알림 읽음 처리 실패:', err)
        return false
      }
    },
    [user]
  )

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!user || !supabaseRef.current) return false

    const supabase = supabaseRef.current

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) throw updateError

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      )
      setUnreadCount(0)

      return true
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err)
      return false
    }
  }, [user])

  // 알림 삭제
  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      if (!user || !supabaseRef.current) return false

      const supabase = supabaseRef.current
      const notification = notifications.find((n) => n.id === notificationId)

      try {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        setTotalCount((prev) => Math.max(0, prev - 1))

        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }

        return true
      } catch (err) {
        console.error('알림 삭제 실패:', err)
        return false
      }
    },
    [user, notifications]
  )

  // 새로고침
  const refetch = useCallback(async () => {
    await fetchNotifications(true)
  }, [fetchNotifications])

  // 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    setPage((prev) => prev + 1)
  }, [hasMore, isLoading])

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (isClientReady && user && page > 1) {
      fetchNotifications(false)
    }
  }, [page, isClientReady, user, fetchNotifications])

  // 초기 로드
  useEffect(() => {
    if (isClientReady && user && autoFetch) {
      fetchNotifications(true)
    }
  }, [isClientReady, user, autoFetch, fetchNotifications])

  // 실시간 구독
  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current) return

    const supabase = supabaseRef.current

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Database['public']['Tables']['notifications']['Row']

          const formattedNotification: NotificationListItem = {
            id: newNotification.id,
            userId: newNotification.user_id,
            type: newNotification.type as NotificationType,
            title: newNotification.title,
            body: newNotification.body,
            data: (newNotification.data as Record<string, unknown>) ?? {},
            isRead: newNotification.is_read ?? false,
            readAt: newNotification.read_at,
            priority: newNotification.priority as NotificationListItem['priority'],
            createdAt: newNotification.created_at ?? new Date().toISOString(),
            unreadMinutes: 0,
          }

          setNotifications((prev) => [formattedNotification, ...prev])
          setTotalCount((prev) => prev + 1)
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isClientReady, user])

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    totalCount,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  }
}

/**
 * 읽지 않은 알림 수만 조회하는 훅
 */
export function useUnreadNotificationCount(): {
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
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setCount(unreadCount ?? 0)
    } catch (err) {
      console.error('알림 수 조회 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isClientReady && user) {
      refetch()
    }
  }, [isClientReady, user, refetch])

  // 실시간 구독
  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current) return

    const supabase = supabaseRef.current

    const subscription = supabase
      .channel('notification-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
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

/**
 * 알림 타입을 카테고리로 변환하는 유틸
 */
export function getNotificationCategory(
  type: NotificationType
): NotificationCategory {
  return NOTIFICATION_TYPE_CATEGORY[type] ?? 'system'
}
