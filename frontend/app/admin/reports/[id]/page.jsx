'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, fileUrl } from '@/lib/api'
import { StatusBadge, CategoryBadge, ConfidenceBar } from '@/components/shared/StatusBadge'

export default function AdminReportDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/api/admin/reports/${id}`),
      api.get('/api/doctors'),
    ]).then(([rd, dd]) => {
      setReport(rd.report)
      setDoctors(dd.doctors || [])
      setSelectedDoc(rd.report?.assignment?.doctorId || '')
    }).catch(() => router.back())
     .finally(() => setLoading(false))
  }, [id])

  const reassign = async () => {
    if (!selectedDoc) return
    setAssigning(true)
    try {
      await api.patch(`/api/admin/reports/${id}/assign-doctor`, { doctorId: selectedDoc })
      setMsg({ type: 'success', text: 'Doctor reassigned successfully' })
      const rd = await api.get(`/api/admin/reports/${id}`)
      setReport(rd.report)
    } catch (e) { setMsg({ type: 'danger', text: e.message }) }
    finally { setAssigning(false) }
  }

  const reanalyze = async () => {
    setReanalyzing(true)
    try {
      await api.post(`/api/admin/reports/${id}/reanalyze`, {})
      const rd = await api.get(`/api/admin/reports/${id}`)
      setReport(rd.report)
      setMsg({ type: 'success', text: 'Report re-analyzed successfully' })
    } catch (e) { setMsg({ type: 'danger', text: e.message }) }
    finally { setReanalyzing(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  if (!report) return null
  const r = report
  const keywords = (() => { try { return JSON.parse(r.aiKeywords || '[]') } catch { return [] } })()

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.back()} className="btn btn-ghost btn-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700 }}>Report — {r.patient?.name}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
              <StatusBadge status={r.status} />
              {r.aiUrgency && <StatusBadge status={r.aiUrgency} />}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {r.reportTranscript && (
            <button className="btn btn-secondary btn-sm" onClick={reanalyze} disabled={reanalyzing}>
              {reanalyzing ? <div className="spinner" style={{ width: 13, height: 13 }} /> : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>}
              Re-analyze
            </button>
          )}
          <a href={fileUrl(r.filePath)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </a>
        </div>
      </div>

      <div className="page-body">
        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>{msg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Patient info */}
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Patient Information</h3>
              <div className="grid-2" style={{ gap: 12 }}>
                {[['Name', r.patient?.name],['Age', r.patient?.age ? `${r.patient.age} years` : '—'],['Gender', r.patient?.gender],['Phone', r.patient?.phone || '—']].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
              {r.symptoms && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Symptoms Described</div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.symptoms}</p>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {r.aiSuggestedCategory && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3>AI Analysis</h3>
                  {r.analysisSource && <StatusBadge status={r.analysisSource} />}
                </div>
                <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, marginBottom: 6 }}>Suggested Category</div>
                    <CategoryBadge category={r.aiSuggestedCategory} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, marginBottom: 6 }}>Urgency</div>
                    {r.aiUrgency && <StatusBadge status={r.aiUrgency} />}
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, marginBottom: 8 }}>Confidence</div>
                    <ConfidenceBar value={r.aiConfidence} />
                  </div>
                </div>
                {r.aiReason && (
                  <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>AI REASONING</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{r.aiReason}</p>
                  </div>
                )}
                {keywords.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {keywords.map(k => <span key={k} className="badge badge-gray">{k}</span>)}
                  </div>
                )}
                {r.aiManualReviewRequired && (
                  <div className="alert alert-warning" style={{ marginTop: 14 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Manual review recommended — low confidence score
                  </div>
                )}
              </div>
            )}

            {/* Transcript */}
            {r.reportTranscript && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3>Report Transcript</h3>
                  <span className="badge badge-gray" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>
                    {r.extractionStatus}
                  </span>
                </div>
                <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '14px 16px', maxHeight: 300, overflowY: 'auto' }}>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.reportTranscript}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Assignment */}
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Doctor Assignment</h3>
              {r.assignment && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--success-bg)', borderRadius: 8, border: '1px solid var(--success-border)' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 600, marginBottom: 6 }}>CURRENTLY ASSIGNED</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.assignment.doctor?.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{r.assignment.doctor?.category}</div>
                  <div style={{ marginTop: 6 }}><StatusBadge status={r.assignment.status} /></div>
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Reassign to Doctor</label>
                <select className="form-select" value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}>
                  <option value="">Select doctor…</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.category}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={reassign} disabled={!selectedDoc || assigning}>
                {assigning ? <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 14, height: 14 }} /> : null}
                {r.assignment ? 'Reassign Doctor' : 'Assign Doctor'}
              </button>
            </div>

            {/* File info */}
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>File Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['File name', r.fileName],['Type', r.fileType],['Size', `${(r.fileSize / 1024).toFixed(1)} KB`],['Uploaded', new Date(r.createdAt).toLocaleString('en-IN')]].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500, maxWidth: 160 }} className="truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis logs */}
            {r.aiAnalysisLogs?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Analysis History</h3>
                {r.aiAnalysisLogs.map(log => (
                  <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{log.modelUsed}</span>
                      <StatusBadge status={log.success ? 'SUCCESS' : 'FAILED'} />
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('en-IN')} · {log.processingMs}ms</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
