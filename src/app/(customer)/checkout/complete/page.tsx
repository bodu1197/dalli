'use client'

import Link from 'next/link'
import { CheckCircle, Home, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export default function CheckoutCompletePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* 성공 아이콘 */}
        <div className="w-24 h-24 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-[var(--color-primary-500)]" />
        </div>

        {/* 안내 텍스트 */}
        <h1 className="text-2xl font-bold text-[var(--color-neutral-900)] mb-2">
          주문이 완료되었습니다!
        </h1>
        <p className="text-[var(--color-neutral-500)] text-center mb-8">
          맛있는 음식이 곧 배달됩니다.
          <br />
          주문 내역에서 배달 현황을 확인하세요.
        </p>

        {/* 예상 시간 */}
        <div className="w-full max-w-sm bg-[var(--color-neutral-50)] rounded-2xl p-6 mb-8">
          <p className="text-sm text-[var(--color-neutral-500)] mb-1">
            예상 배달 시간
          </p>
          <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
            약 30~40분
          </p>
        </div>

        {/* 버튼들 */}
        <div className="w-full max-w-sm space-y-3">
          <Link href="/orders">
            <Button className="w-full h-14 text-base font-bold flex items-center justify-center gap-2">
              <ClipboardList className="w-5 h-5" />
              주문 내역 보기
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-14 text-base font-bold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              홈으로 가기
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
