'use client'

import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BaseModal } from './BaseModal'
import type { ConfirmModalProps } from '../types'

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmColor: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmColor: 'bg-blue-600 hover:bg-blue-700',
  },
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  isLoading,
}: ConfirmModalProps): React.ReactElement {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className={cn('rounded-full p-3', config.iconBg)}>
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors',
            config.confirmColor
          )}
        >
          {isLoading ? '처리 중...' : confirmText}
        </button>
      </div>
    </BaseModal>
  )
}
