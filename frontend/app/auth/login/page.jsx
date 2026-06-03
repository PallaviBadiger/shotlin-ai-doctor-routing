'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

const TEST_CREDS = [
  { role: 'Admin',   email: 'admin@shotlin.com',   password: 'Admin@1234',   color: 'var(--purple)', bg: 'var(--purple-bg)' },
  { role: 'Doctor',  email: 'dr.mehta@shotlin.com', password: 'Doctor@1234',  color: 'var(--teal)',   bg: 'var(--teal-bg)' },
  { role: 'Patient', email: 'patient@shotlin.com',  password: 'Patient@1234', color: 'var(--brand)',  bg: 'var(--brand-light)' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const d = await api.post('/api/auth/login', form)
      const { token, user } = d.data || d
      setAuth(token, user)
      const dest = { ADMIN: '/admin/dashboard', DOCTOR: '/doctor/dashboard', PATIENT: '/patient/dashboard' }
      router.replace(dest[user.role] || '/patient/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const fillCred = (email, password) => { setForm({ email, password }); setError('') }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel auth-panel-left" style={{ flexDirection: 'column', gap: 0, justifyContent: 'space-between', padding: '56px 64px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>S</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Shotlin</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>AI Healthcare Platform</div>
            </div>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20 }}>
            Smarter<br />patient routing<br />powered by AI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Upload a report, extract the transcript, and let our AI instantly route patients to the right specialist — with full admin oversight.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['🔬', 'OCR text extraction from images & PDFs'],
            ['🤖', 'Gemini AI classification with fallback'],
            ['🏥', 'Role-based access for Admin, Doctor & Patient'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, backdropFilter: 'blur(10px)' }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel" style={{ background: 'var(--bg)', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Sign in</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showPw
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)' }}>
            New patient?{' '}
            <Link href="/auth/register" style={{ color: 'var(--brand)', fontWeight: 500 }}>Create account</Link>
          </p>

          {/* Test credentials */}
          <div style={{ marginTop: 28 }}>
            <div className="divider"><span>Test credentials</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEST_CREDS.map(({ role, email, password, color, bg }) => (
                <button key={role} type="button" onClick={() => fillCred(email, password)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: bg, border: `1px solid ${color}22`, borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}22`, padding: '2px 8px', borderRadius: 99, minWidth: 52, textAlign: 'center', letterSpacing: '0.3px' }}>{role}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', flex: 1 }}>{email}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}