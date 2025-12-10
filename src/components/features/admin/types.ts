import type { LucideIcon } from 'lucide-react'

// ========================================
// 통계 카드 타입
// ========================================
export type IconColorType = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'

export interface StatsCardProps {
  readonly icon: LucideIcon
  readonly iconColor: IconColorType
  readonly label: string
  readonly value: string | number
  readonly suffix?: string
  readonly className?: string
}

// ========================================
// 데이터 테이블 타입
// ========================================
export type TableAlignType = 'left' | 'center' | 'right'

export interface TableColumn<T> {
  readonly key: string
  readonly header: string
  readonly align?: TableAlignType
  readonly width?: string
  readonly render: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  readonly columns: ReadonlyArray<TableColumn<T>>
  readonly data: ReadonlyArray<T>
  readonly keyExtractor: (row: T) => string
  readonly onRowClick?: (row: T) => void
  readonly emptyIcon?: LucideIcon
  readonly emptyMessage?: string
  readonly isLoading?: boolean
  readonly className?: string
}

// ========================================
// 필터 타입
// ========================================
export interface FilterOption {
  readonly label: string
  readonly value: string
}

export interface FilterConfig {
  readonly name: string
  readonly label: string
  readonly options: ReadonlyArray<FilterOption>
  readonly value: string
}

export interface SearchFilterBarProps {
  readonly searchQuery: string
  readonly onSearchChange: (query: string) => void
  readonly searchPlaceholder?: string
  readonly filters?: ReadonlyArray<FilterConfig>
  readonly onFilterChange?: (name: string, value: string) => void
  readonly onReset?: () => void
  readonly className?: string
}

// ========================================
// 탭 네비게이션 타입
// ========================================
export interface TabItem {
  readonly href: string
  readonly label: string
  readonly count?: number
}

export interface TabNavigationProps {
  readonly tabs: ReadonlyArray<TabItem>
  readonly activeHref: string
  readonly className?: string
}

// ========================================
// 상태 배지 타입
// ========================================
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'pending' | 'primary'

export interface StatusBadgeProps {
  readonly variant: StatusVariant
  readonly children: React.ReactNode
  readonly className?: string
}

// ========================================
// 모달 타입
// ========================================
export interface BaseModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: React.ReactNode
  readonly maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  readonly footer?: React.ReactNode
  readonly className?: string
}

export interface ConfirmModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly message: string
  readonly confirmText?: string
  readonly cancelText?: string
  readonly variant?: 'danger' | 'warning' | 'info'
  readonly isLoading?: boolean
}

// ========================================
// 액션 메뉴 타입
// ========================================
export interface ActionMenuItem {
  readonly label: string
  readonly onClick: () => void
  readonly icon?: LucideIcon
  readonly variant?: 'default' | 'danger'
  readonly disabled?: boolean
}

export interface ActionMenuProps {
  readonly items: ReadonlyArray<ActionMenuItem>
  readonly className?: string
}

// ========================================
// 페이지 헤더 타입
// ========================================
export interface PageHeaderAction {
  readonly label: string
  readonly onClick: () => void
  readonly icon?: LucideIcon
  readonly variant?: 'primary' | 'secondary' | 'outline'
}

export interface PageHeaderProps {
  readonly title: string
  readonly description?: string
  readonly backLink?: string
  readonly actions?: ReadonlyArray<PageHeaderAction>
  readonly className?: string
}

// ========================================
// 빈 상태 타입
// ========================================
export interface EmptyStateProps {
  readonly icon?: LucideIcon
  readonly title: string
  readonly description?: string
  readonly action?: {
    readonly label: string
    readonly onClick: () => void
  }
  readonly className?: string
}
