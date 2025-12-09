'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Users,
  Store
} from 'lucide-react'

interface SalesData {
  date: string
  totalSales: number
  orderCount: number
  avgOrderValue: number
  newCustomers: number
  platformFee: number
  deliveryFee: number
}

const mockDailyData: SalesData[] = [
  { date: '2024-01-20', totalSales: 15234000, orderCount: 523, avgOrderValue: 29132, newCustomers: 45, platformFee: 261500, deliveryFee: 1569000 },
  { date: '2024-01-19', totalSales: 14521000, orderCount: 498, avgOrderValue: 29158, newCustomers: 38, platformFee: 249000, deliveryFee: 1494000 },
  { date: '2024-01-18', totalSales: 13987000, orderCount: 485, avgOrderValue: 28839, newCustomers: 42, platformFee: 242500, deliveryFee: 1455000 },
  { date: '2024-01-17', totalSales: 16432000, orderCount: 562, avgOrderValue: 29238, newCustomers: 51, platformFee: 281000, deliveryFee: 1686000 },
  { date: '2024-01-16', totalSales: 12876000, orderCount: 442, avgOrderValue: 29130, newCustomers: 35, platformFee: 221000, deliveryFee: 1326000 },
  { date: '2024-01-15', totalSales: 14123000, orderCount: 487, avgOrderValue: 29009, newCustomers: 40, platformFee: 243500, deliveryFee: 1461000 },
  { date: '2024-01-14', totalSales: 18765000, orderCount: 645, avgOrderValue: 29093, newCustomers: 62, platformFee: 322500, deliveryFee: 1935000 }
]

const topStores = [
  { id: '1', name: '행복한 치킨', sales: 4523000, orders: 156, change: 12.5 },
  { id: '2', name: '맛있는 피자', sales: 3872000, orders: 134, change: 8.2 },
  { id: '3', name: '신선한 초밥', sales: 3654000, orders: 98, change: -2.1 },
  { id: '4', name: '불타는 떡볶이', sales: 2987000, orders: 187, change: 15.8 },
  { id: '5', name: '건강한 샐러드', sales: 2543000, orders: 112, change: 5.4 }
]

const topCategories = [
  { name: '치킨', sales: 8523000, percentage: 25 },
  { name: '피자', sales: 6872000, percentage: 20 },
  { name: '한식', sales: 5654000, percentage: 16 },
  { name: '중식', sales: 4987000, percentage: 14 },
  { name: '분식', sales: 3543000, percentage: 10 },
  { name: '기타', sales: 5187000, percentage: 15 }
]

export default function AdminAnalyticsSalesPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [dateRange, setDateRange] = useState('2024-01-14 ~ 2024-01-20')

  const totalSales = mockDailyData.reduce((sum, d) => sum + d.totalSales, 0)
  const totalOrders = mockDailyData.reduce((sum, d) => sum + d.orderCount, 0)
  const totalNewCustomers = mockDailyData.reduce((sum, d) => sum + d.newCustomers, 0)
  const avgOrderValue = Math.round(totalSales / totalOrders)
  const totalPlatformFee = mockDailyData.reduce((sum, d) => sum + d.platformFee, 0)

  const prevWeekSales = 95000000
  const salesChange = ((totalSales - prevWeekSales) / prevWeekSales * 100).toFixed(1)
  const isPositive = Number(salesChange) > 0

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
            <Link href="/admin/analytics" style={{ color: 'var(--color-text-secondary)' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              매출 분석
            </h1>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            내보내기
          </button>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Period Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto'
        }}>
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: period === p ? 'var(--color-primary-500)' : 'var(--color-white)',
                color: period === p ? 'white' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {p === 'daily' ? '일별' : p === 'weekly' ? '주별' : '월별'}
            </button>
          ))}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--color-white)',
            borderRadius: '8px',
            marginLeft: 'auto'
          }}>
            <Calendar size={16} color="var(--color-text-tertiary)" />
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {dateRange}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DollarSign size={18} color="var(--color-primary-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>총 매출</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {(totalSales / 1000000).toFixed(1)}M
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
              {isPositive ? (
                <TrendingUp size={14} color="var(--color-success-500)" />
              ) : (
                <TrendingDown size={14} color="var(--color-error-500)" />
              )}
              <span style={{
                fontSize: '12px',
                color: isPositive ? 'var(--color-success-500)' : 'var(--color-error-500)'
              }}>
                {isPositive ? '+' : ''}{salesChange}%
              </span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShoppingBag size={18} color="var(--color-success-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>주문 수</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalOrders.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              일평균 {Math.round(totalOrders / 7).toLocaleString()}건
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={18} color="#8b5cf6" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>신규 고객</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalNewCustomers}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              일평균 {Math.round(totalNewCustomers / 7)}명
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DollarSign size={18} color="#f97316" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>평균 주문액</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {avgOrderValue.toLocaleString()}원
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              플랫폼 수익: {(totalPlatformFee / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>

        {/* Daily Chart Placeholder */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            일별 매출 추이
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockDailyData.map((day, index) => {
              const maxSales = Math.max(...mockDailyData.map(d => d.totalSales))
              const percentage = (day.totalSales / maxSales) * 100

              return (
                <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', width: '60px' }}>
                    {day.date.slice(5)}
                  </span>
                  <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--color-background)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: 'var(--color-primary-500)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px'
                    }}>
                      <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>
                        {(day.totalSales / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '50px', textAlign: 'right' }}>
                    {day.orderCount}건
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Stores */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              TOP 매출 가게
            </h2>
            <Store size={18} color="var(--color-text-tertiary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topStores.map((store, index) => (
              <div
                key={store.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: index < 3 ? 'var(--color-primary-500)' : 'var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: index < 3 ? 'white' : 'var(--color-text-tertiary)',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {store.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {store.orders}건
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {(store.sales / 10000).toLocaleString()}만원
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: store.change > 0 ? 'var(--color-success-500)' : 'var(--color-error-500)'
                  }}>
                    {store.change > 0 ? '+' : ''}{store.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            카테고리별 매출
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topCategories.map(category => (
              <div key={category.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{category.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {(category.sales / 10000).toLocaleString()}만원 ({category.percentage}%)
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${category.percentage}%`,
                    backgroundColor: 'var(--color-primary-500)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
