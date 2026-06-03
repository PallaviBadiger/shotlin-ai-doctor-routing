'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
    </div>
    <div>
      <div className="stat-value">{value ?? <div className="skeleton" style={{ width: 48, height: 28 }} />}</div>
      <div className="stat-label" style={{ marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])

  useEffect(() => {
    api.get('/api/admin/stats').then(d => setStats(d.data || d)).catch(() => {})
    api.get('/api/admin/reports?limit=8').then(d => {
      const payload = d.data || d
      setReports(Array.isArray(payload) ? payload : payload.reports || [])
    }).catch(() => {})
  }, [])

  const s = stats || {}

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/admin/reports" className="btn btn-primary btn-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          View all reports
        </Link>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <StatCard icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} label="Total Patients" value={s.totalPatients} color="blue" />
          <StatCard icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} label="Total Reports" value={s.totalReports} color="purple" />
          <StatCard icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} label="Assigned" value={s.assigned} color="green" />
          <StatCard icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="Pending Review" value={s.pending} color="warning" />
        </div>

        <div className="grid-2" style={{ marginBottom: 28, gridTemplateColumns: '2fr 1fr' }}>
          {/* Recent Reports */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <h3>Recent Reports</h3>
              <Link href="/admin/reports" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No reports yet</td></tr>
                  )}
                  {reports.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/admin/reports/${r.id}`}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.patient?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.fileName}</div>
                      </td>
                      <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>{r.aiUrgency ? <StatusBadge status={r.aiUrgency} /> : <span className="text-muted">—</span>}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)' }}>
              <h3>By Specialist</h3>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(s.byCategory || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
              {(s.byCategory || []).map(({ category, count }) => {
                const total = s.totalReports || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{category}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid-3">
          {[
            { href: '/admin/patients', label: 'Manage Patients', desc: 'View all patient profiles and reports', color: 'var(--brand)', bg: 'var(--brand-light)' },
            { href: '/admin/doctors', label: 'Manage Doctors', desc: 'Add, edit and configure doctor profiles', color: 'var(--teal)', bg: 'var(--teal-bg)' },
            { href: '/admin/reports', label: 'All Reports', desc: 'Review, reassign and manage every report', color: 'var(--purple)', bg: 'var(--purple-bg)' },
          ].map(({ href, label, desc, color, bg }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s', borderLeft: `3px solid ${color}` }}
                onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
