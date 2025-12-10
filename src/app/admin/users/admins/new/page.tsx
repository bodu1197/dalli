'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react'
import { z } from 'zod'
import { IconInput } from '@/components/ui/IconInput'


// Zod Schema for validation
const adminFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string().regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다').regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대소문자와 숫자를 포함해야 합니다'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'manager', 'support']),
  department: z.string().min(1, '부서를 선택해주세요'),
  permissions: z.array(z.string()).min(1, '최소 하나의 권한을 선택해주세요'),
  requireTwoFactor: z.boolean(),
  sendWelcomeEmail: z.boolean()
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
})

// Types
interface AdminFormData extends z.infer<typeof adminFormSchema> {}

// Permission groups
const permissionGroups = [
  {
    id: 'users',
    label: '사용자 관리',
    permissions: [
      { id: 'users.view', label: '사용자 조회' },
      { id: 'users.edit', label: '사용자 수정' },
      { id: 'users.delete', label: '사용자 삭제' },
      { id: 'users.ban', label: '사용자 차단' }
    ]
  },
  {
    id: 'orders',
    label: '주문 관리',
    permissions: [
      { id: 'orders.view', label: '주문 조회' },
      { id: 'orders.edit', label: '주문 수정' },
      { id: 'orders.cancel', label: '주문 취소' },
      { id: 'orders.refund', label: '환불 처리' }
    ]
  },
  {
    id: 'stores',
    label: '가게 관리',
    permissions: [
      { id: 'stores.view', label: '가게 조회' },
      { id: 'stores.edit', label: '가게 수정' },
      { id: 'stores.approve', label: '가게 승인' },
      { id: 'stores.suspend', label: '가게 정지' }
    ]
  },
  {
    id: 'riders',
    label: '라이더 관리',
    permissions: [
      { id: 'riders.view', label: '라이더 조회' },
      { id: 'riders.edit', label: '라이더 수정' },
      { id: 'riders.approve', label: '라이더 승인' },
      { id: 'riders.suspend', label: '라이더 정지' }
    ]
  },
  {
    id: 'settlements',
    label: '정산 관리',
    permissions: [
      { id: 'settlements.view', label: '정산 조회' },
      { id: 'settlements.process', label: '정산 처리' },
      { id: 'settlements.export', label: '정산 내보내기' }
    ]
  },
  {
    id: 'content',
    label: '콘텐츠 관리',
    permissions: [
      { id: 'content.view', label: '콘텐츠 조회' },
      { id: 'content.edit', label: '콘텐츠 수정' },
      { id: 'content.publish', label: '콘텐츠 발행' }
    ]
  },
  {
    id: 'support',
    label: '고객지원',
    permissions: [
      { id: 'support.view', label: '문의 조회' },
      { id: 'support.reply', label: '문의 답변' },
      { id: 'support.escalate', label: '문의 에스컬레이션' }
    ]
  },
  {
    id: 'analytics',
    label: '분석/통계',
    permissions: [
      { id: 'analytics.view', label: '통계 조회' },
      { id: 'analytics.export', label: '데이터 내보내기' }
    ]
  },
  {
    id: 'settings',
    label: '시스템 설정',
    permissions: [
      { id: 'settings.view', label: '설정 조회' },
      { id: 'settings.edit', label: '설정 수정' }
    ]
  }
]

const rolePresets: Record<string, string[]> = {
  admin: permissionGroups.flatMap(g => g.permissions.map(p => p.id)),
  manager: [
    'users.view', 'users.edit',
    'orders.view', 'orders.edit', 'orders.cancel',
    'stores.view', 'stores.edit',
    'riders.view', 'riders.edit',
    'settlements.view',
    'support.view', 'support.reply',
    'analytics.view'
  ],
  support: [
    'users.view',
    'orders.view',
    'stores.view',
    'support.view', 'support.reply'
  ]
}

const departments = [
  '기술팀',
  '운영팀',
  '고객지원팀',
  '마케팅팀',
  '정산팀',
  '품질관리팀'
]

export default function NewAdminPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'support',
    department: '',
    permissions: rolePresets.support,
    requireTwoFactor: false,
    sendWelcomeEmail: true
  })

  const handleChange = (field: keyof AdminFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleRoleChange = (role: 'admin' | 'manager' | 'support') => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePresets[role]
    }))
  }

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleGroupToggle = (groupId: string) => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return

    const groupPermissionIds = group.permissions.map(p => p.id)
    const allSelected = groupPermissionIds.every(id => formData.permissions.includes(id))

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !groupPermissionIds.includes(p))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupPermissionIds])]
      }))
    }
  }

  const validateForm = (): boolean => {
    const result = adminFormSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message
        }
      }
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      // Continue with submission
    } else {
      return
    }

    setIsSubmitting(true)

    try {
      // API call would go here
      console.log('Creating admin:', formData)
      await new Promise(resolve => setTimeout(resolve, 1500))

      router.push('/admin/users/admins')
    } catch (error) {
      console.error('Failed to create admin:', error)
      setErrors({ submit: '관리자 등록 중 오류가 발생했습니다' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck size={20} />
      case 'manager':
        return <Shield size={20} />
      default:
        return <User size={20} />
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/users/admins"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-gray-600)',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={18} />
          관리자 목록으로
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          새 관리자 등록
        </h1>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '14px' }}>
          시스템 관리자 계정을 생성합니다
        </p>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Basic Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
            기본 정보
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <IconInput
              id="name"
              label="이름 *"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={<User size={18} />}
              error={errors.name}
            />

            <IconInput
              id="email"
              label="이메일 *"
              type="email"
              placeholder="admin@dalligo.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              icon={<Mail size={18} />}
              error={errors.email}
            />

            <IconInput
              id="phone"
              label="전화번호 *"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              icon={<Phone size={18} />}
              error={errors.phone}
            />

            {/* Department */}
            <div>
              <label htmlFor="department" style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-gray-700)'
              }}>
                부서 *
              </label>
              <div style={{ position: 'relative' }}>
                <Building2
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-gray-400)'
                  }}
                />
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 42px',
                    border: `1px solid ${errors.department ? 'var(--color-error-500)' : 'var(--color-gray-200)'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    appearance: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">부서 선택</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-error-500)' }}>
                  {errors.department}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-gray-700)'
              }}>
                비밀번호 *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-gray-400)'
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="8자 이상, 대소문자 + 숫자"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    border: `1px solid ${errors.password ? 'var(--color-error-500)' : 'var(--color-gray-200)'}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-gray-400)'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-error-500)' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-gray-700)'
              }}>
                비밀번호 확인 *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-gray-400)'
                  }}
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="비밀번호 재입력"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    border: `1px solid ${errors.confirmPassword ? 'var(--color-error-500)' : 'var(--color-gray-200)'}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-gray-400)'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-error-500)' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
            역할 선택
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {(['admin', 'manager', 'support'] as const).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                style={{
                  padding: '20px',
                  border: `2px solid ${formData.role === role ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
                  borderRadius: '12px',
                  backgroundColor: formData.role === role ? 'var(--color-primary-50)' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: formData.role === role ? 'var(--color-primary-500)' : 'var(--color-gray-100)',
                    color: formData.role === role ? 'white' : 'var(--color-gray-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getRoleIcon(role)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: formData.role === role ? 'var(--color-primary-700)' : 'var(--color-gray-900)' }}>
                      {(() => {
                        if (role === 'admin') return '관리자'
                        if (role === 'manager') return '매니저'
                        return '상담원'
                      })()}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: 1.5 }}>
                  {role === 'admin'
                    ? '전체 시스템 관리 권한'
                    : role === 'manager'
                    ? '일부 관리 기능 접근'
                    : '고객 지원 기능만 접근'}
                </p>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'var(--color-primary-50)',
            borderRadius: '8px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <Info size={18} color="var(--color-primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--color-primary-700)', lineHeight: 1.5 }}>
              역할을 선택하면 기본 권한이 자동으로 설정됩니다. 아래에서 개별 권한을 추가로 조정할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>
              세부 권한 설정
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
              {formData.permissions.length}개 권한 선택됨
            </span>
          </div>

          {errors.permissions && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'var(--color-error-50)',
              borderRadius: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <AlertTriangle size={18} color="var(--color-error-500)" />
              <p style={{ fontSize: '13px', color: 'var(--color-error-700)' }}>
                {errors.permissions}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {permissionGroups.map((group) => {
              const groupPermissionIds = group.permissions.map(p => p.id)
              const selectedCount = groupPermissionIds.filter(id => formData.permissions.includes(id)).length
              const allSelected = selectedCount === group.permissions.length

              return (
                <div
                  key={group.id}
                  style={{
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--color-gray-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--color-gray-200)'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{group.label}</span>
                    <button
                      onClick={() => handleGroupToggle(group.id)}
                      style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: allSelected ? 'var(--color-primary-100)' : 'var(--color-gray-200)',
                        color: allSelected ? 'var(--color-primary-700)' : 'var(--color-gray-600)'
                      }}
                    >
                      {allSelected ? '전체 해제' : '전체 선택'}
                    </button>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 0',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '13px' }}>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Security Options */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
            보안 및 알림 설정
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '10px',
            }}>
              <label htmlFor="requireTwoFactor" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldAlert size={20} color="var(--color-primary-500)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>2단계 인증 필수</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
                    첫 로그인 시 2단계 인증 설정을 요구합니다
                  </p>
                </div>
              </label>
              <input
                id="requireTwoFactor"
                type="checkbox"
                checked={formData.requireTwoFactor}
                onChange={(e) => handleChange('requireTwoFactor', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '10px',
            }}>
              <label htmlFor="sendWelcomeEmail" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-success-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={20} color="var(--color-success-500)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>환영 이메일 발송</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
                    계정 생성 정보가 담긴 이메일을 발송합니다
                  </p>
                </div>
              </label>
              <input
                id="sendWelcomeEmail"
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => handleChange('sendWelcomeEmail', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--color-error-50)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={20} color="var(--color-error-500)" />
            <p style={{ color: 'var(--color-error-700)' }}>{errors.submit}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '8px'
        }}>
          <Link
            href="/admin/users/admins"
            style={{
              padding: '12px 24px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              backgroundColor: 'white',
              textDecoration: 'none',
              color: 'var(--color-gray-700)',
              fontSize: '14px'
            }}
          >
            취소
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isSubmitting ? 'var(--color-gray-300)' : 'var(--color-primary-500)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <>처리 중...</>
            ) : (
              <>
                <Save size={18} />
                관리자 등록
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
