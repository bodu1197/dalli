import { type PropsWithChildren } from 'react'

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]" data-admin-layout>
      {children}
    </div>
  )
}
