export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]" data-admin-layout>
      {children}
    </div>
  )
}
