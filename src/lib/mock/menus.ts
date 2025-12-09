import type { Menu, MenuOption } from '@/types/restaurant.types'

// 식당 1: 맛있는 치킨 메뉴
export const MENUS_RESTAURANT_1: Menu[] = [
  {
    id: 'menu-1-1',
    restaurantId: '1',
    name: '후라이드치킨',
    description: '바삭바삭 황금빛 클래식 후라이드',
    price: 18000,
    imageUrl: null,
    isAvailable: true,
    isPopular: true,
    sortOrder: 1,
    rank: 1,
    reviewCount: 523,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-1-2',
    restaurantId: '1',
    name: '양념치킨',
    description: '달콤 매콤한 특제 양념 소스',
    price: 19000,
    imageUrl: null,
    isAvailable: true,
    isPopular: true,
    sortOrder: 2,
    rank: 2,
    reviewCount: 412,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-1-3',
    restaurantId: '1',
    name: '반반치킨',
    description: '후라이드 + 양념 반반',
    price: 19000,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 3,
    reviewCount: 189,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-1-4',
    restaurantId: '1',
    name: '간장치킨',
    description: '특제 간장 소스에 버무린 치킨',
    price: 19000,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 4,
    reviewCount: 156,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-1-5',
    restaurantId: '1',
    name: '순살치킨',
    description: '뼈 없는 순살 후라이드',
    price: 20000,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 5,
    reviewCount: 98,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-1-6',
    restaurantId: '1',
    name: '치킨무 추가',
    description: '시원한 치킨무 추가',
    price: 500,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 99,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-1-7',
    restaurantId: '1',
    name: '콜라 1.5L',
    description: '',
    price: 2500,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 100,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// 식당 2: 황금피자 메뉴
export const MENUS_RESTAURANT_2: Menu[] = [
  {
    id: 'menu-2-1',
    restaurantId: '2',
    name: '마르게리타 피자',
    description: '토마토 소스, 모짜렐라, 바질',
    price: 18000,
    imageUrl: null,
    isAvailable: true,
    isPopular: true,
    sortOrder: 1,
    rank: 1,
    reviewCount: 234,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'menu-2-2',
    restaurantId: '2',
    name: '페페로니 피자',
    description: '매콤한 페페로니와 모짜렐라 치즈',
    price: 20000,
    imageUrl: null,
    isAvailable: true,
    isPopular: true,
    sortOrder: 2,
    rank: 2,
    reviewCount: 198,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'menu-2-3',
    restaurantId: '2',
    name: '콤비네이션 피자',
    description: '다양한 토핑이 올라간 푸짐한 피자',
    price: 22000,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 3,
    reviewCount: 156,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'menu-2-4',
    restaurantId: '2',
    name: '고르곤졸라 피자',
    description: '진한 치즈 향과 꿀의 조화',
    price: 23000,
    imageUrl: null,
    isAvailable: true,
    isPopular: false,
    sortOrder: 4,
    reviewCount: 89,
    createdAt: '2024-06-01T00:00:00Z',
  },
]

// 식당별 메뉴 맵
export const MENUS_BY_RESTAURANT: Record<string, Menu[]> = {
  '1': MENUS_RESTAURANT_1,
  '2': MENUS_RESTAURANT_2,
}

// 메뉴 옵션
export const MENU_OPTIONS: MenuOption[] = [
  // 치킨 옵션
  {
    id: 'opt-1',
    menuId: 'menu-1-1',
    name: '순한맛',
    price: 0,
    isRequired: false,
  },
  {
    id: 'opt-2',
    menuId: 'menu-1-1',
    name: '매운맛',
    price: 0,
    isRequired: false,
  },
  {
    id: 'opt-3',
    menuId: 'menu-1-1',
    name: '치즈 추가',
    price: 2000,
    isRequired: false,
  },
  {
    id: 'opt-4',
    menuId: 'menu-1-1',
    name: '양 1.5배',
    price: 5000,
    isRequired: false,
  },
]

// 메뉴 가져오기
export function getMenusByRestaurantId(restaurantId: string): Menu[] {
  return MENUS_BY_RESTAURANT[restaurantId] || []
}

// 메뉴 상세 가져오기
export function getMenuById(
  restaurantId: string,
  menuId: string
): Menu | undefined {
  const menus = getMenusByRestaurantId(restaurantId)
  return menus.find((m) => m.id === menuId)
}

// 인기 메뉴 가져오기
export function getPopularMenus(restaurantId: string): Menu[] {
  const menus = getMenusByRestaurantId(restaurantId)
  return menus.filter((m) => m.isPopular).sort((a, b) => (a.rank || 99) - (b.rank || 99))
}

// 메뉴 옵션 가져오기
export function getMenuOptions(menuId: string): MenuOption[] {
  return MENU_OPTIONS.filter((o) => o.menuId === menuId)
}
