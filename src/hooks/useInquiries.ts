/**
 * 고객 문의 관리 훅
 * - 문의 목록 조회
 * - 문의 상세 조회
 * - 문의 작성
 * - 만족도 평가
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import type {
  Inquiry,
  CreateInquiryInput,
  InquirySatisfactionInput,
  InquiryStatus,
} from '@/types/user-features.types'

// Query Keys
export const inquiriesKeys = {
  all: ['inquiries'] as const,
  list: (filters?: InquiryFilters) => [...inquiriesKeys.all, 'list', filters] as const,
  detail: (id: string) => [...inquiriesKeys.all, 'detail', id] as const,
  counts: () => [...inquiriesKeys.all, 'counts'] as const,
}

interface InquiryFilters {
  status?: InquiryStatus | 'all'
}

/**
 * 내 문의 목록 조회 훅
 */
export function useInquiries(filters?: InquiryFilters) {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: inquiriesKeys.list(filters),
    queryFn: async (): Promise<Inquiry[]> => {
      if (!user?.id) {
        return []
      }

      let query = supabase
        .from('inquiries')
        .select(`
          *,
          order:orders(
            id,
            status,
            created_at,
            restaurant:restaurants(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // 상태 필터
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query.limit(50)

      if (error) {
        throw new Error(`문의 목록 조회 실패: ${error.message}`)
      }

      return data as Inquiry[]
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5분
  })
}

/**
 * 문의 상세 조회 훅
 */
export function useInquiryDetail(inquiryId: string) {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: inquiriesKeys.detail(inquiryId),
    queryFn: async (): Promise<Inquiry | null> => {
      if (!user?.id || !inquiryId) {
        return null
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          order:orders(
            id,
            status,
            created_at,
            total_amount,
            restaurant:restaurants(name, image_url)
          )
        `)
        .eq('id', inquiryId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`문의 조회 실패: ${error.message}`)
      }

      return data as Inquiry
    },
    enabled: !!user?.id && !!inquiryId,
  })
}

/**
 * 문의 상태별 카운트 조회 훅
 */
export function useInquiryCounts() {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: inquiriesKeys.counts(),
    queryFn: async (): Promise<Record<InquiryStatus | 'total', number>> => {
      if (!user?.id) {
        return { pending: 0, in_progress: 0, answered: 0, closed: 0, total: 0 }
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select('status')
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`문의 카운트 조회 실패: ${error.message}`)
      }

      const counts: Record<InquiryStatus | 'total', number> = {
        pending: 0,
        in_progress: 0,
        answered: 0,
        closed: 0,
        total: data.length,
      }

      data.forEach((item) => {
        counts[item.status as InquiryStatus]++
      })

      return counts
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2분
  })
}

/**
 * 문의 작성 훅
 */
export function useCreateInquiry() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateInquiryInput): Promise<Inquiry> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      // 입력 검증
      if (!input.title.trim()) {
        throw new Error('제목을 입력해주세요')
      }

      if (!input.content.trim()) {
        throw new Error('내용을 입력해주세요')
      }

      if (input.title.length > 100) {
        throw new Error('제목은 100자 이내로 입력해주세요')
      }

      if (input.content.length > 2000) {
        throw new Error('내용은 2000자 이내로 입력해주세요')
      }

      if (input.images && input.images.length > 5) {
        throw new Error('이미지는 최대 5개까지 첨부할 수 있습니다')
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          user_id: user.id,
          category: input.category,
          order_id: input.order_id || null,
          title: input.title.trim(),
          content: input.content.trim(),
          images: input.images || [],
          status: 'pending',
          priority: 'normal',
        })
        .select()
        .single()

      if (error) {
        throw new Error(`문의 등록 실패: ${error.message}`)
      }

      return data as Inquiry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiriesKeys.all })
    },
  })
}

/**
 * 문의 만족도 평가 훅
 */
export function useSubmitInquirySatisfaction() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inquiryId,
      satisfaction,
    }: {
      inquiryId: string
      satisfaction: InquirySatisfactionInput
    }): Promise<Inquiry> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      // 유효성 검증
      if (satisfaction.rating < 1 || satisfaction.rating > 5) {
        throw new Error('평점은 1~5점 사이여야 합니다')
      }

      // 해당 문의가 답변 완료 상태인지 확인
      const { data: inquiry } = await supabase
        .from('inquiries')
        .select('status, satisfaction_rating')
        .eq('id', inquiryId)
        .eq('user_id', user.id)
        .single()

      if (!inquiry) {
        throw new Error('문의를 찾을 수 없습니다')
      }

      if (inquiry.status !== 'answered') {
        throw new Error('답변이 완료된 문의만 평가할 수 있습니다')
      }

      if (inquiry.satisfaction_rating) {
        throw new Error('이미 만족도 평가를 완료하셨습니다')
      }

      const { data, error } = await supabase
        .from('inquiries')
        .update({
          satisfaction_rating: satisfaction.rating,
          satisfaction_comment: satisfaction.comment?.trim() || null,
          status: 'closed', // 평가 완료 시 문의 종료
        })
        .eq('id', inquiryId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`만족도 평가 실패: ${error.message}`)
      }

      return data as Inquiry
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inquiriesKeys.all })
      queryClient.invalidateQueries({
        queryKey: inquiriesKeys.detail(variables.inquiryId),
      })
    },
  })
}

/**
 * 문의에 이미지 업로드 (Storage 사용)
 */
export function useUploadInquiryImage() {
  const { user } = useAuthStore()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다')
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('JPG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다')
      }

      // 파일명 생성
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('inquiries')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        throw new Error(`이미지 업로드 실패: ${error.message}`)
      }

      // Public URL 반환
      const { data: urlData } = supabase.storage
        .from('inquiries')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    },
  })
}
