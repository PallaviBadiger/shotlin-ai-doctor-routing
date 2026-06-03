'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/api/admin/patients').then(d => setPatients(d.patients || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q) || p.phone?.includes(q)
  })

  const initials = name => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const avatarBg = i => ['var(--brand)', 'var(--teal)', 'var(--purple)', 'var(--warning)'][i % 4]

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Patients</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{patients.length} registered patients</p>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input className="form-input" placeholder="Search by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 340 }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} shown</span>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Reports</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 140 : 80 }} /></td>)}</tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                    <div style={{ fontWeight: 600 }}>No patients found</div>
                  </div>
                </td></tr>
              )}
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ background: avatarBg(i), width: 34, height: 34 }}>{initials(p.name)}</div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.age}y · {p.gender}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.phone || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.user?.email}</td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{p._count?.reports ?? '—'}</span>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <Link href={`/admin/reports?patient=${p.id}`} className="btn btn-ghost btn-sm">Reports</Link>
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
