export function StatusBadge({ status }) {
  const map = {
    PENDING:   { cls: 'badge-warning', label: 'Pending' },
    EXTRACTED: { cls: 'badge-blue',    label: 'Extracted' },
    ANALYZED:  { cls: 'badge-purple',  label: 'Analyzed' },
    ASSIGNED:  { cls: 'badge-teal',    label: 'Assigned' },
    REVIEWED:  { cls: 'badge-green',   label: 'Reviewed' },
    CLOSED:    { cls: 'badge-gray',    label: 'Closed' },
    IN_REVIEW: { cls: 'badge-blue',    label: 'In Review' },
    ACCEPTED:  { cls: 'badge-teal',    label: 'Accepted' },
    SUCCESS:   { cls: 'badge-green',   label: 'Success' },
    FAILED:    { cls: 'badge-danger',  label: 'Failed' },
    MANUAL:    { cls: 'badge-warning', label: 'Manual' },
    LOW:       { cls: 'badge-green',   label: 'Low' },
    MEDIUM:    { cls: 'badge-warning', label: 'Medium' },
    HIGH:      { cls: 'badge-danger',  label: 'High' },
    CRITICAL:  { cls: 'badge-danger',  label: '⚠ Critical' },
    GEMINI_AI: { cls: 'badge-purple',  label: 'Gemini AI' },
    FALLBACK_RULE_ENGINE: { cls: 'badge-gray', label: 'Rule Engine' },
  }
  const { cls, label } = map[status] || { cls: 'badge-gray', label: status }
  return <span className={`badge ${cls}`}><span className="badge-dot" />{label}</span>
}

export function CategoryBadge({ category }) {
  const map = {
    'General Physician': 'badge-blue',
    'Cardiologist': 'badge-danger',
    'Dermatologist': 'badge-warning',
    'Orthopedic': 'badge-teal',
    'Neurologist': 'badge-purple',
    'Gynecologist': 'badge-teal',
    'Pediatrician': 'badge-blue',
    'ENT Specialist': 'badge-teal',
    'Diabetologist': 'badge-warning',
  }
  const cls = map[category] || 'badge-gray'
  return <span className={`badge ${cls}`}>{category || '—'}</span>
}

export function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100)
  const color = pct >= 70 ? 'var(--success)' : pct >= 45 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 34 }}>{pct}%</span>
    </div>
  )
}