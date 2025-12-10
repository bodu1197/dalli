'use client'

import { useState, useCallback } from 'react'
import {
  Save,
  Bike,
  MapPin,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Bell,
} from 'lucide-react'
import { PageHeader, ConfirmModal } from '@/components/features/admin/common'
import { cn } from '@/lib/utils'

// Types
interface DeliveryConfig {
  readonly general: {
    readonly maxDeliveryRadius: number
    readonly defaultPrepTime: number
    readonly maxPrepTime: number
    readonly minOrderAmount: number
  }
  readonly restrictions: {
    readonly weatherRestriction: boolean
    readonly lateNightRestriction: boolean
    readonly lateNightStart: string
    readonly lateNightEnd: string
    readonly holidayRestriction: boolean
  }
  readonly riderAssignment: {
    readonly autoAssign: boolean
    readonly assignmentRadius: number
    readonly maxConcurrentOrders: number
    readonly reassignTimeout: number
  }
  readonly notifications: {
    readonly orderReceived: boolean
    readonly riderAssigned: boolean
    readonly preparing: boolean
    readonly delivering: boolean
    readonly delivered: boolean
    readonly delayed: boolean
  }
}

// Toggle Component
interface ToggleProps {
  readonly checked: boolean
  readonly onChange: () => void
}

function Toggle({ checked, onChange }: ToggleProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onChange}
      className="focus:outline-none"
    >
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
  readonly onChange: (value: number | string) => void
}

function InputWithSuffix({
  label,
  value,
  suffix,
  type = 'number',
  onChange,
}: InputWithSuffixProps): React.ReactElement {
  return (
    <div>
      <label className="mb-2 block text-xs text-gray-500">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
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

// Toggle Setting Row Component
interface ToggleSettingProps {
  readonly title: string
  readonly description: string
  readonly checked: boolean
  readonly onChange: () => void
}

function ToggleSetting({
  title,
  description,
  checked,
  onChange,
}: ToggleSettingProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

// Section Card Component
interface SectionCardProps {
  readonly icon: React.ReactNode
  readonly title: string
  readonly children: React.ReactNode
}

function SectionCard({
  icon,
  title,
  children,
}: SectionCardProps): React.ReactElement {
  return (
    <div className="mb-4 rounded-xl bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// Default Config
const defaultConfig: DeliveryConfig = {
  general: {
    maxDeliveryRadius: 5,
    defaultPrepTime: 30,
    maxPrepTime: 60,
    minOrderAmount: 10000,
  },
  restrictions: {
    weatherRestriction: true,
    lateNightRestriction: true,
    lateNightStart: '01:00',
    lateNightEnd: '06:00',
    holidayRestriction: false,
  },
  riderAssignment: {
    autoAssign: true,
    assignmentRadius: 2,
    maxConcurrentOrders: 3,
    reassignTimeout: 5,
  },
  notifications: {
    orderReceived: true,
    riderAssigned: true,
    preparing: true,
    delivering: true,
    delivered: true,
    delayed: true,
  },
}

const notificationItems = [
  { key: 'orderReceived', label: '주문 접수', desc: '새 주문이 접수되면 알림' },
  { key: 'riderAssigned', label: '라이더 배정', desc: '라이더 배정 시 알림' },
  { key: 'preparing', label: '조리 시작', desc: '음식 조리 시작 시 알림' },
  { key: 'delivering', label: '배달 출발', desc: '배달 출발 시 알림' },
  { key: 'delivered', label: '배달 완료', desc: '배달 완료 시 알림' },
  { key: 'delayed', label: '지연 알림', desc: '예상 시간 초과 시 알림' },
] as const

export default function AdminSettingsDeliveryPage(): React.ReactElement {
  const [config, setConfig] = useState<DeliveryConfig>(defaultConfig)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleChange = useCallback(
    <K extends keyof DeliveryConfig>(
      section: K,
      field: keyof DeliveryConfig[K],
      value: DeliveryConfig[K][keyof DeliveryConfig[K]]
    ) => {
      setConfig((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }))
      setHasChanges(true)
    },
    []
  )

  const handleSave = useCallback(() => {
    setShowSaveModal(false)
    setHasChanges(false)
    // Save logic here
  }, [])

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="배달 설정"
          description="플랫폼의 배달 관련 설정을 관리합니다"
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

      {/* General Settings */}
      <SectionCard
        icon={<MapPin className="h-5 w-5 text-blue-500" />}
        title="기본 설정"
      >
        <div className="grid grid-cols-2 gap-3">
          <InputWithSuffix
            label="최대 배달 반경"
            value={config.general.maxDeliveryRadius}
            suffix="km"
            onChange={(v) => handleChange('general', 'maxDeliveryRadius', v as number)}
          />
          <InputWithSuffix
            label="최소 주문 금액"
            value={config.general.minOrderAmount}
            suffix="원"
            onChange={(v) => handleChange('general', 'minOrderAmount', v as number)}
          />
          <InputWithSuffix
            label="기본 조리 시간"
            value={config.general.defaultPrepTime}
            suffix="분"
            onChange={(v) => handleChange('general', 'defaultPrepTime', v as number)}
          />
          <InputWithSuffix
            label="최대 조리 시간"
            value={config.general.maxPrepTime}
            suffix="분"
            onChange={(v) => handleChange('general', 'maxPrepTime', v as number)}
          />
        </div>
      </SectionCard>

      {/* Rider Assignment */}
      <SectionCard
        icon={<Bike className="h-5 w-5 text-green-500" />}
        title="라이더 배정"
      >
        <div className="mb-4">
          <ToggleSetting
            title="자동 배정"
            description="주문 접수 시 자동으로 라이더 배정"
            checked={config.riderAssignment.autoAssign}
            onChange={() =>
              handleChange(
                'riderAssignment',
                'autoAssign',
                !config.riderAssignment.autoAssign
              )
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputWithSuffix
            label="배정 반경"
            value={config.riderAssignment.assignmentRadius}
            suffix="km"
            onChange={(v) =>
              handleChange('riderAssignment', 'assignmentRadius', v as number)
            }
          />
          <InputWithSuffix
            label="동시 배달 최대"
            value={config.riderAssignment.maxConcurrentOrders}
            suffix="건"
            onChange={(v) =>
              handleChange('riderAssignment', 'maxConcurrentOrders', v as number)
            }
          />
          <div className="col-span-2">
            <InputWithSuffix
              label="재배정 타임아웃 (미수락 시)"
              value={config.riderAssignment.reassignTimeout}
              suffix="분"
              onChange={(v) =>
                handleChange('riderAssignment', 'reassignTimeout', v as number)
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* Restrictions */}
      <SectionCard
        icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
        title="운영 제한"
      >
        <div className="flex flex-col gap-3">
          <ToggleSetting
            title="악천후 제한"
            description="폭우/폭설 시 배달 일시 중단"
            checked={config.restrictions.weatherRestriction}
            onChange={() =>
              handleChange(
                'restrictions',
                'weatherRestriction',
                !config.restrictions.weatherRestriction
              )
            }
          />
          <ToggleSetting
            title="심야 시간 제한"
            description={`${config.restrictions.lateNightStart} ~ ${config.restrictions.lateNightEnd} 배달 중단`}
            checked={config.restrictions.lateNightRestriction}
            onChange={() =>
              handleChange(
                'restrictions',
                'lateNightRestriction',
                !config.restrictions.lateNightRestriction
              )
            }
          />
          {config.restrictions.lateNightRestriction && (
            <div className="ml-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  시작 시간
                </label>
                <input
                  type="time"
                  value={config.restrictions.lateNightStart}
                  onChange={(e) =>
                    handleChange('restrictions', 'lateNightStart', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  종료 시간
                </label>
                <input
                  type="time"
                  value={config.restrictions.lateNightEnd}
                  onChange={(e) =>
                    handleChange('restrictions', 'lateNightEnd', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          <ToggleSetting
            title="공휴일 제한"
            description="공휴일 배달 서비스 중단"
            checked={config.restrictions.holidayRestriction}
            onChange={() =>
              handleChange(
                'restrictions',
                'holidayRestriction',
                !config.restrictions.holidayRestriction
              )
            }
          />
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard
        icon={<Bell className="h-5 w-5 text-blue-500" />}
        title="알림 설정"
      >
        <div className="flex flex-col gap-2">
          {notificationItems.map((item) => (
            <ToggleSetting
              key={item.key}
              title={item.label}
              description={item.desc}
              checked={config.notifications[item.key]}
              onChange={() =>
                handleChange(
                  'notifications',
                  item.key,
                  !config.notifications[item.key]
                )
              }
            />
          ))}
        </div>
      </SectionCard>

      {/* Save Modal */}
      <ConfirmModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSave}
        title="배달 설정 저장"
        message="배달 설정을 저장하시겠습니까? 변경 사항은 즉시 적용됩니다."
        confirmText="저장"
        cancelText="취소"
        variant="info"
      />
    </div>
  )
}
