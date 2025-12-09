// 식당 카테고리
export interface Category {
  id: string
  name: string
  icon: string | null
  sortOrder: number
}

// 식당 정보
export interface Restaurant {
  id: string
  ownerId: string
  name: string
  description: string | null
  phone: string
  address: string
  lat: number
  lng: number
  categoryId: string | null
  category?: Category
  minOrderAmount: number
  deliveryFee: number
  originalDeliveryFee?: number // 원래 배달비 (할인 전)
  estimatedDeliveryTime: number // 분
  businessHours: BusinessHours | null
  isOpen: boolean
  rating: number
  reviewCount: number
  imageUrl: string | null
  // 광고 관련
  isAdvertised: boolean
  adPriority: number
  adExpiresAt: string | null
  // 추가 정보
  distance?: number // 미터
  isNew?: boolean
  hasDiscount?: boolean
  discountAmount?: number
  isClubMember?: boolean
  canPickup?: boolean
  createdAt: string
  updatedAt: string
}

// 영업 시간
export interface BusinessHours {
  mon?: DayHours
  tue?: DayHours
  wed?: DayHours
  thu?: DayHours
  fri?: DayHours
  sat?: DayHours
  sun?: DayHours
}

export interface DayHours {
  open: string // "09:00"
  close: string // "22:00"
  breakStart?: string // 브레이크 타임 시작
  breakEnd?: string // 브레이크 타임 종료
  isClosed?: boolean // 휴무
}

// 메뉴 정보
export interface Menu {
  id: string
  restaurantId: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  isPopular: boolean
  sortOrder: number
  rank?: number // 인기 순위
  reviewCount?: number
  createdAt: string
}

// 메뉴 옵션
export interface MenuOption {
  id: string
  menuId: string
  name: string
  price: number
  isRequired: boolean
}

// 검색 필터
export interface RestaurantFilter {
  categoryId?: string
  minRating?: number
  maxDeliveryFee?: number
  minOrderAmount?: number
  sortBy?: 'distance' | 'rating' | 'deliveryTime' | 'reviewCount'
  isOpen?: boolean
  hasDiscount?: boolean
}

// 검색 결과
export interface RestaurantSearchResult {
  restaurants: Restaurant[]
  totalCount: number
  hasMore: boolean
}
