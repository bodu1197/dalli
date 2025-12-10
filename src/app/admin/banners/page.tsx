'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ExternalLink,
  Calendar,
  Monitor,
  Smartphone,
} from 'lucide-react'
import {
  PageHeader,
  StatsCardGrid,
  StatusBadge,
  EmptyState,
  ConfirmModal,
} from '@/components/features/admin/common'
import type { StatusVariant } from '@/components/features/admin/types'
import { cn } from '@/lib/utils'

// Types
interface BannerItem {
  readonly id: string
  readonly title: string
  readonly position: 'home_main' | 'home_sub' | 'category' | 'event' | 'popup'
  readonly linkType: 'none' | 'internal' | 'external'
  readonly linkUrl?: string
  readonly status: 'active' | 'inactive' | 'scheduled'
  readonly isVisible: boolean
  readonly startDate: string
  readonly endDate: string
  readonly order: number
  readonly imageUrl: string
  readonly mobileImageUrl?: string
  readonly clickCount: number
  readonly viewCount: number
  readonly createdAt: string
}

// Mock Data
const mockBanners: ReadonlyArray<BannerItem> = [
  {
    id: 'BNR001',
    title: '신규 가입 50% 할인 배너',
    position: 'home_main',
    linkType: 'internal',
    linkUrl: '/events/EVT001',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    order: 1,
    imageUrl: '/banners/main-1.jpg',
    mobileImageUrl: '/banners/main-1-m.jpg',
    clickCount: 15234,
    viewCount: 125000,
    createdAt: '2024-01-01',
  },
  {
    id: 'BNR002',
    title: '무료배달 페스티벌',
    position: 'home_main',
    linkType: 'internal',
    linkUrl: '/events/EVT002',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    order: 2,
    imageUrl: '/banners/main-2.jpg',
    mobileImageUrl: '/banners/main-2-m.jpg',
    clickCount: 8521,
    viewCount: 98000,
    createdAt: '2024-01-15',
  },
  {
    id: 'BNR003',
    title: '카테고리 - 치킨 할인',
    position: 'category',
    linkType: 'internal',
    linkUrl: '/category/chicken',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    order: 1,
    imageUrl: '/banners/category-chicken.jpg',
    clickCount: 3254,
    viewCount: 45000,
    createdAt: '2024-01-08',
  },
  {
    id: 'BNR004',
    title: '앱 다운로드 유도 배너',
    position: 'home_sub',
    linkType: 'external',
    linkUrl: 'https://apps.apple.com/dalligo',
    status: 'active',
    isVisible: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    order: 1,
    imageUrl: '/banners/app-download.jpg',
    clickCount: 5621,
    viewCount: 78000,
    createdAt: '2024-01-01',
  },
  {
    id: 'BNR005',
    title: '설날 이벤트 팝업',
    position: 'popup',
    linkType: 'internal',
    linkUrl: '/events/EVT005',
    status: 'inactive',
    isVisible: false,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    order: 1,
    imageUrl: '/banners/newyear-popup.jpg',
    clickCount: 12453,
    viewCount: 156000,
    createdAt: '2023-12-28',
  },
  {
    id: 'BNR006',
    title: '발렌타인 데이 이벤트',
    position: 'home_main',
    linkType: 'none',
    status: 'scheduled',
    isVisible: false,
    startDate: '2024-02-10',
    endDate: '2024-02-14',
    order: 3,
    imageUrl: '/banners/valentine.jpg',
    mobileImageUrl: '/banners/valentine-m.jpg',
    clickCount: 0,
    viewCount: 0,
    createdAt: '2024-01-20',
  },
]

const statusConfig: Record<
  BannerItem['status'],
  { label: string; variant: StatusVariant }
> = {
  active: { label: '게시중', variant: 'success' },
  scheduled: { label: '예약', variant: 'primary' },
  inactive: { label: '비활성', variant: 'default' },
}

const positionConfig: Record<BannerItem['position'], string> = {
  home_main: '홈 메인',
  home_sub: '홈 서브',
  category: '카테고리',
  event: '이벤트',
  popup: '팝업',
}

function getCTR(clicks: number, views: number): string {
  if (views === 0) return '0.0'
  return ((clicks / views) * 100).toFixed(1)
}

export default function AdminBannersPage(): React.ReactElement {
  const [banners, setBanners] = useState<ReadonlyArray<BannerItem>>(mockBanners)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    banner: BannerItem | null
  }>({ isOpen: false, banner: null })

  const filteredBanners = useMemo(() => {
    return banners
      .filter((banner) => {
        const matchesSearch = banner.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        const matchesPosition =
          positionFilter === 'all' || banner.position === positionFilter
        const matchesStatus =
          statusFilter === 'all' || banner.status === statusFilter
        return matchesSearch && matchesPosition && matchesStatus
      })
      .sort((a, b) => a.order - b.order)
  }, [banners, searchQuery, positionFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      total: banners.length,
      active: banners.filter((b) => b.status === 'active').length,
      totalViews: banners.reduce((sum, b) => sum + b.viewCount, 0),
      totalClicks: banners.reduce((sum, b) => sum + b.clickCount, 0),
    }
  }, [banners])

  const statsCards = useMemo(
    () => [
      { icon: ImageIcon, iconColor: 'primary' as const, label: '전체 배너', value: stats.total },
      { icon: Eye, iconColor: 'success' as const, label: '게시중', value: stats.active },
      { icon: Monitor, iconColor: 'default' as const, label: '총 노출수', value: `${(stats.totalViews / 1000).toFixed(0)}K` },
      { icon: ExternalLink, iconColor: 'primary' as const, label: '평균 CTR', value: `${getCTR(stats.totalClicks, stats.totalViews)}%` },
    ],
    [stats]
  )

  const toggleVisibility = useCallback((bannerId: string) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === bannerId ? { ...banner, isVisible: !banner.isVisible } : banner
      )
    )
  }, [])

  const handleDelete = useCallback(() => {
    if (deleteModal.banner) {
      setBanners((prev) => prev.filter((b) => b.id !== deleteModal.banner!.id))
      setDeleteModal({ isOpen: false, banner: null })
    }
  }, [deleteModal.banner])

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="배너 관리"
          description="홈 화면 배너를 관리합니다"
          backLink="/admin"
        />
        <Link
          href="/admin/banners/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          배너 등록
        </Link>
      </div>

      {/* Stats */}
      <StatsCardGrid cards={statsCards} className="mb-6" />

      {/* Search and Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="배너 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            positionFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">전체 위치</option>
          <option value="home_main">홈 메인</option>
          <option value="home_sub">홈 서브</option>
          <option value="category">카테고리</option>
          <option value="event">이벤트</option>
          <option value="popup">팝업</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            statusFilter !== 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <option value="all">전체 상태</option>
          <option value="active">게시중</option>
          <option value="scheduled">예약</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* Banner List */}
      {filteredBanners.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className={cn(
                'rounded-xl bg-white p-4',
                !banner.isVisible && 'opacity-60'
              )}
            >
              <div className="flex gap-3">
                {/* Drag Handle & Image */}
                <div className="flex items-start gap-2">
                  <div className="cursor-grab p-2 text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  {/* Badges */}
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge variant={statusConfig[banner.status].variant}>
                        {statusConfig[banner.status].label}
                      </StatusBadge>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {positionConfig[banner.position]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">#{banner.order}</span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    {banner.title}
                  </h3>

                  {/* Meta */}
                  <div className="mb-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {banner.startDate} ~ {banner.endDate}
                    </span>
                    {banner.mobileImageUrl && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        모바일 이미지
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 border-t border-gray-100 pt-2">
                    <div>
                      <span className="text-xs text-gray-400">노출</span>
                      <span className="ml-1 text-xs font-semibold text-gray-900">
                        {banner.viewCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">클릭</span>
                      <span className="ml-1 text-xs font-semibold text-gray-900">
                        {banner.clickCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">CTR</span>
                      <span className="ml-1 text-xs font-semibold text-blue-600">
                        {getCTR(banner.clickCount, banner.viewCount)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleVisibility(banner.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium',
                    banner.isVisible
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-green-50 text-green-600'
                  )}
                >
                  {banner.isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {banner.isVisible ? '숨김' : '노출'}
                </button>
                <Link
                  href={`/admin/banners/${banner.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: true, banner })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="검색 결과 없음"
          description="검색 조건에 맞는 배너가 없습니다"
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, banner: null })}
        onConfirm={handleDelete}
        title="배너 삭제"
        message={`"${deleteModal.banner?.title}" 배너를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  )
}
