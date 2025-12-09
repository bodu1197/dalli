import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  hasHeader?: boolean
  hasBottomNav?: boolean
  hasStickyBottom?: boolean
}

export function PageContainer({
  children,
  className,
  hasHeader = true,
  hasBottomNav = true,
  hasStickyBottom = false,
}: PageContainerProps) {
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
