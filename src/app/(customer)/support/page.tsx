'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

// Mock FAQ 데이터
const MOCK_FAQ: FAQItem[] = [
  {
    id: '1',
    question: '주문 취소는 어떻게 하나요?',
    answer:
      '주문 취소는 가게에서 주문을 접수하기 전까지 가능합니다. 주문내역 > 해당 주문 > 주문 취소 버튼을 눌러주세요. 가게에서 이미 조리를 시작한 경우에는 취소가 불가능할 수 있습니다.',
    category: '주문/결제',
  },
  {
    id: '2',
    question: '배달이 늦어지면 어떻게 하나요?',
    answer:
      '예상 배달 시간보다 늦어지는 경우, 주문 상세 페이지에서 라이더 위치를 확인하실 수 있습니다. 30분 이상 늦어지는 경우 고객센터로 문의해 주세요.',
    category: '배달',
  },
  {
    id: '3',
    question: '결제 수단을 변경하고 싶어요',
    answer:
      '마이페이지 > 결제 수단 관리에서 결제 수단을 추가하거나 삭제할 수 있습니다. 기본 결제 수단도 변경 가능합니다.',
    category: '주문/결제',
  },
  {
    id: '4',
    question: '포인트는 어떻게 사용하나요?',
    answer:
      '주문 시 결제 단계에서 보유 포인트를 사용하실 수 있습니다. 최소 1,000포인트 이상부터 사용 가능하며, 결제 금액의 최대 30%까지 사용할 수 있습니다.',
    category: '포인트/쿠폰',
  },
  {
    id: '5',
    question: '쿠폰 사용 조건이 궁금해요',
    answer:
      '쿠폰마다 사용 조건이 다릅니다. 쿠폰함에서 해당 쿠폰을 클릭하시면 최소 주문금액, 사용 가능 가게, 유효기간 등 상세 조건을 확인하실 수 있습니다.',
    category: '포인트/쿠폰',
  },
  {
    id: '6',
    question: '회원 탈퇴는 어떻게 하나요?',
    answer:
      '설정 > 회원탈퇴에서 탈퇴하실 수 있습니다. 탈퇴 시 보유 포인트, 쿠폰, 주문내역 등 모든 정보가 삭제되며 복구가 불가능합니다.',
    category: '계정',
  },
]

const FAQ_CATEGORIES = ['전체', '주문/결제', '배달', '포인트/쿠폰', '계정']

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFAQ = MOCK_FAQ.filter((item) => {
    const matchesCategory =
      selectedCategory === '전체' || item.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
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

        {/* FAQ 카테고리 */}
        <div className="px-4 mt-2">
          <h2 className="font-semibold text-[var(--color-neutral-900)] mb-3">
            자주 묻는 질문
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  selectedCategory === category
                    ? 'bg-[var(--color-neutral-900)] text-white'
                    : 'bg-white text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ 목록 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            {filteredFAQ.length === 0 ? (
              <div className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-[var(--color-neutral-300)] mx-auto mb-3" />
                <p className="text-[var(--color-neutral-500)]">
                  검색 결과가 없습니다
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-neutral-100)]">
                {filteredFAQ.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-[var(--color-neutral-50)] transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <span className="text-xs text-[var(--color-primary-600)] font-medium">
                          {item.category}
                        </span>
                        <p className="mt-1 font-medium text-[var(--color-neutral-900)]">
                          {item.question}
                        </p>
                      </div>
                      {expandedId === item.id ? (
                        <ChevronUp className="w-5 h-5 text-[var(--color-neutral-400)] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--color-neutral-400)] flex-shrink-0" />
                      )}
                    </button>
                    {expandedId === item.id && (
                      <div className="px-4 pb-4">
                        <p className="p-4 bg-[var(--color-neutral-50)] rounded-xl text-sm text-[var(--color-neutral-700)] leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
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
