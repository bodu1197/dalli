'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, MoreVertical, Trash2, Edit3, MessageCircle } from 'lucide-react'

interface MyReview {
  id: string
  restaurantId: string
  restaurantName: string
  orderId: string
  rating: number
  content: string
  images: string[]
  createdAt: string
  ownerReply?: {
    content: string
    createdAt: string
  }
}

// Mock 내 리뷰 데이터
const MOCK_MY_REVIEWS: MyReview[] = [
  {
    id: '1',
    restaurantId: '1',
    restaurantName: 'BBQ 치킨 강남점',
    orderId: 'ORD001',
    rating: 5,
    content: '치킨이 정말 바삭바삭하고 맛있어요! 배달도 빨랐고 양도 푸짐해서 만족스러웠습니다. 다음에 또 시켜먹을게요~',
    images: [],
    createdAt: '2024-12-08T15:30:00',
    ownerReply: {
      content: '맛있게 드셔주셔서 감사합니다! 다음에도 맛있는 치킨으로 찾아뵙겠습니다 :)',
      createdAt: '2024-12-08T16:00:00',
    },
  },
  {
    id: '2',
    restaurantId: '2',
    restaurantName: '맥도날드 역삼점',
    orderId: 'ORD002',
    rating: 4,
    content: '빅맥 세트 맛있게 먹었습니다. 감자튀김이 조금 식어서 왔는데 그래도 전체적으로 만족해요.',
    images: [],
    createdAt: '2024-12-07T13:00:00',
  },
  {
    id: '3',
    restaurantId: '3',
    restaurantName: '본죽&비빔밥 강남역점',
    orderId: 'ORD003',
    rating: 5,
    content: '전복죽 진짜 맛있어요! 전복도 실하고 죽도 부드럽고 속이 따뜻해지는 맛이에요. 강추합니다!',
    images: [],
    createdAt: '2024-12-05T10:00:00',
    ownerReply: {
      content: '좋은 리뷰 감사합니다! 항상 정성껏 준비하겠습니다.',
      createdAt: '2024-12-05T11:30:00',
    },
  },
]

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_MY_REVIEWS)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleDeleteReview = (id: string) => {
    if (confirm('리뷰를 삭제하시겠습니까?\n삭제된 리뷰는 복구할 수 없습니다.')) {
      setReviews((prev) => prev.filter((r) => r.id !== id))
      setMenuOpenId(null)
    }
  }

  const toggleMenu = (id: string) => {
    setMenuOpenId((prev) => (prev === id ? null : id))
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
            내 리뷰
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 리뷰 통계 */}
      <section className="bg-white p-4 border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
              {reviews.length}
            </p>
            <p className="text-sm text-[var(--color-neutral-500)]">작성한 리뷰</p>
          </div>
          <div className="w-px h-10 bg-[var(--color-neutral-200)]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
              {(
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0
              ).toFixed(1)}
            </p>
            <p className="text-sm text-[var(--color-neutral-500)]">평균 별점</p>
          </div>
        </div>
      </section>

      {/* 리뷰 목록 */}
      <main className="pb-20">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Star className="w-16 h-16 text-[var(--color-neutral-300)] mb-4" />
            <p className="text-[var(--color-neutral-500)] mb-2">
              작성한 리뷰가 없습니다
            </p>
            <p className="text-sm text-[var(--color-neutral-400)]">
              주문 후 리뷰를 작성해보세요
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isMenuOpen={menuOpenId === review.id}
                onToggleMenu={() => toggleMenu(review.id)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ReviewCard({
  review,
  isMenuOpen,
  onToggleMenu,
  onDelete,
}: Readonly<{
  review: MyReview
  isMenuOpen: boolean
  onToggleMenu: () => void
  onDelete: () => void
}>) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white p-4">
      {/* 가게 정보 + 메뉴 */}
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/restaurant/${review.restaurantId}`}
          className="font-semibold text-[var(--color-neutral-900)] hover:underline"
        >
          {review.restaurantName}
        </Link>
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-1 -mr-1 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default bg-transparent border-none p-0 m-0"
                onClick={onToggleMenu}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggleMenu()
                  }
                }}
                aria-label="메뉴 닫기"
                tabIndex={0}
              />
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-[var(--color-neutral-100)] py-1 z-50">
                <button
                  onClick={() => {
                    // Note: Review edit functionality (to be implemented)
                    alert('리뷰 수정 기능 준비 중입니다')
                    onToggleMenu()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                >
                  <Edit3 className="w-4 h-4" />
                  수정
                </button>
                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-error-500)] hover:bg-[var(--color-neutral-50)]"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 별점 + 날짜 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star
              key={`review-${review.id}-star-${starIndex}`}
              className={`w-4 h-4 ${
                starIndex < review.rating
                  ? 'fill-[var(--color-warning-400)] text-[var(--color-warning-400)]'
                  : 'text-[var(--color-neutral-200)]'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-[var(--color-neutral-400)]">
          {formattedDate}
        </span>
      </div>

      {/* 리뷰 내용 */}
      <p className="text-[var(--color-neutral-700)] leading-relaxed">
        {review.content}
      </p>

      {/* 이미지 */}
      {review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img) => (
            <div
              key={`${review.id}-img-${img}`}
              className="w-20 h-20 bg-[var(--color-neutral-200)] rounded-lg overflow-hidden"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* 사장님 답글 */}
      {review.ownerReply && (
        <div className="mt-4 p-3 bg-[var(--color-neutral-50)] rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-[var(--color-primary-500)]" />
            <span className="text-sm font-medium text-[var(--color-primary-500)]">
              사장님 답글
            </span>
            <span className="text-xs text-[var(--color-neutral-400)]">
              {new Date(review.ownerReply.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <p className="text-sm text-[var(--color-neutral-600)]">
            {review.ownerReply.content}
          </p>
        </div>
      )}
    </div>
  )
}
