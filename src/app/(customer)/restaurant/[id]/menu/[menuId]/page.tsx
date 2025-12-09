'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { MOCK_RESTAURANTS } from '@/lib/mock/restaurants'
import { getMenuById, getMenuOptions } from '@/lib/mock/menus'

interface MenuDetailPageProps {
  params: Promise<{ id: string; menuId: string }>
}

export default function MenuDetailPage({ params }: MenuDetailPageProps) {
  const { id, menuId } = use(params)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  // 데이터 가져오기
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id)
  const menu = getMenuById(id, menuId)
  const options = getMenuOptions(menuId)

  if (!restaurant || !menu) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[var(--color-neutral-500)]">
          메뉴를 찾을 수 없습니다
        </p>
      </div>
    )
  }

  // 옵션 토글
  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    )
  }

  // 총 가격 계산
  const optionsPrice = options
    .filter((opt) => selectedOptions.includes(opt.id))
    .reduce((sum, opt) => sum + opt.price, 0)
  const totalPrice = (menu.price + optionsPrice) * quantity

  // 수량 변경
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (quantity < 99) setQuantity(quantity + 1)
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 메뉴 이미지 */}
      <div className="relative h-72 bg-[var(--color-neutral-100)]">
        {menu.imageUrl ? (
          <Image
            src={menu.imageUrl}
            alt={menu.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}

        {/* 뒤로가기 버튼 */}
        <Link
          href={`/restaurant/${id}`}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-neutral-700)]" />
        </Link>
      </div>

      {/* 메뉴 정보 */}
      <div className="p-4">
        {/* 인기 배지 */}
        {menu.rank && (
          <span className="inline-block bg-[var(--color-neutral-800)] text-white text-xs font-medium px-2 py-1 rounded mb-3">
            인기 {menu.rank}위
          </span>
        )}

        <h1 className="text-xl font-bold text-[var(--color-neutral-900)] mb-2">
          {menu.name}
        </h1>

        {menu.description && (
          <p className="text-[var(--color-neutral-600)] mb-4">
            {menu.description}
          </p>
        )}

        <p className="text-xl font-bold text-[var(--color-neutral-900)]">
          {menu.price.toLocaleString()}원
        </p>
      </div>

      {/* 옵션 선택 */}
      {options.length > 0 && (
        <div className="border-t-8 border-[var(--color-neutral-50)] p-4">
          <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">
            추가 옵션
          </h2>

          <div className="space-y-3">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-neutral-200)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="w-5 h-5 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                  />
                  <span className="text-[var(--color-neutral-700)]">
                    {option.name}
                  </span>
                </div>
                <span className="font-medium text-[var(--color-neutral-700)]">
                  +{option.price.toLocaleString()}원
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 수량 선택 */}
      <div className="border-t-8 border-[var(--color-neutral-50)] p-4">
        <h2 className="font-bold text-[var(--color-neutral-900)] mb-4">
          수량
        </h2>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-full border border-[var(--color-neutral-200)] flex items-center justify-center disabled:opacity-50"
          >
            <Minus className="w-5 h-5 text-[var(--color-neutral-700)]" />
          </button>

          <span className="text-xl font-bold text-[var(--color-neutral-900)] w-12 text-center">
            {quantity}
          </span>

          <button
            onClick={increaseQuantity}
            disabled={quantity >= 99}
            className="w-10 h-10 rounded-full border border-[var(--color-neutral-200)] flex items-center justify-center disabled:opacity-50"
          >
            <Plus className="w-5 h-5 text-[var(--color-neutral-700)]" />
          </button>
        </div>
      </div>

      {/* 하단 담기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
        <Button
          className="w-full h-14 text-base font-bold"
          onClick={() => {
            // TODO: 장바구니에 담기
            alert('장바구니에 담겼습니다')
          }}
        >
          {totalPrice.toLocaleString()}원 담기
        </Button>
      </div>
    </div>
  )
}
