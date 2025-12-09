'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const { signInWithEmail, signInWithOAuth, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    const { error } = await signInWithEmail(data.email, data.password)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다')
      } else {
        setError('로그인 중 오류가 발생했습니다')
      }
      return
    }

    router.push(redirectTo)
  }

  const handleOAuthLogin = async (provider: 'kakao' | 'google') => {
    setError(null)
    const { error } = await signInWithOAuth(provider)

    if (error) {
      setError('소셜 로그인 중 오류가 발생했습니다')
    }
  }

  return (
    <>
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="email"
          placeholder="이메일"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          로그인
        </Button>
      </form>

      {/* 비밀번호 찾기 */}
      <div className="text-center mt-4">
        <Link
          href="/forgot-password"
          className="text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      {/* 구분선 */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-neutral-200)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-[var(--color-neutral-400)]">
            또는
          </span>
        </div>
      </div>

      {/* 소셜 로그인 */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuthLogin('kakao')}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-medium rounded-xl hover:bg-[#FDD800] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.03 5.938-.124.456-.79 2.898-.817 3.103 0 0-.016.134.07.186.087.052.19.012.19.012.25-.034 2.896-1.896 3.36-2.218.38.054.77.082 1.167.082 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
          </svg>
          카카오로 계속하기
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] font-medium rounded-xl hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>
      </div>

      {/* 회원가입 링크 */}
      <div className="text-center mt-8">
        <span className="text-sm text-[var(--color-neutral-500)]">
          아직 계정이 없으신가요?{' '}
        </span>
        <Link
          href="/signup"
          className="text-sm font-semibold text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]"
        >
          회원가입
        </Link>
      </div>
    </>
  )
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner size="lg" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="h-14 flex items-center justify-center border-b border-[var(--color-neutral-100)]">
        <h1 className="text-lg font-semibold">로그인</h1>
      </header>

      <main className="flex-1 px-5 py-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--color-primary-500)]">달리고</h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-2">
            빠르게 달리고, 맛있게 도착하고
          </p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  )
}
