/**
 * 주문 실시간 추적 훅
 * @description Supabase Realtime을 사용한 주문 상태 및 라이더 위치 실시간 추적
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ============================================================================
// 타입 정의
// ============================================================================

export interface RiderLocation {
  lat: number
  lng: number
  heading: number | null
  speed: number | null
  updatedAt: string
}

export interface OrderTrackingData {
  orderId: string
  orderNumber: string
  status: string
  riderLocation: RiderLocation | null
  eta: {
    remainingDistance: number
    remainingMinutes: number
    estimatedArrival: string
  } | null
  restaurant: {
    id: string
    name: string
    lat: number | null
    lng: number | null
  } | null
  deliveryLocation: {
    lat: number
    lng: number
  } | null
  lastUpdated: string
}

interface UseOrderTrackingOptions {
  /** 위치 업데이트 폴링 간격 (ms), 기본값: 5000 */
  pollingInterval?: number
  /** 자동 연결 여부, 기본값: true */
  autoConnect?: boolean
}

interface UseOrderTrackingReturn {
  /** 추적 데이터 */
  data: OrderTrackingData | null
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 */
  error: Error | null
  /** 연결 상태 */
  isConnected: boolean
  /** 수동 새로고침 */
  refresh: () => Promise<void>
  /** 연결 해제 */
  disconnect: () => void
}

// ============================================================================
// 훅 구현
// ============================================================================

export function useOrderTracking(
  orderId: string,
  options: UseOrderTrackingOptions = {}
): UseOrderTrackingReturn {
  const { pollingInterval = 5000, autoConnect = true } = options

  const [data, setData] = useState<OrderTrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 추적 데이터 가져오기
   */
  const fetchTrackingData = useCallback(async (): Promise<void> => {
    if (!orderId) return

    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error ?? '추적 정보를 불러올 수 없습니다.')
      }

      const result = await response.json()

      if (result.success && result.data) {
        setData({
          orderId: result.data.orderId,
          orderNumber: result.data.orderNumber,
          status: result.data.status,
          riderLocation: result.data.riderLocation,
          eta: result.data.eta,
          restaurant: result.data.restaurant,
          deliveryLocation: result.data.deliveryLocation,
          lastUpdated: new Date().toISOString(),
        })
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류'))
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  /**
   * 실시간 구독 설정
   */
  const setupRealtimeSubscription = useCallback((): void => {
    if (!orderId || channelRef.current) return

    if (!supabaseRef.current) supabaseRef.current = createClient()
    const supabase = supabaseRef.current

    // 주문 상태 변경 구독
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          // 주문 상태 업데이트
          setData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              status: payload.new.status,
              lastUpdated: new Date().toISOString(),
            }
          })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel
  }, [orderId])

  /**
   * 폴링 설정 (라이더 위치 갱신)
   */
  const setupPolling = useCallback((): void => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingRef.current = setInterval(() => {
      // 배달 중인 상태에서만 위치 폴링
      if (data?.status === 'delivering' || data?.status === 'picked_up') {
        fetchTrackingData()
      }
    }, pollingInterval)
  }, [data?.status, pollingInterval, fetchTrackingData])

  /**
   * 연결 해제
   */
  const disconnect = useCallback((): void => {
    // 채널 구독 해제
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // 폴링 정리
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    setIsConnected(false)
  }, [])

  /**
   * 수동 새로고침
   */
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    await fetchTrackingData()
  }, [fetchTrackingData])

  // 초기 데이터 로딩 및 구독 설정
  useEffect(() => {
    if (!orderId || !autoConnect) return

    // 초기 데이터 가져오기
    fetchTrackingData()

    // 실시간 구독 설정
    setupRealtimeSubscription()

    return () => {
      disconnect()
    }
  }, [orderId, autoConnect, fetchTrackingData, setupRealtimeSubscription, disconnect])

  // 상태 변경에 따른 폴링 설정
  useEffect(() => {
    if (isConnected && (data?.status === 'delivering' || data?.status === 'picked_up')) {
      setupPolling()
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [isConnected, data?.status, setupPolling])

  return {
    data,
    isLoading,
    error,
    isConnected,
    refresh,
    disconnect,
  }
}

// ============================================================================
// 라이더 위치만 구독하는 간단한 훅
// ============================================================================

export interface UseRiderLocationReturn {
  location: RiderLocation | null
  isLoading: boolean
  error: Error | null
}

export function useRiderLocation(riderId: string | null): UseRiderLocationReturn {
  const [location, setLocation] = useState<RiderLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!riderId) {
      setLocation(null)
      setIsLoading(false)
      return
    }

    if (!supabaseRef.current) supabaseRef.current = createClient()
    const supabase = supabaseRef.current

    // 초기 위치 가져오기
    const fetchInitialLocation = async (): Promise<void> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('rider_locations')
          .select('lat, lng, heading, speed, updated_at')
          .eq('rider_id', riderId)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }

        if (data) {
          setLocation({
            lat: data.lat,
            lng: data.lng,
            heading: data.heading,
            speed: data.speed,
            updatedAt: data.updated_at ?? new Date().toISOString(),
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('위치를 불러올 수 없습니다.'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialLocation()

    // 실시간 구독
    const channel = supabase
      .channel(`rider-location-${riderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rider_locations',
          filter: `rider_id=eq.${riderId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setLocation(null)
          } else {
            const newData = payload.new as {
              lat: number
              lng: number
              heading: number | null
              speed: number | null
              updated_at: string
            }
            setLocation({
              lat: newData.lat,
              lng: newData.lng,
              heading: newData.heading,
              speed: newData.speed,
              updatedAt: newData.updated_at,
            })
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [riderId])

  return { location, isLoading, error }
}

// ============================================================================
// 주문 상태만 구독하는 간단한 훅
// ============================================================================

export interface UseOrderStatusReturn {
  status: string | null
  isLoading: boolean
  error: Error | null
}

export function useOrderStatus(orderId: string): UseOrderStatusReturn {
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!orderId) {
      setStatus(null)
      setIsLoading(false)
      return
    }

    if (!supabaseRef.current) supabaseRef.current = createClient()
    const supabase = supabaseRef.current

    // 초기 상태 가져오기
    const fetchInitialStatus = async (): Promise<void> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          setStatus(data.status)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('상태를 불러올 수 없습니다.'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialStatus()

    // 실시간 구독
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setStatus(payload.new.status)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [orderId])

  return { status, isLoading, error }
}
