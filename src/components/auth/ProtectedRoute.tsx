'use client'

import { useEffect, type PropsWithChildren } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import type { UserRole } from '@/stores/auth.store'

interface ProtectedRouteProps {
  readonly allowedRoles?: UserRole[]
  readonly redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: PropsWithChildren<ProtectedRouteProps>) {
  const router = useRouter()
  const { isAuthenticated, isLoading, profile } = useAuth()

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return
    }
    router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
  }, [isLoading, isAuthenticated, router, redirectTo])

  useEffect(() => {
    if (isLoading || !isAuthenticated || !allowedRoles || !profile) {
      return
    }
    if (allowedRoles.includes(profile.role)) {
      // Role is allowed
    } else {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, allowedRoles, profile, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    if (allowedRoles && profile) {
      if (allowedRoles.includes(profile.role)) {
        return <>{children}</>
      }
      return null
    }
    return <>{children}</>
  }

  return null
}
