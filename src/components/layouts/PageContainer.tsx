import { type PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  readonly className?: string
  readonly hasHeader?: boolean
  readonly hasBottomNav?: boolean
  readonly hasStickyBottom?: boolean
}

export function PageContainer({
  children,
  className,
  hasHeader = true,
  hasBottomNav = true,
  hasStickyBottom = false,
}: PropsWithChildren<PageContainerProps>) {
  return (
    <main
      className={cn(
        'min-h-screen bg-[var(--background)]',
        hasHeader && 'pt-14',
        hasBottomNav && 'pb-16 md:pb-0',
        hasStickyBottom && 'pb-24',
        className
      )}
    >
      {children}
    </main>
  )
}
