import { useState } from 'react'
import { X, Bell, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { NOTIFICATIONS } from '../../data/mockData.js'
import BeforeAfterVisual from './BeforeAfterVisual.jsx'

const TYPE_CFG = {
  resolved:     { label: 'Resolved',    bg: 'rgba(16,185,129,.12)', color: '#10b981', Icon: CheckCircle2 },
  'in-progress':{ label: 'In Progress', bg: 'rgba(245,158,11,.12)', color: '#f59e0b', Icon: Clock },
  update:       { label: 'Update',      bg: 'rgba(59,130,246,.12)', color: '#3b82f6', Icon: AlertCircle  },
}

export default function NotificationsPanel() {
  const { notifPanelOpen, setNotifPanelOpen, navigate } = useApp()
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const [expanded, setExpanded] = useState(null)

  const unread = notifs.filter(n => !n.read).length

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  const toggle = (id) => {
    setExpanded(prev => prev === id ? null : id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const viewAll = () => {
    setNotifPanelOpen(false)
    navigate('notifications')
  }

  return (
    <>
      {notifPanelOpen && (
        <div
          className="notif-overlay"
          onClick={() => setNotifPanelOpen(false)}
        />
      )}

      <aside className={`notif-panel${notifPanelOpen ? ' open' : ''}`}>
        {/* Header */}
        <div className="notif-panel-header">
          <div className="notif-panel-title">
            <Bell size={16} />
            <span>Notifications</span>
            {unread > 0 && <span className="notif-count-badge">{unread}</span>}
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
            <button className="notif-close-btn" onClick={() => setNotifPanelOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="notif-panel-list">
          {notifs.length === 0 && (
            <div className="notif-empty">No notifications yet.</div>
          )}
          {notifs.map(n => {
            const tc = TYPE_CFG[n.type] || TYPE_CFG.update
            const TIcon = tc.Icon
            const isOpen = expanded === n.id

            return (
              <div key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
                <div className="notif-item-top" onClick={() => toggle(n.id)}>
                  <div className="notif-item-icon" style={{ background: tc.bg, color: tc.color }}>
                    <TIcon size={15} />
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-meta">
                      <span className="notif-type-pill" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                      <span>{n.booth}</span>
                      <span>{n.time}</span>
                    </div>
                  </div>
                  {!n.read && <div className="notif-unread-dot" />}
                </div>

                {isOpen && (
                  <div className="notif-item-detail">
                    <p>{n.body}</p>
                    <BeforeAfterVisual notif={n} compact />
                    <div className="notif-detail-meta">
                      <div><span>Resolved by</span><strong>{n.resolvedBy}</strong></div>
                      <div><span>Date</span><strong>{n.resolvedDate}</strong></div>
                      <div><span>Notified</span><strong>{n.sentTo.toLocaleString()} residents</strong></div>
                      <div><span>Channels</span><strong>{n.channels.join(', ')}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="notif-panel-footer">
          <button className="notif-view-all" onClick={viewAll}>
            View All &amp; Manage <ArrowRight size={14} />
          </button>
        </div>
      </aside>
    </>
  )
}
