'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'

export default function PatientDashboard() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  api.get('/api/reports/my').then(d => {
    const payload = d.data || d
    setReports(Array.isArray(payload) ? payload : payload.reports || [])
  }).catch(() => {}).finally(() => setLoading(false))
}, [])

  const total    = reports.length
  const assigned = reports.filter(r => r.status === 'ASSIGNED').length
  const pending  = reports.filter(r => r.status === 'PENDING').length

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Welcome, {user?.name || 'Patient'}</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/patient/upload-report" className="btn btn-primary btn-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          Upload Report
        </Link>
      </div>

      <div className="page-body">
        <div className="grid-3" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Reports',  value: total,    color: 'blue'    },
            { label: 'Assigned',       value: assigned, color: 'green'   },
            { label: 'Pending Review', value: pending,  color: 'warning' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div>
                <div className="stat-value">{loading ? <div className="skeleton" style={{ width: 40, height: 24 }} /> : value}</div>
                <div className="stat-label" style={{ marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <h3>My Reports</h3>
            <Link href="/patient/reports" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>File</th><th>Category</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 120 : 70 }} /></td>)}</tr>
                ))}
                {!loading && reports.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>
                    No reports yet. <Link href="/patient/upload-report" style={{ color: 'var(--brand)' }}>Upload your first report →</Link>
                  </td></tr>
                )}
                {reports.slice(0, 5).map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/patient/reports/${r.id}`}>
                    <td style={{ fontSize: 13 }}>{r.filePath?.split('/').pop() || r.filePath}</td>
                    <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
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