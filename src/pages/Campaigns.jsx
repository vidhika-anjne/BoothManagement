import { CAMPAIGNS } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import { Megaphone, Plus, Download, Play, Pause, CheckCircle } from 'lucide-react'

const STATUS_COLORS = {
  Active: { bg: 'rgba(16,185,129,.12)', color: '#10b981' },
  Planned: { bg: 'rgba(59,130,246,.12)', color: '#3b82f6' },
  Completed: { bg: 'rgba(107,114,128,.12)', color: '#9ca3af' },
  Paused : { bg: 'rgba(245,158,11,.12)', color: '#f59e0b' },
}

const ACCENT_GRADIENTS = [
  'linear-gradient(90deg,#6366f1,#8b5cf6)',
  'linear-gradient(90deg,#10b981,#06b6d4)',
  'linear-gradient(90deg,#f59e0b,#ef4444)',
  'linear-gradient(90deg,#ec4899,#8b5cf6)',
  'linear-gradient(90deg,#3b82f6,#6366f1)',
  'linear-gradient(90deg,#10b981,#6366f1)',
]

export default function Campaigns() {
  const { showToast } = useApp()

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Campaigns</div>
          <div className="page-subtitle">Manage voter outreach and awareness campaigns</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => showToast('Report exported!')}><Download size={14}/>Export</button>
          <button className="btn btn-primary" onClick={() => showToast('Campaign creation coming soon!')}><Plus size={14}/>New Campaign</button>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['Total', CAMPAIGNS.length, '#6366f1'], ['Active', CAMPAIGNS.filter(c=>c.status==='Active').length, '#10b981'],
          ['Planned', CAMPAIGNS.filter(c=>c.status==='Planned').length, '#3b82f6'],
          ['Completed', CAMPAIGNS.filter(c=>c.status==='Completed').length, '#9ca3af']].map(([label, val, color]) => (
          <div key={label} className="card" style={{ display:'flex', alignItems:'center', gap:'.75rem', flex:'1', minWidth:120 }}>
            <div style={{ fontSize:'1.6rem', fontWeight:800, color }}>{val}</div>
            <div style={{ fontSize:'.78rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>{label} Campaigns</div>
          </div>
        ))}
      </div>

      <div className="campaign-grid">
        {CAMPAIGNS.map((c, i) => {
          const sc = STATUS_COLORS[c.status] || STATUS_COLORS.Active
          const StatusIcon = c.status === 'Active' ? Play : c.status === 'Completed' ? CheckCircle : Pause
          return (
            <div className="campaign-card" key={c.id}>
              <div className="campaign-top" style={{ background: ACCENT_GRADIENTS[i % ACCENT_GRADIENTS.length] }} />
              <div className="campaign-body">
                <span className="campaign-status" style={{ background: sc.bg, color: sc.color }}>
                  <StatusIcon size={10} style={{ marginRight: 3 }} />{c.status}
                </span>
                <div className="campaign-title">{c.title}</div>
                <div className="campaign-desc">{c.description}</div>
                <div className="campaign-meta">
                  <span>{c.type}</span>
                  <span>{c.reach.toLocaleString()} reach</span>
                </div>
                <div className="campaign-progress-bar">
                  <div className="cpb-top">
                    <span>Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.progress}%</span>
                  </div>
                  <div className="cpb-bg">
                    <div className="cpb-fill" style={{ width: c.progress + '%', background: ACCENT_GRADIENTS[i % ACCENT_GRADIENTS.length] }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, fontSize: '.78rem', padding: '.38rem' }}
                    onClick={() => showToast(`${c.title} details loaded`)}>View</button>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '.78rem', padding: '.38rem' }}
                    onClick={() => showToast(`${c.title} updated`)}>Edit</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
