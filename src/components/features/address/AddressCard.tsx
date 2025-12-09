'use client'

import { MapPin, Home, Briefcase, GraduationCap, MoreVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Address } from '@/types/address.types'

interface AddressCardProps {
  address: Address
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

const labelIcons: Record<string, React.ReactNode> = {
  '집': <Home className="w-5 h-5" />,
  '회사': <Briefcase className="w-5 h-5" />,
  '학교': <GraduationCap className="w-5 h-5" />,
}

export function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
}: AddressCardProps) {
  const icon = address.label ? labelIcons[address.label] : null

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-2xl border-2 transition-all',
        onSelect && 'cursor-pointer',
        isSelected
          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
          : 'border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]'
      )}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            isSelected
              ? 'bg-[var(--color-primary-500)] text-white'
              : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
          )}
        >
          {icon || <MapPin className="w-5 h-5" />}
        </div>

        {/* 주소 정보 */}
        <div className="flex-1 min-w-0">
          {/* 라벨 + 기본 배지 */}
          <div className="flex items-center gap-2 mb-1">
            {address.label && (
              <span className="font-semibold text-[var(--color-neutral-900)]">
                {address.label}
              </span>
            )}
            {address.isDefault && (
              <span className="px-2 py-0.5 text-2xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full">
                기본
              </span>
            )}
          </div>

          {/* 주소 */}
          <p className="text-sm text-[var(--color-neutral-700)] truncate">
            {address.address}
          </p>
          {address.detail && (
            <p className="text-sm text-[var(--color-neutral-500)] truncate">
              {address.detail}
            </p>
          )}
        </div>

        {/* 선택 체크 또는 액션 버튼 */}
        {isSelected ? (
          <div className="w-6 h-6 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : showActions ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // 드롭다운 메뉴 표시 로직
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
            >
              <MoreVertical className="w-5 h-5 text-[var(--color-neutral-400)]" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
