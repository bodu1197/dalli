'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, type UserProfile, type UserRole } from '@/stores/auth.store'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()
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

  // 세션 초기화 및 구독
  useEffect(() => {
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
  }, [])

  // 프로필 조회
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
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
        createdAt: data.created_at,
      }

      setProfile(userProfile)
      return userProfile
    } catch (error) {
      console.error('Fetch profile error:', error)
      return null
    }
  }

  // 이메일 로그인
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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
  }, [supabase, setLoading])

  // 이메일 회원가입
  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    metadata: { name: string; role: UserRole; phone?: string }
  ) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
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
  }, [supabase, setLoading])

  // 소셜 로그인
  const signInWithOAuth = useCallback(async (provider: 'kakao' | 'google') => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
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
  }, [supabase, setLoading])

  // 로그아웃
  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      clearAuth()
      router.push('/login')

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [supabase, clearAuth, router, setLoading])

  // 비밀번호 재설정 요청
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [supabase, setLoading])

  // 비밀번호 업데이트
  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [supabase, setLoading])

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
