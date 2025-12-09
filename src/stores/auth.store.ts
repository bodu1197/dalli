import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'customer' | 'owner' | 'rider' | 'admin'

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  avatarUrl: string | null
  defaultAddressId: string | null
  createdAt: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (isLoading: boolean) => void
  signOut: () => void
  reset: () => void
}

const initialState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setProfile: (profile) =>
        set({ profile }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      signOut: () =>
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'dalligo-auth',
      partialize: (state) => ({
        // 민감한 정보는 persist하지 않음
        // 세션 복원은 Supabase가 처리
      }),
    }
  )
)
