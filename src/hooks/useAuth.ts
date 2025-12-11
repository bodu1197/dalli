'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type UserProfile, type UserRole } from '@/stores/auth.store'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function useAuth() {
  const router = useRouter()
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)

  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    setUser,
    setProfile,
    setLoading,
    signOut: clearAuth
  } = useAuthStore()

  // 클라이언트 사이드에서만 Supabase 클라이언트 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && !supabaseRef.current) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        supabaseRef.current = createClient()
        setIsClientReady(true)
      })
    }
  }, [])

  // 프로필 조회
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!supabaseRef.current) return null

    try {
      const { data, error } = await supabaseRef.current
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // 프로필이 없으면 null 반환 (아직 생성 전일 수 있음)
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role as UserRole,
        avatarUrl: data.avatar_url,
        defaultAddressId: data.default_address_id,
        createdAt: data.created_at ?? new Date().toISOString(),
      }

      setProfile(userProfile)
      return userProfile
    } catch (error) {
      console.error('Fetch profile error:', error)
      return null
    }
  }, [setProfile])

  // 세션 초기화 및 구독
  useEffect(() => {
    if (!isClientReady || !supabaseRef.current) return

    const supabase = supabaseRef.current

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
        setUser(null)
      }
    }

    initAuth()

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [isClientReady, setUser, setProfile, clearAuth, fetchProfile])

  // 이메일 로그인
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabaseRef.current) return { data: null, error: new Error('Client not ready') }

    setLoading(true)
    try {
      const { data, error } = await supabaseRef.current.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // 이메일 회원가입
  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    metadata: { name: string; role: UserRole; phone?: string }
  ) => {
    if (!supabaseRef.current) return { data: null, error: new Error('Client not ready') }

    setLoading(true)
    try {
      const { data, error } = await supabaseRef.current.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            role: metadata.role,
            phone: metadata.phone,
          },
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // 소셜 로그인
  const signInWithOAuth = useCallback(async (provider: 'kakao' | 'google') => {
    if (!supabaseRef.current) return { data: null, error: new Error('Client not ready') }

    setLoading(true)
    try {
      const { data, error } = await supabaseRef.current.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // 로그아웃
  const signOut = useCallback(async () => {
    if (!supabaseRef.current) return { error: new Error('Client not ready') }

    setLoading(true)
    try {
      const { error } = await supabaseRef.current.auth.signOut()
      if (error) throw error

      clearAuth()
      router.push('/login')

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [clearAuth, router, setLoading])

  // 비밀번호 재설정 요청
  const resetPassword = useCallback(async (email: string) => {
    if (!supabaseRef.current) return { data: null, error: new Error('Client not ready') }

    setLoading(true)
    try {
      const { data, error } = await supabaseRef.current.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // 비밀번호 업데이트
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabaseRef.current) return { data: null, error: new Error('Client not ready') }

    setLoading(true)
    try {
      const { data, error } = await supabaseRef.current.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    fetchProfile,
  }
}
