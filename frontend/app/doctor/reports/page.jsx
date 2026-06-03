'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'

export default function DoctorAssignedReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/api/doctor/reports').then(d => setReports(d.reports || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = filter ? reports.filter(r => r.assignment?.status === filter) : reports

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Assigned Reports</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{reports.length} reports assigned to you</p>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['', 'PENDING', 'IN_REVIEW', 'REVIEWED'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
              {s || 'All'} {s && `(${reports.filter(r => r.assignment?.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Patient</th><th>Symptoms</th><th>AI Category</th><th>Urgency</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 120 : 80 }} /></td>)}</tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><div style={{ fontWeight: 600 }}>No reports in this category</div></div></td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.patient?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.patient?.age}y · {r.patient?.gender}</div>
                  </td>
                  <td style={{ maxWidth: 180 }}><p className="truncate" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.symptoms || '—'}</p></td>
                  <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                  <td>{r.aiUrgency ? <StatusBadge status={r.aiUrgency} /> : '—'}</td>
                  <td><StatusBadge status={r.assignment?.status || 'PENDING'} /></td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><Link href={`/doctor/reports/${r.id}`} className="btn btn-primary btn-sm">Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
