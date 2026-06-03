'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function UploadReport() {
  const router = useRouter()
  const [form, setForm]     = useState({ symptoms: '', manualTranscript: '' })
  const [file, setFile]     = useState(null)
  const [step, setStep]     = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return setError('Please select a file')
    setError('')

    try {
      // Step 1: upload file
      setStep('uploading')
      const fd = new FormData()
      fd.append('report', file)
      fd.append('symptoms', form.symptoms)
      const uploadRes = await api.postForm('/api/reports/upload', fd)
      const report = uploadRes.data || uploadRes

      // Step 2: extract text
      setStep('extracting')
      await api.post(`/api/reports/${report.id}/extract-text`, {
        manualTranscript: form.manualTranscript
      })

      // Step 3: analyze
      setStep('analyzing')
      const analyzeRes = await api.post(`/api/reports/${report.id}/analyze`)
      setResult(analyzeRes.data || analyzeRes)
      setStep('done')
    } catch (err) {
      setError(err.message || 'Upload failed')
      setStep('idle')
    }
  }

  const stepLabel = {
    idle:       '',
    uploading:  'Uploading file…',
    extracting: 'Extracting text…',
    analyzing:  'Analyzing with AI…',
    done:       'Done!',
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Upload Report</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>Submit a medical report for AI analysis and doctor assignment</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 600 }}>
          {step !== 'done' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* File upload */}
              <div className="form-group">
                <label className="form-label">Medical Report File</label>
                <div className={`upload-zone${file ? '' : ''}`} onClick={() => document.getElementById('file-input').click()}>
                  <input type="file" id="file-input" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                    {file
                      ? <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--brand)' }}>{file.name}</span>
                      : <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Click to upload <strong>JPG, PNG, or PDF</strong></span>
                    }
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="form-group">
                <label className="form-label">Symptoms</label>
                <textarea className="form-textarea" placeholder="Describe your symptoms…"
                  value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })}
                  required style={{ minHeight: 90 }} />
              </div>

              {/* Manual transcript */}
              <details style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 500, marginBottom: 8 }}>
                  Manual transcript (optional — if OCR fails)
                </summary>
                <div className="form-group" style={{ marginTop: 8 }}>
                  <textarea className="form-textarea" placeholder="Paste report text here…"
                    value={form.manualTranscript}
                    onChange={e => setForm({ ...form, manualTranscript: e.target.value })}
                    style={{ minHeight: 90 }} />
                </div>
              </details>

              {error && (
                <div className="alert alert-danger">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {step !== 'idle' && (
                <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {stepLabel[step]}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg"
                disabled={step !== 'idle'} style={{ width: '100%', justifyContent: 'center' }}>
                {step !== 'idle' ? stepLabel[step] : 'Submit Report'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="alert alert-success">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Report submitted and analyzed successfully!
              </div>

              <div className="card" style={{ background: 'var(--surface-alt)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Suggested Specialist</span>
                    <span style={{ fontWeight: 600 }}>{result?.analysis?.suggestedCategory || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
                    <span style={{ fontWeight: 600 }}>{result?.analysis?.confidence ? `${(result.analysis.confidence * 100).toFixed(0)}%` : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Urgency</span>
                    <span style={{ fontWeight: 600 }}>{result?.analysis?.urgency || '—'}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reason: </span>
                    <span>{result?.analysis?.reason || '—'}</span>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-lg"
                onClick={() => router.push('/patient/reports')}
                style={{ width: '100%', justifyContent: 'center' }}>
                View My Reports
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}