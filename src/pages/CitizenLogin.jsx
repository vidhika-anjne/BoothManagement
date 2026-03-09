import { useState, useEffect, useRef } from 'react'
import {
  Shield, Smartphone, ChevronRight, CheckCircle2,
  RefreshCw, ArrowLeft, Lock, FileText, Fingerprint,
} from 'lucide-react'

// ─── Demo prototype: any valid 10-digit Indian mobile + any 6-digit OTP ─────

export default function CitizenLogin({ onLogin }) {
  const [step, setStep] = useState('mobile')   // 'mobile' | 'otp' | 'success'
  const [mobile, setMobile] = useState('')
  const [otp, setOtp]       = useState(['', '', '', '', '', ''])
  const [mobileErr, setMobileErr] = useState('')
  const [otpErr, setOtpErr]       = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading]     = useState(false)
  const otpRefs = useRef([])

  // Countdown for resend OTP
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const submitMobile = () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileErr('Enter a valid 10-digit Indian mobile number')
      return
    }
    setMobileErr('')
    setLoading(true)
    // Simulate network delay
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      setCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 80)
    }, 1300)
  }

  // ── OTP box handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setOtpErr('')
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'Enter') submitOtp()
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < digits.length; i++) next[i] = digits[i]
    setOtp(next)
    const focus = Math.min(digits.length, 5)
    setTimeout(() => otpRefs.current[focus]?.focus(), 0)
  }

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const submitOtp = () => {
    if (otp.join('').length < 6) {
      setOtpErr('Enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
      // Short success flash → call onLogin
      setTimeout(() => onLogin({ mobile }), 1100)
    }, 1100)
  }

  const resendOtp = () => {
    setOtp(['', '', '', '', '', ''])
    setOtpErr('')
    setCountdown(30)
    otpRefs.current[0]?.focus()
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dgl-page">

      {/* ── Top strip ───────────────────────────────────────────────────── */}
      <div className="dgl-topstrip">
        <div className="dgl-topstrip-inner">
          <div className="dgl-topstrip-brand">
            <Shield size={17} />
            <span>DigiLocker</span>
          </div>
          <div className="dgl-topstrip-gov">
            Government of India &nbsp;·&nbsp; Ministry of Electronics &amp; Information Technology
          </div>
        </div>
      </div>

      <div className="dgl-body">

        {/* ── Left branding panel ─────────────────────────────────────── */}
        <div className="dgl-left">
          <div className="dgl-brand-logo">
            <Shield size={52} strokeWidth={1.5} />
          </div>
          <div className="dgl-brand-name">DigiLocker</div>
          <div className="dgl-brand-tagline">Your Digital Document Wallet</div>

          <div className="dgl-features">
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>Aadhaar-linked verified identity</span></div>
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>Access government-issued documents</span></div>
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>Accepted as valid ID proof nationally</span></div>
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>End-to-end encrypted &amp; secure</span></div>
            <div className="dgl-feature"><CheckCircle2 size={15} /><span>4.5 crore+ citizens registered</span></div>
          </div>

          <div className="dgl-badge-row">
            <div className="dgl-badge"><FileText size={13} /> ISO 27001</div>
            <div className="dgl-badge"><Fingerprint size={13} /> Aadhaar KYC</div>
          </div>

          <div className="dgl-demo-pill">
            <Lock size={11} />
            Demo mode — any number &amp; any OTP works
          </div>
        </div>

        {/* ── Right card panel ────────────────────────────────────────── */}
        <div className="dgl-right">
          <div className="dgl-card">
            <div className="dgl-card-head">
              <div className="dgl-card-icon-wrap">
                <Shield size={20} />
              </div>
              <div>
                <div className="dgl-card-title">Sign in via DigiLocker</div>
                <div className="dgl-card-sub">Ward 8 Citizen Service Portal</div>
              </div>
            </div>

            {/* ── Step: Mobile ──────────────────────────────────────── */}
            {step === 'mobile' && (
              <div className="dgl-step-wrap">
                <div className="dgl-step-label">
                  <Smartphone size={14} />
                  Enter your DigiLocker mobile number
                </div>

                <div className="dgl-mobile-row">
                  <span className="dgl-code">+91</span>
                  <input
                    className={`dgl-input${mobileErr ? ' err' : ''}`}
                    type="tel"
                    inputMode="numeric"
                    placeholder="XXXXX XXXXX"
                    maxLength={10}
                    value={mobile}
                    autoFocus
                    onChange={e => {
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                      setMobileErr('')
                    }}
                    onKeyDown={e => e.key === 'Enter' && submitMobile()}
                  />
                </div>

                {mobileErr && <div className="dgl-err-msg">{mobileErr}</div>}
                <p className="dgl-help">A one-time password will be sent to this number via SMS</p>

                <button
                  className={`dgl-btn${loading ? ' loading' : ''}`}
                  onClick={submitMobile}
                  disabled={loading}
                >
                  {loading
                    ? <><RefreshCw size={15} className="dgl-spin" /> Sending OTP…</>
                    : <>Get OTP &nbsp;<ChevronRight size={16} /></>
                  }
                </button>
              </div>
            )}

            {/* ── Step: OTP ─────────────────────────────────────────── */}
            {step === 'otp' && (
              <div className="dgl-step-wrap">
                <button className="dgl-back" onClick={() => { setStep('mobile'); setOtp(['','','','','','']) }}>
                  <ArrowLeft size={14} /> Change number
                </button>

                <div className="dgl-otp-sent-note">
                  OTP sent to <strong>+91-{mobile.slice(0, 5)}XXXXX</strong>
                </div>

                <div className="dgl-otp-label">Enter 6-digit OTP</div>

                <div className="dgl-otp-row" onPaste={handleOtpPaste}>
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

                <button
                  className={`dgl-btn${loading ? ' loading' : ''}`}
                  onClick={submitOtp}
                  disabled={loading}
                >
                  {loading
                    ? <><RefreshCw size={15} className="dgl-spin" /> Verifying…</>
                    : <>Verify &amp; Sign In &nbsp;<ChevronRight size={16} /></>
                  }
                </button>
              </div>
            )}

            {/* ── Step: Success ─────────────────────────────────────── */}
            {step === 'success' && (
              <div className="dgl-success-wrap">
                <div className="dgl-success-ring">
                  <CheckCircle2 size={44} />
                </div>
                <div className="dgl-success-title">Authenticated!</div>
                <div className="dgl-success-sub">Redirecting to Citizen Portal…</div>
              </div>
            )}

            <div className="dgl-card-footer">
              <span>Secured by DigiLocker</span>
              <span className="dgl-dot" />
              <span>MeitY, Govt. of India</span>
              <span className="dgl-dot" />
              <span>© 2026</span>
            </div>
          </div>

          {/* Privacy note below card */}
          <p className="dgl-privacy-note">
            By signing in, you agree to DigiLocker's Terms of Service and Privacy Policy.
            Your mobile number is used solely for OTP authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
