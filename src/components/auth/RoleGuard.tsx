'use client'

import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/stores/auth.store'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

/**
 * 역할 기반 컴포넌트 렌더링 가드
 * 특정 역할을 가진 사용자에게만 children을 렌더링
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { profile, isAuthenticated } = useAuth()

  if (!isAuthenticated || !profile) {
    return <>{fallback}</>
  }

  if (!allowedRoles.includes(profile.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
