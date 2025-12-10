'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Save,
  DollarSign,
  Percent,
  Info,
  History,
  Bike,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { PageHeader, ConfirmModal } from '@/components/features/admin/common'
import { cn } from '@/lib/utils'

// Types
interface FeeConfig {
  readonly platformFee: {
    readonly type: 'fixed' | 'percentage'
    readonly value: number
    readonly minOrderAmount: number
    readonly freeThreshold: number
  }
  readonly deliveryFee: {
    readonly base: number
    readonly perKm: number
    readonly maxDistance: number
    readonly surgePricing: {
      readonly enabled: boolean
      readonly peakHours: { readonly start: string; readonly end: string }
      readonly multiplier: number
    }
    readonly weatherSurge: {
      readonly enabled: boolean
      readonly rainMultiplier: number
      readonly snowMultiplier: number
    }
  }
  readonly riderPayment: {
    readonly basePayment: number
    readonly perKm: number
    readonly longDistanceBonus: {
      readonly threshold: number
      readonly bonus: number
    }
    readonly peakBonus: number
  }
  readonly ownerCommission: {
    readonly percentage: number
    readonly minMonthlyFee: number
  }
}

interface FeeHistory {
  readonly date: string
  readonly change: string
  readonly admin: string
}

// Toggle Component
interface ToggleProps {
  readonly checked: boolean
  readonly onChange: () => void
}

function Toggle({ checked, onChange }: ToggleProps): React.ReactElement {
  return (
    <button type="button" onClick={onChange} className="focus:outline-none">
      {checked ? (
        <ToggleRight className="h-8 w-8 text-blue-500" />
      ) : (
        <ToggleLeft className="h-8 w-8 text-gray-400" />
      )}
    </button>
  )
}

// Input with Suffix Component
interface InputWithSuffixProps {
  readonly label: string
  readonly value: number | string
  readonly suffix: string
  readonly type?: 'number' | 'time'
  readonly step?: string
  readonly onChange: (value: number | string) => void
  readonly labelSize?: 'sm' | 'xs'
}

function InputWithSuffix({
  label,
  value,
  suffix,
  type = 'number',
  step,
  onChange,
  labelSize = 'sm',
}: InputWithSuffixProps): React.ReactElement {
  return (
    <div>
      <label
        className={cn(
          'mb-2 block text-gray-500',
          labelSize === 'xs' ? 'text-xs' : 'text-sm'
        )}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          step={step}
          onChange={(e) =>
            onChange(type === 'number' ? Number(e.target.value) : e.target.value)
          }
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {type === 'number' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// Section Card Component
interface SectionCardProps {
  readonly icon: React.ReactNode
  readonly title: string
  readonly children: React.ReactNode
  readonly info?: string
}

function SectionCard({
  icon,
  title,
  children,
  info,
}: SectionCardProps): React.ReactElement {
  return (
    <div className="mb-4 rounded-xl bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      {info && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-500">{info}</span>
        </div>
      )}
      {children}
    </div>
  )
}

// Toggle Section Component
interface ToggleSectionProps {
  readonly title: string
  readonly checked: boolean
  readonly onChange: () => void
  readonly children?: React.ReactNode
}

function ToggleSection({
  title,
  checked,
  onChange,
  children,
}: ToggleSectionProps): React.ReactElement {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {checked && children}
    </div>
  )
}

// Fee Type Button Component
interface FeeTypeButtonProps {
  readonly label: string
  readonly isActive: boolean
  readonly onClick: () => void
}

function FeeTypeButton({
  label,
  isActive,
  onClick,
}: FeeTypeButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-colors',
        isActive
          ? 'border-blue-500 bg-blue-50 text-blue-500'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
      )}
    >
      {label}
    </button>
  )
}

// Default Config
const defaultConfig: FeeConfig = {
  platformFee: {
    type: 'fixed',
    value: 500,
    minOrderAmount: 10000,
    freeThreshold: 10000,
  },
  deliveryFee: {
    base: 3000,
    perKm: 500,
    maxDistance: 10,
    surgePricing: {
      enabled: true,
      peakHours: { start: '11:30', end: '13:30' },
      multiplier: 1.2,
    },
    weatherSurge: {
      enabled: true,
      rainMultiplier: 1.3,
      snowMultiplier: 1.5,
    },
  },
  riderPayment: {
    basePayment: 3500,
    perKm: 400,
    longDistanceBonus: {
      threshold: 5,
      bonus: 1000,
    },
    peakBonus: 500,
  },
  ownerCommission: {
    percentage: 12,
    minMonthlyFee: 0,
  },
}

const feeHistory: ReadonlyArray<FeeHistory> = [
  { date: '2024-01-15', change: '플랫폼 수수료 500원 고정으로 변경', admin: '관리자' },
  { date: '2024-01-01', change: '배달비 기본 3,000원으로 인상', admin: '관리자' },
  { date: '2023-12-20', change: '피크타임 할증 20%로 조정', admin: '관리자' },
  { date: '2023-12-01', change: '점주 수수료 12%로 인하', admin: '관리자' },
]

export default function AdminSettingsFeesPage(): React.ReactElement {
  const [config, setConfig] = useState<FeeConfig>(defaultConfig)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleChange = useCallback(
    <K extends keyof FeeConfig>(
      section: K,
      field: string,
      value: number | boolean | string
    ) => {
      setConfig((prev) => {
        const sectionData = prev[section]
        if (field.includes('.')) {
          const [parent, child] = field.split('.')
          const parentObj = sectionData[parent as keyof typeof sectionData]
          if (typeof parentObj === 'object' && parentObj !== null) {
            return {
              ...prev,
              [section]: {
                ...sectionData,
                [parent]: {
                  ...parentObj,
                  [child]: value,
                },
              },
            }
          }
        }
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        }
      })
      setHasChanges(true)
    },
    []
  )

  const handleSave = useCallback(() => {
    setShowSaveModal(false)
    setHasChanges(false)
    // Save logic here
  }, [])

  const currentPolicyText = useMemo(() => {
    const { freeThreshold, value, type } = config.platformFee
    const thresholdText = freeThreshold.toLocaleString()
    const valueText =
      type === 'fixed' ? `${value.toLocaleString()}원 고정` : `${value}%`
    return `현재 정책: ${thresholdText}원 미만 0원, ${thresholdText}원 이상 ${valueText}`
  }, [config.platformFee])

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="수수료 설정"
          description="플랫폼의 수수료 정책을 관리합니다"
          backLink="/admin"
        />
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          disabled={!hasChanges}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          )}
        >
          <Save className="h-4 w-4" />
          저장
        </button>
      </div>

      {/* Platform Fee */}
      <SectionCard
        icon={<DollarSign className="h-5 w-5 text-blue-500" />}
        title="플랫폼 수수료 (고객)"
        info={currentPolicyText}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm text-gray-500">수수료 타입</label>
            <div className="flex gap-3">
              <FeeTypeButton
                label="고정 금액"
                isActive={config.platformFee.type === 'fixed'}
                onClick={() => handleChange('platformFee', 'type', 'fixed')}
              />
              <FeeTypeButton
                label="비율 (%)"
                isActive={config.platformFee.type === 'percentage'}
                onClick={() => handleChange('platformFee', 'type', 'percentage')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputWithSuffix
              label={
                config.platformFee.type === 'fixed' ? '수수료 금액' : '수수료 비율'
              }
              value={config.platformFee.value}
              suffix={config.platformFee.type === 'fixed' ? '원' : '%'}
              onChange={(v) => handleChange('platformFee', 'value', v as number)}
            />
            <InputWithSuffix
              label="무료 기준 금액"
              value={config.platformFee.freeThreshold}
              suffix="원"
              onChange={(v) =>
                handleChange('platformFee', 'freeThreshold', v as number)
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* Delivery Fee */}
      <SectionCard
        icon={<DollarSign className="h-5 w-5 text-green-500" />}
        title="배달비 설정"
      >
        <div className="mb-4 grid grid-cols-2 gap-3">
          <InputWithSuffix
            label="기본 배달비"
            value={config.deliveryFee.base}
            suffix="원"
            onChange={(v) => handleChange('deliveryFee', 'base', v as number)}
          />
          <InputWithSuffix
            label="km당 추가"
            value={config.deliveryFee.perKm}
            suffix="원"
            onChange={(v) => handleChange('deliveryFee', 'perKm', v as number)}
          />
        </div>

        {/* Surge Pricing */}
        <div className="mb-3">
          <ToggleSection
            title="피크타임 할증"
            checked={config.deliveryFee.surgePricing.enabled}
            onChange={() =>
              handleChange(
                'deliveryFee',
                'surgePricing.enabled',
                !config.deliveryFee.surgePricing.enabled
              )
            }
          >
            <div className="grid grid-cols-3 gap-2">
              <InputWithSuffix
                label="시작"
                value={config.deliveryFee.surgePricing.peakHours.start}
                suffix=""
                type="time"
                labelSize="xs"
                onChange={(v) =>
                  handleChange('deliveryFee', 'surgePricing.start', v as string)
                }
              />
              <InputWithSuffix
                label="종료"
                value={config.deliveryFee.surgePricing.peakHours.end}
                suffix=""
                type="time"
                labelSize="xs"
                onChange={(v) =>
                  handleChange('deliveryFee', 'surgePricing.end', v as string)
                }
              />
              <InputWithSuffix
                label="할증률"
                value={config.deliveryFee.surgePricing.multiplier}
                suffix="x"
                step="0.1"
                labelSize="xs"
                onChange={(v) =>
                  handleChange('deliveryFee', 'surgePricing.multiplier', v as number)
                }
              />
            </div>
          </ToggleSection>
        </div>

        {/* Weather Surge */}
        <ToggleSection
          title="날씨 할증"
          checked={config.deliveryFee.weatherSurge.enabled}
          onChange={() =>
            handleChange(
              'deliveryFee',
              'weatherSurge.enabled',
              !config.deliveryFee.weatherSurge.enabled
            )
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <InputWithSuffix
              label="비 할증률"
              value={config.deliveryFee.weatherSurge.rainMultiplier}
              suffix="x"
              step="0.1"
              labelSize="xs"
              onChange={(v) =>
                handleChange('deliveryFee', 'weatherSurge.rainMultiplier', v as number)
              }
            />
            <InputWithSuffix
              label="눈 할증률"
              value={config.deliveryFee.weatherSurge.snowMultiplier}
              suffix="x"
              step="0.1"
              labelSize="xs"
              onChange={(v) =>
                handleChange('deliveryFee', 'weatherSurge.snowMultiplier', v as number)
              }
            />
          </div>
        </ToggleSection>
      </SectionCard>

      {/* Rider Payment */}
      <SectionCard
        icon={<Bike className="h-5 w-5 text-purple-500" />}
        title="라이더 지급금"
      >
        <div className="grid grid-cols-2 gap-3">
          <InputWithSuffix
            label="기본 배달료"
            value={config.riderPayment.basePayment}
            suffix="원"
            onChange={(v) =>
              handleChange('riderPayment', 'basePayment', v as number)
            }
          />
          <InputWithSuffix
            label="km당 추가"
            value={config.riderPayment.perKm}
            suffix="원"
            onChange={(v) => handleChange('riderPayment', 'perKm', v as number)}
          />
          <InputWithSuffix
            label="장거리 기준"
            value={config.riderPayment.longDistanceBonus.threshold}
            suffix="km"
            onChange={(v) =>
              handleChange('riderPayment', 'longDistanceBonus.threshold', v as number)
            }
          />
          <InputWithSuffix
            label="장거리 보너스"
            value={config.riderPayment.longDistanceBonus.bonus}
            suffix="원"
            onChange={(v) =>
              handleChange('riderPayment', 'longDistanceBonus.bonus', v as number)
            }
          />
          <div className="col-span-2">
            <InputWithSuffix
              label="피크타임 보너스"
              value={config.riderPayment.peakBonus}
              suffix="원"
              onChange={(v) =>
                handleChange('riderPayment', 'peakBonus', v as number)
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* Owner Commission */}
      <SectionCard
        icon={<Percent className="h-5 w-5 text-orange-500" />}
        title="점주 수수료"
      >
        <div className="grid grid-cols-2 gap-3">
          <InputWithSuffix
            label="수수료율"
            value={config.ownerCommission.percentage}
            suffix="%"
            onChange={(v) =>
              handleChange('ownerCommission', 'percentage', v as number)
            }
          />
          <InputWithSuffix
            label="최소 월 수수료"
            value={config.ownerCommission.minMonthlyFee}
            suffix="원"
            onChange={(v) =>
              handleChange('ownerCommission', 'minMonthlyFee', v as number)
            }
          />
        </div>
      </SectionCard>

      {/* Change History */}
      <SectionCard
        icon={<History className="h-5 w-5 text-gray-500" />}
        title="변경 이력"
      >
        <div className="flex flex-col gap-3">
          {feeHistory.map((item) => (
            <div
              key={`${item.date}-${item.change}`}
              className="rounded-lg bg-gray-50 p-3"
            >
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-gray-400">{item.date}</span>
                <span className="text-xs text-gray-400">{item.admin}</span>
              </div>
              <p className="text-sm text-gray-900">{item.change}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Save Modal */}
      <ConfirmModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSave}
        title="수수료 설정 변경"
        message="수수료 설정을 변경하시겠습니까? 변경 사항은 즉시 적용됩니다."
        confirmText="저장"
        cancelText="취소"
        variant="info"
      />
    </div>
  )
}
