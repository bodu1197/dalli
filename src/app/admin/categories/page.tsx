'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  FolderOpen,
  Tag,
  Store,
  AlertTriangle
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

// Types
interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string | null
  image: string | null
  parentId: string | null
  order: number
  isActive: boolean
  storeCount: number
  children?: Category[]
}


// Mock Data
const mockCategories: Category[] = [
  {
    id: 'CAT001',
    name: '한식',
    slug: 'korean',
    description: '한국 전통 음식',
    icon: '🍚',
    image: null,
    parentId: null,
    order: 1,
    isActive: true,
    storeCount: 156,
    children: [
      {
        id: 'CAT001-1',
        name: '찌개/탕',
        slug: 'korean-stew',
        description: '한국식 찌개와 탕요리',
        icon: '🍲',
        image: null,
        parentId: 'CAT001',
        order: 1,
        isActive: true,
        storeCount: 45
      },
      {
        id: 'CAT001-2',
        name: '구이',
        slug: 'korean-grill',
        description: '고기 구이 전문',
        icon: '🥩',
        image: null,
        parentId: 'CAT001',
        order: 2,
        isActive: true,
        storeCount: 38
      },
      {
        id: 'CAT001-3',
        name: '분식',
        slug: 'korean-snack',
        description: '떡볶이, 김밥 등',
        icon: '🍙',
        image: null,
        parentId: 'CAT001',
        order: 3,
        isActive: true,
        storeCount: 52
      }
    ]
  },
  {
    id: 'CAT002',
    name: '중식',
    slug: 'chinese',
    description: '중국 요리',
    icon: '🥢',
    image: null,
    parentId: null,
    order: 2,
    isActive: true,
    storeCount: 89,
    children: [
      {
        id: 'CAT002-1',
        name: '짜장/짬뽕',
        slug: 'chinese-noodle',
        description: '면요리 전문',
        icon: '🍜',
        image: null,
        parentId: 'CAT002',
        order: 1,
        isActive: true,
        storeCount: 62
      },
      {
        id: 'CAT002-2',
        name: '탕수육/볶음',
        slug: 'chinese-main',
        description: '중식 메인 요리',
        icon: '🍖',
        image: null,
        parentId: 'CAT002',
        order: 2,
        isActive: true,
        storeCount: 27
      }
    ]
  },
  {
    id: 'CAT003',
    name: '일식',
    slug: 'japanese',
    description: '일본 요리',
    icon: '🍣',
    image: null,
    parentId: null,
    order: 3,
    isActive: true,
    storeCount: 67,
    children: [
      {
        id: 'CAT003-1',
        name: '초밥/사시미',
        slug: 'japanese-sushi',
        description: '신선한 초밥과 회',
        icon: '🍣',
        image: null,
        parentId: 'CAT003',
        order: 1,
        isActive: true,
        storeCount: 28
      },
      {
        id: 'CAT003-2',
        name: '라멘/우동',
        slug: 'japanese-noodle',
        description: '일본 면요리',
        icon: '🍜',
        image: null,
        parentId: 'CAT003',
        order: 2,
        isActive: true,
        storeCount: 23
      },
      {
        id: 'CAT003-3',
        name: '돈까스',
        slug: 'japanese-donkatsu',
        description: '바삭한 돈까스',
        icon: '🍱',
        image: null,
        parentId: 'CAT003',
        order: 3,
        isActive: true,
        storeCount: 16
      }
    ]
  },
  {
    id: 'CAT004',
    name: '양식',
    slug: 'western',
    description: '서양 요리',
    icon: '🍕',
    image: null,
    parentId: null,
    order: 4,
    isActive: true,
    storeCount: 112,
    children: [
      {
        id: 'CAT004-1',
        name: '피자',
        slug: 'western-pizza',
        description: '피자 전문점',
        icon: '🍕',
        image: null,
        parentId: 'CAT004',
        order: 1,
        isActive: true,
        storeCount: 45
      },
      {
        id: 'CAT004-2',
        name: '치킨',
        slug: 'western-chicken',
        description: '치킨 전문점',
        icon: '🍗',
        image: null,
        parentId: 'CAT004',
        order: 2,
        isActive: true,
        storeCount: 67
      }
    ]
  },
  {
    id: 'CAT005',
    name: '카페/디저트',
    slug: 'cafe',
    description: '카페 음료와 디저트',
    icon: '☕',
    image: null,
    parentId: null,
    order: 5,
    isActive: true,
    storeCount: 78,
    children: []
  },
  {
    id: 'CAT006',
    name: '패스트푸드',
    slug: 'fastfood',
    description: '빠른 음식',
    icon: '🍔',
    image: null,
    parentId: null,
    order: 6,
    isActive: false,
    storeCount: 34,
    children: []
  }
]

interface CategoryFormData {
  name: string
  slug: string
  description: string
  icon: string
  parentId: string | null
  isActive: boolean
}

// 카테고리 삭제 헬퍼 함수 (중첩 방지)
function removeCategoryById(cats: Category[], targetId: string): Category[] {
  return cats.filter(c => c.id !== targetId).map(c => ({
    ...c,
    children: c.children ? removeCategoryById(c.children, targetId) : undefined
  }))
}

// 카테고리 활성화 토글 헬퍼 함수 (중첩 방지)
function toggleCategoryActive(cats: Category[], targetId: string): Category[] {
  return cats.map(c => {
    if (c.id === targetId) {
      return { ...c, isActive: !c.isActive }
    }
    return {
      ...c,
      children: c.children ? toggleCategoryActive(c.children, targetId) : undefined
    }
  })
}

// 카테고리 업데이트 헬퍼 함수 (중첩 방지)
function updateCategoryInList(
  cats: Category[],
  targetId: string,
  updates: { name: string; slug: string; description: string; icon: string | null; isActive: boolean }
): Category[] {
  return cats.map(c => {
    if (c.id === targetId) {
      return {
        ...c,
        name: updates.name,
        slug: updates.slug,
        description: updates.description,
        icon: updates.icon,
        isActive: updates.isActive
      }
    }
    return {
      ...c,
      children: c.children ? updateCategoryInList(c.children, targetId, updates) : undefined
    }
  })
}

// 모달 제목 헬퍼 함수
function getModalTitle(isEditing: boolean, parentId: string | null): string {
  if (isEditing) return '카테고리 수정'
  if (parentId) return '하위 카테고리 추가'
  return '카테고리 추가'
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['CAT001', 'CAT002', 'CAT003', 'CAT004']))
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parentId: null,
    isActive: true
  })

  // Filter categories by search
  const filterCategories = (cats: Category[]): Category[] => {
    if (searchQuery) {
      return cats.reduce<Category[]>((acc, cat) => {
      const matchesSelf = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())

      const filteredChildren = cat.children ? filterCategories(cat.children) : []

      if (matchesSelf || filteredChildren.length > 0) {
        acc.push({
          ...cat,
          children: matchesSelf ? cat.children : filteredChildren
        })
      }

        return acc
      }, [])
    }
    return cats
  }

  const filteredCategories = filterCategories(categories)

  // Stats
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    totalStores: categories.reduce((sum, c) => sum + c.storeCount, 0),
    subCategories: categories.reduce((sum, c) => sum + (c.children?.length || 0), 0)
  }

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleAddCategory = (parentId: string | null = null) => {
    setIsEditing(false)
    setSelectedCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parentId,
      isActive: true
    })
    setShowModal(true)
    setActiveMenu(null)
  }

  const handleEditCategory = (category: Category) => {
    setIsEditing(true)
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || '',
      parentId: category.parentId,
      isActive: category.isActive
    })
    setShowModal(true)
    setActiveMenu(null)
  }

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
    setActiveMenu(null)
  }

  const confirmDelete = () => {
    if (!selectedCategory) return

    // Remove category from list using helper function
    setCategories(prev => removeCategoryById(prev, selectedCategory.id))

    setShowDeleteModal(false)
    setSelectedCategory(null)
  }

  const handleToggleActive = (category: Category) => {
    // Use helper function to avoid deep nesting
    setCategories(prev => toggleCategoryActive(prev, category.id))
    setActiveMenu(null)
  }

  const handleSave = () => {
    if (!formData.name || !formData.slug) return

    if (isEditing && selectedCategory) {
      // Update existing category using helper function
      const updates = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon || null,
        isActive: formData.isActive
      }
      setCategories(prev => updateCategoryInList(prev, selectedCategory.id, updates))
    } else {
      // Add new category
      const newCategory: Category = {
        id: `CAT${Date.now()}`,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon || null,
        image: null,
        parentId: formData.parentId,
        order: categories.length + 1,
        isActive: formData.isActive,
        storeCount: 0,
        children: formData.parentId ? undefined : []
      }

      if (formData.parentId) {
        // Add as subcategory - simplified map operation
        setCategories(prev => prev.map(c =>
          c.id === formData.parentId
            ? { ...c, children: [...(c.children || []), newCategory] }
            : c
        ))
      } else {
        // Add as main category
        setCategories(prev => [...prev, newCategory])
      }
    }

    setShowModal(false)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parentId: null,
      isActive: true
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\uAC00-\uD7A3]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-)|(-$)/g, '')
  }

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            paddingLeft: `${16 + level * 32}px`,
            borderBottom: '1px solid var(--color-gray-100)',
            backgroundColor: level > 0 ? 'var(--color-gray-50)' : 'white',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = level > 0 ? 'var(--color-gray-50)' : 'white'
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = level > 0 ? 'var(--color-gray-50)' : 'white'
          }}
        >
          {/* Drag Handle */}
          <div style={{ cursor: 'grab', marginRight: '12px', color: 'var(--color-gray-400)' }}>
            <GripVertical size={18} />
          </div>

          {/* Expand/Collapse */}
          <div style={{ width: '24px', marginRight: '8px' }}>
            {hasChildren && (
              <button
                onClick={() => toggleExpand(category.id)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={18} color="var(--color-gray-500)" />
                ) : (
                  <ChevronRight size={18} color="var(--color-gray-500)" />
                )}
              </button>
            )}
          </div>

          {/* Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-gray-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            marginRight: '12px'
          }}>
            {category.icon || <FolderOpen size={20} color="var(--color-gray-400)" />}
          </div>

          {/* Name & Description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{category.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>/{category.slug}</span>
            </div>
            {category.description && (
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                {category.description}
              </p>
            )}
          </div>

          {/* Store Count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginRight: '24px',
            color: 'var(--color-gray-600)'
          }}>
            <Store size={16} />
            <span style={{ fontSize: '13px' }}>{category.storeCount}개</span>
          </div>

          {/* Status */}
          <div style={{ marginRight: '24px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: category.isActive ? 'var(--color-success-50)' : 'var(--color-gray-100)',
              color: category.isActive ? 'var(--color-success-600)' : 'var(--color-gray-500)'
            }}>
              {category.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              {category.isActive ? '활성' : '비활성'}
            </span>
          </div>

          {/* Actions */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setActiveMenu(activeMenu === category.id ? null : category.id)}
              style={{
                padding: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              <MoreVertical size={18} color="var(--color-gray-500)" />
            </button>

            {activeMenu === category.id && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minWidth: '160px',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => handleEditCategory(category)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--color-gray-700)'
                  }}
                >
                  <Edit2 size={16} />
                  수정
                </button>
                {level === 0 && (
                  <button
                    onClick={() => handleAddCategory(category.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--color-gray-700)',
                      borderTop: '1px solid var(--color-gray-100)'
                    }}
                  >
                    <Plus size={16} />
                    하위 카테고리 추가
                  </button>
                )}
                <button
                  onClick={() => handleToggleActive(category)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--color-gray-700)',
                    borderTop: '1px solid var(--color-gray-100)'
                  }}
                >
                  {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  {category.isActive ? '비활성화' : '활성화'}
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--color-error-500)',
                    borderTop: '1px solid var(--color-gray-100)'
                  }}
                >
                  <Trash2 size={16} />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategoryRow(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>카테고리 관리</h1>
          <button
            onClick={() => handleAddCategory()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--color-primary-500)',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <Plus size={18} />
            카테고리 추가
          </button>
        </div>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '14px' }}>
          음식 카테고리를 관리하고 정렬합니다
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderOpen size={24} color="var(--color-primary-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>대분류</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.total}개</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Tag size={24} color="var(--color-success-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>소분류</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.subCategories}개</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-warning-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Eye size={24} color="var(--color-warning-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>활성 카테고리</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.active}개</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Store size={24} color="var(--color-gray-500)" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>연결된 가게</p>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.totalStores}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-gray-400)'
            }}
          />
          <input
            type="text"
            placeholder="카테고리 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Category List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          backgroundColor: 'var(--color-gray-50)',
          borderBottom: '1px solid var(--color-gray-200)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-gray-600)'
        }}>
          <div style={{ width: '54px' }}></div>
          <div style={{ flex: 1 }}>카테고리</div>
          <div style={{ width: '100px', textAlign: 'center' }}>가게 수</div>
          <div style={{ width: '100px', textAlign: 'center' }}>상태</div>
          <div style={{ width: '50px' }}></div>
        </div>

        {/* Categories */}
        <div>
          {filteredCategories.map(category => renderCategoryRow(category))}
        </div>

        {filteredCategories.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--color-gray-500)'
          }}>
            <FolderOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>카테고리가 없습니다</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={getModalTitle(isEditing, formData.parentId)}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '12px 20px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.slug}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: !formData.name || !formData.slug ? 'var(--color-gray-300)' : 'var(--color-primary-500)',
                color: 'white',
                cursor: !formData.name || !formData.slug ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              {isEditing ? '저장' : '추가'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label htmlFor="categoryName" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              카테고리명 *
            </label>
            <input
              id="categoryName"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: prev.slug || generateSlug(e.target.value)
                }))
              }}
              placeholder="예: 한식"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="categorySlug" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              슬러그 *
            </label>
            <input
              id="categorySlug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="예: korean"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Icon */}
          <div>
            <label htmlFor="categoryIcon" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              아이콘 (이모지)
            </label>
            <input
              id="categoryIcon"
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="예: 🍚"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="categoryDescription" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              설명
            </label>
            <textarea
              id="categoryDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="카테고리 설명을 입력하세요"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Active */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px' }}>활성화</span>
          </label>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal && !!selectedCategory}
        onClose={() => setShowDeleteModal(false)}
        title="카테고리 삭제"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              취소
            </button>
            <button
              onClick={confirmDelete}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'var(--color-error-500)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              삭제
            </button>
          </div>
        }
      >
        {selectedCategory && (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--color-error-50)',
            borderRadius: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={20} color="var(--color-error-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-error-700)', marginBottom: '4px' }}>
                {selectedCategory.name} 카테고리를 삭제하시겠습니까?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-error-600)', lineHeight: 1.5 }}>
                {(() => {
                  const hasStores = selectedCategory.storeCount > 0
                  const hasChildren = selectedCategory.children && selectedCategory.children.length > 0

                  if (hasStores && hasChildren) {
                    return (
                      <>
                        이 카테고리에 연결된 {selectedCategory.storeCount}개 가게의 카테고리가 해제됩니다.
                        하위 {selectedCategory.children.length}개 카테고리도 함께 삭제됩니다.
                      </>
                    )
                  }
                  if (hasStores) {
                    return <>이 카테고리에 연결된 {selectedCategory.storeCount}개 가게의 카테고리가 해제됩니다.</>
                  }
                  if (hasChildren) {
                    return <>하위 {selectedCategory.children.length}개 카테고리도 함께 삭제됩니다.</>
                  }
                  return <>이 작업은 되돌릴 수 없습니다.</>
                })()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Click outside to close menus */}
      {activeMenu && (
        <button
          type="button"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            background: 'transparent',
            border: 'none',
            cursor: 'default'
          }}
          onClick={() => setActiveMenu(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActiveMenu(null)
          }}
          aria-label="메뉴 닫기"
        />
      )}
    </div>
  )
}
