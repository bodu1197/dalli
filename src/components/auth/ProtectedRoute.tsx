'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import type { UserRole } from '@/stores/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, profile } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  useEffect(() => {
    if (!isLoading && isAuthenticated && allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        router.push('/')
      }
    }
  }, [isLoading, isAuthenticated, allowedRoles, profile, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
}
