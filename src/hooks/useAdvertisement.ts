'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type {
  Advertisement,
  AdPlanType,
  CreateAdvertisementInput,
  AD_PLANS,
} from '@/types/advertisement.types'

interface UseAdvertisementsReturn {
  advertisements: Advertisement[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 점주의 광고 목록 조회 훅
 */
export function useAdvertisements(restaurantId: string | null): UseAdvertisementsReturn {
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
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAdvertisements = useCallback(async () => {
    if (!user || !supabaseRef.current || !restaurantId) return

    const supabase = supabaseRef.current
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('advertisements')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const formattedAds: Advertisement[] = (data ?? []).map((ad) => ({
        id: ad.id,
        restaurantId: ad.restaurant_id,
        planType: ad.plan_type as AdPlanType,
        amount: ad.amount,
        startDate: ad.start_date,
        endDate: ad.end_date,
        isActive: ad.is_active ?? false,
        paymentStatus: ad.payment_status as Advertisement['paymentStatus'],
        paymentId: ad.payment_id,
        createdAt: ad.created_at ?? new Date().toISOString(),
        updatedAt: ad.updated_at,
      }))

      setAdvertisements(formattedAds)
    } catch (err) {
      setError('광고 목록을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [user, restaurantId])

  useEffect(() => {
    if (isClientReady && user && restaurantId) {
      fetchAdvertisements()
    }
  }, [isClientReady, user, restaurantId, fetchAdvertisements])

  return { advertisements, isLoading, error, refetch: fetchAdvertisements }
}

interface UseCurrentAdvertisementReturn {
  currentAd: Advertisement | null
  isLoading: boolean
  daysRemaining: number
}

/**
 * 현재 활성화된 광고 조회 훅
 */
export function useCurrentAdvertisement(restaurantId: string | null): UseCurrentAdvertisementReturn {
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
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current || !restaurantId) return

    const fetchCurrentAd = async () => {
      const supabase = supabaseRef.current!
      setIsLoading(true)

      try {
        const now = new Date().toISOString()

        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .eq('payment_status', 'paid')
          .gte('end_date', now)
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setCurrentAd({
            id: data.id,
            restaurantId: data.restaurant_id,
            planType: data.plan_type as AdPlanType,
            amount: data.amount,
            startDate: data.start_date,
            endDate: data.end_date,
            isActive: data.is_active ?? false,
            paymentStatus: data.payment_status as Advertisement['paymentStatus'],
            paymentId: data.payment_id,
            createdAt: data.created_at ?? new Date().toISOString(),
            updatedAt: data.updated_at,
          })
        } else {
          setCurrentAd(null)
        }
      } catch (err) {
        setCurrentAd(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentAd()
  }, [isClientReady, user, restaurantId])

  const daysRemaining = currentAd
    ? Math.ceil(
        (new Date(currentAd.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 0

  return { currentAd, isLoading, daysRemaining }
}

interface UseCreateAdvertisementReturn {
  createAdvertisement: (input: CreateAdvertisementInput) => Promise<Advertisement | null>
  isCreating: boolean
  error: string | null
}

/**
 * 광고 생성 훅
 */
export function useCreateAdvertisement(): UseCreateAdvertisementReturn {
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
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAdvertisement = useCallback(
    async (input: CreateAdvertisementInput): Promise<Advertisement | null> => {
      if (!user || !supabaseRef.current || !isClientReady) return null

      const supabase = supabaseRef.current
      setIsCreating(true)
      setError(null)

      try {
        const { AD_PLANS } = await import('@/types/advertisement.types')
        const plan = AD_PLANS[input.planType]
        const amount = plan.price * input.months

        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + input.months)

        const { data, error: insertError } = await supabase
          .from('advertisements')
          .insert({
            restaurant_id: input.restaurantId,
            plan_type: input.planType,
            amount,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: false, // 결제 완료 후 활성화
            payment_status: 'pending',
          })
          .select()
          .single()

        if (insertError) throw insertError

        return {
          id: data.id,
          restaurantId: data.restaurant_id,
          planType: data.plan_type as AdPlanType,
          amount: data.amount,
          startDate: data.start_date,
          endDate: data.end_date,
          isActive: data.is_active ?? false,
          paymentStatus: data.payment_status as Advertisement['paymentStatus'],
          paymentId: data.payment_id,
          createdAt: data.created_at ?? new Date().toISOString(),
          updatedAt: data.updated_at,
        }
      } catch (err) {
        setError('광고 생성에 실패했습니다')
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [user, isClientReady]
  )

  return { createAdvertisement, isCreating, error }
}

interface UseActivateAdvertisementReturn {
  activateAdvertisement: (adId: string, paymentId: string) => Promise<boolean>
  isActivating: boolean
  error: string | null
}

/**
 * 광고 활성화 훅 (결제 완료 후)
 */
export function useActivateAdvertisement(): UseActivateAdvertisementReturn {
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
  const [isActivating, setIsActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activateAdvertisement = useCallback(
    async (adId: string, paymentId: string): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsActivating(true)
      setError(null)

      try {
        // 1. 광고 상태 업데이트
        const { data: adData, error: adError } = await supabase
          .from('advertisements')
          .update({
            is_active: true,
            payment_status: 'paid',
            payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adId)
          .select()
          .single()

        if (adError) throw adError

        // 2. 식당 광고 상태 업데이트
        const { AD_PLANS } = await import('@/types/advertisement.types')
        const plan = AD_PLANS[adData.plan_type as AdPlanType]

        const { error: restaurantError } = await supabase
          .from('restaurants')
          .update({
            is_advertised: true,
            ad_priority: plan.priority,
            ad_expires_at: adData.end_date,
          })
          .eq('id', adData.restaurant_id)

        if (restaurantError) throw restaurantError

        return true
      } catch (err) {
        setError('광고 활성화에 실패했습니다')
        return false
      } finally {
        setIsActivating(false)
      }
    },
    [user, isClientReady]
  )

  return { activateAdvertisement, isActivating, error }
}

interface UseCancelAdvertisementReturn {
  cancelAdvertisement: (adId: string) => Promise<boolean>
  isCanceling: boolean
  error: string | null
}

/**
 * 광고 취소 훅
 */
export function useCancelAdvertisement(): UseCancelAdvertisementReturn {
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
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancelAdvertisement = useCallback(
    async (adId: string): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsCanceling(true)
      setError(null)

      try {
        // 광고 정보 조회
        const { data: adData, error: fetchError } = await supabase
          .from('advertisements')
          .select('restaurant_id')
          .eq('id', adId)
          .single()

        if (fetchError) throw fetchError

        // 광고 비활성화
        const { error: updateError } = await supabase
          .from('advertisements')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', adId)

        if (updateError) throw updateError

        // 식당 광고 상태 초기화
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .update({
            is_advertised: false,
            ad_priority: 0,
            ad_expires_at: null,
          })
          .eq('id', adData.restaurant_id)

        if (restaurantError) throw restaurantError

        return true
      } catch (err) {
        setError('광고 취소에 실패했습니다')
        return false
      } finally {
        setIsCanceling(false)
      }
    },
    [user, isClientReady]
  )

  return { cancelAdvertisement, isCanceling, error }
}
