'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  CreditCard,
  Ban,
  CheckCircle,
  TrendingUp,
  ShoppingBag,
  FileText
} from 'lucide-react'

interface StoreInfo {
  id: string
  name: string
  category: string
  rating: number
  orderCount: number
  revenue: number
  status: 'open' | 'closed' | 'paused'
}

interface OwnerDetail {
  id: string
  name: string
  email: string
  phone: string
  businessNumber: string
  businessName: string
  joinDate: string
  status: 'active' | 'inactive' | 'suspended'
  settlementStatus: 'normal' | 'pending' | 'overdue'
  bankName: string
  accountNumber: string
  accountHolder: string
  totalRevenue: number
  totalSettlement: number
  pendingSettlement: number
  stores: StoreInfo[]
}

const mockOwner: OwnerDetail = {
  id: '1',
  name: '박점주',
  email: 'owner1@email.com',
  phone: '010-1111-2222',
  businessNumber: '123-45-67890',
  businessName: '맛있는치킨 강남점',
  joinDate: '2024-01-15',
  status: 'active',
  settlementStatus: 'normal',
  bankName: '국민은행',
  accountNumber: '123-456-789012',
  accountHolder: '박점주',
  totalRevenue: 45600000,
  totalSettlement: 43200000,
  pendingSettlement: 2400000,
  stores: [
    {
      id: 's1',
      name: '맛있는치킨 강남점',
      category: '치킨',
      rating: 4.8,
      orderCount: 1234,
      revenue: 32400000,
      status: 'open'
    },
    {
      id: 's2',
      name: '맛있는치킨 서초점',
      category: '치킨',
      rating: 4.6,
      orderCount: 856,
      revenue: 13200000,
      status: 'open'
    }
  ]
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
  suspended: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
}

const storeStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: '영업중', bg: '#DCFCE7', text: '#16A34A' },
  closed: { label: '영업종료', bg: '#F3F4F6', text: '#6B7280' },
  paused: { label: '일시중지', bg: '#FEF3C7', text: '#D97706' }
}

export default function OwnerDetailPage() {
  const params = useParams()
  const [owner] = useState<OwnerDetail>(mockOwner)
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
            <Link href="/admin/users/owners" style={{ color: 'var(--color-text-secondary)' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              점주 상세
            </h1>
          </div>
          <button
            onClick={() => setShowBanModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: owner.status === 'suspended' ? 'var(--color-success-50)' : 'var(--color-error-50)',
              borderRadius: '8px',
              fontSize: '14px',
              color: owner.status === 'suspended' ? 'var(--color-success-500)' : 'var(--color-error-500)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {owner.status === 'suspended' ? <CheckCircle size={16} /> : <Ban size={16} />}
            {owner.status === 'suspended' ? '정지 해제' : '이용 정지'}
          </button>
        </div>
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Card */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-warning-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Store size={32} color="var(--color-warning-500)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {owner.name}
                </h2>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: statusConfig[owner.status].bg,
                  color: statusConfig[owner.status].text
                }}>
                  {statusConfig[owner.status].label}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {owner.businessName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <FileText size={16} />
              사업자번호: {owner.businessNumber}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Mail size={16} />
              {owner.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Phone size={16} />
              {owner.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Calendar size={16} />
              가입일: {owner.joinDate}
            </div>
          </div>
        </div>

        {/* Settlement Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>총 매출</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {(owner.totalRevenue / 10000).toLocaleString()}만원
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>정산 완료</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success-500)' }}>
              {(owner.totalSettlement / 10000).toLocaleString()}만원
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>정산 대기</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-warning-500)' }}>
              {(owner.pendingSettlement / 10000).toLocaleString()}만원
            </div>
          </div>
        </div>

        {/* Bank Account */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CreditCard size={20} color="var(--color-primary-500)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              정산 계좌
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>은행명</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{owner.bankName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>계좌번호</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{owner.accountNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>예금주</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{owner.accountHolder}</div>
            </div>
          </div>
        </div>

        {/* Stores List */}
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
              <Store size={20} color="var(--color-warning-500)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                운영 가게 ({owner.stores.length})
              </h3>
            </div>
          </div>

          {owner.stores.map((store, index) => (
            <Link
              key={store.id}
              href={`/admin/stores/${store.id}`}
              style={{
                display: 'block',
                padding: '16px 20px',
                borderBottom: index < owner.stores.length - 1 ? '1px solid var(--color-border)' : 'none',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {store.name}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: storeStatusConfig[store.status].bg,
                      color: storeStatusConfig[store.status].text
                    }}>
                      {storeStatusConfig[store.status].label}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                    {store.category}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={16} fill="var(--color-warning-500)" color="var(--color-warning-500)" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {store.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)'
                }}>
                  <ShoppingBag size={14} />
                  주문 {store.orderCount.toLocaleString()}건
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)'
                }}>
                  <TrendingUp size={14} />
                  매출 {(store.revenue / 10000).toLocaleString()}만원
                </div>
              </div>
            </Link>
          ))}
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
              {owner.status === 'suspended' ? '정지 해제' : '이용 정지'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {owner.status === 'suspended'
                ? '이 점주의 이용 정지를 해제하시겠습니까?'
                : '이 점주의 서비스 이용을 정지하시겠습니까? 모든 가게가 함께 정지됩니다.'}
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
                  backgroundColor: owner.status === 'suspended' ? 'var(--color-success-500)' : 'var(--color-error-500)',
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
