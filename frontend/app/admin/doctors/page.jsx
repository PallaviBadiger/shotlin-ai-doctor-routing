'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CategoryBadge } from '@/components/shared/StatusBadge'

const CATEGORIES = ['General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic', 'Neurologist', 'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Diabetologist']

const BLANK = { name: '', email: '', password: '', category: 'General Physician', specialization: '', experience: '', qualification: '', bio: '', phone: '', maxCases: 10 }

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = () => api.get('/api/doctors').then(d => setDoctors(d.data || d.doctors || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/api/doctors/${editing}`, form)
        setMsg({ type: 'success', text: 'Doctor updated' })
      } else {
        await api.post('/api/auth/register', { ...form, role: 'DOCTOR' })
        setMsg({ type: 'success', text: 'Doctor created and account set up' })
      }
      setShowForm(false); setEditing(null); setForm(BLANK); load()
    } catch (err) { setMsg({ type: 'danger', text: err.message }) }
    finally { setSaving(false) }
  }

  const toggleAvail = async (id, cur) => {
    await api.patch(`/api/doctors/${id}`, { isAvailable: !cur }).catch(() => {})
    load()
  }

  const initials = name => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Doctors</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{doctors.length} doctors registered</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditing(null); setForm(BLANK) }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Doctor
        </button>
      </div>

      <div className="page-body">
        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>{msg.text}</div>}

        {/* Add/Edit form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>{editing ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowForm(false); setEditing(null) }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={save}>
              <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} required /></div>
                {!editing && <><div className="form-group"><label className="form-label">Login Email</label><input className="form-input" type="email" value={form.email} onChange={set('email')} required /></div>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={set('password')} required minLength={6} /></div></>}
                <div className="form-group"><label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Specialization</label><input className="form-input" value={form.specialization} onChange={set('specialization')} /></div>
                <div className="form-group"><label className="form-label">Experience (years)</label><input className="form-input" type="number" min={0} value={form.experience} onChange={set('experience')} /></div>
                <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={set('qualification')} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" value={form.phone} onChange={set('phone')} /></div>
                <div className="form-group"><label className="form-label">Max Concurrent Cases</label><input className="form-input" type="number" min={1} value={form.maxCases} onChange={set('maxCases')} /></div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Bio</label><textarea className="form-textarea" rows={2} value={form.bio} onChange={set('bio')} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 14, height: 14 }} /> : null}
                  {editing ? 'Save Changes' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctors grid */}
        <div className="grid-3">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card"><div className="skeleton" style={{ height: 80 }} /></div>
          ))}
          {!loading && doctors.length === 0 && (
            <div style={{ gridColumn: '1/-1' }}>
              <div className="empty-state card"><div style={{ fontWeight: 600 }}>No doctors yet</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add your first doctor to get started</div></div>
            </div>
          )}
          {doctors.map((d, i) => (
            <div key={d.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div className="avatar avatar-teal" style={{ width: 44, height: 44, fontSize: 14 }}>{initials(d.name)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.qualification || 'MBBS'}</div>
                </div>
              </div>
              <CategoryBadge category={d.category} />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['Experience', `${d.experience} yrs`],['Specialization', d.specialization || '—'],['Max Cases', d.maxCases]].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={`btn btn-sm ${d.isAvailable ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleAvail(d.id, d.isAvailable)} style={{ fontSize: 11.5 }}>
                  {d.isAvailable ? '● Available' : '○ Unavailable'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(d.id); setForm({ name: d.name, category: d.category, specialization: d.specialization || '', experience: d.experience, qualification: d.qualification || '', bio: d.bio || '', phone: d.phone || '', maxCases: d.maxCases, email: '', password: '' }); setShowForm(true) }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
