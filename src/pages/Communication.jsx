import { useState } from 'react'
import { SEGMENTS, AI_MESSAGES, RECENT_CAMPAIGNS } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import { MessageSquare, Phone, Bell, Mail, RefreshCw, Send, Users2 } from 'lucide-react'

const CHANNELS = [
  { id: 'sms',      label: 'SMS',      icon: MessageSquare, cls: 'sms'      },
  { id: 'whatsapp', label: 'WhatsApp', icon: Phone,         cls: 'whatsapp' },
  { id: 'app',      label: 'App Push', icon: Bell,          cls: 'app'      },
  { id: 'voice',    label: 'Voice',    icon: Phone,         cls: 'voice'    },
]

export default function Communication() {
  const { showToast } = useApp()
  const [selectedAudience, setSelectedAudience] = useState([])
  const [selectedChannel, setSelectedChannel] = useState('sms')
  const [msgIdx, setMsgIdx] = useState(0)
  const [msg, setMsg] = useState(AI_MESSAGES[0])

  const toggleAud = (id) => setSelectedAudience(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])

  const regenMsg = () => {
    const next = (msgIdx + 1) % AI_MESSAGES.length
    setMsgIdx(next); setMsg(AI_MESSAGES[next])
    showToast('AI message regenerated')
  }

  const totalReach = selectedAudience.reduce((acc, id) => {
    const seg = SEGMENTS.find(s => s.id === id)
    return acc + (seg ? seg.count : 0)
  }, 0)
  const maxReach = SEGMENTS.reduce((a, s) => a + s.count, 0)
  const reachPct = maxReach ? Math.round((totalReach / maxReach) * 100) : 0

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Communication Center</div>
          <div className="page-subtitle">Compose and send targeted messages to voter segments</div>
        </div>
      </div>

      <div className="comm-layout">
        {/* Compose Panel */}
        <div className="comm-compose">
          {/* Audience */}
          <div className="card">
            <div className="card-header"><span className="card-title"><Users2 size={14}/> Target Audience</span></div>
            <div className="form-group">
              <label>Select Segments</label>
              <div className="audience-chips">
                {SEGMENTS.map(s => (
                  <button
                    key={s.id}
                    className={`aud-chip${selectedAudience.includes(s.id) ? ' active' : ''}`}
                    onClick={() => toggleAud(s.id)}
                  >
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="reach-bar" style={{ marginTop: '.75rem' }}>
              <div className="reach-info">
                <span>Estimated Reach</span>
                <strong>{totalReach.toLocaleString()} voters</strong>
              </div>
              <div className="reach-progress-bg">
                <div className="reach-progress-fill" style={{ width: reachPct + '%' }} />
              </div>
              <div className="reach-pct">{reachPct}% of total voters</div>
            </div>
          </div>

          {/* Channel */}
          <div className="card">
            <div className="card-header"><span className="card-title">Channel</span></div>
            <div className="channel-grid">
              {CHANNELS.map(ch => {
                const Icon = ch.icon
                return (
                  <div
                    key={ch.id}
                    className={`channel-card${selectedChannel === ch.id ? ' active' : ''}`}
                    onClick={() => setSelectedChannel(ch.id)}
                  >
                    <div className={`channel-icon ${ch.cls}`}><Icon size={16}/></div>
                    {ch.label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Message</span>
              <span className="ai-tag"><RefreshCw size={11}/>AI-Generated</span>
            </div>
            <textarea
              className="msg-textarea"
              rows={5}
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.75rem' }}>
              <button className="btn btn-secondary" onClick={regenMsg} style={{ flex: 1 }}>
                <RefreshCw size={14}/>Regenerate
              </button>
              <button
                className="btn btn-primary pulse-btn"
                style={{ flex: 2 }}
                onClick={() => showToast(`Message sent to ${totalReach.toLocaleString() || 'all'} voters!`)}
              >
                <Send size={14}/>Send Campaign
              </button>
            </div>
          </div>
        </div>

        {/* Preview + Recent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Phone mockup */}
          <div className="card" style={{ padding: '1.1rem' }}>
            <div className="card-header"><span className="card-title">Preview</span></div>
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="sms-header">Booth Management</div>
                  <div className="sms-bubble">{msg}</div>
                  <div className="sms-time">Now · {selectedChannel.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="card" style={{ padding: '1.1rem' }}>
            <div className="card-header"><span className="card-title">Recent Sends</span></div>
            {RECENT_CAMPAIGNS.map((rc, i) => (
              <div className="rc-item" key={i}>
                <div className="rc-icon" style={{ background: rc.color + '22' }}>
                  <MessageSquare size={15} color={rc.color} />
                </div>
                <div className="rc-text">
                  <div className="rc-title">{rc.title}</div>
                  <div className="rc-meta">{rc.meta}</div>
                </div>
                <span className="rc-badge" style={{ background: rc.color + '22', color: rc.color }}>{rc.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
