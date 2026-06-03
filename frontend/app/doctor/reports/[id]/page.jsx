'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api, fileUrl } from '@/lib/api'
import { StatusBadge, CategoryBadge, ConfidenceBar } from '@/components/shared/StatusBadge'

export default function DoctorReportDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get(`/api/reports/${id}`)
      .then(d => { setReport(d.report); setNotes(d.report?.assignment?.doctorNotes || '') })
      .catch(() => router.back())
      .finally(() => setLoading(false))
  }, [id])

  const markReviewed = async () => {
    setSaving(true)
    try {
      await api.patch(`/api/doctor/reports/${id}/mark-reviewed`, { notes })
      const d = await api.get(`/api/reports/${id}`)
      setReport(d.report)
      setMsg({ type: 'success', text: 'Case marked as reviewed successfully' })
    } catch (e) { setMsg({ type: 'danger', text: e.message }) }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (!report) return null

  const r = report
  const keywords = (() => { try { return JSON.parse(r.aiKeywords || '[]') } catch { return [] } })()
  const isReviewed = r.assignment?.status === 'REVIEWED'

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.back()} className="btn btn-ghost btn-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700 }}>Patient: {r.patient?.name}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
              <CategoryBadge category={r.aiSuggestedCategory} />
              {r.aiUrgency && <StatusBadge status={r.aiUrgency} />}
            </div>
          </div>
        </div>
        <a href={fileUrl(r.filePath)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Report
        </a>
      </div>

      <div className="page-body">
        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>{msg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Patient */}
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Patient Information</h3>
              <div className="grid-2" style={{ gap: 12 }}>
                {[['Name', r.patient?.name], ['Age', r.patient?.age ? `${r.patient.age} years` : '—'], ['Gender', r.patient?.gender], ['Phone', r.patient?.phone || '—']].map(([k, v]) => (
                  <div key={k}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{k}</div><div style={{ fontSize: 13.5, fontWeight: 500 }}>{v}</div></div>
                ))}
              </div>
              {r.symptoms && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Reported Symptoms</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{r.symptoms}</p>
                </div>
              )}
            </div>

            {/* AI */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3>AI Routing Analysis</h3>
                {r.analysisSource && <StatusBadge status={r.analysisSource} />}
              </div>
              <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Suggested Category</div><CategoryBadge category={r.aiSuggestedCategory} /></div>
                <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Urgency Level</div>{r.aiUrgency && <StatusBadge status={r.aiUrgency} />}</div>
                <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>AI Confidence</div><ConfidenceBar value={r.aiConfidence} /></div>
              </div>
              {r.aiReason && <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}><div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ROUTING REASON</div><p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{r.aiReason}</p></div>}
              {keywords.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{keywords.map(k => <span key={k} className="badge badge-gray">{k}</span>)}</div>}
            </div>

            {/* Transcript */}
            {r.reportTranscript && (
              <div className="card">
                <h3 style={{ marginBottom: 14 }}>Report Transcript</h3>
                <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '14px 16px', maxHeight: 320, overflowY: 'auto' }}>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.reportTranscript}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Your Review</h3>
              {isReviewed ? (
                <div className="alert alert-success">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  Marked as reviewed on {r.assignment?.reviewedAt ? new Date(r.assignment.reviewedAt).toLocaleDateString('en-IN') : 'N/A'}
                </div>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Doctor Notes</label>
                    <textarea className="form-textarea" rows={5} placeholder="Add your clinical notes, observations, or recommendations for the admin…" value={notes} onChange={e => setNotes(e.target.value)} />
                    <div className="form-hint">These notes are visible to the admin and are not shared with the patient.</div>
                  </div>
                  <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={markReviewed} disabled={saving}>
                    {saving ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                    Mark as Reviewed
                  </button>
                </>
              )}
              {isReviewed && r.assignment?.doctorNotes && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Your Notes</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{r.assignment.doctorNotes}</p>
                </div>
              )}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Case Info</h3>
              {[['Report Status', <StatusBadge key="s" status={r.status} />],['Assignment', <StatusBadge key="a" status={r.assignment?.status || 'PENDING'} />],['Uploaded', new Date(r.createdAt).toLocaleDateString('en-IN')],['File type', r.fileType?.split('/')[1]?.toUpperCase()]].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
