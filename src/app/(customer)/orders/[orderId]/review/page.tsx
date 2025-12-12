'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Camera,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Order, PaymentMethod, OrderStatus, OrderRejectionReason } from '@/types/order.types'
import { useAuthStore } from '@/stores/auth.store'

interface PageProps {
  readonly params: Promise<{ orderId: string }>
}

export default function ReviewWritePage({ params }: Readonly<PageProps>) {
  const { orderId } = use(params)
  const router = useRouter()
  const { user } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch order data
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, restaurants(name, image_url)')
          .eq('id', orderId)
          .single()

        if (orderError) throw new Error('주문 정보를 불러오는데 실패했습니다.')

        const formattedOrder: Order = {
          id: orderData.id,
          orderNumber: orderData.order_number ?? '',
          userId: orderData.user_id ?? '',
          restaurantId: orderData.restaurant_id ?? '',
          restaurantName: orderData.restaurants?.name ?? '',
          restaurantImage: orderData.restaurants?.image_url,
          restaurantPhone: null, // Not needed for this page
          riderId: orderData.rider_id,
          riderName: null, // Not needed
          riderPhone: null, // Not needed
          status: orderData.status as OrderStatus,
          menuAmount: orderData.menu_amount ?? 0,
          discountAmount: orderData.discount_amount ?? 0,
          pointsUsed: orderData.points_used ?? 0,
          deliveryFee: orderData.delivery_fee ?? 0,
          platformFee: orderData.platform_fee ?? 0,
          totalAmount: orderData.total_amount ?? 0,
          deliveryAddress: orderData.delivery_address,
          deliveryDetail: orderData.delivery_detail,
          deliveryLat: orderData.delivery_lat,
          deliveryLng: orderData.delivery_lng,
          specialInstructions: orderData.special_instructions,
          deliveryInstructions: orderData.delivery_instructions,
          disposableItems: orderData.disposable_items ?? false,
          estimatedPrepTime: orderData.estimated_prep_time,
          estimatedDeliveryTime: orderData.estimated_delivery_time,
          actualDeliveryTime: orderData.actual_delivery_time,
          confirmedAt: orderData.confirmed_at,
          preparedAt: orderData.prepared_at,
          pickedUpAt: orderData.picked_up_at,
          deliveredAt: orderData.actual_delivery_time,
          rejectionReason: orderData.rejection_reason as OrderRejectionReason | null,
          rejectionDetail: orderData.rejection_detail,
          cancelledReason: orderData.cancelled_reason,
          cancelledAt: orderData.cancelled_at,
          cancelledBy: orderData.cancelled_by as 'customer' | 'owner' | 'system' | null,
          paymentMethod: orderData.payment_method as PaymentMethod,
          paymentId: orderData.payment_key,
          couponId: orderData.coupon_id,
          couponName: orderData.coupon_name,
          items: [], // Not needed for this page
          createdAt: orderData.created_at ?? '',
          updatedAt: orderData.updated_at ?? '',
        }

        setOrder(formattedOrder)

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [orderId])

  // 이미지 추가 핸들러 (실제로는 파일 업로드 구현 필요)
  const handleAddImage = () => {
    if (images.length >= 5) {
      alert('최대 5장까지 첨부할 수 있습니다')
      return
    }
    // Note: 이미지 업로드 기능 (Supabase Storage 연동 예정)
    alert('이미지 업로드 기능 준비 중입니다')
  }

  // 이미지 제거 핸들러
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // 리뷰 제출
  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      alert('리뷰는 10자 이상 작성해주세요')
      return
    }

    if (!user || !order) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          restaurant_id: order.restaurantId,
          order_id: order.id,
          rating,
          content,
          images,
        })

      if (reviewError) throw reviewError

      // Add points for review
      // 포인트 적립 (RPC 함수 호출)
      await supabase.rpc('earn_points', {
        p_user_id: user.id,
        p_amount: 100,
        p_description: '리뷰 작성 적립',
        p_order_id: order.id,
      })

      alert('리뷰가 등록되었습니다')
      router.push(`/orders/${orderId}`)
    } catch {
      alert('리뷰 등록에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-[var(--color-neutral-500)] mb-6">
          주문을 찾을 수 없습니다
        </p>
        <Link
          href="/orders"
          className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
        >
          주문내역으로 돌아가기
        </Link>
      </div>
    )
  }

  // 배달 완료된 주문만 리뷰 작성 가능
  if (order.status !== 'delivered') {
    return (
      <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-[var(--color-neutral-500)] mb-6">
          배달 완료된 주문만 리뷰를 작성할 수 있습니다
        </p>
        <Link
          href={`/orders/${orderId}`}
          className="px-6 py-3 bg-[var(--color-primary-500)] text-white font-semibold rounded-xl"
        >
          주문 상세로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </button>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            리뷰 작성
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main>
        {/* 가게 정보 */}
        <div className="bg-white px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)]">
            {order.restaurantName}
          </h3>
          <p className="text-sm text-[var(--color-neutral-500)] mt-1">
            {order.items.map(item => item.menuName).join(', ')}
          </p>
        </div>

        {/* 별점 */}
        <div className="bg-white mt-2 px-4 py-6">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-4 text-center">
            음식은 어떠셨나요?
          </h3>

          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`star-${star}`}
                onClick={() => setRating(star)}
                className="p-1 transition-transform active:scale-90"
              >
                <Star
                  className={`w-10 h-10 ${star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-[var(--color-neutral-200)]'
                    }`}
                />
              </button>
            ))}
          </div>

          <p className="text-center mt-3 text-sm text-[var(--color-neutral-500)]">
            {rating === 5 && '최고예요!'}
            {rating === 4 && '맛있어요'}
            {rating === 3 && '보통이에요'}
            {rating === 2 && '별로예요'}
            {rating === 1 && '최악이에요'}
          </p>
        </div>

        {/* 리뷰 내용 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">
            상세한 리뷰를 남겨주세요
          </h3>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="음식의 맛, 양, 포장 상태 등 자세한 리뷰를 남겨주시면 다른 고객님들께 도움이 됩니다. (최소 10자)"
            className="w-full h-32 px-4 py-3 bg-[var(--color-neutral-50)] rounded-xl border-none resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          />

          <p className="text-right text-xs text-[var(--color-neutral-400)] mt-2">
            {content.length}/500
          </p>
        </div>

        {/* 사진 첨부 */}
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="font-bold text-[var(--color-neutral-900)] mb-3">
            사진 첨부
            <span className="font-normal text-[var(--color-neutral-400)] ml-2">
              (선택, 최대 5장)
            </span>
          </h3>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {/* 이미지 추가 버튼 */}
            <button
              onClick={handleAddImage}
              className="flex-shrink-0 w-20 h-20 bg-[var(--color-neutral-50)] border-2 border-dashed border-[var(--color-neutral-200)] rounded-xl flex flex-col items-center justify-center"
            >
              <Camera className="w-6 h-6 text-[var(--color-neutral-400)]" />
              <span className="text-xs text-[var(--color-neutral-400)] mt-1">
                {images.length}/5
              </span>
            </button>

            {/* 첨부된 이미지 */}
            {images.map((image) => (
              <div
                key={`review-img-${image}`}
                className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden"
              >
                <img
                  src={image}
                  alt={`리뷰 이미지`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(images.indexOf(image))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="px-4 py-4">
          <ul className="text-xs text-[var(--color-neutral-400)] space-y-1">
            <li>• 작성된 리뷰는 가게 상세 페이지에 노출됩니다</li>
            <li>• 부적절한 내용의 리뷰는 삭제될 수 있습니다</li>
            <li>• 리뷰 작성 시 100 포인트가 적립됩니다</li>
          </ul>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-neutral-100)] p-4 safe-area-bottom">
        <Button
          className="w-full h-14 text-base font-bold"
          onClick={handleSubmit}
          disabled={isSubmitting || content.trim().length < 10}
        >
          {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
        </Button>
      </div>
    </div>
  )
}