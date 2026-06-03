'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/api/reports/my')
      .then(d => {
        const payload = d.data || d
        setReports(Array.isArray(payload) ? payload : payload.reports || [])
      })
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>My Reports</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>All your submitted medical reports</p>
        </div>
        <Link href="/patient/upload-report" className="btn btn-primary btn-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          Upload Report
        </Link>
      </div>

      <div className="page-body">
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Symptoms</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Assigned Doctor</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 120 : 70 }} /></td>
                  ))}</tr>
                ))}
                {!loading && error && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--danger)', fontSize: 13 }}>{error}</td></tr>
                )}
                {!loading && !error && reports.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>
                    No reports yet. <Link href="/patient/upload-report" style={{ color: 'var(--brand)' }}>Upload your first report →</Link>
                  </td></tr>
                )}
                {reports.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/patient/reports/${r.id}`}>
                    <td style={{ fontSize: 13 }}>{r.filePath?.split('/').pop() || '—'}</td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.symptoms?.slice(0, 60) || '—'}
                      </div>
                    </td>
                    <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ fontSize: 13 }}>
                      {r.assignment?.doctor
                        ? <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{r.assignment.doctor.name}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link href={`/patient/reports/${r.id}`} className="btn btn-secondary btn-sm" onClick={e => e.stopPropagation()}>
                        View
                      </Link>
                    </td>
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