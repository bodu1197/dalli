/**
 * 최근 본 가게 관리 훅
 * - 최근 본 가게 목록 조회
 * - 식당 조회 기록 추가
 * - 최근 본 기록 삭제
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import type { RecentViewWithRestaurant } from '@/types/user-features.types'

// Query Keys
export const recentViewsKeys = {
  all: ['recentViews'] as const,
  list: () => [...recentViewsKeys.all, 'list'] as const,
}

// 거리 계산 유틸리티
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 최근 본 가게 목록 조회 훅
 */
export function useRecentViews(userLat?: number, userLng?: number) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: recentViewsKeys.list(),
    queryFn: async (): Promise<RecentViewWithRestaurant[]> => {
      if (!user?.id) {
        return []
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('recent_views')
        .select(`
          *,
          restaurant:restaurants(
            id,
            name,
            image_url,
            category_id,
            rating,
            review_count,
            estimated_delivery_time,
            delivery_fee,
            is_open,
            address,
            lat,
            lng,
            category:categories(id, name, icon)
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50)

      if (error) {
        throw new Error(`최근 본 가게 조회 실패: ${error.message}`)
      }

      // 거리 정보 추가
      if (userLat && userLng && data) {
        return data.map((item) => ({
          ...item,
          restaurant: {
            ...item.restaurant,
            distance: calculateDistance(
              userLat,
              userLng,
              item.restaurant.lat,
              item.restaurant.lng
            ),
          },
        })) as RecentViewWithRestaurant[]
      }

      return data as RecentViewWithRestaurant[]
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  })
}

/**
 * 식당 조회 기록 추가 훅
 */
export function useAddRecentView() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (restaurantId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      const supabase = createClient()
      // UPSERT: 이미 있으면 viewed_at 업데이트, 없으면 생성
      const { error } = await supabase.rpc('upsert_recent_view', {
        p_user_id: user.id,
        p_restaurant_id: restaurantId,
      })

      if (error) {
        // RPC가 없는 경우 직접 upsert
        const { error: upsertError } = await supabase
          .from('recent_views')
          .upsert(
            {
              user_id: user.id,
              restaurant_id: restaurantId,
              viewed_at: new Date().toISOString(),
              view_count: 1,
            },
            {
              onConflict: 'user_id,restaurant_id',
            }
          )

        if (upsertError) {
          throw new Error(`최근 본 기록 추가 실패: ${upsertError.message}`)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recentViewsKeys.list() })
    },
  })
}

/**
 * 최근 본 기록 삭제 훅 (단일)
 */
export function useDeleteRecentView() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recentViewId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      const supabase = createClient()
      const { error } = await supabase
        .from('recent_views')
        .delete()
        .eq('id', recentViewId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`삭제 실패: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recentViewsKeys.list() })
    },
  })
}

/**
 * 최근 본 기록 전체 삭제 훅
 */
export function useClearAllRecentViews() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<number> => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('recent_views')
        .delete()
        .eq('user_id', user.id)
        .select('id')

      if (error) {
        throw new Error(`전체 삭제 실패: ${error.message}`)
      }

      return data?.length ?? 0
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recentViewsKeys.list() })
    },
  })
}
