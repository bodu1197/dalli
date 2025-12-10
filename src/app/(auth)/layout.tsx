import { type PropsWithChildren } from 'react'

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[700px] mx-auto min-h-screen bg-white md:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
        {children}
      </div>
    </div>
  )
}
