'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, MessageCircle, ThumbsUp, MoreVertical } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  rating: number
  content: string
  images: string[]
  menuNames: string[]
  createdAt: string
  reply?: {
    content: string
    createdAt: string
  }
  helpful: number
}

// Mock 리뷰 데이터
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    customerName: '김**',
    rating: 5,
    content: '치킨이 정말 바삭바삭하고 맛있어요! 배달도 빨랐고 양도 푸짐해서 만족스러웠습니다. 다음에 또 시켜먹을게요~',
    images: [],
    menuNames: ['황금올리브 치킨', '콜라 1.25L'],
    createdAt: '2024-12-09T10:30:00',
    helpful: 5,
  },
  {
    id: '2',
    customerName: '이**',
    rating: 4,
    content: '양념치킨 맛있었어요. 치즈볼도 좋았는데 좀 더 따뜻했으면 좋겠어요.',
    images: [],
    menuNames: ['양념치킨', '치즈볼'],
    createdAt: '2024-12-08T18:20:00',
    reply: {
      content: '소중한 리뷰 감사합니다! 치즈볼 온도 관련해서 더 신경쓰겠습니다 :)',
      createdAt: '2024-12-08T19:00:00',
    },
    helpful: 3,
  },
  {
    id: '3',
    customerName: '박**',
    rating: 5,
    content: '반반 치킨 최고입니다! 두 가지 맛을 한 번에 즐길 수 있어서 좋아요.',
    images: [],
    menuNames: ['후라이드 반 + 양념 반'],
    createdAt: '2024-12-07T20:15:00',
    helpful: 8,
  },
  {
    id: '4',
    customerName: '최**',
    rating: 3,
    content: '배달이 조금 늦었어요. 음식은 맛있었는데 아쉽네요.',
    images: [],
    menuNames: ['간장치킨'],
    createdAt: '2024-12-06T19:45:00',
    helpful: 1,
  },
]

type FilterType = 'all' | 'unreplied' | 'low'

export default function OwnerReviewsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const avgRating = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length
  const unrepliedCount = MOCK_REVIEWS.filter((r) => !r.reply).length
  const lowRatingCount = MOCK_REVIEWS.filter((r) => r.rating <= 3).length

  const filteredReviews = MOCK_REVIEWS.filter((r) => {
    if (filter === 'unreplied') return !r.reply
    if (filter === 'low') return r.rating <= 3
    return true
  })

  const handleSubmitReply = (reviewId: string) => {
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요')
      return
    }
    alert(`리뷰 ${reviewId}에 답글 등록 (개발 중)`)
    setReplyingId(null)
    setReplyContent('')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 0) return '오늘'
    if (diff === 1) return '어제'
    if (diff < 7) return `${diff}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/owner" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            리뷰 관리
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-20">
        {/* 리뷰 요약 */}
        <section className="bg-white p-4">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-6 h-6 fill-[var(--color-warning-400)] text-[var(--color-warning-400)]" />
                <span className="text-2xl font-bold text-[var(--color-neutral-900)]">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                평균 별점
              </p>
            </div>
            <div className="w-px h-12 bg-[var(--color-neutral-200)]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                {MOCK_REVIEWS.length}
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                총 리뷰
              </p>
            </div>
          </div>
        </section>

        {/* 필터 */}
        <div className="flex gap-2 p-4 bg-white border-t border-[var(--color-neutral-100)]">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('unreplied')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'unreplied'
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            미답변 {unrepliedCount > 0 && `(${unrepliedCount})`}
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'low'
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            낮은 평점 {lowRatingCount > 0 && `(${lowRatingCount})`}
          </button>
        </div>

        {/* 리뷰 목록 */}
        <div className="divide-y divide-[var(--color-neutral-100)]">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-4">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--color-neutral-900)]">
                      {review.customerName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-[var(--color-warning-400)] text-[var(--color-warning-400)]'
                              : 'text-[var(--color-neutral-200)]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                    {formatDate(review.createdAt)} · {review.menuNames.join(', ')}
                  </p>
                </div>
              </div>

              {/* 내용 */}
              <p className="text-[var(--color-neutral-700)] leading-relaxed">
                {review.content}
              </p>

              {/* 도움됨 */}
              {review.helpful > 0 && (
                <div className="flex items-center gap-1 mt-3 text-sm text-[var(--color-neutral-500)]">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpful}명에게 도움됨</span>
                </div>
              )}

              {/* 사장님 답글 */}
              {review.reply ? (
                <div className="mt-4 p-3 bg-[var(--color-neutral-50)] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[var(--color-primary-500)]" />
                    <span className="text-sm font-medium text-[var(--color-primary-500)]">
                      사장님 답글
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-neutral-600)]">
                    {review.reply.content}
                  </p>
                </div>
              ) : replyingId === review.id ? (
                <div className="mt-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 입력하세요..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyingId(null)
                        setReplyContent('')
                      }}
                      className="px-4 py-2 text-sm text-[var(--color-neutral-600)]"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      className="px-4 py-2 bg-[var(--color-primary-500)] text-white text-sm font-medium rounded-lg"
                    >
                      등록
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingId(review.id)}
                  className="mt-4 text-sm font-medium text-[var(--color-primary-500)]"
                >
                  답글 작성
                </button>
              )}
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="bg-white py-12 text-center">
              <p className="text-[var(--color-neutral-500)]">
                {filter === 'unreplied'
                  ? '미답변 리뷰가 없습니다'
                  : filter === 'low'
                  ? '낮은 평점 리뷰가 없습니다'
                  : '리뷰가 없습니다'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
