'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'

export default function AssignedReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/doctors/assigned-reports')
      .then(d => setReports(d.data || d.reports || d || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Assigned Reports</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>Reports assigned to you for review</p>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
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
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No reports assigned yet</td></tr>
              )}
              {reports.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/doctor/reports/${r.id}`}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.patient?.name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.fileName}</div>
                  </td>
                  <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.aiUrgency ? <StatusBadge status={r.aiUrgency} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}