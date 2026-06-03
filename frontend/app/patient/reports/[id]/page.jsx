'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function PatientReportDetail() {
  const { id } = useParams()
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get(`/api/reports/${id}`)
      .then(r => setReport(r.data || r))
      .catch(e => setError(e.message || 'Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <div className="spinner" />
    </div>
  )

  if (error) return (
    <div className="page-body">
      <div className="alert alert-danger">
        {error} — <Link href="/patient/reports">Go back</Link>
      </div>
    </div>
  )

  const ai = report?.aiAnalysis ? (() => { try { return JSON.parse(report.aiAnalysis.responseJson) } catch { return null } })() : null

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/patient/reports" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            ← Back to reports
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Report Detail</h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{report?.id}</p>
        </div>
        <StatusBadge status={report?.status} />
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Symptoms */}
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Symptoms</h3>
          <p style={{ fontSize: 13.5, background: 'var(--surface-alt)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
            {report?.symptoms}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Uploaded: {new Date(report?.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Transcript */}
        {report?.reportTranscript && (
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Extracted Transcript</h3>
            <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', maxHeight: 200, overflowY: 'auto' }}>
              <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                {report.reportTranscript}
              </pre>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {ai && (
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>AI Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Suggested Specialist</span>
                <span style={{ fontWeight: 600 }}>{ai.suggestedCategory?.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className="progress-fill" style={{ width: `${Math.round((ai.confidence || 0) * 100)}%` }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{Math.round((ai.confidence || 0) * 100)}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Urgency</span>
                <StatusBadge status={ai.urgency} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Reason</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{ai.reason}</p>
              </div>
              {ai.keywords?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ai.keywords.map(k => (
                    <span key={k} className="badge badge-blue">{k}</span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Source: <span style={{ fontFamily: 'var(--font-mono)' }}>{report?.aiAnalysis?.modelUsed}</span>
              </p>
            </div>
          </div>
        )}

        {/* Assigned Doctor */}
        {report?.assignment?.doctor && (
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Assigned Doctor</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar avatar-teal" style={{ width: 48, height: 48, fontSize: 18, borderRadius: 'var(--radius)' }}>
                {report.assignment.doctor.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{report.assignment.doctor.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{report.assignment.doctor.category?.replace(/_/g, ' ')}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.assignment.doctor.specialization}</p>
              </div>
              <span className="badge badge-teal">by {report.assignment.assignedBy}</span>
            </div>
            {report.assignment.reviewedAt && (
              <div className="alert alert-success" style={{ marginTop: 12 }}>
                ✓ Reviewed on {new Date(report.assignment.reviewedAt).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}