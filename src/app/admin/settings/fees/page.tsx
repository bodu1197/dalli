'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  DollarSign,
  Percent,
  Info,
  History,
  AlertCircle
} from 'lucide-react'

interface FeeConfig {
  platformFee: {
    type: 'fixed' | 'percentage'
    value: number
    minOrderAmount: number
    freeThreshold: number
  }
  deliveryFee: {
    base: number
    perKm: number
    maxDistance: number
    surgePricing: {
      enabled: boolean
      peakHours: { start: string; end: string }
      multiplier: number
    }
    weatherSurge: {
      enabled: boolean
      rainMultiplier: number
      snowMultiplier: number
    }
  }
  riderPayment: {
    basePayment: number
    perKm: number
    longDistanceBonus: {
      threshold: number
      bonus: number
    }
    peakBonus: number
  }
  ownerCommission: {
    percentage: number
    minMonthlyFee: number
  }
}

const defaultConfig: FeeConfig = {
  platformFee: {
    type: 'fixed',
    value: 500,
    minOrderAmount: 10000,
    freeThreshold: 10000
  },
  deliveryFee: {
    base: 3000,
    perKm: 500,
    maxDistance: 10,
    surgePricing: {
      enabled: true,
      peakHours: { start: '11:30', end: '13:30' },
      multiplier: 1.2
    },
    weatherSurge: {
      enabled: true,
      rainMultiplier: 1.3,
      snowMultiplier: 1.5
    }
  },
  riderPayment: {
    basePayment: 3500,
    perKm: 400,
    longDistanceBonus: {
      threshold: 5,
      bonus: 1000
    },
    peakBonus: 500
  },
  ownerCommission: {
    percentage: 12,
    minMonthlyFee: 0
  }
}

const feeHistory = [
  { date: '2024-01-15', change: '플랫폼 수수료 500원 고정으로 변경', admin: '관리자' },
  { date: '2024-01-01', change: '배달비 기본 3,000원으로 인상', admin: '관리자' },
  { date: '2023-12-20', change: '피크타임 할증 20%로 조정', admin: '관리자' },
  { date: '2023-12-01', change: '점주 수수료 12%로 인하', admin: '관리자' }
]

export default function AdminSettingsFeesPage() {
  const [config, setConfig] = useState<FeeConfig>(defaultConfig)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleChange = (section: keyof FeeConfig, field: string, value: number | boolean | string) => {
    setConfig(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        const sectionData = prev[section] as unknown as Record<string, Record<string, unknown>>
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [parent]: {
              ...sectionData[parent],
              [child]: value
            }
          }
        }
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }
    })
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
              수수료 설정
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
        {/* Platform Fee */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <DollarSign size={20} color="var(--color-primary-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              플랫폼 수수료 (고객)
            </h2>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color="var(--color-primary-500)" />
              <span style={{ fontSize: '13px', color: 'var(--color-primary-500)' }}>
                현재 정책: 10,000원 미만 0원, 10,000원 이상 500원 고정
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                수수료 타입
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleChange('platformFee', 'type', 'fixed')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${config.platformFee.type === 'fixed' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                    backgroundColor: config.platformFee.type === 'fixed' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-white)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: config.platformFee.type === 'fixed' ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  고정 금액
                </button>
                <button
                  onClick={() => handleChange('platformFee', 'type', 'percentage')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${config.platformFee.type === 'percentage' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                    backgroundColor: config.platformFee.type === 'percentage' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-white)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: config.platformFee.type === 'percentage' ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  비율 (%)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                  {config.platformFee.type === 'fixed' ? '수수료 금액' : '수수료 비율'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={config.platformFee.value}
                    onChange={(e) => handleChange('platformFee', 'value', Number(e.target.value))}
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
                    {config.platformFee.type === 'fixed' ? '원' : '%'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                  무료 기준 금액
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={config.platformFee.freeThreshold}
                    onChange={(e) => handleChange('platformFee', 'freeThreshold', Number(e.target.value))}
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
            </div>
          </div>
        </div>

        {/* Delivery Fee */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <DollarSign size={20} color="var(--color-success-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              배달비 설정
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                기본 배달비
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.deliveryFee.base}
                  onChange={(e) => handleChange('deliveryFee', 'base', Number(e.target.value))}
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
                km당 추가
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.deliveryFee.perKm}
                  onChange={(e) => handleChange('deliveryFee', 'perKm', Number(e.target.value))}
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
          </div>

          {/* Surge Pricing */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--color-background)',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                피크타임 할증
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.deliveryFee.surgePricing.enabled}
                  onChange={(e) => handleChange('deliveryFee', 'surgePricing.enabled', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
              </label>
            </div>
            {config.deliveryFee.surgePricing.enabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    시작
                  </label>
                  <input
                    type="time"
                    value={config.deliveryFee.surgePricing.peakHours.start}
                    onChange={(e) => handleChange('deliveryFee', 'surgePricing.start', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    종료
                  </label>
                  <input
                    type="time"
                    value={config.deliveryFee.surgePricing.peakHours.end}
                    onChange={(e) => handleChange('deliveryFee', 'surgePricing.end', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    할증률
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={config.deliveryFee.surgePricing.multiplier}
                      onChange={(e) => handleChange('deliveryFee', 'surgePricing.multiplier', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        paddingRight: '24px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '12px'
                    }}>
                      x
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weather Surge */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--color-background)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                날씨 할증
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.deliveryFee.weatherSurge.enabled}
                  onChange={(e) => handleChange('deliveryFee', 'weatherSurge.enabled', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
              </label>
            </div>
            {config.deliveryFee.weatherSurge.enabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    비 할증률
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={config.deliveryFee.weatherSurge.rainMultiplier}
                      onChange={(e) => handleChange('deliveryFee', 'weatherSurge.rainMultiplier', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        paddingRight: '24px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '12px'
                    }}>
                      x
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    눈 할증률
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={config.deliveryFee.weatherSurge.snowMultiplier}
                      onChange={(e) => handleChange('deliveryFee', 'weatherSurge.snowMultiplier', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        paddingRight: '24px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '12px'
                    }}>
                      x
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Commission */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Percent size={20} color="#f97316" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              점주 수수료
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                수수료율
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.ownerCommission.percentage}
                  onChange={(e) => handleChange('ownerCommission', 'percentage', Number(e.target.value))}
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
                  %
                </span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                최소 월 수수료
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={config.ownerCommission.minMonthlyFee}
                  onChange={(e) => handleChange('ownerCommission', 'minMonthlyFee', Number(e.target.value))}
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
          </div>
        </div>

        {/* Change History */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <History size={20} color="var(--color-text-tertiary)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              변경 이력
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {feeHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {item.date}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {item.admin}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                  {item.change}
                </p>
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
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={24} color="var(--color-error-500)" />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              수수료 설정 변경
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              수수료 설정을 변경하시겠습니까?
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
