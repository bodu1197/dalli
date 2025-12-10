'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]',
        secondary: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]',
        outline: 'border border-[var(--color-neutral-300)] bg-white text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]',
        ghost: 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]',
        destructive: 'bg-[var(--color-error)] text-white hover:bg-red-600',
        link: 'text-[var(--color-primary-500)] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-4 text-base rounded-xl',
        lg: 'h-14 px-6 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {(() => {
          if (isLoading) {
            return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          }
          if (leftIcon) {
            return <span className="mr-2">{leftIcon}</span>
          }
          return null
        })()}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
