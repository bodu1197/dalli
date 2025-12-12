/**
 * 결제 수단 관리 훅
 * - 결제 수단 목록 조회
 * - 결제 수단 추가/수정/삭제
 * - 기본 결제 수단 설정
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import type {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from '@/types/user-features.types'

// Query Keys
export const paymentMethodsKeys = {
  all: ['paymentMethods'] as const,
  list: () => [...paymentMethodsKeys.all, 'list'] as const,
  default: () => [...paymentMethodsKeys.all, 'default'] as const,
  detail: (id: string) => [...paymentMethodsKeys.all, 'detail', id] as const,
}

/**
 * 결제 수단 목록 조회 훅
 */
export function usePaymentMethods() {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: paymentMethodsKeys.list(),
    queryFn: async (): Promise<PaymentMethod[]> => {
      if (!user?.id) {
        return []
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`결제 수단 조회 실패: ${error.message}`)
      }

      return data as PaymentMethod[]
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10분
  })
}

/**
 * 기본 결제 수단 조회 훅
 */
export function useDefaultPaymentMethod() {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: paymentMethodsKeys.default(),
    queryFn: async (): Promise<PaymentMethod | null> => {
      if (!user?.id) {
        return null
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_default', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 기본 결제 수단이 없는 경우
          return null
        }
        throw new Error(`기본 결제 수단 조회 실패: ${error.message}`)
      }

      return data as PaymentMethod
    },
    enabled: !!user?.id,
  })
}

/**
 * 결제 수단 추가 훅
 */
export function useAddPaymentMethod() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePaymentMethodInput): Promise<PaymentMethod> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      // 첫 번째 결제 수단이면 자동으로 기본으로 설정
      const { count } = await supabase
        .from('payment_methods')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      const isFirst = count === 0

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          ...input,
          is_default: input.is_default ?? isFirst,
          is_verified: true, // 실제로는 PG사 검증 필요
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`결제 수단 추가 실패: ${error.message}`)
      }

      return data as PaymentMethod
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all })
    },
  })
}

/**
 * 결제 수단 수정 훅
 */
export function useUpdatePaymentMethod() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdatePaymentMethodInput
    }): Promise<PaymentMethod> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`결제 수단 수정 실패: ${error.message}`)
      }

      return data as PaymentMethod
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all })
    },
  })
}

/**
 * 기본 결제 수단 설정 훅
 */
export function useSetDefaultPaymentMethod() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentMethodId: string): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      // RPC 함수 사용 시도
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'set_default_payment_method',
        {
          p_user_id: user.id,
          p_payment_id: paymentMethodId,
        }
      )

      if (rpcError) {
        // RPC가 없는 경우 직접 처리
        // 1. 모든 결제 수단 is_default를 false로
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)

        // 2. 선택한 결제 수단만 true로
        const { error } = await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', paymentMethodId)
          .eq('user_id', user.id)

        if (error) {
          throw new Error(`기본 결제 수단 설정 실패: ${error.message}`)
        }

        return true
      }

      return rpcResult as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all })
    },
  })
}

/**
 * 결제 수단 삭제 훅 (소프트 삭제 - is_active = false)
 */
export function useDeletePaymentMethod() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentMethodId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      // 기본 결제 수단인지 확인
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('is_default')
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)
        .single()

      if (paymentMethod?.is_default) {
        throw new Error('기본 결제 수단은 삭제할 수 없습니다. 다른 결제 수단을 기본으로 설정한 후 삭제해주세요.')
      }

      // 소프트 삭제
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`결제 수단 삭제 실패: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all })
    },
  })
}

/**
 * 결제 수단 완전 삭제 훅 (하드 삭제)
 */
export function useHardDeletePaymentMethod() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentMethodId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)
        .eq('is_default', false) // 기본 결제 수단은 삭제 불가

      if (error) {
        throw new Error(`결제 수단 삭제 실패: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all })
    },
  })
}
