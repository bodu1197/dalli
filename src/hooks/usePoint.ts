'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type {
  PointTransaction,
  UserPointInfo,
  EarnPointInput,
  UsePointInput,
  POINT_POLICY,
  calculateEarnPoints,
  canUsePoints,
  getPointExpiryDate,
} from '@/types/point.types'

interface UsePointBalanceReturn {
  balance: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 사용자 포인트 잔액 조회 훅
 */
export function usePointBalance(): UsePointBalanceReturn {
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
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!user || !supabaseRef.current) return

    const supabase = supabaseRef.current
    setIsLoading(true)
    setError(null)

    try {
      // getUser()로 서버에서 실제 세션 검증 (getSession은 캐시만 반환)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        setError('로그인이 필요합니다')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('point_balance')
        .eq('id', authUser.id)
        .single()

      if (fetchError) throw fetchError

      setBalance(data?.point_balance ?? 0)
    } catch (err) {
      setError('포인트 잔액을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isClientReady && user) {
      fetchBalance()
    }
  }, [isClientReady, user, fetchBalance])

  return { balance, isLoading, error, refetch: fetchBalance }
}

interface UsePointInfoReturn {
  pointInfo: UserPointInfo | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 사용자 포인트 상세 정보 조회 훅
 */
export function usePointInfo(): UsePointInfoReturn {
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
  const [pointInfo, setPointInfo] = useState<UserPointInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPointInfo = useCallback(async () => {
    if (!user || !supabaseRef.current) return

    const supabase = supabaseRef.current
    setIsLoading(true)
    setError(null)

    try {
      // getUser()로 서버에서 실제 세션 검증 (getSession은 캐시만 반환)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        setError('로그인이 필요합니다')
        return
      }

      // 1. 현재 잔액 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('point_balance')
        .eq('id', authUser.id)
        .single()

      if (userError) throw userError

      // 2. 총 적립액 조회
      const { data: earnData } = await supabase
        .from('point_transactions')
        .select('amount')
        .eq('user_id', authUser.id)
        .in('type', ['earn', 'admin_add'])

      const totalEarned = (earnData ?? []).reduce((sum, item) => sum + item.amount, 0)

      // 3. 총 사용액 조회
      const { data: useData } = await supabase
        .from('point_transactions')
        .select('amount')
        .eq('user_id', authUser.id)
        .in('type', ['use', 'admin_deduct', 'expire'])

      const totalUsed = Math.abs(
        (useData ?? []).reduce((sum, item) => sum + item.amount, 0)
      )

      // 4. 이번달 만료 예정 포인트
      const now = new Date()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const { data: expiringData } = await supabase
        .from('point_transactions')
        .select('amount, balance_after')
        .eq('user_id', authUser.id)
        .eq('type', 'earn')
        .gte('expires_at', now.toISOString())
        .lte('expires_at', endOfMonth.toISOString())

      // 만료 예정 포인트 계산 (단순화: 적립된 포인트 중 잔액 내에서 만료 예정인 금액)
      const expiringThisMonth = (expiringData ?? []).reduce(
        (sum, item) => sum + item.amount,
        0
      )

      setPointInfo({
        balance: userData?.point_balance ?? 0,
        totalEarned,
        totalUsed,
        expiringThisMonth: Math.min(expiringThisMonth, userData?.point_balance ?? 0),
      })
    } catch (err) {
      setError('포인트 정보를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isClientReady && user) {
      fetchPointInfo()
    }
  }, [isClientReady, user, fetchPointInfo])

  return { pointInfo, isLoading, error, refetch: fetchPointInfo }
}

interface UsePointTransactionsReturn {
  transactions: PointTransaction[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

/**
 * 포인트 거래 내역 조회 훅
 */
export function usePointTransactions(limit: number = 20): UsePointTransactionsReturn {
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
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const fetchTransactions = useCallback(
    async (reset: boolean = false) => {
      if (!user || !supabaseRef.current) return

      const supabase = supabaseRef.current
      setIsLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset

      try {
        // getUser()로 서버에서 실제 세션 검증 (getSession은 캐시만 반환)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
          setError('로그인이 필요합니다')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + limit - 1)

        if (fetchError) throw fetchError

        const formattedTransactions: PointTransaction[] = (data ?? []).map((tx) => ({
          id: tx.id,
          userId: tx.user_id,
          orderId: tx.order_id,
          type: tx.type as PointTransaction['type'],
          amount: tx.amount,
          balanceAfter: tx.balance_after,
          description: tx.description,
          expiresAt: tx.expires_at,
          createdAt: tx.created_at ?? new Date().toISOString(),
        }))

        if (reset) {
          setTransactions(formattedTransactions)
          setOffset(limit)
        } else {
          setTransactions((prev) => [...prev, ...formattedTransactions])
          setOffset((prev) => prev + limit)
        }

        setHasMore(formattedTransactions.length === limit)
      } catch (err) {
        setError('포인트 내역을 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    },
    [user, offset, limit]
  )

  useEffect(() => {
    if (isClientReady && user) {
      fetchTransactions(true)
    }
  }, [isClientReady, user])

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchTransactions(false)
    }
  }, [fetchTransactions, isLoading, hasMore])

  const refetch = useCallback(async () => {
    setOffset(0)
    await fetchTransactions(true)
  }, [fetchTransactions])

  return { transactions, isLoading, error, hasMore, loadMore, refetch }
}

interface UseEarnPointsReturn {
  earnPoints: (input: EarnPointInput) => Promise<boolean>
  isEarning: boolean
  error: string | null
}

/**
 * 포인트 적립 훅 (주문 완료 시)
 */
export function useEarnPoints(): UseEarnPointsReturn {
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

  const [isEarning, setIsEarning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const earnPoints = useCallback(
    async (input: EarnPointInput): Promise<boolean> => {
      if (!supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsEarning(true)
      setError(null)

      try {
        const { getPointExpiryDate } = await import('@/types/point.types')

        // 1. 현재 잔액 조회
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('point_balance')
          .eq('id', input.userId)
          .single()

        if (userError) throw userError

        const currentBalance = userData?.point_balance ?? 0
        const newBalance = currentBalance + input.amount

        // 2. 거래 내역 추가
        const { error: txError } = await supabase.from('point_transactions').insert({
          user_id: input.userId,
          order_id: input.orderId,
          type: 'earn',
          amount: input.amount,
          balance_after: newBalance,
          description: input.description ?? '주문 적립',
          expires_at: input.expiresAt ?? getPointExpiryDate(),
        })

        if (txError) throw txError

        // 3. 잔액 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update({ point_balance: newBalance })
          .eq('id', input.userId)

        if (updateError) throw updateError

        return true
      } catch (err) {
        setError('포인트 적립에 실패했습니다')
        return false
      } finally {
        setIsEarning(false)
      }
    },
    [isClientReady]
  )

  return { earnPoints, isEarning, error }
}

interface UseUsePointsReturn {
  usePoints: (input: UsePointInput) => Promise<boolean>
  isUsing: boolean
  error: string | null
}

/**
 * 포인트 사용 훅 (결제 시)
 */
export function useUsePoints(): UseUsePointsReturn {
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
  const [isUsing, setIsUsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usePoints = useCallback(
    async (input: UsePointInput): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsUsing(true)
      setError(null)

      try {
        const { canUsePoints: checkCanUse, POINT_POLICY } = await import(
          '@/types/point.types'
        )

        // 1. 현재 잔액 조회 및 검증
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('point_balance')
          .eq('id', input.userId)
          .single()

        if (userError) throw userError

        const currentBalance = userData?.point_balance ?? 0

        // 사용 가능 여부 체크
        if (!checkCanUse(currentBalance, input.amount)) {
          if (input.amount < POINT_POLICY.MIN_USE_AMOUNT) {
            setError(`최소 ${POINT_POLICY.MIN_USE_AMOUNT.toLocaleString()}원 이상 사용 가능합니다`)
          } else if (input.amount % POINT_POLICY.USE_UNIT !== 0) {
            setError(`${POINT_POLICY.USE_UNIT}원 단위로 사용 가능합니다`)
          } else {
            setError('포인트 잔액이 부족합니다')
          }
          return false
        }

        const newBalance = currentBalance - input.amount

        // 2. 거래 내역 추가 (음수로 저장)
        const { error: txError } = await supabase.from('point_transactions').insert({
          user_id: input.userId,
          order_id: input.orderId,
          type: 'use',
          amount: -input.amount, // 음수
          balance_after: newBalance,
          description: input.description ?? '주문 사용',
        })

        if (txError) throw txError

        // 3. 잔액 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update({ point_balance: newBalance })
          .eq('id', input.userId)

        if (updateError) throw updateError

        return true
      } catch (err) {
        setError('포인트 사용에 실패했습니다')
        return false
      } finally {
        setIsUsing(false)
      }
    },
    [user, isClientReady]
  )

  return { usePoints, isUsing, error }
}

interface UseRefundPointsReturn {
  refundPoints: (userId: string, orderId: string, amount: number) => Promise<boolean>
  isRefunding: boolean
  error: string | null
}

/**
 * 포인트 환불 훅 (주문 취소 시)
 */
export function useRefundPoints(): UseRefundPointsReturn {
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

  const [isRefunding, setIsRefunding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refundPoints = useCallback(
    async (userId: string, orderId: string, amount: number): Promise<boolean> => {
      if (!supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsRefunding(true)
      setError(null)

      try {
        // 1. 현재 잔액 조회
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('point_balance')
          .eq('id', userId)
          .single()

        if (userError) throw userError

        const currentBalance = userData?.point_balance ?? 0
        const newBalance = currentBalance + amount

        // 2. 거래 내역 추가 (환불은 양수)
        const { error: txError } = await supabase.from('point_transactions').insert({
          user_id: userId,
          order_id: orderId,
          type: 'admin_add', // 환불은 관리자 지급과 동일하게 처리
          amount: amount,
          balance_after: newBalance,
          description: '주문 취소 포인트 환불',
        })

        if (txError) throw txError

        // 3. 잔액 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update({ point_balance: newBalance })
          .eq('id', userId)

        if (updateError) throw updateError

        return true
      } catch (err) {
        setError('포인트 환불에 실패했습니다')
        return false
      } finally {
        setIsRefunding(false)
      }
    },
    [isClientReady]
  )

  return { refundPoints, isRefunding, error }
}

interface UseAdminPointReturn {
  addPoints: (userId: string, amount: number, description: string) => Promise<boolean>
  deductPoints: (userId: string, amount: number, description: string) => Promise<boolean>
  isProcessing: boolean
  error: string | null
}

/**
 * 관리자 포인트 지급/차감 훅
 */
export function useAdminPoint(): UseAdminPointReturn {
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addPoints = useCallback(
    async (userId: string, amount: number, description: string): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsProcessing(true)
      setError(null)

      try {
        // 1. 현재 잔액 조회
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('point_balance')
          .eq('id', userId)
          .single()

        if (userError) throw userError

        const currentBalance = userData?.point_balance ?? 0
        const newBalance = currentBalance + amount

        // 2. 거래 내역 추가
        const { error: txError } = await supabase.from('point_transactions').insert({
          user_id: userId,
          type: 'admin_add',
          amount: amount,
          balance_after: newBalance,
          description: description,
        })

        if (txError) throw txError

        // 3. 잔액 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update({ point_balance: newBalance })
          .eq('id', userId)

        if (updateError) throw updateError

        return true
      } catch (err) {
        setError('포인트 지급에 실패했습니다')
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [user, isClientReady]
  )

  const deductPoints = useCallback(
    async (userId: string, amount: number, description: string): Promise<boolean> => {
      if (!user || !supabaseRef.current || !isClientReady) return false

      const supabase = supabaseRef.current
      setIsProcessing(true)
      setError(null)

      try {
        // 1. 현재 잔액 조회
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('point_balance')
          .eq('id', userId)
          .single()

        if (userError) throw userError

        const currentBalance = userData?.point_balance ?? 0

        if (currentBalance < amount) {
          setError('차감할 포인트보다 잔액이 적습니다')
          return false
        }

        const newBalance = currentBalance - amount

        // 2. 거래 내역 추가
        const { error: txError } = await supabase.from('point_transactions').insert({
          user_id: userId,
          type: 'admin_deduct',
          amount: -amount, // 음수
          balance_after: newBalance,
          description: description,
        })

        if (txError) throw txError

        // 3. 잔액 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update({ point_balance: newBalance })
          .eq('id', userId)

        if (updateError) throw updateError

        return true
      } catch (err) {
        setError('포인트 차감에 실패했습니다')
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [user, isClientReady]
  )

  return { addPoints, deductPoints, isProcessing, error }
}
