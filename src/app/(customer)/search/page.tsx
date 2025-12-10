'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, X, Clock, TrendingUp } from 'lucide-react'

import { Input } from '@/components/ui/Input'

const RECENT_SEARCHES_KEY = 'dalligo_recent_searches'
const MAX_RECENT_SEARCHES = 10

// 인기 검색어 (실제로는 서버에서 가져옴)
const POPULAR_KEYWORDS = [
  '치킨',
  '피자',
  '족발',
  '중국집',
  '돈까스',
  '떡볶이',
  '햄버거',
  '초밥',
]

export default function SearchPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches from localStorage:', error)
        setRecentSearches([])
      }
    }
  }, [])

  // 검색어 저장
  const saveSearch = useCallback((searchKeyword: string) => {
    const trimmed = searchKeyword.trim()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((k) => k !== trimmed)
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // 검색 실행
  const handleSearch = useCallback(
    (searchKeyword: string) => {
      const trimmed = searchKeyword.trim()
      if (!trimmed) return

      saveSearch(trimmed)
      router.push(`/search/results?q=${encodeURIComponent(trimmed)}`)
    },
    [router, saveSearch]
  )

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(keyword)
  }

  // 최근 검색어 삭제
  const removeRecentSearch = (searchKeyword: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((k) => k !== searchKeyword)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
      return filtered
    })
  }

  // 전체 삭제
  const clearAllRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 검색 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>

          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="맛집, 메뉴를 검색해보세요"
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-[var(--color-neutral-100)] border-none"
                autoFocus
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--color-neutral-300)] flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      <main className="p-4">
        {/* 최근 검색어 */}
        {recentSearches.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--color-neutral-900)]">
                최근 검색어
              </h2>
              <button
                onClick={clearAllRecentSearches}
                className="text-sm text-[var(--color-neutral-400)]"
              >
                전체 삭제
              </button>
            </div>

            <div className="space-y-2">
              {recentSearches.map((search) => (
                <div
                  key={search}
                  className="flex items-center justify-between py-2"
                >
                  <button
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <Clock className="w-4 h-4 text-[var(--color-neutral-400)]" />
                    <span className="text-[var(--color-neutral-700)]">
                      {search}
                    </span>
                  </button>
                  <button
                    onClick={() => removeRecentSearch(search)}
                    className="w-8 h-8 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-[var(--color-neutral-400)]" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 인기 검색어 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--color-primary-500)]" />
            <h2 className="text-base font-bold text-[var(--color-neutral-900)]">
              인기 검색어
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_KEYWORDS.map((popularKeyword) => (
              <button
                key={popularKeyword}
                onClick={() => handleSearch(popularKeyword)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-200)] transition-colors"
              >
                <span className="text-sm font-bold text-[var(--color-primary-500)]">
                  {POPULAR_KEYWORDS.indexOf(popularKeyword) + 1}
                </span>
                <span className="text-sm text-[var(--color-neutral-700)]">
                  {popularKeyword}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
