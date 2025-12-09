'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useLocationStore } from '@/stores/location.store'
import type { Address, AddressInput } from '@/types/address.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

interface UseAddressReturn {
  addresses: Address[]
  isLoading: boolean
  error: string | null
  fetchAddresses: () => Promise<void>
  addAddress: (input: AddressInput) => Promise<Address | null>
  updateAddress: (id: string, input: Partial<AddressInput>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  setDefaultAddress: (id: string) => Promise<boolean>
}

/**
 * 사용자 주소 관리 훅
 */
export function useAddress(): UseAddressReturn {
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)

  // 클라이언트 사이드에서만 Supabase 클라이언트 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
      })
    }
  }, [])
  const { user } = useAuthStore()
  const { setSelectedAddress, addRecentAddress } = useLocationStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 주소 목록 조회
  const fetchAddresses = useCallback(async () => {
    if (!user || !supabaseRef.current) return

    const supabase = supabaseRef.current

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const formattedAddresses: Address[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        label: item.label,
        address: item.address,
        detail: item.detail,
        lat: item.lat,
        lng: item.lng,
        isDefault: item.is_default,
        createdAt: item.created_at,
      }))

      setAddresses(formattedAddresses)
    } catch (err) {
      console.error('주소 조회 실패:', err)
      setError('주소를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 주소 추가
  const addAddress = useCallback(
    async (input: AddressInput): Promise<Address | null> => {
      if (!user || !supabaseRef.current) return null

      const supabase = supabaseRef.current

      setIsLoading(true)
      setError(null)

      try {
        // 첫 번째 주소이면 기본 주소로 설정
        const isFirstAddress = addresses.length === 0
        const isDefault = input.isDefault || isFirstAddress

        // 기본 주소로 설정하면 기존 기본 주소 해제
        if (isDefault && addresses.length > 0) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .eq('is_default', true)
        }

        const { data, error: insertError } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            label: input.label || null,
            address: input.address,
            detail: input.detail || null,
            lat: input.lat,
            lng: input.lng,
            is_default: isDefault,
          })
          .select()
          .single()

        if (insertError) throw insertError

        const newAddress: Address = {
          id: data.id,
          userId: data.user_id,
          label: data.label,
          address: data.address,
          detail: data.detail,
          lat: data.lat,
          lng: data.lng,
          isDefault: data.is_default,
          createdAt: data.created_at,
        }

        setAddresses((prev) => [newAddress, ...prev])
        addRecentAddress(newAddress)

        // 기본 주소면 선택된 주소로 설정
        if (isDefault) {
          setSelectedAddress(newAddress)
        }

        return newAddress
      } catch (err) {
        console.error('주소 추가 실패:', err)
        setError('주소 추가에 실패했습니다')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user, addresses.length, addRecentAddress, setSelectedAddress]
  )

  // 주소 수정
  const updateAddress = useCallback(
    async (id: string, input: Partial<AddressInput>): Promise<boolean> => {
      if (!user || !supabaseRef.current) return false

      const supabase = supabaseRef.current

      setIsLoading(true)
      setError(null)

      try {
        const { error: updateError } = await supabase
          .from('addresses')
          .update({
            label: input.label,
            address: input.address,
            detail: input.detail,
            lat: input.lat,
            lng: input.lng,
          })
          .eq('id', id)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        await fetchAddresses()
        return true
      } catch (err) {
        console.error('주소 수정 실패:', err)
        setError('주소 수정에 실패했습니다')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user, fetchAddresses]
  )

  // 주소 삭제
  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user || !supabaseRef.current) return false

      const supabase = supabaseRef.current

      setIsLoading(true)
      setError(null)

      try {
        const { error: deleteError } = await supabase
          .from('addresses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        setAddresses((prev) => prev.filter((a) => a.id !== id))
        return true
      } catch (err) {
        console.error('주소 삭제 실패:', err)
        setError('주소 삭제에 실패했습니다')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  // 기본 주소 설정
  const setDefaultAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user || !supabaseRef.current) return false

      const supabase = supabaseRef.current

      setIsLoading(true)
      setError(null)

      try {
        // 기존 기본 주소 해제
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)

        // 새 기본 주소 설정
        const { error: updateError } = await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', id)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        await fetchAddresses()

        // 선택된 주소 업데이트
        const newDefault = addresses.find((a) => a.id === id)
        if (newDefault) {
          setSelectedAddress({ ...newDefault, isDefault: true })
        }

        return true
      } catch (err) {
        console.error('기본 주소 설정 실패:', err)
        setError('기본 주소 설정에 실패했습니다')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user, addresses, fetchAddresses, setSelectedAddress]
  )

  // 초기 로드
  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user, fetchAddresses])

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  }
}
