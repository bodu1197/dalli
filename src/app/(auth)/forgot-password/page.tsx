'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Mail, Check } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)
    const { error } = await resetPassword(data.email)

    if (error) {
      setError('비밀번호 재설정 이메일 발송에 실패했습니다')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="h-14 flex items-center px-4 border-b border-[var(--color-neutral-100)]">
          <Link href="/login" className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold pr-8">비밀번호 찾기</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-16 h-16 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">이메일을 확인해주세요</h2>
          <p className="text-[var(--color-neutral-500)] text-center mb-2">
            비밀번호 재설정 링크를 발송했습니다.
          </p>
          <p className="text-[var(--color-neutral-700)] font-medium mb-8">
            {getValues('email')}
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" fullWidth size="lg">
              로그인으로 돌아가기
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 flex items-center px-4 border-b border-[var(--color-neutral-100)]">
        <Link href="/login" className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold pr-8">비밀번호 찾기</h1>
      </header>

      <main className="flex-1 px-5 py-8">
        <h2 className="text-2xl font-bold mb-2">비밀번호를 잊으셨나요?</h2>
        <p className="text-[var(--color-neutral-500)] mb-8">
          가입한 이메일 주소를 입력하시면<br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder="이메일 주소"
            leftIcon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            비밀번호 재설정 링크 받기
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  )
}
