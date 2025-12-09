import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      spinnerColor: {
        primary: 'text-[var(--color-primary-500)]',
        white: 'text-white',
        neutral: 'text-[var(--color-neutral-400)]',
      },
    },
    defaultVariants: {
      size: 'md',
      spinnerColor: 'primary',
    },
  }
)

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, spinnerColor, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, spinnerColor }), className)}
      role="status"
      aria-label="로딩 중"
      {...props}
    />
  )
}

export { Spinner, spinnerVariants }
