/**
 * FAQ 관리 훅
 * - FAQ 카테고리 목록 조회
 * - FAQ 목록 조회 (검색, 카테고리 필터)
 * - FAQ 조회수 증가
 * - FAQ 도움됨/안됨 피드백
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { FAQ, FAQCategory, FAQWithCategory } from '@/types/user-features.types'

// Query Keys
export const faqKeys = {
  all: ['faq'] as const,
  categories: () => [...faqKeys.all, 'categories'] as const,
  list: (filters?: FAQFilters) => [...faqKeys.all, 'list', filters] as const,
  search: (query: string) => [...faqKeys.all, 'search', query] as const,
  pinned: () => [...faqKeys.all, 'pinned'] as const,
  detail: (id: string) => [...faqKeys.all, 'detail', id] as const,
}

interface FAQFilters {
  categorySlug?: string
  searchQuery?: string
}

/**
 * FAQ 카테고리 목록 조회 훅
 */
export function useFAQCategories() {
  return useQuery({
    queryKey: faqKeys.categories(),
    queryFn: async (): Promise<FAQCategory[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('faq_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        throw new Error(`FAQ 카테고리 조회 실패: ${error.message}`)
      }

      return data as FAQCategory[]
    },
    staleTime: 1000 * 60 * 60, // 1시간 (카테고리는 자주 변경되지 않음)
    gcTime: 1000 * 60 * 60 * 24, // 24시간
  })
}

/**
 * FAQ 목록 조회 훅 (필터링 지원)
 */
export function useFAQList(filters?: FAQFilters) {
  return useQuery({
    queryKey: faqKeys.list(filters),
    queryFn: async (): Promise<FAQWithCategory[]> => {
      const supabase = createClient()
      let query = supabase
        .from('faqs')
        .select(`
          *,
          category:faq_categories(*)
        `)
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('view_count', { ascending: false })

      // 카테고리 필터
      if (filters?.categorySlug && filters.categorySlug !== 'all') {
        const { data: categoryData } = await supabase
          .from('faq_categories')
          .select('id')
          .eq('slug', filters.categorySlug)
          .single()

        if (categoryData) {
          query = query.eq('category_id', categoryData.id)
        }
      }

      // 검색어 필터 (question, answer에서 검색)
      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        query = query.or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        throw new Error(`FAQ 조회 실패: ${error.message}`)
      }

      return data as FAQWithCategory[]
    },
    staleTime: 1000 * 60 * 10, // 10분
  })
}

/**
 * 상단 고정 FAQ 조회 훅
 */
export function usePinnedFAQs() {
  return useQuery({
    queryKey: faqKeys.pinned(),
    queryFn: async (): Promise<FAQWithCategory[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('faqs')
        .select(`
          *,
          category:faq_categories(*)
        `)
        .eq('is_active', true)
        .eq('is_pinned', true)
        .order('sort_order', { ascending: true })
        .limit(5)

      if (error) {
        throw new Error(`고정 FAQ 조회 실패: ${error.message}`)
      }

      return data as FAQWithCategory[]
    },
    staleTime: 1000 * 60 * 30, // 30분
  })
}

/**
 * FAQ 검색 훅 (실시간 검색용)
 */
export function useSearchFAQ(query: string) {
  return useQuery({
    queryKey: faqKeys.search(query),
    queryFn: async (): Promise<FAQWithCategory[]> => {
      if (!query || query.length < 2) {
        return []
      }

      const supabase = createClient()
      const searchTerm = `%${query}%`

      const { data, error } = await supabase
        .from('faqs')
        .select(`
          *,
          category:faq_categories(*)
        `)
        .eq('is_active', true)
        .or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`)
        .order('view_count', { ascending: false })
        .limit(20)

      if (error) {
        throw new Error(`FAQ 검색 실패: ${error.message}`)
      }

      return data as FAQWithCategory[]
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5분
  })
}

/**
 * FAQ 조회수 증가 훅
 */
export function useIncrementFAQView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (faqId: string): Promise<void> => {
      const supabase = createClient()
      // RPC 함수 사용 시도
      const { error: rpcError } = await supabase.rpc('increment_faq_view', {
        p_faq_id: faqId,
      })

      if (rpcError) {
        // RPC가 없는 경우 직접 업데이트
        const { error } = await supabase.rpc('increment_faq_view', {
          p_faq_id: faqId,
        })

        // 그래도 실패하면 무시 (조회수는 critical하지 않음)
        if (error) {
          console.warn('FAQ 조회수 증가 실패:', error.message)
        }
      }
    },
    // 조회수 증가는 UI 업데이트 불필요
    onSuccess: () => {
      // 선택적: 캐시 무효화
      // queryClient.invalidateQueries({ queryKey: faqKeys.all })
    },
  })
}

/**
 * FAQ 도움됨/안됨 피드백 훅
 */
export function useFAQFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      faqId,
      helpful,
    }: {
      faqId: string
      helpful: boolean
    }): Promise<void> => {
      // 로컬 스토리지에서 이미 피드백했는지 확인
      const feedbackKey = `faq_feedback_${faqId}`
      if (typeof window !== 'undefined' && localStorage.getItem(feedbackKey)) {
        throw new Error('이미 피드백을 제출하셨습니다')
      }

      const supabase = createClient()
      // RPC 함수 사용 시도
      const { error: rpcError } = await supabase.rpc('faq_feedback', {
        p_faq_id: faqId,
        p_helpful: helpful,
      })

      if (rpcError) {
        // RPC가 없는 경우 직접 업데이트
        const column = helpful ? 'helpful_count' : 'not_helpful_count'

        const { data: currentFaq } = await supabase
          .from('faqs')
          .select(column)
          .eq('id', faqId)
          .single()

        if (currentFaq) {
          const currentValue = (currentFaq as Record<string, number>)[column]
          const { error } = await supabase
            .from('faqs')
            .update({ [column]: currentValue + 1 })
            .eq('id', faqId)

          if (error) {
            throw new Error(`피드백 제출 실패: ${error.message}`)
          }
        }
      }

      // 로컬 스토리지에 피드백 기록
      if (typeof window !== 'undefined') {
        localStorage.setItem(feedbackKey, helpful ? 'helpful' : 'not_helpful')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all })
    },
  })
}

/**
 * FAQ 피드백 여부 확인 유틸리티
 */
export function getFAQFeedbackStatus(faqId: string): 'helpful' | 'not_helpful' | null {
  if (typeof window === 'undefined') return null
  const feedback = localStorage.getItem(`faq_feedback_${faqId}`)
  return feedback as 'helpful' | 'not_helpful' | null
}
