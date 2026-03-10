import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Settings as SettingsIcon, User, Bell, Shield, Database, Save } from 'lucide-react'

function Toggle({ on, onToggle }) {
  return <div className={`toggle${on?' on':''}`} onClick={onToggle} role="switch" aria-checked={on} />
}

export default function Settings() {
  const { showToast } = useApp()

  const [profile, setProfile] = useState({ name: 'Neha Diwedi', email: 'neha@boothmanagement.gov', phone: '+91 98765 43210', role: 'Senior Booth Manager', constituency: 'Ward 8, Delhi' })

  const [notifs, setNotifs] = useState({ email: true, sms: false, push: true, issueAlerts: true, campaignUpdates: false, dailyReport: true })
  const [privacy, setPrivacy] = useState({ twoFactor: true, sessionLog: true, dataExport: false })
  const [data, setData] = useState({ autoBackup: true, realTime: true, analytics: false })

  const toggle = (setter, key) => setter(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage your account and application preferences</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => showToast('Settings saved successfully!')}><Save size={14}/>Save Changes</button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="card settings-card">
          <div className="settings-section-title"><User size={16} color="var(--primary)" />Profile Information</div>
          {Object.entries({ Name: 'name', 'Email Address': 'email', 'Phone Number': 'phone', Role: 'role', Constituency: 'constituency' }).map(([label, key]) => (
            <div className="settings-field" key={key}>
              <label>{label}</label>
              <input
                className="setting-input"
                value={profile[key]}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="card settings-card">
          <div className="settings-section-title"><Bell size={16} color="var(--primary)" />Notifications</div>
          {[
            ['Email Notifications', 'email', notifs],
            ['SMS Alerts', 'sms', notifs],
            ['Push Notifications', 'push', notifs],
            ['Issue Alerts', 'issueAlerts', notifs],
            ['Campaign Updates', 'campaignUpdates', notifs],
            ['Daily Report', 'dailyReport', notifs],
          ].map(([label, key, state]) => (
            <div className="settings-toggle-row" key={key}>
              <span>{label}</span>
              <Toggle on={state[key]} onToggle={() => toggle(setNotifs, key)} />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="card settings-card">
          <div className="settings-section-title"><Shield size={16} color="var(--primary)" />Security & Privacy</div>
          {[
            ['Two-Factor Authentication', 'twoFactor'],
            ['Session Activity Log', 'sessionLog'],
            ['Allow Data Export', 'dataExport'],
          ].map(([label, key]) => (
            <div className="settings-toggle-row" key={key}>
              <span>{label}</span>
              <Toggle on={privacy[key]} onToggle={() => toggle(setPrivacy, key)} />
            </div>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <button className="btn btn-secondary full-btn" onClick={() => showToast('Password reset email sent!')}>Change Password</button>
            <button className="btn btn-secondary full-btn" onClick={() => showToast('All sessions terminated!')}>Revoke All Sessions</button>
          </div>
        </div>

        {/* Data */}
        <div className="card settings-card">
          <div className="settings-section-title"><Database size={16} color="var(--primary)" />Data Management</div>
          {[
            ['Auto Backup (Daily)', 'autoBackup'],
            ['Real-time Sync', 'realTime'],
            ['Advanced Analytics', 'analytics'],
          ].map(([label, key]) => (
            <div className="settings-toggle-row" key={key}>
              <span>{label}</span>
              <Toggle on={data[key]} onToggle={() => toggle(setData, key)} />
            </div>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <button className="btn btn-secondary full-btn" onClick={() => showToast('Backup starting…')}>Backup Now</button>
            <button className="btn btn-secondary full-btn" onClick={() => showToast('Data cleared from cache!')}>Clear Cache</button>
            <button className="btn btn-secondary full-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }} onClick={() => showToast('Contact admin to delete account')}>Delete All Data</button>
          </div>
        </div>
      </div>
    </div>
  )
}
