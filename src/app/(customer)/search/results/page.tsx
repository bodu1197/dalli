'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react'

import { RestaurantList } from '@/components/features/restaurant'
import { Spinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase/client'
import type { Restaurant, BusinessHours } from '@/types/restaurant.types'
import type { Database } from '@/types/supabase'

type RestaurantRow = Database['public']['Tables']['restaurants']['Row']

// 필터 옵션
const SORT_OPTIONS = [
  { value: 'distance', label: '거리순' },
  { value: 'rating', label: '평점순' },
  { value: 'delivery_time', label: '배달시간순' },
  { value: 'delivery_fee', label: '배달비순' },
]

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)

        if (error) throw new Error('식당 정보를 불러오는데 실패했습니다.')

        const formattedRestaurants: Restaurant[] = data.map((item: RestaurantRow) => ({
          id: item.id,
          ownerId: item.owner_id,
          name: item.name,
          description: item.description,
          phone: item.phone,
          address: item.address,
          lat: item.lat,
          lng: item.lng,
          categoryId: item.category_id,
          minOrderAmount: item.min_order_amount ?? 0,
          deliveryFee: item.delivery_fee ?? 0,
          estimatedDeliveryTime: item.estimated_delivery_time ?? 0,
          businessHours: item.business_hours as unknown as BusinessHours | null,
          isOpen: item.is_open ?? false,
          rating: item.rating ?? 0,
          reviewCount: item.review_count ?? 0,
          imageUrl: item.image_url,
          isAdvertised: item.is_advertised ?? false,
          adPriority: item.ad_priority ?? 0,
          adExpiresAt: item.ad_expires_at,
          createdAt: item.created_at ?? '',
          updatedAt: item.updated_at ?? '',
        }))

        // 정렬
        const sortedRestaurants = formattedRestaurants.sort((a, b) => {
          // 기본: 광고 우선 + 평점순
          if (a.isAdvertised && !b.isAdvertised) return -1
          if (!a.isAdvertised && b.isAdvertised) return 1
          return (b.rating ?? 0) - (a.rating ?? 0)
        })

        setRestaurants(sortedRestaurants)

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('알 수 없는 오류가 발생했습니다.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [query])


  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/search"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>

          <Link
            href="/search"
            className="flex-1 flex items-center gap-3 h-10 px-4 rounded-xl bg-[var(--color-neutral-100)]"
          >
            <Search className="w-5 h-5 text-[var(--color-neutral-400)]" />
            <span className="text-[var(--color-neutral-700)]">{query}</span>
            <X className="w-4 h-4 text-[var(--color-neutral-400)] ml-auto" />
          </Link>
        </div>

        {/* 필터 바 */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            필터
          </button>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className="px-3 py-1.5 rounded-full border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] whitespace-nowrap hover:bg-[var(--color-neutral-50)]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4">
        {loading && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-[var(--color-neutral-500)]">
              검색 중...
            </p>
          </div>
        )}
        {error && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-red-500">
              {error}
            </p>
          </div>
        )}
        {!loading && !error && (
          <>
            {/* 검색 결과 수 */}
            <p className="text-sm text-[var(--color-neutral-500)] mb-4">
              &quot;{query}&quot; 검색 결과 {restaurants.length}개
            </p>

            {/* 검색 결과 */}
            <RestaurantList
              restaurants={restaurants}
              emptyMessage={`"${query}"에 대한 검색 결과가 없습니다`}
            />
          </>
        )}
      </main>
    </div>
  )
}

function SearchResultsFallback() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchResultsContent />
    </Suspense>
  )
}