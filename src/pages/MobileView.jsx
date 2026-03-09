import { useState } from 'react'
import { FIELD_WORKERS } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import { Smartphone, Check, X } from 'lucide-react'

const SCREENS = ['Add Voter','Update Status','File Complaint','Survey','Scheme Check']

function AddVoterScreen() {
  return (
    <div>
      <div className="mobile-form-title">Add New Voter</div>
      <div className="mobile-form-group"><label>Full Name</label><input className="mobile-input" placeholder="Enter voter name" defaultValue="Ramesh Kumar" /></div>
      <div className="mobile-form-row">
        <div className="mobile-form-group half"><label>Age</label><input className="mobile-input" placeholder="Age" defaultValue="45" /></div>
        <div className="mobile-form-group half"><label>Gender</label>
          <select className="mobile-input"><option>Male</option><option>Female</option><option>Other</option></select>
        </div>
      </div>
      <div className="mobile-form-group"><label>Phone</label><input className="mobile-input" placeholder="Mobile number" defaultValue="98765 43210" /></div>
      <div className="mobile-form-group"><label>Booth</label>
        <select className="mobile-input"><option>Booth A</option><option>Booth B</option><option>Booth C</option></select>
      </div>
      <div className="mobile-form-group"><label>Category</label>
        <select className="mobile-input"><option>Farmer</option><option>Student</option><option>Senior Citizen</option><option>Women</option><option>Business</option></select>
      </div>
      <button className="mobile-btn primary">Submit Voter</button>
    </div>
  )
}

function UpdateScreen() {
  const [found, setFound] = useState(false)
  return (
    <div>
      <div className="mobile-form-title">Update Voter Status</div>
      <div className="mobile-search-voter">
        <div className="mobile-form-group"><label>Search Voter ID</label>
          <input className="mobile-input" placeholder="e.g. V-001" defaultValue="V-001" />
        </div>
        <button className="mobile-btn secondary" onClick={() => setFound(true)}>Search</button>
        {found && (
          <div className="mobile-voter-result">
            <div className="mvr-name">Ravi Shankar</div>
            <div className="mvr-id">V-001 · Booth A · Farmer</div>
          </div>
        )}
      </div>
      {found && (
        <>
          <div className="mobile-form-group"><label>New Status</label>
            <select className="mobile-input"><option>Active</option><option>Inactive</option><option>Pending</option></select>
          </div>
          <button className="mobile-btn primary">Update</button>
        </>
      )}
    </div>
  )
}

function ComplaintScreen() {
  const [priority, setPriority] = useState('Medium')
  return (
    <div>
      <div className="mobile-form-title">File Complaint</div>
      <div className="mobile-form-group"><label>Category</label>
        <select className="mobile-input"><option>Water Supply</option><option>Roads</option><option>Electricity</option><option>Healthcare</option></select>
      </div>
      <div className="mobile-form-group"><label>Description</label>
        <textarea className="mobile-input" rows={3} style={{resize:'none'}} defaultValue="Road near main junction is severely damaged." />
      </div>
      <div className="mobile-form-group">
        <label>Priority</label>
        <div className="priority-btns">
          {['Low','Medium','High'].map(p => (
            <button key={p} className={`prio-btn${priority===p?' active':''}`} onClick={() => setPriority(p)}>{p}</button>
          ))}
        </div>
      </div>
      <button className="mobile-btn primary">Submit Complaint</button>
    </div>
  )
}

function SurveyScreen() {
  const [answers, setAnswers] = useState({})
  const Qs = [
    { q: 'How satisfied with water supply?', opts: ['Very Good','Good','Average','Poor'] },
    { q: 'Top priority issue in your area?', opts: ['Roads','Water','Jobs','Health','Schools'] },
    { q: 'Would you vote in next election?', opts: ['Definitely','Likely','Unlikely','No'] },
  ]
  return (
    <div>
      <div className="mobile-form-title">Voter Survey</div>
      {Qs.map((q, i) => (
        <div className="survey-q" key={i}>
          <div className="sq-label">{i+1}. {q.q}</div>
          <div className="survey-options">
            {q.opts.map(o => (
              <button key={o} className={`srv-opt${answers[i]===o?' active':''}`} onClick={() => setAnswers(a => ({...a,[i]:o}))}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="mobile-btn primary" style={{marginTop:'.5rem'}}>Submit Survey</button>
    </div>
  )
}

function SchemeScreen() {
  const [checked, setChecked] = useState(false)
  const SCHEMES = [
    { name: 'PM Kisan Samman Nidhi', eligible: true },
    { name: 'Ayushman Bharat', eligible: true },
    { name: 'PM Awas Yojana', eligible: false },
    { name: 'Pradhan Mantri Ujjwala Yojana', eligible: true },
    { name: 'Scholarship for Students', eligible: false },
  ]
  return (
    <div>
      <div className="mobile-form-title">Scheme Eligibility Check</div>
      <div className="mobile-form-group"><label>Category</label>
        <select className="mobile-input"><option>Farmer</option><option>BPL Family</option><option>Senior Citizen</option></select>
      </div>
      <div className="mobile-form-group">
        <label>Annual Income (₹)</label>
        <input className="mobile-input" defaultValue="1,20,000" />
      </div>
      <button className="mobile-btn secondary" onClick={() => setChecked(true)}>Check Eligibility</button>
      {checked && (
        <div className="scheme-result-card">
          <div className="scheme-result-title">Eligible Schemes</div>
          {SCHEMES.map(s => (
            <div key={s.name} className={`scheme-result-item ${s.eligible?'eligible':'ineligible'}`}>
              {s.eligible ? <Check size={13}/> : <X size={13}/>} {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SCREEN_COMPONENTS = [AddVoterScreen, UpdateScreen, ComplaintScreen, SurveyScreen, SchemeScreen]

export default function MobileView() {
  const { showToast } = useApp()
  const [activeScreen, setActiveScreen] = useState(0)
  const ScreenComp = SCREEN_COMPONENTS[activeScreen]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mobile Field App</div>
          <div className="page-subtitle">Preview the field worker mobile application</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => showToast('QR code generated for mobile!')}>
            <Smartphone size={14}/>Get QR Code
          </button>
        </div>
      </div>

      <div className="mobile-demo-layout">
        {/* Left info */}
        <div className="mobile-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Field Workers</span></div>
            {FIELD_WORKERS.map(fw => (
              <div className="field-worker-row" key={fw.id}>
                <div className="fw-avatar" style={{ background: fw.color }}>{fw.initials}</div>
                <div>
                  <div className="fw-name">{fw.name}</div>
                  <div className="fw-booth">{fw.booth}</div>
                </div>
                <div className={`fw-status ${fw.online ? 'online' : 'offline'}`} style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Today's Stats</span></div>
            {[['Voters Added','34'],['Surveys Done','18'],['Issues Filed','7'],['Schemes Checked','12']].map(([l,v])=>(
              <div className="stat-row" key={l}><span>{l}</span><strong>{v}</strong></div>
            ))}
          </div>
        </div>

        {/* Device */}
        <div>
          <div className="screen-tabs">
            {SCREENS.map((s, i) => (
              <button key={s} className={`screen-tab${activeScreen===i?' active':''}`} onClick={() => setActiveScreen(i)}>{s}</button>
            ))}
          </div>
          <div className="mobile-device">
            <div className="mobile-status-bar">
              <span>9:41 AM</span>
              <div className="mobile-icons">
                <span>●●●</span><span>WiFi</span><span>🔋</span>
              </div>
            </div>
            <div className="mobile-app-header">
              <div className="mobile-app-title">BoothAI Field App</div>
            </div>
            <div className="mobile-screen">
              <ScreenComp />
            </div>
          </div>
        </div>

        {/* Right info */}
        <div className="mobile-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">App Features</span></div>
            {['Offline mode support','Real-time data sync','GPS location tracking','Photo capture','Voice input (8 languages)','Biometric verification'].map(f => (
              <div key={f} style={{ display:'flex',alignItems:'center',gap:'.5rem',padding:'.3rem 0',fontSize:'.82rem',color:'var(--text-secondary)',borderBottom:'1px solid var(--border)' }}>
                <Check size={13} color="#10b981" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
