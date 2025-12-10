'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Star,
  CreditCard,
  Ban,
  CheckCircle,
  MessageSquare,
  Gift
} from 'lucide-react'

interface Order {
  id: string
  date: string
  storeName: string
  amount: number
  status: 'delivered' | 'cancelled'
}

interface CustomerDetail {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive' | 'banned'
  tier: 'normal' | 'silver' | 'gold' | 'vip'
  profileImage?: string
  defaultAddress: string
  orderCount: number
  totalSpent: number
  avgOrderValue: number
  cancelRate: number
  avgRating: number
  reviewCount: number
  point: number
  couponCount: number
  lastLoginDate: string
  recentOrders: Order[]
}

const mockCustomer: CustomerDetail = {
  id: '1',
  name: '김민수',
  email: 'minsu.kim@email.com',
  phone: '010-1234-5678',
  joinDate: '2024-03-15',
  status: 'active',
  tier: 'vip',
  defaultAddress: '서울시 강남구 테헤란로 123 현대빌딩 401호',
  orderCount: 45,
  totalSpent: 1250000,
  avgOrderValue: 27780,
  cancelRate: 2.2,
  avgRating: 4.8,
  reviewCount: 38,
  point: 12500,
  couponCount: 3,
  lastLoginDate: '2024-12-08 14:32',
  recentOrders: [
    { id: 'ORD001', date: '2024-12-08', storeName: '맛있는 치킨', amount: 28000, status: 'delivered' },
    { id: 'ORD002', date: '2024-12-06', storeName: '피자헛 강남점', amount: 35000, status: 'delivered' },
    { id: 'ORD003', date: '2024-12-04', storeName: '한솥 도시락', amount: 12000, status: 'delivered' },
    { id: 'ORD004', date: '2024-12-01', storeName: '중국성', amount: 42000, status: 'cancelled' },
    { id: 'ORD005', date: '2024-11-28', storeName: '스시로', amount: 56000, status: 'delivered' }
  ]
}

const tierColors: Record<string, { bg: string; text: string }> = {
  vip: { bg: '#FEF3C7', text: '#D97706' },
  gold: { bg: '#FEF9C3', text: '#CA8A04' },
  silver: { bg: '#F3F4F6', text: '#6B7280' },
  normal: { bg: '#E5E7EB', text: '#9CA3AF' }
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
  banned: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
}

export default function CustomerDetailPage() {
  const [customer] = useState<CustomerDetail>(mockCustomer)
  const [showBanModal, setShowBanModal] = useState(false)

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
            <Link href="/admin/users/customers" style={{ color: 'var(--color-text-secondary)' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              고객 상세
            </h1>
          </div>
          <button
            onClick={() => setShowBanModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: customer.status === 'banned' ? 'var(--color-success-50)' : 'var(--color-error-50)',
              borderRadius: '8px',
              fontSize: '14px',
              color: customer.status === 'banned' ? 'var(--color-success-500)' : 'var(--color-error-500)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {customer.status === 'banned' ? <CheckCircle size={16} /> : <Ban size={16} />}
            {customer.status === 'banned' ? '정지 해제' : '이용 정지'}
          </button>
        </div>
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Card */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <User size={40} color="var(--color-primary-500)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {customer.name}
            </h2>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: tierColors[customer.tier].bg,
              color: tierColors[customer.tier].text,
              textTransform: 'uppercase'
            }}>
              {customer.tier}
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: statusConfig[customer.status].bg,
              color: statusConfig[customer.status].text
            }}>
              {statusConfig[customer.status].label}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Mail size={16} />
              {customer.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Phone size={16} />
              {customer.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <MapPin size={16} />
              {customer.defaultAddress}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--color-background)',
            borderRadius: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>가입일</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.joinDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>포인트</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-500)' }}>{customer.point.toLocaleString()}P</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>보유 쿠폰</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.couponCount}장</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>마지막 접속</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.lastLoginDate.split(' ')[0]}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShoppingBag size={20} color="var(--color-primary-500)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>주문 통계</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 주문</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.orderCount}회</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 결제</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.totalSpent.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>평균 주문</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.avgOrderValue.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>취소율</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: customer.cancelRate > 5 ? 'var(--color-error-500)' : 'var(--color-text-primary)' }}>{customer.cancelRate}%</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Star size={20} color="var(--color-warning-500)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>리뷰 통계</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>작성 리뷰</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.reviewCount}개</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>평균 평점</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{customer.avgRating.toFixed(1)}점</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>리뷰 작성률</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{((customer.reviewCount / customer.orderCount) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
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
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--color-primary-500)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                최근 주문
              </h3>
            </div>
            <Link href={`/admin/orders?customer=${customer.id}`} style={{ fontSize: '14px', color: 'var(--color-primary-500)' }}>
              전체 보기
            </Link>
          </div>

          {customer.recentOrders.map((order, index) => (
            <div
              key={order.id}
              style={{
                padding: '16px 20px',
                borderBottom: index < customer.recentOrders.length - 1 ? '1px solid var(--color-border)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {order.storeName}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                  {order.id} · {order.date}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {order.amount.toLocaleString()}원
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: order.status === 'delivered' ? '#DCFCE7' : '#FEE2E2',
                  color: order.status === 'delivered' ? '#16A34A' : '#DC2626'
                }}>
                  {order.status === 'delivered' ? '배달완료' : '취소'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer'
          }}>
            <MessageSquare size={24} color="var(--color-primary-500)" />
            <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>메시지 발송</span>
          </button>
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer'
          }}>
            <Gift size={24} color="var(--color-success-500)" />
            <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>쿠폰 지급</span>
          </button>
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer'
          }}>
            <CreditCard size={24} color="var(--color-warning-500)" />
            <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>포인트 지급</span>
          </button>
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
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
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              {customer.status === 'banned' ? '정지 해제' : '이용 정지'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {customer.status === 'banned'
                ? '이 고객의 이용 정지를 해제하시겠습니까?'
                : '이 고객의 서비스 이용을 정지하시겠습니까?'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowBanModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-white)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={() => setShowBanModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: customer.status === 'banned' ? 'var(--color-success-500)' : 'var(--color-error-500)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
