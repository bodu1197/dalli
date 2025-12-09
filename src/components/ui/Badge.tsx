import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
        primary: 'bg-[var(--color-primary-500)] text-white',
        delivery: 'bg-[var(--color-badge-delivery)] text-white',
        discount: 'bg-[var(--color-badge-discount)] text-white',
        club: 'bg-[var(--color-badge-club)] text-white',
        new: 'bg-[var(--color-badge-new)] text-white',
        outline: 'border border-[var(--color-neutral-300)] text-[var(--color-neutral-600)]',
        hygiene: 'bg-emerald-100 text-emerald-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-[0.625rem]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
