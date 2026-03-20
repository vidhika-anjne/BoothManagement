import { useState, useEffect, useRef } from 'react'
import {
  Shield, Smartphone, ChevronRight, CheckCircle2, RefreshCw,
  AlertCircle
} from 'lucide-react'

const API_BASE = 'http://localhost:8080'

export default function CitizenLogin({ onLogin }) {
  const [step, setStep]         = useState('mobile')   // 'mobile' | 'otp' | 'success'
  const [mobile, setMobile]     = useState('')
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [mobileErr, setMobileErr] = useState('')
  const [otpErr, setOtpErr]     = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading]   = useState(false)
  // Voter profile fetched from backend
  const [profile, setProfile]   = useState(null)
  const otpRefs = useRef([])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Redirect to portal after success banner
  useEffect(() => {
    if (step === 'success' && profile) {
      setTimeout(() => onLogin({ mobile, ...profile }), 1500)
    }
  }, [step])

  // ── Step 1: Mobile number → backend lookup ────────────────────────
  const submitMobile = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileErr('Enter a valid 10-digit Indian mobile number')
      return
    }
    setMobileErr('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/citizen/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile }),
      })

      if (res.status === 404) {
        setMobileErr('This mobile number is not registered in the voter database. Please contact your Booth Officer.')
        return
      }
      if (!res.ok) {
        setMobileErr('Server error. Please try again later.')
        return
      }

      const voterProfile = await res.json()
      setProfile(voterProfile)
      setStep('otp')
      setCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 80)
    } catch {
      setMobileErr('Could not connect to the server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: OTP (always accepts any 6-digit code — demo) ─────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setOtpErr('')
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
    if (e.key === 'Enter') submitOtp()
  }

  const resendOtp = () => {
    setOtp(['', '', '', '', '', ''])
    setOtpErr('')
    setCountdown(30)
    setTimeout(() => otpRefs.current[0]?.focus(), 80)
  }

  const submitOtp = () => {
    if (otp.join('').length < 6) {
      setOtpErr('Enter the complete 6-digit OTP')
      return
    }
    // Demo: any 6-digit code is accepted
    setStep('success')
  }

  return (
    <div className="dgl-page">
      {/* Top strip */}
      <div className="dgl-topstrip">
        <div className="dgl-topstrip-inner">
          <div className="dgl-topstrip-brand">
            <Shield size={17} />
            <span>Booth Management System</span>
          </div>
          <div className="dgl-topstrip-gov">Voter Identity Verification Portal</div>
        </div>
      </div>

      <div className="dgl-body">
        {/* Left panel */}
        <div className="dgl-left">
          <div className="dgl-brand-logo"><Shield size={52} strokeWidth={1.5} /></div>
          <div className="dgl-brand-name">DigiLocker Auth</div>
          <div className="dgl-brand-tagline">Secure Voter Identity Verification</div>
          <div className="dgl-features">
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>Real-time Voter ID matching</span></div>
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>Instant scheme eligibility check</span></div>
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>Secure OTP authentication</span></div>
          </div>

          {/* Demo hint */}
          <div className="dgl-demo-hint">
            <strong>Demo credentials</strong>
            <p>Mobile numbers: <code>9810000001</code> to <code>9810000050</code></p>
            <p>OTP: any 6 digits (e.g. <code>123456</code>)</p>
          </div>
        </div>

        <div className="dgl-right">
          <div className="dgl-card">
            {/* Card header */}
            <div className="dgl-card-head">
              <div className="dgl-card-icon-wrap"><Shield size={20} /></div>
              <div>
                <div className="dgl-card-title">Sign in via DigiLocker</div>
                <div className="dgl-card-sub">Booth Management Service · Ward 8, Delhi</div>
              </div>
            </div>

            {/* ── Step: Mobile ─────────────────────────────── */}
            {step === 'mobile' && (
              <div className="dgl-step-wrap">
                <div className="dgl-step-label">
                  <Smartphone size={14} /> Enter your registered mobile number
                </div>
                <div className="dgl-mobile-row">
                  <span className="dgl-code">+91</span>
                  <input
                    className="dgl-input"
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && submitMobile()}
                    autoFocus
                    placeholder="98XXXXXXXX"
                  />
                </div>
                {mobileErr && (
                  <div className="dgl-err-msg" style={{ display: 'flex', alignItems: 'flex-start', gap: '.4rem' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {mobileErr}
                  </div>
                )}
                <button
                  className={`dgl-btn${loading ? ' loading' : ''}`}
                  onClick={submitMobile}
                  disabled={loading}
                >
                  {loading
                    ? <><RefreshCw size={15} className="dgl-spin" /> Verifying…</>
                    : <>Get OTP <ChevronRight size={16} /></>
                  }
                </button>
              </div>
            )}

            {/* ── Step: OTP ─────────────────────────────────── */}
            {step === 'otp' && (
              <div className="dgl-step-wrap">
                {/* Welcome banner */}
                {profile && (
                  <div className="dgl-voter-banner">
                    <div className="dgl-voter-avatar">{profile.name?.charAt(0) ?? '?'}</div>
                    <div>
                      <div className="dgl-voter-name">{profile.name}</div>
                      <div className="dgl-voter-meta">Voter ID: <strong>{profile.voterId}</strong> · Booth {profile.boothId}</div>
                    </div>
                  </div>
                )}

                <div className="dgl-step-label" style={{ marginBottom: '0.5rem' }}>
                  OTP sent to <strong>+91-{mobile.slice(0, 5)}XXXXX</strong>
                </div>
                <div className="dgl-otp-label">Enter 6-digit OTP</div>
                <div className="dgl-otp-inputs">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => (otpRefs.current[i] = el)}
                      className={`dgl-otp-box${otpErr ? ' err' : ''}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      onFocus={e => e.target.select()}
                    />
                  ))}
                </div>
                {otpErr && <div className="dgl-err-msg">{otpErr}</div>}
                <div className="dgl-resend">
                  {countdown > 0
                    ? <span className="dgl-countdown">Resend OTP in {countdown}s</span>
                    : <button className="dgl-resend-btn" onClick={resendOtp}>Resend OTP</button>
                  }
                </div>
                <button className="dgl-btn" onClick={submitOtp}>
                  Verify &amp; Continue <ChevronRight size={16} />
                </button>
                <button
                  className="dgl-resend-btn"
                  style={{ marginTop: '.5rem', fontSize: '.78rem' }}
                  onClick={() => { setStep('mobile'); setOtp(['','','','','','']); setOtpErr('') }}
                >
                  ← Change number
                </button>
              </div>
            )}

            {/* ── Step: Success ──────────────────────────────── */}
            {step === 'success' && (
              <div className="dgl-success-wrap">
                <div className="dgl-success-icon"><CheckCircle2 size={44} /></div>
                <div className="dgl-success-title">Verification Successful</div>
                <p>Welcome, {profile?.name ?? 'Citizen'}. Redirecting to your portal…</p>
              </div>
            )}

            {/* Footer */}
            <div className="dgl-card-footer">
              <span>Secured by DigiLocker</span>
              <span className="dgl-dot" />
              <span>MeitY, Govt. of India</span>
              <span className="dgl-dot" />
              <span>© 2026</span>
            </div>
          </div>

          <p className="dgl-privacy-note">
            By signing in, you agree to DigiLocker's Terms of Service and Privacy Policy.
            Your mobile number is used solely for OTP authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
