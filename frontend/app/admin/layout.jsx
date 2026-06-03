'use client';
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from '@/components/shared/Sidebar'

export default function AdminLayout({ children }) {
  const { isLoading } = useAuth('ADMIN')
  const { user } = useAuthStore()
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>

  return (
    <div className="app-shell">
      <Sidebar role={user?.role} name={user?.name} />
      <div className="main-content">
        {children}
      </div>
    </div>
  )
}