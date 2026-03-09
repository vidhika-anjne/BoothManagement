import { useState } from 'react'
import {
  Bell, Send, CheckCircle2, Clock, AlertCircle, Plus, X,
  Users, Megaphone, MessageSquare, ArrowRight, BarChart2,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { NOTIFICATIONS, BOOTHS, ISSUES } from '../data/mockData.js'
import BeforeAfterVisual from '../components/shared/BeforeAfterVisual.jsx'

// ── Type + channel config ──────────────────────────────────────────────────
const TYPE_CFG = {
  resolved:     { label: 'Resolved',    bg: 'rgba(16,185,129,.12)', color: '#10b981', Icon: CheckCircle2 },
  'in-progress':{ label: 'In Progress', bg: 'rgba(245,158,11,.12)', color: '#f59e0b', Icon: Clock        },
  update:       { label: 'Update',      bg: 'rgba(59,130,246,.12)', color: '#3b82f6', Icon: AlertCircle  },
}

const VISUAL_TYPES = ['streetlight', 'road', 'water', 'other']

const CHANNEL_META = {
  SMS:      { color: '#3b82f6', bg: 'rgba(59,130,246,.1)'  },
  WhatsApp: { color: '#10b981', bg: 'rgba(16,185,129,.1)'  },
  App:      { color: '#8b5cf6', bg: 'rgba(139,92,246,.1)'  },
  Voice:    { color: '#f59e0b', bg: 'rgba(245,158,11,.1)'  },
}

// ── Compose form ────────────────────────────────────────────────────────────
const BLANK = {
  title: '', body: '', issueRef: '', booth: '', type: 'resolved',
  channels: ['SMS'], beforeDesc: '', afterDesc: '', visualType: 'other',
  resolvedBy: '', sentTo: '',
}

function ComposeForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleChannel = (ch) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter(c => c !== ch)
        : [...f.channels, ch],
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())  e.title = 'Title is required'
    if (!form.body.trim() || form.body.trim().length < 20) e.body = 'Message must be at least 20 characters'
    if (!form.booth)         e.booth = 'Select a booth'
    if (!form.resolvedBy.trim()) e.resolvedBy = 'Enter responsible department / organisation'
    if (!form.beforeDesc.trim()) e.beforeDesc = 'Describe the before state'
    if (!form.afterDesc.trim())  e.afterDesc  = 'Describe the after state'
    if (form.channels.length === 0) e.channels = 'Select at least one channel'
    return e
  }

  const submit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    onSubmit({
      id: 'N-' + String(Date.now()).slice(-5),
      ...form,
      sentTo: Number(form.sentTo) || 500,
      read: false,
      time: 'Just now',
      resolvedDate: new Date().toISOString().split('T')[0],
    })
  }

  const F = ({ label, err, hint, children, full }) => (
    <div className={`notif-cf-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      {children}
      {err  && <span className="notif-cf-error">{err}</span>}
      {hint && !err && <span className="notif-cf-hint">{hint}</span>}
    </div>
  )
  const inp = (k, props = {}) => (
    <input className={`notif-cf-input${errors[k] ? ' error' : ''}`}
      value={form[k]} onChange={e => set(k, e.target.value)} {...props} />
  )
  const sel = (k, children, props = {}) => (
    <select className={`notif-cf-input${errors[k] ? ' error' : ''}`}
      value={form[k]} onChange={e => set(k, e.target.value)} {...props}>
      {children}
    </select>
  )

  return (
    <div className="notif-compose-wrap">
      <div className="notif-compose-title">
        <Plus size={16} /> Send New Notification
      </div>

      <div className="notif-cf-grid">
        <F label="Notification Title*" err={errors.title} full>
          {inp('title', { placeholder: 'e.g. Road pothole repaired — Booth 141' })}
        </F>
        <F label="Type*" err={errors.type}>
          {sel('type', <>
            <option value="resolved">Resolved</option>
            <option value="in-progress">In Progress</option>
            <option value="update">Update</option>
          </>)}
        </F>
        <F label="Booth / Area*" err={errors.booth}>
          {sel('booth', <>
            <option value="">Select booth</option>
            {BOOTHS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </>)}
        </F>
        <F label="Linked Issue (optional)">
          {sel('issueRef', <>
            <option value="">None</option>
            {ISSUES.map(i => <option key={i.id} value={i.id}>{i.id} – {i.title.slice(0,40)}</option>)}
          </>)}
        </F>
        <F label="Responsible Department / Agency*" err={errors.resolvedBy}>
          {inp('resolvedBy', { placeholder: 'e.g. PWD Maharashtra, MCGM Water Dept.' })}
        </F>
        <F label="Est. Recipients" hint="Leave blank to auto-calculate from booth">
          {inp('sentTo', { type: 'number', placeholder: 'e.g. 800' })}
        </F>
        <F label="Message Body*" err={errors.body} full>
          <textarea className={`notif-cf-input${errors.body ? ' error' : ''}`}
            rows={3} placeholder="Provide a clear, informative update for residents…"
            value={form.body} onChange={e => set('body', e.target.value)} />
        </F>
        <F label="Visual Type" hint="Generates the before/after illustration">
          {sel('visualType', VISUAL_TYPES.map(v => <option key={v}>{v}</option>))}
        </F>
        <F label="" /> {/* spacer */}
        <F label="Before — Situation Description*" err={errors.beforeDesc}>
          {inp('beforeDesc', { placeholder: 'e.g. 6 street lights non-functional since Feb 26' })}
        </F>
        <F label="After — Outcome Description*" err={errors.afterDesc}>
          {inp('afterDesc', { placeholder: 'e.g. All lights repaired and commissioned' })}
        </F>
      </div>

      {/* Channel selection */}
      <div className="notif-cf-field full">
        <label>Notification Channels*</label>
        <div className="notif-channel-row">
          {Object.keys(CHANNEL_META).map(ch => {
            const active = form.channels.includes(ch)
            const m = CHANNEL_META[ch]
            return (
              <button
                key={ch}
                className={`notif-ch-btn${active ? ' active' : ''}`}
                style={active ? { background: m.bg, color: m.color, borderColor: m.color } : {}}
                onClick={() => toggleChannel(ch)}
              >{ch}</button>
            )
          })}
        </div>
        {errors.channels && <span className="notif-cf-error">{errors.channels}</span>}
      </div>

      {/* Live preview */}
      {(form.beforeDesc || form.afterDesc) && (
        <div className="notif-cf-preview">
          <div className="notif-cf-preview-label">Before / After Preview</div>
          <BeforeAfterVisual notif={{ beforeDesc: form.beforeDesc || '…', afterDesc: form.afterDesc || '…', visualType: form.visualType }} compact />
        </div>
      )}

      <div className="notif-cf-actions">
        <button className="notif-cf-btn secondary" onClick={onCancel}>Cancel</button>
        <button className="notif-cf-btn primary" onClick={submit}>
          <Send size={14} /> Send Notification
        </button>
      </div>
    </div>
  )
}

// ── Detail panel ────────────────────────────────────────────────────────────
function NotifDetail({ notif }) {
  if (!notif) return (
    <div className="notif-detail-empty">
      <Bell size={40} strokeWidth={1.2} />
      <p>Select a notification to view its details.</p>
    </div>
  )
  const tc = TYPE_CFG[notif.type] || TYPE_CFG.update
  const TIcon = tc.Icon

  return (
    <div className="notif-detail-scroll">
      <div className="notif-detail-head">
        <div className="notif-detail-type" style={{ background: tc.bg, color: tc.color }}>
          <TIcon size={13} /> {tc.label}
        </div>
        <div className="notif-detail-title">{notif.title}</div>
        <div className="notif-detail-meta-row">
          <span>{notif.booth}</span>
          <span>{notif.resolvedDate}</span>
          <span>By: {notif.resolvedBy}</span>
          <span>Ref: {notif.issueRef}</span>
        </div>
      </div>

      <p className="notif-detail-body">{notif.body}</p>

      <div className="notif-detail-section-label">Before &amp; After Proof</div>
      <BeforeAfterVisual notif={notif} />

      {/* Delivery stats */}
      <div className="notif-detail-section-label">Delivery Statistics</div>
      <div className="notif-delivery-stats">
        <div className="notif-ds-card">
          <div className="notif-ds-num" style={{ color: '#3b82f6' }}>{notif.sentTo.toLocaleString('en-IN')}</div>
          <div className="notif-ds-label">Sent</div>
        </div>
        <div className="notif-ds-card">
          <div className="notif-ds-num" style={{ color: '#10b981' }}>{Math.round(notif.sentTo * 0.91).toLocaleString('en-IN')}</div>
          <div className="notif-ds-label">Delivered</div>
        </div>
        <div className="notif-ds-card">
          <div className="notif-ds-num" style={{ color: '#8b5cf6' }}>{Math.round(notif.sentTo * 0.64).toLocaleString('en-IN')}</div>
          <div className="notif-ds-label">Read / Opened</div>
        </div>
      </div>

      <div className="notif-channel-tags">
        {notif.channels.map(ch => (
          <span key={ch} className="notif-ch-tag"
            style={{ background: CHANNEL_META[ch]?.bg, color: CHANNEL_META[ch]?.color }}>
            {ch}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function Notifications() {
  const { showToast } = useApp()
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(NOTIFICATIONS[0]?.id ?? null)
  const [mode, setMode] = useState('detail') // 'detail' | 'compose'

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter)
  const selectedNotif = notifs.find(n => n.id === selected)

  const totalSent    = notifs.reduce((s, n) => s + n.sentTo, 0)
  const resolvedCnt  = notifs.filter(n => n.type === 'resolved').length
  const pendingCnt   = notifs.filter(n => n.type === 'in-progress').length

  const addNotif = (n) => {
    setNotifs(prev => [n, ...prev])
    setSelected(n.id)
    setMode('detail')
    showToast(`Notification "${n.title}" sent to ${n.sentTo.toLocaleString()} residents!`)
  }

  const FILTER_TABS = [
    { id: 'all',          label: `All (${notifs.length})` },
    { id: 'resolved',     label: 'Resolved'    },
    { id: 'in-progress',  label: 'In Progress' },
    { id: 'update',       label: 'Updates'     },
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-subtitle">Send proof-of-resolution alerts with before &amp; after evidence to citizens</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setMode('compose'); setSelected(null) }}>
            <Plus size={14} /> New Notification
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="notif-kpi-row">
        <div className="notif-kpi-card">
          <div className="notif-kpi-icon" style={{ background: 'rgba(59,130,246,.1)', color: '#3b82f6' }}><Megaphone size={18} /></div>
          <div><div className="notif-kpi-num">{notifs.length}</div><div className="notif-kpi-label">Total Sent</div></div>
        </div>
        <div className="notif-kpi-card">
          <div className="notif-kpi-icon" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981' }}><CheckCircle2 size={18} /></div>
          <div><div className="notif-kpi-num">{resolvedCnt}</div><div className="notif-kpi-label">Resolved Alerts</div></div>
        </div>
        <div className="notif-kpi-card">
          <div className="notif-kpi-icon" style={{ background: 'rgba(245,158,11,.1)', color: '#f59e0b' }}><Clock size={18} /></div>
          <div><div className="notif-kpi-num">{pendingCnt}</div><div className="notif-kpi-label">In Progress</div></div>
        </div>
        <div className="notif-kpi-card">
          <div className="notif-kpi-icon" style={{ background: 'rgba(139,92,246,.1)', color: '#8b5cf6' }}><Users size={18} /></div>
          <div><div className="notif-kpi-num">{totalSent.toLocaleString('en-IN')}</div><div className="notif-kpi-label">Citizens Notified</div></div>
        </div>
        <div className="notif-kpi-card">
          <div className="notif-kpi-icon" style={{ background: 'rgba(99,102,241,.1)', color: '#6366f1' }}><BarChart2 size={18} /></div>
          <div><div className="notif-kpi-num">91%</div><div className="notif-kpi-label">Delivery Rate</div></div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="notif-page-layout">
        {/* Left: list */}
        <div className="notif-list-panel">
          <div className="notif-filter-tabs">
            {FILTER_TABS.map(t => (
              <button key={t.id} className={`notif-ftab${filter === t.id ? ' active' : ''}`}
                onClick={() => setFilter(t.id)}>{t.label}</button>
            ))}
          </div>
          <div className="notif-list-items">
            {filtered.length === 0 && (
              <div className="notif-list-empty">No notifications match this filter.</div>
            )}
            {filtered.map(n => {
              const tc = TYPE_CFG[n.type] || TYPE_CFG.update
              const TIcon = tc.Icon
              return (
                <div
                  key={n.id}
                  className={`notif-list-item${selected === n.id ? ' selected' : ''}${!n.read ? ' unread' : ''}`}
                  onClick={() => { setSelected(n.id); setMode('detail') }}
                >
                  <div className="notif-item-icon" style={{ background: tc.bg, color: tc.color, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TIcon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="notif-item-title" style={{ fontSize: '.84rem', marginBottom: '.25rem' }}>{n.title}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem .5rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                      <span className="notif-type-pill" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                      <span>{n.booth}</span>
                      <span>{n.time}</span>
                    </div>
                  </div>
                  {!n.read && <div className="notif-unread-dot" style={{ marginTop: 4 }} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: detail or compose */}
        <div className="notif-right-panel">
          {mode === 'compose'
            ? <ComposeForm onSubmit={addNotif} onCancel={() => setMode('detail')} />
            : <NotifDetail notif={selectedNotif} />
          }
        </div>
      </div>
    </div>
  )
}
