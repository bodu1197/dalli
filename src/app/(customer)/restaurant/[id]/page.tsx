'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Clock,
  Phone,
  MapPin,
  Info,
  ChevronRight,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { MenuList } from '@/components/features/menu/MenuList'
import { BottomNavBar } from '@/components/layouts/BottomNavBar'
import { createClient } from '@/lib/supabase/client'
import type { Restaurant } from '@/types/restaurant.types'
import type { Menu, MenuOption } from '@/types/restaurant.types'

interface RestaurantDetailPageProps {
  readonly params: Promise<{ id: string }>
}

type TabType = 'menu' | 'info' | 'review'

export default function RestaurantDetailPage({
  params,
}: Readonly<RestaurantDetailPageProps>) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<TabType>('menu')
  const [isFavorite, setIsFavorite] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [allMenus, setAllMenus] = useState<Menu[]>([])
  const [popularMenus, setPopularMenus] = useState<Menu[]>([])
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
          businessHours: restaurantData.business_hours as any,
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

        // Fetch all menus
        const { data: allMenusData, error: allMenusError } = await supabase
          .from('menus')
          .select('*')
          .eq('restaurant_id', id)
          .order('sort_order', { ascending: true })


        if (allMenusError) throw new Error('메뉴 정보를 불러오는데 실패했습니다.')

        const formattedMenus: Menu[] = allMenusData.map((menu: any) => ({
          id: menu.id,
          restaurantId: menu.restaurant_id,
          name: menu.name,
          description: menu.description,
          price: menu.price ?? 0,
          imageUrl: menu.image_url,
          isAvailable: menu.is_available ?? false,
          isPopular: menu.is_popular ?? false,
          sortOrder: menu.sort_order ?? 0,
          createdAt: menu.created_at ?? '',
        }))
        setAllMenus(formattedMenus)

        // Fetch popular menus
        const popularMenusData = formattedMenus.filter(menu => menu.isPopular)
        setPopularMenus(popularMenusData)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[var(--color-neutral-500)]">
          가게를 찾을 수 없습니다
        </p>
      </div>
    )
  }

  // 영업 상태 표시
  const getStatusText = () => {
    if (!restaurant.isOpen) return '준비중'
    return '영업중'
  }

  const getStatusColor = () => {
    if (!restaurant.isOpen) return 'text-[var(--color-neutral-400)]'
    return 'text-green-500'
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-20">
      {/* 헤더 이미지 */}
      <div className="relative h-56 bg-[var(--color-neutral-100)]">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}

        {/* 상단 버튼들 */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-neutral-700)]" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-[var(--color-neutral-700)]'
                  }`}
              />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center">
              <Share2 className="w-5 h-5 text-[var(--color-neutral-700)]" />
            </button>
          </div>
        </div>
      </div>

      {/* 식당 정보 카드 */}
      <div className="bg-white px-4 py-5 -mt-4 relative rounded-t-3xl">
        {/* 영업 상태 */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {restaurant.deliveryFee === 0 && (
            <Badge variant="delivery" size="sm">
              배달팁 무료
            </Badge>
          )}
          {/* restaurant.isNew is not in the db schema, so I will remove it */}
        </div>

        {/* 가게명 */}
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)] mb-2">
          {restaurant.name}
        </h1>

        {/* 평점 & 리뷰 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
          </div>
          <Link
            href={`/restaurant/${id}/reviews`}
            className="text-sm text-[var(--color-neutral-500)] underline"
          >
            리뷰 {restaurant.reviewCount.toLocaleString()}개
          </Link>
        </div>

        {/* 배달 정보 */}
        <div className="flex items-center gap-4 text-sm text-[var(--color-neutral-600)]">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>약 {restaurant.estimatedDeliveryTime}분</span>
          </div>
          <span>·</span>
          <span>
            최소주문 {restaurant.minOrderAmount.toLocaleString()}원
          </span>
          <span>·</span>
          <span>
            배달팁{' '}
            {restaurant.deliveryFee === 0
              ? '무료'
              : `${restaurant.deliveryFee.toLocaleString()}원`}
          </span>
        </div>

        {/* 가게 정보 더보기 */}
        <Link
          href={`/restaurant/${id}/info`}
          className="flex items-center justify-between mt-4 py-3 border-t border-[var(--color-neutral-100)]"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--color-neutral-400)]" />
            <span className="text-sm text-[var(--color-neutral-600)]">
              가게정보
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-neutral-400)]" />
        </Link>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white mt-2 sticky top-0 z-20">
        <div className="flex border-b border-[var(--color-neutral-100)]">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${activeTab === 'menu'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
              }`}
          >
            메뉴
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${activeTab === 'info'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
              }`}
          >
            정보
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${activeTab === 'review'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
              }`}
          >
            리뷰
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white">
        {activeTab === 'menu' && (
          <div>
            {/* 인기 메뉴 */}
            {popularMenus.length > 0 && (
              <section className="border-b-8 border-[var(--color-neutral-50)]">
                <div className="px-4 py-4">
                  <h2 className="text-lg font-bold text-[var(--color-neutral-900)]">
                    인기 메뉴
                  </h2>
                </div>
                <MenuList menus={popularMenus} restaurantId={id} />
              </section>
            )}

            {/* 전체 메뉴 */}
            <section>
              <div className="px-4 py-4">
                <h2 className="text-lg font-bold text-[var(--color-neutral-900)]">
                  전체 메뉴
                </h2>
              </div>
              <MenuList menus={allMenus} restaurantId={id} />
            </section>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            {/* 영업 시간 */}
            <div>
              <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
                영업 시간
              </h3>
              {restaurant.businessHours ? (
                <div className="space-y-1 text-sm text-[var(--color-neutral-600)]">
                  {Object.entries(restaurant.businessHours).map(
                    ([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span>
                          {
                            {
                              mon: '월요일',
                              tue: '화요일',
                              wed: '수요일',
                              thu: '목요일',
                              fri: '금요일',
                              sat: '토요일',
                              sun: '일요일',
                            }[day]
                          }
                        </span>
                        <span>
                          {hours?.open} - {hours?.close}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-neutral-500)]">
                  영업시간 정보가 없습니다
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
                전화번호
              </h3>
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-2 text-sm text-[var(--color-primary-500)]"
              >
                <Phone className="w-4 h-4" />
                {restaurant.phone}
              </a>
            </div>

            {/* 주소 */}
            <div>
              <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
                주소
              </h3>
              <div className="flex items-start gap-2 text-sm text-[var(--color-neutral-600)]">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="p-4">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-[var(--color-neutral-500)]">
                리뷰 기능 준비 중입니다
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  )
}