'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Filter,
  ChevronDown
} from 'lucide-react'

interface RegionData {
  id: string
  name: string
  orderCount: number
  revenue: number
  avgOrderValue: number
  userCount: number
  riderCount: number
  storeCount: number
  growthRate: number
  popularCategories: { name: string; percentage: number }[]
  hourlyDistribution: { hour: string; orders: number }[]
}

const mockRegions: RegionData[] = [
  {
    id: '1',
    name: '강남구',
    orderCount: 15234,
    revenue: 456780000,
    avgOrderValue: 29980,
    userCount: 45230,
    riderCount: 234,
    storeCount: 567,
    growthRate: 12.5,
    popularCategories: [
      { name: '치킨', percentage: 28 },
      { name: '피자', percentage: 22 },
      { name: '한식', percentage: 18 },
      { name: '중식', percentage: 15 },
      { name: '일식', percentage: 10 },
      { name: '기타', percentage: 7 }
    ],
    hourlyDistribution: [
      { hour: '11시', orders: 450 },
      { hour: '12시', orders: 1200 },
      { hour: '13시', orders: 980 },
      { hour: '18시', orders: 1500 },
      { hour: '19시', orders: 1800 },
      { hour: '20시', orders: 1650 },
      { hour: '21시', orders: 1100 }
    ]
  },
  {
    id: '2',
    name: '서초구',
    orderCount: 12456,
    revenue: 378450000,
    avgOrderValue: 30380,
    userCount: 38760,
    riderCount: 198,
    storeCount: 445,
    growthRate: 8.3,
    popularCategories: [
      { name: '한식', percentage: 32 },
      { name: '치킨', percentage: 24 },
      { name: '분식', percentage: 16 },
      { name: '피자', percentage: 12 },
      { name: '중식', percentage: 10 },
      { name: '기타', percentage: 6 }
    ],
    hourlyDistribution: [
      { hour: '11시', orders: 380 },
      { hour: '12시', orders: 1050 },
      { hour: '13시', orders: 850 },
      { hour: '18시', orders: 1320 },
      { hour: '19시', orders: 1580 },
      { hour: '20시', orders: 1420 },
      { hour: '21시', orders: 980 }
    ]
  },
  {
    id: '3',
    name: '송파구',
    orderCount: 11234,
    revenue: 323450000,
    avgOrderValue: 28790,
    userCount: 35420,
    riderCount: 176,
    storeCount: 398,
    growthRate: 15.7,
    popularCategories: [
      { name: '치킨', percentage: 30 },
      { name: '분식', percentage: 22 },
      { name: '한식', percentage: 20 },
      { name: '피자', percentage: 14 },
      { name: '중식', percentage: 8 },
      { name: '기타', percentage: 6 }
    ],
    hourlyDistribution: [
      { hour: '11시', orders: 320 },
      { hour: '12시', orders: 920 },
      { hour: '13시', orders: 780 },
      { hour: '18시', orders: 1180 },
      { hour: '19시', orders: 1450 },
      { hour: '20시', orders: 1280 },
      { hour: '21시', orders: 890 }
    ]
  },
  {
    id: '4',
    name: '마포구',
    orderCount: 9876,
    revenue: 287650000,
    avgOrderValue: 29130,
    userCount: 31250,
    riderCount: 156,
    storeCount: 356,
    growthRate: -2.3,
    popularCategories: [
      { name: '한식', percentage: 35 },
      { name: '치킨', percentage: 22 },
      { name: '카페', percentage: 18 },
      { name: '분식', percentage: 12 },
      { name: '피자', percentage: 8 },
      { name: '기타', percentage: 5 }
    ],
    hourlyDistribution: [
      { hour: '11시', orders: 290 },
      { hour: '12시', orders: 850 },
      { hour: '13시', orders: 720 },
      { hour: '18시', orders: 980 },
      { hour: '19시', orders: 1250 },
      { hour: '20시', orders: 1150 },
      { hour: '21시', orders: 820 }
    ]
  },
  {
    id: '5',
    name: '영등포구',
    orderCount: 8765,
    revenue: 245780000,
    avgOrderValue: 28040,
    userCount: 27680,
    riderCount: 134,
    storeCount: 312,
    growthRate: 5.6,
    popularCategories: [
      { name: '치킨', percentage: 28 },
      { name: '한식', percentage: 25 },
      { name: '중식', percentage: 18 },
      { name: '분식', percentage: 14 },
      { name: '피자', percentage: 10 },
      { name: '기타', percentage: 5 }
    ],
    hourlyDistribution: [
      { hour: '11시', orders: 260 },
      { hour: '12시', orders: 780 },
      { hour: '13시', orders: 650 },
      { hour: '18시', orders: 920 },
      { hour: '19시', orders: 1150 },
      { hour: '20시', orders: 1020 },
      { hour: '21시', orders: 750 }
    ]
  },
  {
    id: '6',
    name: '성동구',
    orderCount: 7654,
    revenue: 218970000,
    avgOrderValue: 28610,
    userCount: 24560,
    riderCount: 112,
    storeCount: 278,
    growthRate: 18.2,
    popularCategories: [
      { name: '한식', percentage: 30 },
      { name: '카페', percentage: 24 },
      { name: '치킨', percentage: 20 },
      { name: '분식', percentage: 12 },
      { name: '일식', percentage: 8 },
      { name: '기타', percentage: 6 }
    ],
    hourlyDistribution: [
      { hour: '11시', orders: 220 },
      { hour: '12시', orders: 680 },
      { hour: '13시', orders: 580 },
      { hour: '18시', orders: 820 },
      { hour: '19시', orders: 1020 },
      { hour: '20시', orders: 920 },
      { hour: '21시', orders: 680 }
    ]
  }
]

const categoryColors: Record<string, string> = {
  '치킨': 'var(--color-primary-500)',
  '피자': 'var(--color-success-500)',
  '한식': 'var(--color-warning-500)',
  '중식': 'var(--color-error-500)',
  '일식': '#8B5CF6',
  '분식': '#EC4899',
  '카페': '#06B6D4',
  '기타': 'var(--color-text-tertiary)'
}

export default function AdminAnalyticsRegionsPage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(mockRegions[0])
  const [sortBy, setSortBy] = useState<'orderCount' | 'revenue' | 'growthRate'>('orderCount')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const sortedRegions = [...mockRegions].sort((a, b) => {
    if (sortBy === 'growthRate') return b.growthRate - a.growthRate
    return b[sortBy] - a[sortBy]
  })

  const totalOrders = mockRegions.reduce((sum, r) => sum + r.orderCount, 0)
  const totalRevenue = mockRegions.reduce((sum, r) => sum + r.revenue, 0)
  const totalUsers = mockRegions.reduce((sum, r) => sum + r.userCount, 0)
  const totalStores = mockRegions.reduce((sum, r) => sum + r.storeCount, 0)

  const maxBarValue = selectedRegion
    ? Math.max(...selectedRegion.hourlyDistribution.map(h => h.orders))
    : 0

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
              지역별 분석
            </h1>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: 'var(--color-background)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}>
            <Download size={16} />
            내보내기
          </button>
        </div>
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
              총 주문
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalOrders.toLocaleString()}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
              총 매출
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {(totalRevenue / 100000000).toFixed(1)}억
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
              총 사용자
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {(totalUsers / 10000).toFixed(1)}만
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
              총 가게
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalStores.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sort Control */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'var(--color-white)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Filter size={16} />
              {sortBy === 'orderCount' ? '주문순' : sortBy === 'revenue' ? '매출순' : '성장률순'}
              <ChevronDown size={16} />
            </button>
            {showSortMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--color-white)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                zIndex: 20
              }}>
                {[
                  { value: 'orderCount', label: '주문순' },
                  { value: 'revenue', label: '매출순' },
                  { value: 'growthRate', label: '성장률순' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as typeof sortBy)
                      setShowSortMenu(false)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      backgroundColor: sortBy === opt.value ? 'var(--color-background)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Regions List */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={20} color="var(--color-primary-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              지역별 현황
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sortedRegions.map((region, index) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: index < sortedRegions.length - 1 ? '1px solid var(--color-border)' : 'none',
                  backgroundColor: selectedRegion?.id === region.id ? 'var(--color-primary-50)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: selectedRegion?.id === region.id ? 'var(--color-primary-500)' : 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: selectedRegion?.id === region.id ? 'white' : 'var(--color-text-secondary)'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {region.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                      가게 {region.storeCount}개 · 라이더 {region.riderCount}명
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {region.orderCount.toLocaleString()}건
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                      {(region.revenue / 10000).toLocaleString()}만원
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: region.growthRate >= 0 ? 'var(--color-success-500)' : 'var(--color-error-500)'
                  }}>
                    {region.growthRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {region.growthRate >= 0 ? '+' : ''}{region.growthRate}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Region Details */}
        {selectedRegion && (
          <>
            {/* Region Stats */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '16px'
              }}>
                {selectedRegion.name} 상세 현황
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <ShoppingBag size={24} color="var(--color-primary-500)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                    평균 주문금액
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {selectedRegion.avgOrderValue.toLocaleString()}원
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Users size={24} color="var(--color-success-500)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                    활성 사용자
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {selectedRegion.userCount.toLocaleString()}명
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <MapPin size={24} color="var(--color-warning-500)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                    배달 반경
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    평균 2.5km
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '16px'
              }}>
                인기 카테고리
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedRegion.popularCategories.map((cat, index) => (
                  <div key={index}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                        {cat.name}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: categoryColors[cat.name] || 'var(--color-text-secondary)'
                      }}>
                        {cat.percentage}%
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: 'var(--color-background)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${cat.percentage}%`,
                        height: '100%',
                        backgroundColor: categoryColors[cat.name] || 'var(--color-text-tertiary)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '16px'
              }}>
                시간대별 주문 분포
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                height: '150px'
              }}>
                {selectedRegion.hourlyDistribution.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {item.orders}
                    </span>
                    <div style={{
                      width: '100%',
                      height: `${(item.orders / maxBarValue) * 100}px`,
                      backgroundColor: 'var(--color-primary-500)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '20px'
                    }} />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
