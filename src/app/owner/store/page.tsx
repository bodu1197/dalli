'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Clock, MapPin, Phone, ChevronRight } from 'lucide-react'

interface StoreInfo {
  name: string
  description: string
  category: string
  phone: string
  address: string
  businessHours: {
    day: string
    open: string
    close: string
    isHoliday: boolean
  }[]
  minOrderAmount: number
  deliveryFee: number
  deliveryRadius: number
  estimatedTime: string
  origin: string
}

// Mock 가게 정보
const MOCK_STORE: StoreInfo = {
  name: 'BBQ 치킨 강남점',
  description: '바삭하고 맛있는 치킨 전문점입니다. 황금올리브 치킨이 대표 메뉴입니다.',
  category: '치킨',
  phone: '02-1234-5678',
  address: '서울시 강남구 역삼동 123-45',
  businessHours: [
    { day: '월', open: '11:00', close: '23:00', isHoliday: false },
    { day: '화', open: '11:00', close: '23:00', isHoliday: false },
    { day: '수', open: '11:00', close: '23:00', isHoliday: false },
    { day: '목', open: '11:00', close: '23:00', isHoliday: false },
    { day: '금', open: '11:00', close: '24:00', isHoliday: false },
    { day: '토', open: '11:00', close: '24:00', isHoliday: false },
    { day: '일', open: '12:00', close: '22:00', isHoliday: false },
  ],
  minOrderAmount: 15000,
  deliveryFee: 3000,
  deliveryRadius: 3,
  estimatedTime: '30~45분',
  origin: '닭고기: 국내산, 감자: 미국산, 치즈: 뉴질랜드산',
}

export default function OwnerStorePage() {
  const [store] = useState(MOCK_STORE)

  const settingItems = [
    {
      label: '영업시간 설정',
      href: '/owner/store/hours',
      icon: <Clock className="w-5 h-5" />,
      description: '요일별 영업시간, 브레이크타임',
    },
    {
      label: '휴무일 설정',
      href: '/owner/store/holidays',
      icon: <Clock className="w-5 h-5" />,
      description: '정기 휴무, 임시 휴무',
    },
    {
      label: '배달/주문 설정',
      href: '/owner/store/delivery',
      icon: <MapPin className="w-5 h-5" />,
      description: `최소 주문 ${store.minOrderAmount.toLocaleString()}원, 배달비 ${store.deliveryFee.toLocaleString()}원`,
    },
    {
      label: '원산지 정보',
      href: '/owner/store/origin',
      icon: <span className="text-lg">📋</span>,
      description: '원산지 표기 관리',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/owner" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            가게 관리
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-20">
        {/* 가게 프로필 */}
        <section className="bg-white p-4">
          <div className="flex gap-4">
            {/* 가게 이미지 */}
            <div className="relative">
              <div className="w-24 h-24 bg-[var(--color-neutral-100)] rounded-xl flex items-center justify-center">
                <span className="text-4xl">🍗</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* 가게 정보 */}
            <div className="flex-1">
              <h2 className="font-bold text-lg text-[var(--color-neutral-900)]">
                {store.name}
              </h2>
              <p className="text-sm text-[var(--color-primary-500)] mt-0.5">
                {store.category}
              </p>
              <p className="text-sm text-[var(--color-neutral-600)] mt-2 line-clamp-2">
                {store.description}
              </p>
            </div>
          </div>

          <button className="w-full mt-4 py-3 border border-[var(--color-primary-500)] text-[var(--color-primary-500)] font-semibold rounded-xl">
            가게 정보 수정
          </button>
        </section>

        {/* 기본 정보 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h3 className="font-semibold text-[var(--color-neutral-900)]">기본 정보</h3>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            <div className="flex items-center gap-3 px-4 py-4">
              <Phone className="w-5 h-5 text-[var(--color-neutral-400)]" />
              <div className="flex-1">
                <p className="text-sm text-[var(--color-neutral-500)]">전화번호</p>
                <p className="text-[var(--color-neutral-800)]">{store.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <MapPin className="w-5 h-5 text-[var(--color-neutral-400)]" />
              <div className="flex-1">
                <p className="text-sm text-[var(--color-neutral-500)]">주소</p>
                <p className="text-[var(--color-neutral-800)]">{store.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <Clock className="w-5 h-5 text-[var(--color-neutral-400)]" />
              <div className="flex-1">
                <p className="text-sm text-[var(--color-neutral-500)]">영업시간</p>
                <p className="text-[var(--color-neutral-800)]">
                  매일 {store.businessHours[0].open} ~ {store.businessHours[0].close}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 설정 메뉴 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h3 className="font-semibold text-[var(--color-neutral-900)]">가게 설정</h3>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {settingItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-4 hover:bg-[var(--color-neutral-50)]"
              >
                <span className="text-[var(--color-neutral-400)]">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-[var(--color-neutral-800)]">{item.label}</p>
                  <p className="text-sm text-[var(--color-neutral-500)]">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
              </Link>
            ))}
          </div>
        </section>

        {/* 임시 영업중지 */}
        <section className="mt-3 bg-white p-4">
          <Link
            href="/owner/store/pause"
            className="block w-full py-4 text-center border border-[var(--color-error-500)] text-[var(--color-error-500)] font-semibold rounded-xl"
          >
            임시 영업중지
          </Link>
          <p className="text-center text-sm text-[var(--color-neutral-500)] mt-2">
            바쁘거나 재료 소진 시 일시적으로 주문을 받지 않을 수 있습니다
          </p>
        </section>
      </main>
    </div>
  )
}
