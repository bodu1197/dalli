// 기본 카테고리 데이터 (실제 운영 시 DB에서 관리)
export const DEFAULT_CATEGORIES = [
  { id: 'chicken', name: '치킨', icon: '🍗', sortOrder: 1 },
  { id: 'pizza', name: '피자', icon: '🍕', sortOrder: 2 },
  { id: 'burger', name: '버거', icon: '🍔', sortOrder: 3 },
  { id: 'korean', name: '한식', icon: '🍚', sortOrder: 4 },
  { id: 'chinese', name: '중식', icon: '🥟', sortOrder: 5 },
  { id: 'japanese', name: '일식', icon: '🍣', sortOrder: 6 },
  { id: 'western', name: '양식', icon: '🍝', sortOrder: 7 },
  { id: 'snack', name: '분식', icon: '🍜', sortOrder: 8 },
  { id: 'cafe', name: '카페', icon: '☕', sortOrder: 9 },
  { id: 'dessert', name: '디저트', icon: '🍰', sortOrder: 10 },
  { id: 'asian', name: '아시안', icon: '🍜', sortOrder: 11 },
  { id: 'salad', name: '샐러드', icon: '🥗', sortOrder: 12 },
] as const

export type CategoryId = (typeof DEFAULT_CATEGORIES)[number]['id']
