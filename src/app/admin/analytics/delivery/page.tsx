'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bike,
  Clock,
  MapPin,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react'

interface DeliveryMetrics {
  date: string
  totalDeliveries: number
  completedOnTime: number
  delayed: number
  cancelled: number
  avgDeliveryTime: number
  avgDistance: number
}

const mockDeliveryData: DeliveryMetrics[] = [
  { date: '2024-01-20', totalDeliveries: 523, completedOnTime: 487, delayed: 31, cancelled: 5, avgDeliveryTime: 32, avgDistance: 2.4 },
  { date: '2024-01-19', totalDeliveries: 498, completedOnTime: 462, delayed: 28, cancelled: 8, avgDeliveryTime: 34, avgDistance: 2.5 },
  { date: '2024-01-18', totalDeliveries: 485, completedOnTime: 451, delayed: 26, cancelled: 8, avgDeliveryTime: 31, avgDistance: 2.3 },
  { date: '2024-01-17', totalDeliveries: 562, completedOnTime: 521, delayed: 35, cancelled: 6, avgDeliveryTime: 33, avgDistance: 2.6 },
  { date: '2024-01-16', totalDeliveries: 442, completedOnTime: 412, delayed: 24, cancelled: 6, avgDeliveryTime: 30, avgDistance: 2.2 },
  { date: '2024-01-15', totalDeliveries: 487, completedOnTime: 456, delayed: 25, cancelled: 6, avgDeliveryTime: 32, avgDistance: 2.4 },
  { date: '2024-01-14', totalDeliveries: 645, completedOnTime: 598, delayed: 38, cancelled: 9, avgDeliveryTime: 35, avgDistance: 2.7 }
]

const hourlyDistribution = [
  { hour: '11-12', deliveries: 87, avgTime: 28 },
  { hour: '12-13', deliveries: 156, avgTime: 35 },
  { hour: '13-14', deliveries: 123, avgTime: 32 },
  { hour: '17-18', deliveries: 98, avgTime: 30 },
  { hour: '18-19', deliveries: 178, avgTime: 38 },
  { hour: '19-20', deliveries: 167, avgTime: 36 },
  { hour: '20-21', deliveries: 134, avgTime: 33 },
  { hour: '21-22', deliveries: 89, avgTime: 29 }
]

const topRiders = [
  { id: '1', name: '김라이더', deliveries: 156, avgTime: 28, rating: 4.9, onTimeRate: 98 },
  { id: '2', name: '이배달', deliveries: 142, avgTime: 30, rating: 4.8, onTimeRate: 96 },
  { id: '3', name: '박퀵', deliveries: 138, avgTime: 29, rating: 4.9, onTimeRate: 97 },
  { id: '4', name: '최스피드', deliveries: 134, avgTime: 31, rating: 4.7, onTimeRate: 94 },
  { id: '5', name: '정빠른', deliveries: 128, avgTime: 32, rating: 4.8, onTimeRate: 95 }
]

const delayReasons = [
  { reason: '교통 혼잡', count: 89, percentage: 45 },
  { reason: '조리 지연', count: 53, percentage: 27 },
  { reason: '라이더 부족', count: 32, percentage: 16 },
  { reason: '악천후', count: 16, percentage: 8 },
  { reason: '기타', count: 8, percentage: 4 }
]

export default function AdminAnalyticsDeliveryPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const totalDeliveries = mockDeliveryData.reduce((sum, d) => sum + d.totalDeliveries, 0)
  const totalOnTime = mockDeliveryData.reduce((sum, d) => sum + d.completedOnTime, 0)
  const totalDelayed = mockDeliveryData.reduce((sum, d) => sum + d.delayed, 0)
  const totalCancelled = mockDeliveryData.reduce((sum, d) => sum + d.cancelled, 0)
  const onTimeRate = ((totalOnTime / totalDeliveries) * 100).toFixed(1)
  const avgDeliveryTime = Math.round(mockDeliveryData.reduce((sum, d) => sum + d.avgDeliveryTime, 0) / mockDeliveryData.length)

  const prevWeekOnTimeRate = 92.5
  const onTimeChange = (Number(onTimeRate) - prevWeekOnTimeRate).toFixed(1)

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
              배달 분석
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
          marginBottom: '16px'
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
                cursor: 'pointer'
              }}
            >
              {p === 'daily' ? '일별' : p === 'weekly' ? '주별' : '월별'}
            </button>
          ))}
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
              <Bike size={18} color="var(--color-primary-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>총 배달</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalDeliveries.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              일평균 {Math.round(totalDeliveries / 7).toLocaleString()}건
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={18} color="var(--color-success-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>정시 배달률</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {onTimeRate}%
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
              {Number(onTimeChange) > 0 ? (
                <TrendingUp size={14} color="var(--color-success-500)" />
              ) : (
                <TrendingDown size={14} color="var(--color-error-500)" />
              )}
              <span style={{
                fontSize: '12px',
                color: Number(onTimeChange) > 0 ? 'var(--color-success-500)' : 'var(--color-error-500)'
              }}>
                {Number(onTimeChange) > 0 ? '+' : ''}{onTimeChange}%p
              </span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Timer size={18} color="#8b5cf6" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>평균 배달시간</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {avgDeliveryTime}분
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              목표: 35분 이내
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={18} color="var(--color-warning-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>지연/취소</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalDelayed + totalCancelled}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              지연 {totalDelayed} / 취소 {totalCancelled}
            </div>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            시간대별 배달 현황
          </h2>
          <div style={{ display: 'flex', gap: '8px', height: '140px', alignItems: 'flex-end' }}>
            {hourlyDistribution.map(slot => {
              const maxDeliveries = Math.max(...hourlyDistribution.map(s => s.deliveries))
              const height = (slot.deliveries / maxDeliveries) * 100

              return (
                <div
                  key={slot.hour}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    backgroundColor: slot.avgTime > 35 ? 'var(--color-warning-500)' : 'var(--color-primary-500)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '4px'
                  }}>
                    <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>
                      {slot.deliveries}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                      {slot.hour}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>
                      {slot.avgTime}분
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '12px',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-primary-500)', borderRadius: '2px' }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>정상 (35분 이내)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-warning-500)', borderRadius: '2px' }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>지연 (35분 초과)</span>
            </div>
          </div>
        </div>

        {/* Top Riders */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            TOP 라이더
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topRiders.map((rider, index) => (
              <div
                key={rider.id}
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
                    {rider.name}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    <span>{rider.deliveries}건</span>
                    <span>평균 {rider.avgTime}분</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-success-500)' }}>
                    {rider.onTimeRate}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    ★ {rider.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delay Reasons */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            지연 사유 분석
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {delayReasons.map(item => (
              <div key={item.reason}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{item.reason}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {item.count}건 ({item.percentage}%)
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
                    width: `${item.percentage}%`,
                    backgroundColor: 'var(--color-warning-500)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Performance */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            일별 배달 현황
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockDeliveryData.map(day => {
              const dayOnTimeRate = ((day.completedOnTime / day.totalDeliveries) * 100).toFixed(1)

              return (
                <div
                  key={day.date}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--color-background)',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', width: '60px' }}>
                    {day.date.slice(5)}
                  </span>
                  <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Bike size={14} color="var(--color-primary-500)" />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{day.totalDeliveries}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} color="var(--color-success-500)" />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{dayOnTimeRate}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} color="#8b5cf6" />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{day.avgDeliveryTime}분</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '11px'
                  }}>
                    <span style={{ color: 'var(--color-warning-500)' }}>지연 {day.delayed}</span>
                    <span style={{ color: 'var(--color-error-500)' }}>취소 {day.cancelled}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
