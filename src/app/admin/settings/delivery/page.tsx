'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Bike,
  MapPin,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react'

interface DeliveryConfig {
  general: {
    maxDeliveryRadius: number
    defaultPrepTime: number
    maxPrepTime: number
    minOrderAmount: number
  }
  timeSlots: {
    enabled: boolean
    slots: { start: string; end: string; label: string }[]
  }
  restrictions: {
    weatherRestriction: boolean
    lateNightRestriction: boolean
    lateNightStart: string
    lateNightEnd: string
    holidayRestriction: boolean
  }
  riderAssignment: {
    autoAssign: boolean
    assignmentRadius: number
    maxConcurrentOrders: number
    reassignTimeout: number
  }
  notifications: {
    orderReceived: boolean
    riderAssigned: boolean
    preparing: boolean
    delivering: boolean
    delivered: boolean
    delayed: boolean
  }
}

// Toggle 컴포넌트를 외부로 정의 (render 함수 안에 컴포넌트 정의 금지)
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }}
  >
    {checked ? (
      <ToggleRight size={32} color="var(--color-primary-500)" />
    ) : (
      <ToggleLeft size={32} color="var(--color-text-tertiary)" />
    )}
  </button>
)

const defaultConfig: DeliveryConfig = {
  general: {
    maxDeliveryRadius: 5,
    defaultPrepTime: 30,
    maxPrepTime: 60,
    minOrderAmount: 10000
  },
  timeSlots: {
    enabled: true,
    slots: [
      { start: '11:00', end: '14:00', label: '점심' },
      { start: '17:00', end: '21:00', label: '저녁' },
      { start: '21:00', end: '24:00', label: '야식' }
    ]
  },
  restrictions: {
    weatherRestriction: true,
    lateNightRestriction: true,
    lateNightStart: '01:00',
    lateNightEnd: '06:00',
    holidayRestriction: false
  },
  riderAssignment: {
    autoAssign: true,
    assignmentRadius: 2,
    maxConcurrentOrders: 3,
    reassignTimeout: 5
  },
  notifications: {
    orderReceived: true,
    riderAssigned: true,
    preparing: true,
    delivering: true,
    delivered: true,
    delayed: true
  }
}

export default function AdminSettingsDeliveryPage() {
  const [config, setConfig] = useState<DeliveryConfig>(defaultConfig)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleChange = <K extends keyof DeliveryConfig>(
    section: K,
    field: keyof DeliveryConfig[K],
    value: DeliveryConfig[K][keyof DeliveryConfig[K]]
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    setShowSaveModal(false)
    setHasChanges(false)
    // Save logic here
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
              배달 설정
            </h1>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!hasChanges}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: hasChanges ? 'var(--color-primary-500)' : 'var(--color-border)',
              color: hasChanges ? 'white' : 'var(--color-text-tertiary)',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: hasChanges ? 'pointer' : 'not-allowed'
            }}
          >
            <Save size={18} />
            저장
          </button>
        </div>
      </header>

      <div style={{ padding: '20px' }}>
        {/* General Settings */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MapPin size={20} color="var(--color-primary-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              기본 설정
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                최대 배달 반경
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.general.maxDeliveryRadius}
                  onChange={(e) => handleChange('general', 'maxDeliveryRadius', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  km
                </span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                최소 주문 금액
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.general.minOrderAmount}
                  onChange={(e) => handleChange('general', 'minOrderAmount', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  원
                </span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                기본 조리 시간
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.general.defaultPrepTime}
                  onChange={(e) => handleChange('general', 'defaultPrepTime', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  분
                </span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                최대 조리 시간
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.general.maxPrepTime}
                  onChange={(e) => handleChange('general', 'maxPrepTime', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  분
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rider Assignment */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bike size={20} color="var(--color-success-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              라이더 배정
            </h2>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: 'var(--color-background)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                자동 배정
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                주문 접수 시 자동으로 라이더 배정
              </div>
            </div>
            <Toggle
              checked={config.riderAssignment.autoAssign}
              onChange={() => handleChange('riderAssignment', 'autoAssign', !config.riderAssignment.autoAssign)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                배정 반경
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.riderAssignment.assignmentRadius}
                  onChange={(e) => handleChange('riderAssignment', 'assignmentRadius', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  km
                </span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                동시 배달 최대
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.riderAssignment.maxConcurrentOrders}
                  onChange={(e) => handleChange('riderAssignment', 'maxConcurrentOrders', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  건
                </span>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                재배정 타임아웃 (미수락 시)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.riderAssignment.reassignTimeout}
                  onChange={(e) => handleChange('riderAssignment', 'reassignTimeout', Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px'
                }}>
                  분
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Restrictions */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="var(--color-warning-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              운영 제한
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  악천후 제한
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  폭우/폭설 시 배달 일시 중단
                </div>
              </div>
              <Toggle
                checked={config.restrictions.weatherRestriction}
                onChange={() => handleChange('restrictions', 'weatherRestriction', !config.restrictions.weatherRestriction)}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  심야 시간 제한
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  {config.restrictions.lateNightStart} ~ {config.restrictions.lateNightEnd} 배달 중단
                </div>
              </div>
              <Toggle
                checked={config.restrictions.lateNightRestriction}
                onChange={() => handleChange('restrictions', 'lateNightRestriction', !config.restrictions.lateNightRestriction)}
              />
            </div>

            {config.restrictions.lateNightRestriction && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginLeft: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={config.restrictions.lateNightStart}
                    onChange={(e) => handleChange('restrictions', 'lateNightStart', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={config.restrictions.lateNightEnd}
                    onChange={(e) => handleChange('restrictions', 'lateNightEnd', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: 'var(--color-background)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  공휴일 제한
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  공휴일 배달 서비스 중단
                </div>
              </div>
              <Toggle
                checked={config.restrictions.holidayRestriction}
                onChange={() => handleChange('restrictions', 'holidayRestriction', !config.restrictions.holidayRestriction)}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Info size={20} color="var(--color-primary-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              알림 설정
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {([
              { key: 'orderReceived', label: '주문 접수', desc: '새 주문이 접수되면 알림' },
              { key: 'riderAssigned', label: '라이더 배정', desc: '라이더 배정 시 알림' },
              { key: 'preparing', label: '조리 시작', desc: '음식 조리 시작 시 알림' },
              { key: 'delivering', label: '배달 출발', desc: '배달 출발 시 알림' },
              { key: 'delivered', label: '배달 완료', desc: '배달 완료 시 알림' },
              { key: 'delayed', label: '지연 알림', desc: '예상 시간 초과 시 알림' }
            ] as const).map(item => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {item.desc}
                  </div>
                </div>
                <Toggle
                  checked={config.notifications[item.key]}
                  onChange={() => handleChange('notifications', item.key, !config.notifications[item.key])}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
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
              배달 설정 저장
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              배달 설정을 저장하시겠습니까?
              <br />
              변경 사항은 즉시 적용됩니다.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSaveModal(false)}
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
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary-500)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
