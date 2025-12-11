'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type {
  Coupon,
  UserCouponListItem,
  CouponValidationResult,
  CouponApplyResult,
  CreateCouponInput,
  calculateCouponDiscount,
} from '@/types/coupon.types'

interface UseUserCouponsReturn {
  coupons: UserCouponListItem[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 사용자 보유 쿠폰 목록 조회 훅
 */
export function useUserCoupons(): UseUserCouponsReturn {
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
  const [coupons, setCoupons] = useState<UserCouponListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCoupons = useCallback(async () => {
    if (!user || !supabaseRef.current) return

    const supabase = supabaseRef.current
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('user_coupons')
        .select(`
          id,
          coupon_id,
          used_at,
          created_at,
          coupon:coupons (
            id,
            code,
            name,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            restaurant_id,
            end_date,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const formattedCoupons: UserCouponListItem[] = (data ?? [])
        .filter((item) => item.coupon)
        .map((item) => {
          const coupon = item.coupon as {
            id: string
            code: string
            name: string
            description: string | null
            discount_type: string
            discount_value: number
            min_order_amount: number | null
            max_discount_amount: number | null
            restaurant_id: string | null
            end_date: string
            is_active: boolean
          }
          return {
            id: item.id,
            couponId: coupon.id,
            code: coupon.code,
            name: coupon.name,
            description: coupon.description,
            discountType: coupon.discount_type as 'percentage' | 'fixed',
            discountValue: coupon.discount_value,
            minOrderAmount: coupon.min_order_amount,
            maxDiscountAmount: coupon.max_discount_amount,
            restaurantId: coupon.restaurant_id,
            restaurantName: null, // 추후 조인 추가 가능
            endDate: coupon.end_date,
            isUsed: item.used_at !== null,
            usedAt: item.used_at,
            createdAt: item.created_at ?? new Date().toISOString(),
          }
        })

      setCoupons(formattedCoupons)
    } catch (err) {
      setError('쿠폰 목록을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isClientReady && user) {
      fetchCoupons()
    }
  }, [isClientReady, user, fetchCoupons])

  return { coupons, isLoading, error, refetch: fetchCoupons }
}

interface UseAvailableCouponsReturn {
  coupons: UserCouponListItem[]
  isLoading: boolean
  error: string | null
}

/**
 * 사용 가능한 쿠폰 목록 조회 훅 (주문 시)
 */
export function useAvailableCoupons(
  restaurantId: string | null,
  orderAmount: number
): UseAvailableCouponsReturn {
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
  const [coupons, setCoupons] = useState<UserCouponListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClientReady || !user || !supabaseRef.current || !restaurantId) return

    const fetchAvailableCoupons = async () => {
      const supabase = supabaseRef.current!
      setIsLoading(true)
      setError(null)

      try {
        const now = new Date().toISOString()

        const { data, error: fetchError } = await supabase
          .from('user_coupons')
          .select(`
            id,
            coupon_id,
            used_at,
            created_at,
            coupon:coupons (
              id,
              code,
              name,
              description,
              discount_type,
              discount_value,
              min_order_amount,
              max_discount_amount,
              restaurant_id,
              start_date,
              end_date,
              is_active
            )
          `)
          .eq('user_id', user.id)
          .is('used_at', null) // 미사용 쿠폰만

        if (fetchError) throw fetchError

        // 필터링: 유효한 쿠폰만
        const validCoupons: UserCouponListItem[] = (data ?? [])
          .filter((item) => {
            if (!item.coupon) return false
            const coupon = item.coupon as {
              id: string
              code: string
              name: string
              description: string | null
              discount_type: string
              discount_value: number
              min_order_amount: number | null
              max_discount_amount: number | null
              restaurant_id: string | null
              start_date: string
              end_date: string
              is_active: boolean
            }

            // 활성화 상태
            if (!coupon.is_active) return false

            // 기간 체크
            if (coupon.start_date > now || coupon.end_date < now) return false

            // 최소 주문 금액 체크
            if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
              return false
            }

            // 특정 식당 쿠폰인 경우 식당 체크
            if (coupon.restaurant_id && coupon.restaurant_id !== restaurantId) {
              return false
            }

            return true
          })
          .map((item) => {
            const coupon = item.coupon as {
              id: string
              code: string
              name: string
              description: string | null
              discount_type: string
              discount_value: number
              min_order_amount: number | null
              max_discount_amount: number | null
              restaurant_id: string | null
              end_date: string
            }
            return {
              id: item.id,
              couponId: coupon.id,
              code: coupon.code,
              name: coupon.name,
              description: coupon.description,
              discountType: coupon.discount_type as 'percentage' | 'fixed',
              discountValue: coupon.discount_value,
              minOrderAmount: coupon.min_order_amount,
              maxDiscountAmount: coupon.max_discount_amount,
              restaurantId: coupon.restaurant_id,
              restaurantName: null,
              endDate: coupon.end_date,
              isUsed: false,
              usedAt: null,
              createdAt: item.created_at ?? new Date().toISOString(),
            }
          })

        setCoupons(validCoupons)
      } catch (err) {
        setError('쿠폰 목록을 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableCoupons()
  }, [isClientReady, user, restaurantId, orderAmount])

  return { coupons, isLoading, error }
}

interface UseValidateCouponReturn {
  validateCoupon: (
    couponCode: string,
    restaurantId: string,
    orderAmount: number
  ) => Promise<CouponValidationResult>
  isValidating: boolean
}

/**
 * 쿠폰 유효성 검사 훅
 */
export function useValidateCoupon(): UseValidateCouponReturn {
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
  const [isValidating, setIsValidating] = useState(false)

  const validateCoupon = useCallback(
    async (
      couponCode: string,
      restaurantId: string,
      orderAmount: number
    ): Promise<CouponValidationResult> => {
      if (!user || !supabaseRef.current || !isClientReady) {
        return { isValid: false, errorCode: 'COUPON_NOT_FOUND', message: '로그인이 필요합니다' }
      }

      const supabase = supabaseRef.current
      setIsValidating(true)

      try {
        // 1. 쿠폰 조회
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode.toUpperCase())
          .single()

        if (couponError || !couponData) {
          return { isValid: false, errorCode: 'COUPON_NOT_FOUND', message: '존재하지 않는 쿠폰입니다' }
        }

        const now = new Date().toISOString()

        // 2. 활성화 상태 체크
        if (!couponData.is_active) {
          return { isValid: false, errorCode: 'COUPON_INACTIVE', message: '비활성화된 쿠폰입니다' }
        }

        // 3. 기간 체크
        if (couponData.start_date > now) {
          return { isValid: false, errorCode: 'COUPON_NOT_STARTED', message: '아직 사용할 수 없는 쿠폰입니다' }
        }

        if (couponData.end_date < now) {
          return { isValid: false, errorCode: 'COUPON_EXPIRED', message: '만료된 쿠폰입니다' }
        }

        // 4. 수량 체크
        if (
          couponData.total_quantity !== null &&
          couponData.used_quantity !== null &&
          couponData.used_quantity >= couponData.total_quantity
        ) {
          return { isValid: false, errorCode: 'COUPON_OUT_OF_STOCK', message: '소진된 쿠폰입니다' }
        }

        // 5. 특정 식당 체크
        if (couponData.restaurant_id && couponData.restaurant_id !== restaurantId) {
          return {
            isValid: false,
            errorCode: 'RESTAURANT_NOT_MATCH',
            message: '해당 식당에서 사용할 수 없는 쿠폰입니다',
          }
        }

        // 6. 최소 주문 금액 체크
        if (couponData.min_order_amount && orderAmount < couponData.min_order_amount) {
          return {
            isValid: false,
            errorCode: 'MIN_ORDER_NOT_MET',
            message: `최소 주문 금액 ${couponData.min_order_amount.toLocaleString()}원 이상이어야 합니다`,
          }
        }

        // 7. 사용자가 이미 사용했는지 체크
        const { data: userCoupon } = await supabase
          .from('user_coupons')
          .select('id, used_at')
          .eq('user_id', user.id)
          .eq('coupon_id', couponData.id)
          .single()

        if (userCoupon?.used_at) {
          return { isValid: false, errorCode: 'COUPON_ALREADY_USED', message: '이미 사용한 쿠폰입니다' }
        }

        // 유효한 쿠폰
        const coupon: Coupon = {
          id: couponData.id,
          code: couponData.code,
          name: couponData.name,
          description: couponData.description,
          discountType: couponData.discount_type as 'percentage' | 'fixed',
          discountValue: couponData.discount_value,
          minOrderAmount: couponData.min_order_amount,
          maxDiscountAmount: couponData.max_discount_amount,
          restaurantId: couponData.restaurant_id,
          startDate: couponData.start_date,
          endDate: couponData.end_date,
          totalQuantity: couponData.total_quantity,
          usedQuantity: couponData.used_quantity ?? 0,
          isActive: couponData.is_active ?? false,
          createdAt: couponData.created_at ?? new Date().toISOString(),
        }

        return { isValid: true, message: '사용 가능한 쿠폰입니다', coupon }
      } catch (err) {
        return { isValid: false, errorCode: 'COUPON_NOT_FOUND', message: '쿠폰 검증에 실패했습니다' }
      } finally {
        setIsValidating(false)
      }
    },
    [user, isClientReady]
  )

  return { validateCoupon, isValidating }
}

interface UseApplyCouponReturn {
  applyCoupon: (userCouponId: string, orderId: string) => Promise<boolean>
  isApplying: boolean
  error: string | null
}

/**
 * 쿠폰 사용 처리 훅
 */
export function useApplyCoupon(): UseApplyCouponReturn {
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
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyCoupon = useCallback(
    async (userCouponId: string, orderId: string): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsApplying(true)
      setError(null)

      try {
        // 1. user_coupon 사용 처리
        const { error: updateError } = await supabase
          .from('user_coupons')
          .update({
            used_at: new Date().toISOString(),
            order_id: orderId,
          })
          .eq('id', userCouponId)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        // 2. coupons 테이블 used_quantity 증가
        const { data: userCouponData } = await supabase
          .from('user_coupons')
          .select('coupon_id')
          .eq('id', userCouponId)
          .single()

        if (userCouponData) {
          await supabase.rpc('increment_coupon_usage', {
            coupon_id: userCouponData.coupon_id,
          })
        }

        return true
      } catch (err) {
        setError('쿠폰 적용에 실패했습니다')
        return false
      } finally {
        setIsApplying(false)
      }
    },
    [user, isClientReady]
  )

  return { applyCoupon, isApplying, error }
}

interface UseRegisterCouponReturn {
  registerCoupon: (couponCode: string) => Promise<boolean>
  isRegistering: boolean
  error: string | null
}

/**
 * 쿠폰 등록 훅 (코드 입력으로 쿠폰 획득)
 */
export function useRegisterCoupon(): UseRegisterCouponReturn {
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
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerCoupon = useCallback(
    async (couponCode: string): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsRegistering(true)
      setError(null)

      try {
        // 1. 쿠폰 조회
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode.toUpperCase())
          .single()

        if (couponError || !couponData) {
          setError('존재하지 않는 쿠폰 코드입니다')
          return false
        }

        // 2. 활성화 및 기간 체크
        const now = new Date().toISOString()
        if (!couponData.is_active) {
          setError('비활성화된 쿠폰입니다')
          return false
        }

        if (couponData.end_date < now) {
          setError('만료된 쿠폰입니다')
          return false
        }

        // 3. 이미 등록했는지 체크
        const { data: existingCoupon } = await supabase
          .from('user_coupons')
          .select('id')
          .eq('user_id', user.id)
          .eq('coupon_id', couponData.id)
          .single()

        if (existingCoupon) {
          setError('이미 등록한 쿠폰입니다')
          return false
        }

        // 4. 수량 체크
        if (
          couponData.total_quantity !== null &&
          couponData.used_quantity !== null &&
          couponData.used_quantity >= couponData.total_quantity
        ) {
          setError('소진된 쿠폰입니다')
          return false
        }

        // 5. 쿠폰 등록
        const { error: insertError } = await supabase.from('user_coupons').insert({
          user_id: user.id,
          coupon_id: couponData.id,
        })

        if (insertError) throw insertError

        return true
      } catch (err) {
        setError('쿠폰 등록에 실패했습니다')
        return false
      } finally {
        setIsRegistering(false)
      }
    },
    [user, isClientReady]
  )

  return { registerCoupon, isRegistering, error }
}

interface UseCreateCouponReturn {
  createCoupon: (input: CreateCouponInput) => Promise<Coupon | null>
  isCreating: boolean
  error: string | null
}

/**
 * 쿠폰 생성 훅 (관리자/점주용)
 */
export function useCreateCoupon(): UseCreateCouponReturn {
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

  const createCoupon = useCallback(
    async (input: CreateCouponInput): Promise<Coupon | null> => {
      if (!user || !supabaseRef.current || !isClientReady) return null

      const supabase = supabaseRef.current
      setIsCreating(true)
      setError(null)

      try {
        // 중복 코드 체크
        const { data: existing } = await supabase
          .from('coupons')
          .select('id')
          .eq('code', input.code.toUpperCase())
          .single()

        if (existing) {
          setError('이미 존재하는 쿠폰 코드입니다')
          return null
        }

        const { data, error: insertError } = await supabase
          .from('coupons')
          .insert({
            code: input.code.toUpperCase(),
            name: input.name,
            description: input.description ?? null,
            discount_type: input.discountType,
            discount_value: input.discountValue,
            min_order_amount: input.minOrderAmount ?? null,
            max_discount_amount: input.maxDiscountAmount ?? null,
            restaurant_id: input.restaurantId ?? null,
            start_date: input.startDate,
            end_date: input.endDate,
            total_quantity: input.totalQuantity ?? null,
            used_quantity: 0,
            is_active: true,
          })
          .select()
          .single()

        if (insertError) throw insertError

        return {
          id: data.id,
          code: data.code,
          name: data.name,
          description: data.description,
          discountType: data.discount_type as 'percentage' | 'fixed',
          discountValue: data.discount_value,
          minOrderAmount: data.min_order_amount,
          maxDiscountAmount: data.max_discount_amount,
          restaurantId: data.restaurant_id,
          startDate: data.start_date,
          endDate: data.end_date,
          totalQuantity: data.total_quantity,
          usedQuantity: data.used_quantity ?? 0,
          isActive: data.is_active ?? false,
          createdAt: data.created_at ?? new Date().toISOString(),
        }
      } catch (err) {
        setError('쿠폰 생성에 실패했습니다')
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [user, isClientReady]
  )

  return { createCoupon, isCreating, error }
}
