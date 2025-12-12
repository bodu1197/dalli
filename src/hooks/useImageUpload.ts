'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

// 스토리지 버킷 타입
export type StorageBucket =
  | 'profiles'
  | 'reviews'
  | 'restaurants'
  | 'menus'
  | 'banners'
  | 'inquiries'

// 업로드 옵션 인터페이스
interface UploadOptions {
  bucket: StorageBucket
  maxSizeMB?: number
  allowedTypes?: string[]
  folder?: string // 추가 폴더 경로 (예: restaurant_id)
}

// 업로드 결과 인터페이스
interface UploadResult {
  url: string
  path: string
}

// 기본 허용 이미지 타입
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

// 기본 최대 파일 크기 (MB)
const DEFAULT_MAX_SIZE_MB = 5

/**
 * 이미지 파일 유효성 검사
 */
function validateImage(
  file: File,
  maxSizeMB: number,
  allowedTypes: string[]
): string | null {
  // 파일 타입 검사
  if (!allowedTypes.includes(file.type)) {
    return `지원하지 않는 파일 형식입니다. (${allowedTypes.map(t => t.split('/')[1]).join(', ')} 가능)`
  }

  // 파일 크기 검사
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `파일 크기가 ${maxSizeMB}MB를 초과합니다.`
  }

  return null
}

/**
 * 파일명 생성
 */
function generateFileName(file: File, userId: string, folder?: string): string {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 9)

  const basePath = folder
    ? `${userId}/${folder}`
    : userId

  return `${basePath}/${timestamp}_${randomStr}.${fileExt}`
}

/**
 * 단일 이미지 업로드 훅
 */
export function useUploadImage() {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      file,
      bucket,
      maxSizeMB = DEFAULT_MAX_SIZE_MB,
      allowedTypes = DEFAULT_ALLOWED_TYPES,
      folder,
    }: { file: File } & UploadOptions): Promise<UploadResult> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.')
      }

      // 유효성 검사
      const validationError = validateImage(file, maxSizeMB, allowedTypes)
      if (validationError) {
        throw new Error(validationError)
      }

      // 파일명 생성
      const fileName = generateFileName(file, user.id, folder)

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error('이미지 업로드에 실패했습니다.')
      }

      // Public URL 가져오기
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        path: data.path,
      }
    },
  })
}

/**
 * 다중 이미지 업로드 훅
 */
export function useUploadMultipleImages() {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      files,
      bucket,
      maxSizeMB = DEFAULT_MAX_SIZE_MB,
      allowedTypes = DEFAULT_ALLOWED_TYPES,
      folder,
    }: { files: File[] } & UploadOptions): Promise<UploadResult[]> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.')
      }

      const results: UploadResult[] = []

      for (const file of files) {
        // 유효성 검사
        const validationError = validateImage(file, maxSizeMB, allowedTypes)
        if (validationError) {
          throw new Error(`${file.name}: ${validationError}`)
        }

        // 파일명 생성
        const fileName = generateFileName(file, user.id, folder)

        // 업로드
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          console.error('Upload error:', error)
          throw new Error(`${file.name} 업로드에 실패했습니다.`)
        }

        // Public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

        results.push({
          url: urlData.publicUrl,
          path: data.path,
        })
      }

      return results
    },
  })
}

/**
 * 이미지 삭제 훅
 */
export function useDeleteImage() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ bucket, path }: { bucket: StorageBucket; path: string }): Promise<void> => {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        console.error('Delete error:', error)
        throw new Error('이미지 삭제에 실패했습니다.')
      }
    },
  })
}

/**
 * 프로필 이미지 업로드 전용 훅
 */
export function useUploadProfileImage() {
  const uploadImage = useUploadImage()
  const { user, setProfile, profile } = useAuthStore()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      // 이미지 업로드
      const result = await uploadImage.mutateAsync({
        file,
        bucket: 'profiles',
        maxSizeMB: 5,
      })

      // users 테이블의 avatar_url 업데이트
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update({ avatar_url: result.url, updated_at: new Date().toISOString() })
          .eq('id', user.id)

        if (error) {
          console.error('Profile update error:', error)
          throw new Error('프로필 업데이트에 실패했습니다.')
        }

        // 로컬 상태 업데이트
        if (profile) {
          setProfile({ ...profile, avatar_url: result.url })
        }
      }

      return result.url
    },
  })
}

/**
 * 리뷰 이미지 업로드 전용 훅
 */
export function useUploadReviewImages() {
  const uploadMultiple = useUploadMultipleImages()

  return useMutation({
    mutationFn: async ({ files, orderId }: { files: File[]; orderId: string }): Promise<string[]> => {
      const results = await uploadMultiple.mutateAsync({
        files,
        bucket: 'reviews',
        maxSizeMB: 5,
        folder: orderId,
      })

      return results.map(r => r.url)
    },
  })
}

/**
 * 식당 이미지 업로드 전용 훅
 */
export function useUploadRestaurantImage() {
  const uploadImage = useUploadImage()

  return useMutation({
    mutationFn: async ({ file, restaurantId }: { file: File; restaurantId: string }): Promise<string> => {
      const result = await uploadImage.mutateAsync({
        file,
        bucket: 'restaurants',
        maxSizeMB: 10,
        folder: restaurantId,
      })

      return result.url
    },
  })
}

/**
 * 메뉴 이미지 업로드 전용 훅
 */
export function useUploadMenuImage() {
  const uploadImage = useUploadImage()

  return useMutation({
    mutationFn: async ({ file, restaurantId }: { file: File; restaurantId: string }): Promise<string> => {
      const result = await uploadImage.mutateAsync({
        file,
        bucket: 'menus',
        maxSizeMB: 5,
        folder: restaurantId,
      })

      return result.url
    },
  })
}

/**
 * 이미지 선택 및 미리보기 상태 관리 훅
 */
export function useImagePicker(maxImages: number = 1) {
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)
    const remainingSlots = maxImages - files.length
    const filesToAdd = newFiles.slice(0, remainingSlots)

    if (filesToAdd.length === 0) return

    // 미리보기 생성
    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    setFiles(prev => [...prev, ...filesToAdd])

    // input 초기화
    event.target.value = ''
  }, [files.length, maxImages])

  const removeImage = useCallback((index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearAll = useCallback(() => {
    setPreviews([])
    setFiles([])
  }, [])

  return {
    previews,
    files,
    handleFileSelect,
    removeImage,
    clearAll,
    canAddMore: files.length < maxImages,
  }
}
