import { Lightbulb, AlertTriangle, CheckCircle2, Droplets, XCircle } from 'lucide-react'

const CFG = {
  streetlight: {
    before: { bg: '#1f2937', color: '#6b7280', Icon: Lightbulb },
    after:  { bg: '#0d1117', color: '#fbbf24', Icon: Lightbulb, glow: '0 0 14px rgba(251,191,36,.7)' },
  },
  road: {
    before: { bg: '#2d1b1b', color: '#ef4444', Icon: AlertTriangle },
    after:  { bg: '#0f2117', color: '#10b981', Icon: CheckCircle2, glow: '0 0 14px rgba(16,185,129,.7)' },
  },
  water: {
    before: { bg: '#1e1e2e', color: '#4b5563', Icon: Droplets },
    after:  { bg: '#0c1a2e', color: '#3b82f6', Icon: Droplets,    glow: '0 0 14px rgba(59,130,246,.7)' },
  },
  other: {
    before: { bg: '#2a1616', color: '#ef4444', Icon: XCircle },
    after:  { bg: '#0f2117', color: '#10b981', Icon: CheckCircle2, glow: '0 0 14px rgba(16,185,129,.7)' },
  },
}

/**
 * @param {{ notif: object, compact?: boolean }} props
 * compact=true → smaller padding/icons, used inside notification panel items
 */
export default function BeforeAfterVisual({ notif, compact = false }) {
  const cfg = CFG[notif.visualType] || CFG.other
  const size = compact ? 26 : 38
  const cls = compact ? ' compact' : ''

  return (
    <div className={`ba-wrap${cls}`}>
      <div className="ba-card" style={{ background: cfg.before.bg }}>
        <span className="ba-chip before">BEFORE</span>
        <cfg.before.Icon size={size} color={cfg.before.color} />
        <span className="ba-desc">{notif.beforeDesc}</span>
      </div>
      <span className="ba-arrow">→</span>
      <div className="ba-card" style={{ background: cfg.after.bg }}>
        <span className="ba-chip after">AFTER</span>
        <cfg.after.Icon
          size={size}
          color={cfg.after.color}
          style={{ filter: `drop-shadow(${cfg.after.glow})` }}
        />
        <span className="ba-desc after">{notif.afterDesc}</span>
      </div>
    </div>
  )
}
