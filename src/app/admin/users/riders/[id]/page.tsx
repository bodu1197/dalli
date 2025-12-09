'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Bike,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  CreditCard,
  Ban,
  CheckCircle,
  Package,
  Clock,
  FileCheck,
  Shield
} from 'lucide-react'

interface DeliveryHistory {
  id: string
  date: string
  storeName: string
  amount: number
  distance: string
  duration: string
  rating: number
}

interface RiderDetail {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  vehicleType: 'motorcycle' | 'bicycle' | 'car'
  vehicleNumber: string
  licenseNumber: string
  insuranceExpiry: string
  status: 'active' | 'inactive' | 'suspended'
  isOnline: boolean
  currentArea: string
  bankName: string
  accountNumber: string
  accountHolder: string
  totalDeliveries: number
  totalEarnings: number
  pendingEarnings: number
  avgRating: number
  avgDeliveryTime: number
  recentDeliveries: DeliveryHistory[]
}

const mockRider: RiderDetail = {
  id: '1',
  name: '김라이더',
  email: 'rider1@email.com',
  phone: '010-1111-3333',
  joinDate: '2024-03-01',
  vehicleType: 'motorcycle',
  vehicleNumber: '서울12가3456',
  licenseNumber: '12-34-567890-01',
  insuranceExpiry: '2025-03-01',
  status: 'active',
  isOnline: true,
  currentArea: '강남구',
  bankName: '카카오뱅크',
  accountNumber: '3333-01-234567',
  accountHolder: '김라이더',
  totalDeliveries: 1234,
  totalEarnings: 8500000,
  pendingEarnings: 320000,
  avgRating: 4.9,
  avgDeliveryTime: 28,
  recentDeliveries: [
    { id: 'D001', date: '2024-12-08 14:32', storeName: '맛있는치킨', amount: 4500, distance: '2.3km', duration: '18분', rating: 5 },
    { id: 'D002', date: '2024-12-08 13:15', storeName: '피자헛', amount: 5000, distance: '3.1km', duration: '25분', rating: 5 },
    { id: 'D003', date: '2024-12-08 12:02', storeName: '한솥도시락', amount: 3500, distance: '1.5km', duration: '12분', rating: 4 },
    { id: 'D004', date: '2024-12-08 11:20', storeName: '중국성', amount: 4000, distance: '2.0km', duration: '20분', rating: 5 },
    { id: 'D005', date: '2024-12-07 20:45', storeName: '스시로', amount: 5500, distance: '3.8km', duration: '32분', rating: 5 }
  ]
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: '활성', bg: '#DCFCE7', text: '#16A34A' },
  inactive: { label: '휴면', bg: '#FEF3C7', text: '#D97706' },
  suspended: { label: '정지', bg: '#FEE2E2', text: '#DC2626' }
}

const vehicleConfig: Record<string, { label: string; icon: string }> = {
  motorcycle: { label: '오토바이', icon: '🏍️' },
  bicycle: { label: '자전거', icon: '🚴' },
  car: { label: '자동차', icon: '🚗' }
}

export default function RiderDetailPage() {
  const params = useParams()
  const [rider] = useState<RiderDetail>(mockRider)
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
            <Link href="/admin/users/riders" style={{ color: 'var(--color-text-secondary)' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              라이더 상세
            </h1>
          </div>
          <button
            onClick={() => setShowBanModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: rider.status === 'suspended' ? 'var(--color-success-50)' : 'var(--color-error-50)',
              borderRadius: '8px',
              fontSize: '14px',
              color: rider.status === 'suspended' ? 'var(--color-success-500)' : 'var(--color-error-500)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {rider.status === 'suspended' ? <CheckCircle size={16} /> : <Ban size={16} />}
            {rider.status === 'suspended' ? '정지 해제' : '이용 정지'}
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
              borderRadius: '50%',
              backgroundColor: rider.isOnline ? 'var(--color-success-100)' : 'var(--color-background)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <Bike size={32} color={rider.isOnline ? 'var(--color-success-500)' : 'var(--color-text-tertiary)'} />
              {rider.isOnline && (
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success-500)',
                  border: '2px solid white'
                }} />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {rider.name}
                </h2>
                <span style={{ fontSize: '20px' }}>
                  {vehicleConfig[rider.vehicleType].icon}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: statusConfig[rider.status].bg,
                  color: statusConfig[rider.status].text
                }}>
                  {statusConfig[rider.status].label}
                </span>
              </div>
              {rider.isOnline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-success-500)' }}>
                  <MapPin size={16} />
                  {rider.currentArea} 배달 중
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Mail size={16} />
              {rider.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Phone size={16} />
              {rider.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Calendar size={16} />
              가입일: {rider.joinDate}
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
              <Package size={20} color="var(--color-primary-500)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>배달 통계</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 배달</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.totalDeliveries.toLocaleString()}건</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>평균 평점</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  <Star size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" style={{ marginRight: '4px' }} />
                  {rider.avgRating.toFixed(1)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>평균 배달시간</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.avgDeliveryTime}분</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CreditCard size={20} color="var(--color-success-500)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>수입 통계</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>총 수입</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{(rider.totalEarnings / 10000).toLocaleString()}만원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>정산 대기</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-warning-500)' }}>{(rider.pendingEarnings / 10000).toLocaleString()}만원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>건당 평균</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{Math.round(rider.totalEarnings / rider.totalDeliveries).toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Documents */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileCheck size={20} color="var(--color-primary-500)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              차량 및 서류 정보
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>이동수단</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {vehicleConfig[rider.vehicleType].icon} {vehicleConfig[rider.vehicleType].label}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>차량번호</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.vehicleNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>면허번호</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.licenseNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>보험 만료일</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.insuranceExpiry}</div>
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
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.bankName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>계좌번호</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.accountNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>예금주</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{rider.accountHolder}</div>
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
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
              <Clock size={20} color="var(--color-primary-500)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                최근 배달
              </h3>
            </div>
          </div>

          {rider.recentDeliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              style={{
                padding: '16px 20px',
                borderBottom: index < rider.recentDeliveries.length - 1 ? '1px solid var(--color-border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {delivery.storeName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                    {delivery.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-500)', marginBottom: '2px' }}>
                    +{delivery.amount.toLocaleString()}원
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <Star size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" />
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{delivery.rating}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                <span>{delivery.distance}</span>
                <span>·</span>
                <span>{delivery.duration}</span>
              </div>
            </div>
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
              {rider.status === 'suspended' ? '정지 해제' : '이용 정지'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {rider.status === 'suspended'
                ? '이 라이더의 이용 정지를 해제하시겠습니까?'
                : '이 라이더의 서비스 이용을 정지하시겠습니까?'}
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
                  backgroundColor: rider.status === 'suspended' ? 'var(--color-success-500)' : 'var(--color-error-500)',
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
