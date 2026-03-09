import { INSIGHTS } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import {
  BrainCircuit, TrendingUp, AlertTriangle, Users, Megaphone, BarChart2,
  MapPin, MessageSquare, ChevronRight, RefreshCw, Download, Sparkles,
  Zap, Heart, Clock, ShieldAlert
} from 'lucide-react'

const ICON_MAP = {
  TrendingUp, AlertTriangle, Users, Megaphone, BarChart2,
  MapPin, MessageSquare, BrainCircuit, Sparkles, Zap, Heart, Clock, ShieldAlert
}

const TYPE_COLORS = {
  Prediction:  { color: '#6366f1', bg: 'rgba(99,102,241,.12)' },
  Alert:       { color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
  Strategy:    { color: '#10b981', bg: 'rgba(16,185,129,.12)' },
  Trend:       { color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  Insight:     { color: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
  Opportunity: { color: '#10b981', bg: 'rgba(16,185,129,.12)' },
  Risk:        { color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
}

export default function AIInsights() {
  const { showToast } = useApp()

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">AI Insights</div>
          <div className="page-subtitle">Machine-learning powered recommendations and predictions</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => showToast('Insights refreshed!')}><RefreshCw size={14}/>Refresh</button>
          <button className="btn btn-primary" onClick={() => showToast('Report downloaded!')}><Download size={14}/>Export</button>
        </div>
      </div>

      <div className="ai-banner">
        <div className="ai-banner-icon"><BrainCircuit size={24} /></div>
        <div>
          <div className="ai-banner-title">AI Analysis Engine Active</div>
          <div className="ai-banner-sub">9 insights generated · Last updated 2 minutes ago · Model accuracy: 94.2%</div>
        </div>
        <div className="ai-banner-tag">Live ●</div>
      </div>

      <div className="insight-grid">
        {INSIGHTS.map((ins, i) => {
          const Icon = ICON_MAP[ins.icon] || BrainCircuit
          const tc = TYPE_COLORS[ins.type] || TYPE_COLORS.Insight
          return (
            <div className="insight-card" key={i} style={{ borderTop: `3px solid ${tc.color}` }}>
              <div className="insight-confidence" style={{ color: tc.color }}>{ins.confidence}% conf.</div>
              <div className="insight-icon" style={{ background: tc.bg }}>
                <Icon size={18} color={tc.color} />
              </div>
              <div className="insight-type" style={{ color: tc.color }}>{ins.type}</div>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-body">{ins.body}</div>
              <button className="insight-action" onClick={() => showToast(`Acting on: ${ins.title}`)}>
                Take Action <ChevronRight size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
