'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Star, MapPin, X, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useRecentViews,
  useDeleteRecentView,
  useClearAllRecentViews,
} from '@/hooks/useRecentViews'
import type { RecentViewWithRestaurant } from '@/types/user-features.types'

function formatViewedTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    return '방금 전'
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

function formatDistance(distanceKm: number | undefined): string {
  if (!distanceKm) return ''
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

function formatDeliveryTime(minutes: number): string {
  const minTime = Math.max(15, minutes - 10)
  const maxTime = minutes + 10
  return `${minTime}~${maxTime}분`
}

export default function RecentPage() {
  const { data: recentList, isLoading, error } = useRecentViews()
  const deleteRecentView = useDeleteRecentView()
  const clearAllRecentViews = useClearAllRecentViews()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleRemove = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteRecentView.mutateAsync(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClearAll = async () => {
    if (confirm('최근 본 가게 목록을 모두 삭제하시겠습니까?')) {
      await clearAllRecentViews.mutateAsync()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/my"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            최근 본 가게
          </h1>
          {recentList && recentList.length > 0 ? (
            <button
              onClick={handleClearAll}
              disabled={clearAllRecentViews.isPending}
              className="text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)] disabled:opacity-50 flex items-center gap-1"
            >
              {clearAllRecentViews.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              전체삭제
            </button>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </header>

      {/* 최근 본 목록 */}
      <main className="pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-[var(--color-error-500)] mb-4">
              데이터를 불러오는데 실패했습니다
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--color-neutral-100)] rounded-lg text-sm"
            >
              다시 시도
            </button>
          </div>
        ) : !recentList || recentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Clock className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)] mb-6">
              최근 본 가게가 없습니다
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
            >
              맛집 구경하기
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {recentList.map((item) => (
              <RecentCard
                key={item.id}
                recentView={item}
                onRemove={() => handleRemove(item.id)}
                isDeleting={deletingId === item.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

interface RecentCardProps {
  readonly recentView: RecentViewWithRestaurant
  readonly onRemove: () => void
  readonly isDeleting: boolean
}

function RecentCard({ recentView, onRemove, isDeleting }: RecentCardProps) {
  const { restaurant, viewed_at } = recentView

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative">
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        disabled={isDeleting}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <X className="w-4 h-4 text-white" />
        )}
      </button>

      <Link href={`/restaurant/${restaurant.id}`} className="flex">
        {/* 이미지 */}
        <div className="relative w-28 h-28 flex-shrink-0">
          {restaurant.image_url ? (
            <Image
              src={restaurant.image_url}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--color-neutral-200)]">
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🍽️
              </div>
            </div>
          )}
          {!restaurant.is_open && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium">영업 종료</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--color-neutral-900)] truncate">
                {restaurant.name}
              </h3>
              <p className="text-sm text-[var(--color-neutral-500)]">
                {restaurant.category?.name || '기타'}
              </p>
            </div>
          </div>

          {/* 평점 */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-[var(--color-warning-400)] text-[var(--color-warning-400)]" />
            <span className="text-sm font-medium text-[var(--color-neutral-700)]">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-sm text-[var(--color-neutral-400)]">
              ({restaurant.review_count})
            </span>
          </div>

          {/* 배달 정보 */}
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-neutral-500)]">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDeliveryTime(restaurant.estimated_delivery_time)}</span>
            </div>
            {(restaurant as RecentViewWithRestaurant['restaurant'] & { distance?: number }).distance && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {formatDistance(
                    (restaurant as RecentViewWithRestaurant['restaurant'] & { distance?: number }).distance
                  )}
                </span>
              </div>
            )}
            {restaurant.delivery_fee > 0 && (
              <span className="text-[var(--color-neutral-400)]">
                배달비 {restaurant.delivery_fee.toLocaleString()}원
              </span>
            )}
            {restaurant.delivery_fee === 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
              )}>
                무료배달
              </span>
            )}
          </div>

          {/* 본 시간 */}
          <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
            {formatViewedTime(viewed_at)}에 봄
          </p>
        </div>
      </Link>
    </div>
  )
}
