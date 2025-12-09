'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  ShoppingBag,
  Clock,
  Star
} from 'lucide-react'

interface UserMetrics {
  date: string
  newUsers: number
  activeUsers: number
  returningUsers: number
  churnedUsers: number
  totalOrders: number
}

const mockUserData: UserMetrics[] = [
  { date: '2024-01-20', newUsers: 45, activeUsers: 1234, returningUsers: 892, churnedUsers: 12, totalOrders: 523 },
  { date: '2024-01-19', newUsers: 38, activeUsers: 1189, returningUsers: 856, churnedUsers: 15, totalOrders: 498 },
  { date: '2024-01-18', newUsers: 42, activeUsers: 1156, returningUsers: 823, churnedUsers: 18, totalOrders: 485 },
  { date: '2024-01-17', newUsers: 51, activeUsers: 1298, returningUsers: 912, churnedUsers: 8, totalOrders: 562 },
  { date: '2024-01-16', newUsers: 35, activeUsers: 1087, returningUsers: 756, churnedUsers: 22, totalOrders: 442 },
  { date: '2024-01-15', newUsers: 40, activeUsers: 1145, returningUsers: 801, churnedUsers: 14, totalOrders: 487 },
  { date: '2024-01-14', newUsers: 62, activeUsers: 1456, returningUsers: 1023, churnedUsers: 6, totalOrders: 645 }
]

const userSegments = [
  { segment: 'VIP (월 10회+)', count: 234, percentage: 5, avgOrderValue: 45000, color: '#8b5cf6' },
  { segment: '충성 고객 (월 5-9회)', count: 1256, percentage: 28, avgOrderValue: 32000, color: 'var(--color-primary-500)' },
  { segment: '일반 고객 (월 2-4회)', count: 1892, percentage: 42, avgOrderValue: 28000, color: 'var(--color-success-500)' },
  { segment: '비정기 고객 (월 1회)', count: 856, percentage: 19, avgOrderValue: 25000, color: '#f97316' },
  { segment: '휴면 고객 (3개월+)', count: 267, percentage: 6, avgOrderValue: 0, color: 'var(--color-text-tertiary)' }
]

const cohortData = [
  { month: '2023-10', m0: 100, m1: 45, m2: 32, m3: 28 },
  { month: '2023-11', m0: 100, m1: 48, m2: 35, m3: 0 },
  { month: '2023-12', m0: 100, m1: 52, m2: 0, m3: 0 },
  { month: '2024-01', m0: 100, m1: 0, m2: 0, m3: 0 }
]

const ageGroups = [
  { range: '10대', count: 156, percentage: 3 },
  { range: '20대', count: 1892, percentage: 42 },
  { range: '30대', count: 1534, percentage: 34 },
  { range: '40대', count: 645, percentage: 14 },
  { range: '50대+', count: 278, percentage: 6 }
]

export default function AdminAnalyticsUsersPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const totalNewUsers = mockUserData.reduce((sum, d) => sum + d.newUsers, 0)
  const avgActiveUsers = Math.round(mockUserData.reduce((sum, d) => sum + d.activeUsers, 0) / mockUserData.length)
  const totalChurned = mockUserData.reduce((sum, d) => sum + d.churnedUsers, 0)
  const retentionRate = ((avgActiveUsers - totalChurned) / avgActiveUsers * 100).toFixed(1)

  const totalUsers = 4505 // Total registered users
  const prevWeekNewUsers = 280
  const newUserChange = ((totalNewUsers - prevWeekNewUsers) / prevWeekNewUsers * 100).toFixed(1)

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
              사용자 분석
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
              <Users size={18} color="var(--color-primary-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>총 회원</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalUsers.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              활성 {avgActiveUsers.toLocaleString()}명
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <UserPlus size={18} color="var(--color-success-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>신규 가입</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalNewUsers}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
              {Number(newUserChange) > 0 ? (
                <TrendingUp size={14} color="var(--color-success-500)" />
              ) : (
                <TrendingDown size={14} color="var(--color-error-500)" />
              )}
              <span style={{
                fontSize: '12px',
                color: Number(newUserChange) > 0 ? 'var(--color-success-500)' : 'var(--color-error-500)'
              }}>
                {Number(newUserChange) > 0 ? '+' : ''}{newUserChange}%
              </span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={18} color="#8b5cf6" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>리텐션</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {retentionRate}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              월간 재방문율
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <UserMinus size={18} color="var(--color-error-500)" />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>이탈</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {totalChurned}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              주간 이탈 회원
            </div>
          </div>
        </div>

        {/* User Segments */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            고객 세그먼트
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userSegments.map(segment => (
              <div
                key={segment.segment}
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
                  width: '8px',
                  height: '40px',
                  backgroundColor: segment.color,
                  borderRadius: '4px'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {segment.segment}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {segment.count.toLocaleString()}명 ({segment.percentage}%)
                  </div>
                </div>
                {segment.avgOrderValue > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>평균 주문</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {segment.avgOrderValue.toLocaleString()}원
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            연령대 분포
          </h2>
          <div style={{ display: 'flex', gap: '8px', height: '120px', alignItems: 'flex-end' }}>
            {ageGroups.map(group => (
              <div
                key={group.range}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '100%',
                  height: `${group.percentage * 2}px`,
                  backgroundColor: 'var(--color-primary-500)',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '20px'
                }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {group.percentage}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {group.range}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Analysis */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            코호트 분석 (월별 리텐션)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>가입월</th>
                  <th style={{ padding: '8px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>M+0</th>
                  <th style={{ padding: '8px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>M+1</th>
                  <th style={{ padding: '8px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>M+2</th>
                  <th style={{ padding: '8px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>M+3</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map(row => (
                  <tr key={row.month}>
                    <td style={{ padding: '8px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{row.month}</td>
                    {[row.m0, row.m1, row.m2, row.m3].map((value, i) => (
                      <td key={i} style={{ padding: '8px', textAlign: 'center' }}>
                        {value > 0 ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: `rgba(59, 130, 246, ${value / 100})`,
                            color: value > 50 ? 'white' : 'var(--color-text-primary)',
                            fontWeight: 500
                          }}>
                            {value}%
                          </span>
                        ) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Activity */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            일별 사용자 활동
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockUserData.slice(0, 5).map(day => (
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
                <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserPlus size={14} color="var(--color-success-500)" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>+{day.newUsers}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={14} color="var(--color-primary-500)" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{day.activeUsers}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShoppingBag size={14} color="#f97316" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{day.totalOrders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
