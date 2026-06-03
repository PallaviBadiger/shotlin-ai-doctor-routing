'use client';
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from '@/components/shared/Sidebar'

export default function DoctorLayout({ children }) {
  const { isLoading } = useAuth('DOCTOR')
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