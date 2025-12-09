import { z } from 'zod'

// 이메일 검증
export const emailSchema = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .email('올바른 이메일 형식이 아닙니다')

// 비밀번호 검증
export const passwordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요')
  .min(8, '비밀번호는 8자 이상이어야 합니다')
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)/,
    '비밀번호는 영문과 숫자를 포함해야 합니다'
  )

// 이름 검증
export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요')
  .min(2, '이름은 2자 이상이어야 합니다')
  .max(20, '이름은 20자 이하여야 합니다')

// 휴대폰 번호 검증
export const phoneSchema = z
  .string()
  .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 휴대폰 번호 형식이 아닙니다')
  .optional()
  .or(z.literal(''))

// 역할 검증
export const roleSchema = z.enum(['customer', 'owner', 'rider'], {
  message: '역할을 선택해주세요',
})

// 로그인 폼 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// 회원가입 폼 스키마
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    name: nameSchema,
    phone: phoneSchema,
    role: roleSchema,
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: '이용약관에 동의해주세요',
      }),
    agreePrivacy: z
      .boolean()
      .refine((val) => val === true, {
        message: '개인정보 처리방침에 동의해주세요',
      }),
    agreeMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

// 비밀번호 재설정 요청 스키마
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// 비밀번호 재설정 스키마
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
