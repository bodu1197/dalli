'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, User, Loader2 } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { useUploadProfileImage } from '@/hooks/useImageUpload'
import { createClient } from '@/lib/supabase/client'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { profile, isAuthenticated, isLoading, setProfile, user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadProfileImage = useUploadProfileImage()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
      })
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl)
      }
    }
  }, [profile])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/settings/profile')
    }
  }, [isLoading, isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Supabase Storage에 업로드
    try {
      const url = await uploadProfileImage.mutateAsync(file)
      setAvatarPreview(url)
    } catch (error) {
      alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다')
      // 업로드 실패 시 이전 이미지로 복원
      setAvatarPreview(profile?.avatarUrl || null)
    }

    // input 초기화
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      // users 테이블 업데이트
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id ?? '')

      if (error) {
        throw error
      }

      // 로컬 상태 업데이트
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
        })
      }

      alert('프로필이 저장되었습니다')
      router.push('/settings')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const isUploading = uploadProfileImage.isPending

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/settings"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            프로필 설정
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        {/* 프로필 사진 */}
        <section className="bg-white py-8 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-[var(--color-neutral-400)]" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleImageClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleImageClick}
            disabled={isUploading}
            className="mt-3 text-sm font-medium text-[var(--color-primary-500)] disabled:opacity-50"
          >
            {isUploading ? '업로드 중...' : '사진 변경'}
          </button>

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </section>

        {/* 정보 입력 */}
        <section className="mt-3 bg-white px-4 py-6 space-y-5">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
              이름 *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
              연락처
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
            />
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-500)] cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              이메일은 변경할 수 없습니다
            </p>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)]">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full py-4 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
