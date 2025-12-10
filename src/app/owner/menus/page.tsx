'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MoreVertical, GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  isAvailable: boolean
  isSoldOut: boolean
  isPopular: boolean
  order: number
}

interface MenuCategory {
  id: string
  name: string
  order: number
  items: MenuItem[]
}

// 메뉴 아이템 토글 헬퍼 함수 (중첩 방지)
function updateMenuItemInCategory(
  categories: MenuCategory[],
  categoryId: string,
  itemId: string,
  updater: (item: MenuItem) => MenuItem
): MenuCategory[] {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat
    return {
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId ? updater(item) : item
      ),
    }
  })
}

// 메뉴 아이템 삭제 헬퍼 함수 (중첩 방지)
function removeMenuItemFromCategory(
  categories: MenuCategory[],
  categoryId: string,
  itemId: string
): MenuCategory[] {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat
    return {
      ...cat,
      items: cat.items.filter((item) => item.id !== itemId),
    }
  })
}

// Mock 메뉴 데이터
const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: '1',
    name: '대표 메뉴',
    order: 1,
    items: [
      {
        id: '1',
        name: '황금올리브 치킨',
        description: '바삭바삭한 올리브 치킨',
        price: 19000,
        category: '대표 메뉴',
        isAvailable: true,
        isSoldOut: false,
        isPopular: true,
        order: 1,
      },
      {
        id: '2',
        name: '양념치킨',
        description: '달콤매콤 양념 치킨',
        price: 19000,
        category: '대표 메뉴',
        isAvailable: true,
        isSoldOut: false,
        isPopular: true,
        order: 2,
      },
    ],
  },
  {
    id: '2',
    name: '순살 메뉴',
    order: 2,
    items: [
      {
        id: '3',
        name: '순살 후라이드',
        description: '뼈 없는 순살 치킨',
        price: 20000,
        category: '순살 메뉴',
        isAvailable: true,
        isSoldOut: true,
        isPopular: false,
        order: 1,
      },
    ],
  },
  {
    id: '3',
    name: '사이드',
    order: 3,
    items: [
      {
        id: '4',
        name: '치즈볼',
        description: '쫄깃한 치즈볼 5개',
        price: 5000,
        category: '사이드',
        isAvailable: true,
        isSoldOut: false,
        isPopular: false,
        order: 1,
      },
      {
        id: '5',
        name: '콜라 1.25L',
        description: '',
        price: 2500,
        category: '사이드',
        isAvailable: true,
        isSoldOut: false,
        isPopular: false,
        order: 2,
      },
    ],
  },
]

export default function OwnerMenusPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleToggleSoldOut = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      updateMenuItemInCategory(prev, categoryId, itemId, (item) => ({
        ...item,
        isSoldOut: !item.isSoldOut,
      }))
    )
    setOpenMenuId(null)
  }

  const handleToggleAvailable = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      updateMenuItemInCategory(prev, categoryId, itemId, (item) => ({
        ...item,
        isAvailable: !item.isAvailable,
      }))
    )
    setOpenMenuId(null)
  }

  const handleDelete = (categoryId: string, itemId: string) => {
    if (confirm('메뉴를 삭제하시겠습니까?')) {
      setCategories((prev) =>
        removeMenuItemFromCategory(prev, categoryId, itemId)
      )
    }
    setOpenMenuId(null)
  }

  const totalMenus = categories.reduce((sum, cat) => sum + cat.items.length, 0)
  const soldOutMenus = categories.reduce(
    (sum, cat) => sum + cat.items.filter((item) => item.isSoldOut).length,
    0
  )

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link href="/owner" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            메뉴 관리
          </h1>
          <Link
            href="/owner/menus/new"
            className="w-10 h-10 flex items-center justify-center -mr-2 text-[var(--color-primary-500)]"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>

        {/* 상태 요약 */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-neutral-50)] text-sm">
          <span className="text-[var(--color-neutral-600)]">
            전체 {totalMenus}개
          </span>
          {soldOutMenus > 0 && (
            <span className="text-[var(--color-error-500)]">
              품절 {soldOutMenus}개
            </span>
          )}
        </div>
      </header>

      {/* 카테고리별 메뉴 */}
      <main className="pb-20">
        {categories.map((category) => (
          <section key={category.id} className="mt-3">
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-neutral-100)]">
              <h2 className="font-semibold text-[var(--color-neutral-900)]">
                {category.name}
                <span className="ml-2 text-sm font-normal text-[var(--color-neutral-500)]">
                  {category.items.length}개
                </span>
              </h2>
              <button className="text-sm text-[var(--color-primary-500)]">
                순서 편집
              </button>
            </div>

            <div className="bg-white divide-y divide-[var(--color-neutral-100)]">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-4 ${
                    !item.isAvailable ? 'opacity-50' : ''
                  }`}
                >
                  {/* 드래그 핸들 */}
                  <GripVertical className="w-5 h-5 text-[var(--color-neutral-300)] cursor-grab" />

                  {/* 이미지 */}
                  <div className="relative w-16 h-16 bg-[var(--color-neutral-100)] rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl">🍗</span>
                    {item.isSoldOut && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">품절</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--color-neutral-900)] truncate">
                        {item.name}
                      </h3>
                      {item.isPopular && (
                        <span className="text-xs px-1.5 py-0.5 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded">
                          인기
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-[var(--color-neutral-500)] truncate">
                        {item.description}
                      </p>
                    )}
                    <p className="text-sm font-medium text-[var(--color-neutral-800)] mt-1">
                      {item.price.toLocaleString()}원
                    </p>
                  </div>

                  {/* 메뉴 버튼 */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === item.id && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-40 cursor-default bg-transparent border-none"
                          onClick={() => setOpenMenuId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setOpenMenuId(null)
                          }}
                          aria-label="메뉴 닫기"
                        />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-[var(--color-neutral-100)] py-1 z-50">
                          <button
                            onClick={() => handleToggleSoldOut(category.id, item.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                          >
                            {item.isSoldOut ? (
                              <>
                                <Eye className="w-4 h-4" />
                                품절 해제
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                품절 설정
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleAvailable(category.id, item.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                          >
                            {item.isAvailable ? '숨기기' : '표시하기'}
                          </button>
                          <Link
                            href={`/owner/menus/${item.id}/edit`}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                          >
                            <Edit2 className="w-4 h-4" />
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(category.id, item.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-error-500)] hover:bg-[var(--color-neutral-50)]"
                          >
                            <Trash2 className="w-4 h-4" />
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {category.items.length === 0 && (
                <div className="py-8 text-center text-[var(--color-neutral-500)]">
                  등록된 메뉴가 없습니다
                </div>
              )}
            </div>
          </section>
        ))}

        {/* 카테고리 추가 */}
        <div className="p-4">
          <button className="w-full py-4 border-2 border-dashed border-[var(--color-neutral-300)] rounded-xl text-[var(--color-neutral-500)] font-medium flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            카테고리 추가
          </button>
        </div>
      </main>
    </div>
  )
}
