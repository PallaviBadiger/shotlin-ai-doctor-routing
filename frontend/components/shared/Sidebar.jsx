'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const icons = {
  dashboard: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  patients: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  reports: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  doctors: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  upload: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  assigned: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

const NAV = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Patients', href: '/admin/patients', icon: 'patients' },
    { label: 'Reports', href: '/admin/reports', icon: 'reports' },
    { label: 'Doctors', href: '/admin/doctors', icon: 'doctors' },
  ],
  DOCTOR: [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: 'dashboard' },
    { label: 'Assigned Reports', href: '/doctor/assigned-reports', icon: 'assigned' },
  ],
  PATIENT: [
    { label: 'Dashboard', href: '/patient/dashboard', icon: 'dashboard' },
    { label: 'Upload Report', href: '/patient/upload-report', icon: 'upload' },
    { label: 'My Reports', href: '/patient/reports', icon: 'reports' },
  ],
}

const ROLE_COLOR = { ADMIN: 'avatar-purple', DOCTOR: 'avatar-teal', PATIENT: 'avatar-blue' }
const ROLE_LABEL = { ADMIN: 'Administrator', DOCTOR: 'Doctor', PATIENT: 'Patient' }

export default function Sidebar({ role, name }) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = NAV[role] || []
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  const logout = () => { localStorage.clear(); router.replace('/auth/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">S</div>
        <div>
          <div className="sidebar-name">Shotlin</div>
          <div className="sidebar-tagline">AI Doctor Routing</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`nav-item${pathname === item.href || pathname.startsWith(item.href + '/') ? ' active' : ''}`}>
            {icons[item.icon]}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className={`avatar ${ROLE_COLOR[role]}`}>{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>{name || 'User'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{ROLE_LABEL[role]}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={logout} title="Logout" style={{ padding: 6 }}>
            {icons.logout}
          </button>
        </div>
      </div>
    </aside>
  )
}