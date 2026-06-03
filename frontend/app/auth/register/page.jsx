'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', password: '', name: '', age: '', gender: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const nextStep = e => { e.preventDefault(); setError(''); setStep(2) }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const d = await api.post('/api/auth/register', { ...form, role: 'PATIENT' })
      localStorage.setItem('token', d.token)
      localStorage.setItem('role', d.user.role)
      localStorage.setItem('userName', form.name)
      router.replace('/patient/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-panel auth-panel-left" style={{ flexDirection: 'column', gap: 0, justifyContent: 'center', padding: '56px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>S</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Shotlin</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>AI Healthcare Platform</div>
          </div>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.6px', marginBottom: 16 }}>Get matched to the right doctor, automatically.</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14.5, lineHeight: 1.7 }}>Upload your medical report and our AI instantly analyzes it, identifies the right specialist, and routes your case — no phone calls needed.</p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[['1', 'Upload report', 'JPG, PNG or PDF — any medical document'],
            ['2', 'AI analyzes', 'Gemini AI extracts and classifies your case'],
            ['3', 'Get assigned', 'Matched to the right specialist instantly']].map(([n, title, desc]) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 1 }}>{n}</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13.5 }}>{title}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="auth-panel" style={{ background: 'var(--bg)' }}>
        <div className="auth-form-wrap">
          {/* Step indicator */}
          <div className="step-list" style={{ marginBottom: 32 }}>
            <div className="step-item">
              <div className={`step-circle ${step >= 1 ? 'active' : ''}`}>{step > 1 ? '✓' : '1'}</div>
              <div className={`step-line ${step > 1 ? 'done' : ''}`} />
            </div>
            <div className="step-item" style={{ flex: 'none' }}>
              <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px' }}>{step === 1 ? 'Create account' : 'Your details'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>{step === 1 ? 'Set up your login credentials' : 'Tell us a bit about yourself'}</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

          {step === 1 ? (
            <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>Continue →</button>
            </form>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required autoFocus />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" placeholder="e.g. 32" min={1} max={120} value={form.age} onChange={set('age')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={set('gender')} required>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                  {loading ? <><div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 14, height: 14 }} />Creating…</> : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
