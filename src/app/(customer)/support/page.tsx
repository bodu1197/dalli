'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  FileText,
  HelpCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Pin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useFAQCategories,
  useFAQList,
  usePinnedFAQs,
  useIncrementFAQView,
  useFAQFeedback,
  getFAQFeedbackStatus,
} from '@/hooks/useFAQ'
import type { FAQWithCategory } from '@/types/user-features.types'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: categories, isLoading: categoriesLoading } = useFAQCategories()
  const { data: pinnedFAQs } = usePinnedFAQs()
  const { data: faqList, isLoading: faqLoading } = useFAQList({
    categorySlug: selectedCategory,
    searchQuery: searchQuery.length >= 2 ? searchQuery : undefined,
  })
  const incrementView = useIncrementFAQView()
  const submitFeedback = useFAQFeedback()

  const toggleExpand = (id: string) => {
    if (expandedId !== id) {
      // 새로운 FAQ를 열 때 조회수 증가
      incrementView.mutate(id)
    }
    setExpandedId(expandedId === id ? null : id)
  }

  // 카테고리 목록에 '전체' 추가
  const categoryOptions = [
    { id: 'all', name: '전체', slug: 'all' },
    ...(categories || []),
  ]

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
            고객센터
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-20">
        {/* 검색창 */}
        <div className="p-4 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              placeholder="무엇이 궁금하신가요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--color-neutral-100)] rounded-xl text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            />
          </div>
        </div>

        {/* 문의 방법 */}
        <div className="p-4">
          <h2 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            문의하기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/support/inquiry"
              className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6 text-[var(--color-primary-600)]" />
              </div>
              <span className="font-medium text-[var(--color-neutral-900)]">
                1:1 문의
              </span>
              <span className="text-xs text-[var(--color-neutral-500)]">
                24시간 이내 답변
              </span>
            </Link>

            <a
              href="tel:1600-0000"
              className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center mb-2">
                <Phone className="w-6 h-6 text-[var(--color-neutral-600)]" />
              </div>
              <span className="font-medium text-[var(--color-neutral-900)]">
                전화 문의
              </span>
              <span className="text-xs text-[var(--color-neutral-500)]">
                1600-0000
              </span>
            </a>
          </div>

          {/* 운영 시간 안내 */}
          <div className="mt-3 p-3 bg-[var(--color-neutral-100)] rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-neutral-500)]" />
            <span className="text-sm text-[var(--color-neutral-600)]">
              전화 상담: 평일 09:00 - 18:00 (공휴일 휴무)
            </span>
          </div>
        </div>

        {/* 고정 FAQ (상단 고정) */}
        {pinnedFAQs && pinnedFAQs.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <div className="px-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-4 h-4 text-[var(--color-primary-500)]" />
              <h2 className="font-semibold text-[var(--color-neutral-900)]">
                자주 찾는 질문
              </h2>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden mb-4">
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {pinnedFAQs.map((item) => (
                  <FAQItem
                    key={item.id}
                    faq={item}
                    isExpanded={expandedId === item.id}
                    onToggle={() => toggleExpand(item.id)}
                    onFeedback={submitFeedback.mutate}
                    isPinned
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ 카테고리 */}
        <div className="px-4 mt-2">
          <h2 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            자주 묻는 질문
          </h2>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 pb-2">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--color-neutral-400)]" />
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {categoryOptions.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedCategory === category.slug
                      ? 'bg-[var(--color-neutral-900)] text-white'
                      : 'bg-white text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FAQ 목록 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            {faqLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)]" />
              </div>
            ) : !faqList || faqList.length === 0 ? (
              <div className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-3" />
                <p className="text-[var(--color-neutral-500)]">
                  {searchQuery
                    ? '검색 결과가 없습니다'
                    : '등록된 FAQ가 없습니다'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {faqList
                  .filter((item) => !item.is_pinned || searchQuery || selectedCategory !== 'all')
                  .map((item) => (
                    <FAQItem
                      key={item.id}
                      faq={item}
                      isExpanded={expandedId === item.id}
                      onToggle={() => toggleExpand(item.id)}
                      onFeedback={submitFeedback.mutate}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 추가 메뉴 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            <Link
              href="/notice"
              className="flex items-center justify-between px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--color-neutral-500)]" />
                <span className="text-[var(--color-neutral-800)]">공지사항</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
            <div className="mx-4 h-px bg-[var(--color-neutral-100)]" />
            <Link
              href="/terms"
              className="flex items-center justify-between px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--color-neutral-500)]" />
                <span className="text-[var(--color-neutral-800)]">
                  이용약관 및 정책
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </Link>
            <div className="mx-4 h-px bg-[var(--color-neutral-100)]" />
            <a
              href="mailto:support@dalligo.com"
              className="flex items-center justify-between px-4 py-4 hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--color-neutral-500)]" />
                <span className="text-[var(--color-neutral-800)]">
                  이메일 문의
                </span>
              </div>
              <span className="text-sm text-[var(--color-neutral-500)]">
                support@dalligo.com
              </span>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

interface FAQItemProps {
  readonly faq: FAQWithCategory
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly onFeedback: (params: { faqId: string; helpful: boolean }) => void
  readonly isPinned?: boolean
}

function FAQItem({ faq, isExpanded, onToggle, onFeedback, isPinned }: FAQItemProps) {
  const [feedbackStatus, setFeedbackStatus] = useState<'helpful' | 'not_helpful' | null>(null)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  // 클라이언트에서만 localStorage 확인
  useEffect(() => {
    setFeedbackStatus(getFAQFeedbackStatus(faq.id))
  }, [faq.id])

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackStatus) return // 이미 피드백 제출함

    setFeedbackSubmitting(true)
    try {
      onFeedback({ faqId: faq.id, helpful })
      setFeedbackStatus(helpful ? 'helpful' : 'not_helpful')
    } catch {
      // 에러 처리 (이미 피드백 제출한 경우 등)
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-[var(--color-neutral-50)] transition-colors"
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-primary-600)] font-medium">
              {faq.category?.name || '기타'}
            </span>
            {isPinned && (
              <Pin className="w-3 h-3 text-[var(--color-primary-500)]" />
            )}
          </div>
          <p className="mt-1 font-medium text-[var(--color-neutral-900)]">
            {faq.question}
          </p>
          {faq.view_count > 0 && (
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              조회 {faq.view_count}
            </p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--color-neutral-400)] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--color-neutral-400)] flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="p-4 bg-[var(--color-neutral-50)] rounded-xl">
            <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed whitespace-pre-wrap">
              {faq.answer}
            </p>

            {/* 도움됨 피드백 */}
            <div className="mt-4 pt-4 border-t border-[var(--color-neutral-200)]">
              <p className="text-sm text-[var(--color-neutral-500)] mb-2">
                이 답변이 도움이 되었나요?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={!!feedbackStatus || feedbackSubmitting}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    feedbackStatus === 'helpful'
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                      : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]',
                    (feedbackStatus && feedbackStatus !== 'helpful') && 'opacity-50',
                    feedbackSubmitting && 'opacity-50'
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  도움됨 {faq.helpful_count > 0 && `(${faq.helpful_count})`}
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={!!feedbackStatus || feedbackSubmitting}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    feedbackStatus === 'not_helpful'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]',
                    (feedbackStatus && feedbackStatus !== 'not_helpful') && 'opacity-50',
                    feedbackSubmitting && 'opacity-50'
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                  아니요 {faq.not_helpful_count > 0 && `(${faq.not_helpful_count})`}
                </button>
              </div>
              {feedbackStatus && (
                <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
                  피드백이 전달되었습니다. 감사합니다!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
