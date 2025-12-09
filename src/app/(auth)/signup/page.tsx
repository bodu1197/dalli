'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ChevronLeft, Check } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
type SignUpRole = 'customer' | 'owner' | 'rider'

const roles: { value: SignUpRole; label: string; description: string }[] = [
  { value: 'customer', label: '일반 사용자', description: '음식을 주문하고 배달 받아요' },
  { value: 'owner', label: '사장님', description: '가게를 운영하고 주문을 받아요' },
  { value: 'rider', label: '라이더', description: '음식을 배달해요' },
]

export default function SignUpPage() {
  const router = useRouter()
  const { signUpWithEmail, isLoading } = useAuth()

  const [step, setStep] = useState<'role' | 'form'>('role')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'customer',
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  })

  const selectedRole = watch('role')
  const agreeTerms = watch('agreeTerms')
  const agreePrivacy = watch('agreePrivacy')
  const agreeMarketing = watch('agreeMarketing')

  const handleRoleSelect = (role: SignUpRole) => {
    setValue('role', role)
    setStep('form')
  }

  const handleAllAgree = () => {
    const allAgreed = agreeTerms && agreePrivacy && agreeMarketing
    setValue('agreeTerms', !allAgreed)
    setValue('agreePrivacy', !allAgreed)
    setValue('agreeMarketing', !allAgreed)
  }

  const onSubmit = async (data: SignUpFormData) => {
    setError(null)

    const { error } = await signUpWithEmail(data.email, data.password, {
      name: data.name,
      role: data.role,
      phone: data.phone || undefined,
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일입니다')
      } else {
        setError('회원가입 중 오류가 발생했습니다')
      }
      return
    }

    setSuccess(true)
  }

  // 성공 화면
  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <div className="w-16 h-16 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">가입이 완료되었습니다!</h2>
        <p className="text-[var(--color-neutral-500)] text-center mb-8">
          이메일 인증 후 서비스를 이용할 수 있습니다.<br />
          입력하신 이메일을 확인해주세요.
        </p>
        <Button onClick={() => router.push('/login')} fullWidth size="lg">
          로그인하기
        </Button>
      </div>
    )
  }

  // 역할 선택 화면
  if (step === 'role') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="h-14 flex items-center px-4 border-b border-[var(--color-neutral-100)]">
          <Link href="/login" className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold pr-8">회원가입</h1>
        </header>

        <main className="flex-1 px-5 py-8">
          <h2 className="text-2xl font-bold mb-2">어떤 서비스를 이용하시겠어요?</h2>
          <p className="text-[var(--color-neutral-500)] mb-8">
            이용 목적에 맞는 유형을 선택해주세요
          </p>

          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => handleRoleSelect(role.value)}
                className={cn(
                  'w-full p-5 rounded-2xl border-2 text-left transition-all',
                  selectedRole === role.value
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                    : 'border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{role.label}</h3>
                    <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                      {role.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      selectedRole === role.value
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                        : 'border-[var(--color-neutral-300)]'
                    )}
                  >
                    {selectedRole === role.value && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // 폼 입력 화면
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 flex items-center px-4 border-b border-[var(--color-neutral-100)]">
        <button onClick={() => setStep('role')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-8">회원가입</h1>
      </header>

      <main className="flex-1 px-5 py-8 pb-24">
        {/* 선택된 역할 표시 */}
        <div className="mb-6 p-3 bg-[var(--color-neutral-50)] rounded-xl">
          <span className="text-sm text-[var(--color-neutral-500)]">가입 유형: </span>
          <span className="text-sm font-semibold">
            {roles.find((r) => r.value === selectedRole)?.label}
          </span>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              placeholder="8자 이상, 영문+숫자 조합"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-[var(--color-neutral-400)]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="비밀번호 확인"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력해주세요"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[38px] text-[var(--color-neutral-400)]"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Input
            label="이름"
            type="text"
            placeholder="이름을 입력해주세요"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="휴대폰 번호 (선택)"
            type="tel"
            placeholder="010-0000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {/* 약관 동의 */}
          <div className="pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(agreeTerms && agreePrivacy && agreeMarketing)}
                onChange={handleAllAgree}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center',
                  Boolean(agreeTerms && agreePrivacy && agreeMarketing)
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                    : 'border-[var(--color-neutral-300)]'
                )}
              >
                {Boolean(agreeTerms && agreePrivacy && agreeMarketing) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-semibold">전체 동의</span>
            </label>

            <div className="h-px bg-[var(--color-neutral-100)]" />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center',
                  agreeTerms
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                    : 'border-[var(--color-neutral-300)]'
                )}
              >
                {agreeTerms && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">
                <span className="text-red-500">[필수]</span> 이용약관 동의
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-sm text-red-500 ml-8">{errors.agreeTerms.message}</p>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreePrivacy')}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center',
                  agreePrivacy
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                    : 'border-[var(--color-neutral-300)]'
                )}
              >
                {agreePrivacy && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">
                <span className="text-red-500">[필수]</span> 개인정보 처리방침 동의
              </span>
            </label>
            {errors.agreePrivacy && (
              <p className="text-sm text-red-500 ml-8">{errors.agreePrivacy.message}</p>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeMarketing')}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center',
                  agreeMarketing
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                    : 'border-[var(--color-neutral-300)]'
                )}
              >
                {agreeMarketing && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-[var(--color-neutral-500)]">
                [선택] 마케팅 정보 수신 동의
              </span>
            </label>
          </div>
        </form>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)] safe-area-bottom">
        <Button
          onClick={handleSubmit(onSubmit)}
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          가입하기
        </Button>
      </div>
    </div>
  )
}
