'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Restaurant, BusinessHours, Menu, MenuOption } from '@/types/restaurant.types'
import type { Database } from '@/types/supabase'

type MenuOptionRow = Database['public']['Tables']['menu_options']['Row']

interface MenuDetailPageProps {
  readonly params: Promise<{ id: string; menuId: string }>
}

export default function MenuDetailPage({ params }: Readonly<MenuDetailPageProps>) {
  const { id, menuId } = use(params)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [options, setOptions] = useState<MenuOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch restaurant data
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single()

        if (restaurantError) throw new Error('식당 정보를 불러오는데 실패했습니다.')

        const formattedRestaurant: Restaurant = {
          id: restaurantData.id,
          ownerId: restaurantData.owner_id,
          name: restaurantData.name,
          description: restaurantData.description,
          phone: restaurantData.phone,
          address: restaurantData.address,
          lat: restaurantData.lat,
          lng: restaurantData.lng,
          categoryId: restaurantData.category_id,
          minOrderAmount: restaurantData.min_order_amount ?? 0,
          deliveryFee: restaurantData.delivery_fee ?? 0,
          estimatedDeliveryTime: restaurantData.estimated_delivery_time ?? 0,
          businessHours: restaurantData.business_hours as BusinessHours | null,
          isOpen: restaurantData.is_open ?? false,
          rating: restaurantData.rating ?? 0,
          reviewCount: restaurantData.review_count ?? 0,
          imageUrl: restaurantData.image_url,
          isAdvertised: restaurantData.is_advertised ?? false,
          adPriority: restaurantData.ad_priority ?? 0,
          adExpiresAt: restaurantData.ad_expires_at,
          createdAt: restaurantData.created_at ?? '',
          updatedAt: restaurantData.updated_at ?? '',
        }
        setRestaurant(formattedRestaurant)

        // Fetch menu data
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select('*')
          .eq('id', menuId)
          .single()

        if (menuError) throw new Error('메뉴 정보를 불러오는데 실패했습니다.')

        const formattedMenu: Menu = {
          id: menuData.id,
          restaurantId: menuData.restaurant_id,
          name: menuData.name,
          description: menuData.description,
          price: menuData.price ?? 0,
          imageUrl: menuData.image_url,
          isAvailable: menuData.is_available ?? false,
          isPopular: menuData.is_popular ?? false,
          sortOrder: menuData.sort_order ?? 0,
          createdAt: menuData.created_at ?? '',
        }
        setMenu(formattedMenu)

        // Fetch menu options
        const { data: optionsData, error: optionsError } = await supabase
          .from('menu_option_groups')
          .select('*, menu_options(*)')
          .eq('menu_id', menuId)

        if (optionsError) throw new Error('메뉴 옵션을 불러오는데 실패했습니다.')

        const allOptions = optionsData.flatMap(group => group.menu_options.map((opt: MenuOptionRow) => ({
          id: opt.id,
          menuId: menuId,
          name: opt.name,
          price: opt.price ?? 0,
          isRequired: group.is_required ?? false,
        })))
        setOptions(allOptions)

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, menuId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[var(--color-neutral-500)]">
          로딩 중...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">
          {error}
        </p>
      </div>
    )
  }

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
        {menu.isPopular && (
          <span className="inline-block bg-[var(--color-neutral-800)] text-white text-xs font-medium px-2 py-1 rounded mb-3">
            인기
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
            // Note: Add to cart functionality (to be integrated with cart store)
            alert('장바구니에 담겼습니다')
          }}
        >
          {totalPrice.toLocaleString()}원 담기
        </Button>
      </div>
    </div>
  )
}