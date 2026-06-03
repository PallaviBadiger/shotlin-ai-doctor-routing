'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'
import { useAuthStore } from '@/store/auth.store'

export default function DoctorDashboard() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    api.get('/api/doctors/my-reports').then(d => {
      const payload = d.data || d
      setReports(Array.isArray(payload) ? payload : payload.reports || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pending  = reports.filter(r => r.status !== 'REVIEWED').length
  const reviewed = reports.filter(r => r.status === 'REVIEWED').length
  const critical = reports.filter(r => r.aiUrgency === 'CRITICAL' || r.aiUrgency === 'HIGH').length
  const name     = user?.name || 'Doctor'

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Welcome, Dr. {name.split(' ')[0]}</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/doctor/assigned-reports" className="btn btn-primary btn-sm">View all assigned</Link>
      </div>
      <div className="page-body">
        <div className="grid-3" style={{ marginBottom: 28 }}>
          {[
            { label: 'Assigned to Me', value: reports.length, color: 'blue', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            { label: 'Pending Review', value: pending, color: 'warning', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: 'High / Critical', value: critical, color: 'danger', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
              <div>
                <div className="stat-value">{loading ? <div className="skeleton" style={{ width: 40, height: 24 }} /> : value}</div>
                <div className="stat-label" style={{ marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <h3>Recent Assigned Reports</h3>
            <Link href="/doctor/assigned-reports" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Patient</th><th>Category</th><th>Urgency</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 120 : 70 }} /></td>)}</tr>
                ))}
                {!loading && reports.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>No reports assigned yet</td></tr>
                )}
                {reports.slice(0, 6).map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/doctor/reports/${r.id}`}>
                    <td><div style={{ fontWeight: 500 }}>{r.patient?.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.patient?.age}y · {r.patient?.gender}</div></td>
                    <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                    <td>{r.aiUrgency ? <StatusBadge status={r.aiUrgency} /> : '—'}</td>
                    <td><StatusBadge status={r.status || 'PENDING'} /></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><Link href={`/doctor/reports/${r.id}`} className="btn btn-secondary btn-sm">Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}