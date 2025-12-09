'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
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
  ChevronDown,
  Monitor,
  Smartphone
} from 'lucide-react'

interface BannerItem {
  id: string
  title: string
  position: 'home_main' | 'home_sub' | 'category' | 'event' | 'popup'
  linkType: 'none' | 'internal' | 'external'
  linkUrl?: string
  status: 'active' | 'inactive' | 'scheduled'
  isVisible: boolean
  startDate: string
  endDate: string
  order: number
  imageUrl: string
  mobileImageUrl?: string
  clickCount: number
  viewCount: number
  createdAt: string
}

const mockBanners: BannerItem[] = [
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
    createdAt: '2024-01-01'
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
    createdAt: '2024-01-15'
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
    createdAt: '2024-01-08'
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
    createdAt: '2024-01-01'
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
    createdAt: '2023-12-28'
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
    createdAt: '2024-01-20'
  }
]

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>(mockBanners)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<'all' | 'home_main' | 'home_sub' | 'category' | 'event' | 'popup'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'scheduled'>('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; banner: BannerItem | null }>({
    isOpen: false,
    banner: null
  })

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === 'all' || banner.position === positionFilter
    const matchesStatus = statusFilter === 'all' || banner.status === statusFilter
    return matchesSearch && matchesPosition && matchesStatus
  }).sort((a, b) => a.order - b.order)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-500)' }
      case 'scheduled':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary-500)' }
      case 'inactive':
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-text-tertiary)' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '게시중'
      case 'scheduled': return '예약'
      case 'inactive': return '비활성'
      default: return status
    }
  }

  const getPositionText = (position: string) => {
    switch (position) {
      case 'home_main': return '홈 메인'
      case 'home_sub': return '홈 서브'
      case 'category': return '카테고리'
      case 'event': return '이벤트'
      case 'popup': return '팝업'
      default: return position
    }
  }

  const toggleVisibility = (bannerId: string) => {
    setBanners(prev => prev.map(banner =>
      banner.id === bannerId ? { ...banner, isVisible: !banner.isVisible } : banner
    ))
  }

  const handleDelete = () => {
    if (deleteModal.banner) {
      setBanners(prev => prev.filter(b => b.id !== deleteModal.banner!.id))
      setDeleteModal({ isOpen: false, banner: null })
    }
  }

  const getCTR = (clicks: number, views: number) => {
    if (views === 0) return '0.0'
    return ((clicks / views) * 100).toFixed(1)
  }

  const stats = {
    total: banners.length,
    active: banners.filter(b => b.status === 'active').length,
    totalViews: banners.reduce((sum, b) => sum + b.viewCount, 0),
    totalClicks: banners.reduce((sum, b) => sum + b.clickCount, 0)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/admin" style={{ color: 'var(--color-text-secondary)' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              배너 관리
            </h1>
          </div>
          <Link
            href="/admin/banners/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary-500)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Plus size={18} />
            배너 등록
          </Link>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                  전체 배너
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {stats.total}
                </div>
              </div>
              <div style={{
                padding: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px'
              }}>
                <ImageIcon size={20} color="var(--color-primary-500)" />
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                  게시중
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success-500)' }}>
                  {stats.active}
                </div>
              </div>
              <div style={{
                padding: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px'
              }}>
                <Eye size={20} color="var(--color-success-500)" />
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                  총 노출수
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {(stats.totalViews / 1000).toFixed(0)}K
                </div>
              </div>
              <div style={{
                padding: '8px',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                borderRadius: '8px'
              }}>
                <Monitor size={20} color="var(--color-text-tertiary)" />
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                  평균 CTR
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-500)' }}>
                  {getCTR(stats.totalClicks, stats.totalViews)}%
                </div>
              </div>
              <div style={{
                padding: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px'
              }}>
                <ExternalLink size={20} color="var(--color-primary-500)" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Search size={20} color="var(--color-text-tertiary)" />
          <input
            type="text"
            placeholder="배너 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value as typeof positionFilter)}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">전체 위치</option>
              <option value="home_main">홈 메인</option>
              <option value="home_sub">홈 서브</option>
              <option value="category">카테고리</option>
              <option value="event">이벤트</option>
              <option value="popup">팝업</option>
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--color-text-tertiary)'
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">전체 상태</option>
              <option value="active">게시중</option>
              <option value="scheduled">예약</option>
              <option value="inactive">비활성</option>
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--color-text-tertiary)'
              }}
            />
          </div>
        </div>

        {/* Banner List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBanners.map(banner => {
            const statusStyle = getStatusStyle(banner.status)

            return (
              <div
                key={banner.id}
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '12px',
                  padding: '16px',
                  opacity: banner.isVisible ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Drag Handle & Image */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      padding: '8px 4px',
                      cursor: 'grab',
                      color: 'var(--color-text-tertiary)'
                    }}>
                      <GripVertical size={16} />
                    </div>
                    <div style={{
                      width: '80px',
                      height: '60px',
                      backgroundColor: 'var(--color-background)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <ImageIcon size={24} color="var(--color-text-tertiary)" />
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color
                        }}>
                          {getStatusText(banner.status)}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: 'rgba(107, 114, 128, 0.1)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {getPositionText(banner.position)}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                        #{banner.order}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: '8px'
                    }}>
                      {banner.title}
                    </h3>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="var(--color-text-tertiary)" />
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                          {banner.startDate} ~ {banner.endDate}
                        </span>
                      </div>
                      {banner.mobileImageUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Smartphone size={12} color="var(--color-text-tertiary)" />
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            모바일 이미지
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '8px 0',
                      borderTop: '1px solid var(--color-border)'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>노출</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-primary)', marginLeft: '4px', fontWeight: 600 }}>
                          {banner.viewCount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>클릭</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-primary)', marginLeft: '4px', fontWeight: 600 }}>
                          {banner.clickCount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>CTR</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-primary-500)', marginLeft: '4px', fontWeight: 600 }}>
                          {getCTR(banner.clickCount, banner.viewCount)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                  marginTop: '12px'
                }}>
                  <button
                    onClick={() => toggleVisibility(banner.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: banner.isVisible ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: banner.isVisible ? 'var(--color-text-secondary)' : 'var(--color-success-500)',
                      cursor: 'pointer'
                    }}
                  >
                    {banner.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    {banner.isVisible ? '숨김' : '노출'}
                  </button>
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-primary-500)',
                      textDecoration: 'none'
                    }}
                  >
                    <Edit size={16} />
                    수정
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, banner })}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-error-500)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredBanners.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-tertiary)'
          }}>
            <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>배너가 없습니다</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.banner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '340px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              배너 삭제
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              "{deleteModal.banner.title}" 배너를 삭제하시겠습니까?
              <br />
              <span style={{ color: 'var(--color-error-500)', fontSize: '13px' }}>
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, banner: null })}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-white)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--color-error-500)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
