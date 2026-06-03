'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge, CategoryBadge } from '@/components/shared/StatusBadge'

const STATUS_OPTIONS = ['', 'PENDING', 'EXTRACTED', 'ANALYZED', 'ASSIGNED', 'REVIEWED', 'CLOSED']

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    api.get('/api/admin/reports')
      .then(d => setReports(d.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = reports.filter(r => {
    const q = search.toLowerCase()
    const match = !q || r.patient?.name?.toLowerCase().includes(q) || r.fileName?.toLowerCase().includes(q) || r.aiSuggestedCategory?.toLowerCase().includes(q)
    const statusMatch = !statusFilter || r.status === statusFilter
    return match && statusMatch
  })

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Reports</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{reports.length} total reports</p>
        </div>
      </div>
      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input className="form-input" placeholder="Search by patient, file, category…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: 180 }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} results</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>File</th>
                <th>AI Category</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Source</th>
                <th>Assigned Doctor</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 120 : 80 }} /></td>
                  ))}
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{ fontWeight: 600 }}>No reports found</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try adjusting your search or filters</div>
                  </div>
                </td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{r.patient?.name || '—'}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.patient?.gender}, {r.patient?.age}y</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, maxWidth: 160 }} className="truncate">{r.fileName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{r.fileType?.split('/')[1]}</div>
                  </td>
                  <td><CategoryBadge category={r.aiSuggestedCategory} /></td>
                  <td>{r.aiUrgency ? <StatusBadge status={r.aiUrgency} /> : <span className="text-muted text-sm">—</span>}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.analysisSource ? <StatusBadge status={r.analysisSource} /> : <span className="text-muted text-sm">—</span>}</td>
                  <td>
                    {r.assignment?.doctor
                      ? <><div style={{ fontSize: 13, fontWeight: 500 }}>{r.assignment.doctor.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.assignment.doctor.category}</div></>
                      : <span className="text-muted text-sm">Unassigned</span>}
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <Link href={`/admin/reports/${r.id}`} className="btn btn-secondary btn-sm">Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
