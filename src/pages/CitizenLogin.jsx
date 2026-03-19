import { useState, useEffect, useRef } from 'react'
import {
  Shield, Smartphone, ChevronRight, CheckCircle2, RefreshCw,
  User, Calendar, CreditCard, MapPin, Landmark, Building2,
  Home, FileText, Users, Briefcase, IndianRupee, Heart
} from 'lucide-react'
import { OCCUPATIONS, DISTRICTS, CASTE_CATEGORIES, EMPLOYMENT_STATUSES, GENDERS, MARITAL_STATUSES, AREA_TYPES } from '../data/formConstants'

export default function CitizenLogin({ onLogin }) {
  const [step, setStep] = useState('mobile') // 'mobile' | 'otp' | 'registration' | 'success'
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [mobileErr, setMobileErr] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const otpRefs = useRef([])

  const [formData, setFormData] = useState({
    // Personal
    name: '',
    gender: '',
    age: '',
    voterId: '',
    maritalStatus: '',
    // Location
    district: '',
    assemblyConstituencyAc: '',
    boothId: '',
    houseNumber: '',
    partNumber: '',
    partName: '',
    section: '',
    area: '',
    // Category
    casteCategory: '',
    isDisability: false,
    isMinority: false,
    // Employment & Education
    isStudent: false,
    employmentStatus: '',
    isGovernmentEmployee: false,
    occupation: '',
    // Economic
    isBpl: false,
    annualIncome: '',
  })

  // Countdown for OTP resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Trigger login once success
  useEffect(() => {
    if (step === 'success') {
      setTimeout(() => onLogin({ mobile, ...formData }), 1500)
    }
  }, [step])

  const updateForm = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
    setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  // ── Mobile step ──────────────────────────────────────────────────
  const submitMobile = () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileErr('Enter a valid 10-digit Indian mobile number')
      return
    }
    setMobileErr('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      setCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 80)
    }, 1000)
  }

  // ── OTP step ─────────────────────────────────────────────────────
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
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('registration')
    }, 1000)
  }

  // ── Registration submit ──────────────────────────────────────────
  const validateAndSubmit = () => {
    const errors = {}
    if (!formData.name.trim())              errors.name = 'Full name is required'
    if (!formData.gender)                   errors.gender = 'Select gender'
    if (!formData.age || isNaN(formData.age) || Number(formData.age) < 18)
                                            errors.age = 'Enter valid age (18+)'
    if (!formData.voterId.trim())           errors.voterId = 'Voter ID is required'
    if (!formData.maritalStatus)            errors.maritalStatus = 'Select marital status'
    if (!formData.district)                 errors.district = 'Select district'
    if (!formData.assemblyConstituencyAc.trim()) errors.assemblyConstituencyAc = 'AC name is required'
    if (!formData.boothId.trim())           errors.boothId = 'Booth ID is required'
    if (!formData.area)                     errors.area = 'Select area type'
    if (!formData.casteCategory)            errors.casteCategory = 'Select caste category'
    if (!formData.employmentStatus)         errors.employmentStatus = 'Select employment status'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      // Scroll to first error
      const firstKey = Object.keys(errors)[0]
      document.getElementById(`reg-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 900)
  }

  // ── Helpers ──────────────────────────────────────────────────────
  const showOccupation = formData.employmentStatus === 'Employed' || formData.employmentStatus === 'Self_Employed'
  const showGovtEmployee = formData.employmentStatus === 'Employed'

  return (
    <div className="dgl-page">
      {/* Top strip */}
      <div className="dgl-topstrip">
        <div className="dgl-topstrip-inner">
          <div className="dgl-topstrip-brand">
            <Shield size={17} />
            <span>Booth Management System</span>
          </div>
          <div className="dgl-topstrip-gov">Voter Profile Verification Portal</div>
        </div>
      </div>

      <div className="dgl-body">
        {/* Left panel — hidden during registration */}
        {step !== 'registration' && (
          <div className="dgl-left">
            <div className="dgl-brand-logo"><Shield size={52} strokeWidth={1.5} /></div>
            <div className="dgl-brand-name">DigiLocker Auth</div>
            <div className="dgl-brand-tagline">Secure Identity Verification</div>
            <div className="dgl-features">
              <div className="dgl-feature"><CheckCircle2 size={15} /><span>Real-time Voter ID matching</span></div>
              <div className="dgl-feature"><CheckCircle2 size={15} /><span>Family linkage via Address</span></div>
              <div className="dgl-feature"><CheckCircle2 size={15} /><span>Automated Scheme Eligibility</span></div>
            </div>
          </div>
        )}

        <div className={step === 'registration' ? 'dgl-center' : 'dgl-right'}>
          <div className="dgl-card" style={step === 'registration' ? { maxWidth: 680, width: '100%' } : {}}>

            {/* Card header */}
            <div className="dgl-card-head">
              <div className="dgl-card-icon-wrap"><Shield size={20} /></div>
              <div>
                <div className="dgl-card-title">
                  {step === 'registration' ? 'Voter Profile Registration' : 'Sign in via DigiLocker'}
                </div>
                <div className="dgl-card-sub">
                  {step === 'registration' ? 'Fill in your details to complete registration' : 'Booth Management Service'}
                </div>
              </div>
            </div>

            {/* ── Step: Mobile ───────────────────────────────── */}
            {step === 'mobile' && (
              <div className="dgl-step-wrap">
                <div className="dgl-step-label"><Smartphone size={14} /> Enter your mobile number</div>
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
                {mobileErr && <div className="dgl-err-msg">{mobileErr}</div>}
                <button className={`dgl-btn${loading ? ' loading' : ''}`} onClick={submitMobile} disabled={loading}>
                  {loading ? <><RefreshCw size={15} className="dgl-spin" /> Sending OTP…</> : <>Get OTP <ChevronRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ── Step: OTP ──────────────────────────────────── */}
            {step === 'otp' && (
              <div className="dgl-step-wrap">
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
                <button className={`dgl-btn${loading ? ' loading' : ''}`} onClick={submitOtp} disabled={loading}>
                  {loading
                    ? <><RefreshCw size={15} className="dgl-spin" /> Verifying…</>
                    : <>Verify &amp; Continue <ChevronRight size={16} /></>
                  }
                </button>
              </div>
            )}

            {/* ── Step: Registration Form ─────────────────────── */}
            {step === 'registration' && (
              <div className="dgl-step-wrap" style={{ padding: 0 }}>
                <form
                  onSubmit={e => { e.preventDefault(); validateAndSubmit() }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                  noValidate
                >

                  {/* ── Section 1: Personal Information ── */}
                  <RegSection title="Personal Information" icon={<User size={15} />}>
                    <div className="reg-row">
                      <RegField id="reg-name" label="Full Name *" error={formErrors.name} col="2">
                        <input
                          id="reg-name"
                          className={`reg-input${formErrors.name ? ' reg-input-err' : ''}`}
                          type="text"
                          placeholder="e.g. Aarav Sharma"
                          value={formData.name}
                          onChange={e => updateForm('name', e.target.value)}
                        />
                      </RegField>

                      <RegField id="reg-gender" label="Gender *" error={formErrors.gender}>
                        <select
                          id="reg-gender"
                          className={`reg-select${formErrors.gender ? ' reg-input-err' : ''}`}
                          value={formData.gender}
                          onChange={e => updateForm('gender', e.target.value)}
                        >
                          <option value="">Select gender</option>
                          {GENDERS.map(g => <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>)}
                        </select>
                      </RegField>

                      <RegField id="reg-age" label="Age *" error={formErrors.age}>
                        <input
                          id="reg-age"
                          className={`reg-input${formErrors.age ? ' reg-input-err' : ''}`}
                          type="number"
                          min="18"
                          max="120"
                          placeholder="e.g. 32"
                          value={formData.age}
                          onChange={e => updateForm('age', e.target.value)}
                        />
                      </RegField>

                      <RegField id="reg-maritalStatus" label="Marital Status *" error={formErrors.maritalStatus}>
                        <select
                          id="reg-maritalStatus"
                          className={`reg-select${formErrors.maritalStatus ? ' reg-input-err' : ''}`}
                          value={formData.maritalStatus}
                          onChange={e => updateForm('maritalStatus', e.target.value)}
                        >
                          <option value="">Select status</option>
                          {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </RegField>

                      <RegField id="reg-voterId" label="Voter ID *" error={formErrors.voterId} col="2">
                        <input
                          id="reg-voterId"
                          className={`reg-input${formErrors.voterId ? ' reg-input-err' : ''}`}
                          type="text"
                          placeholder="e.g. ABC1234567"
                          value={formData.voterId}
                          onChange={e => updateForm('voterId', e.target.value.toUpperCase())}
                        />
                      </RegField>
                    </div>
                  </RegSection>

                  {/* ── Section 2: Location & Booth Details ── */}
                  <RegSection title="Location & Booth Details" icon={<MapPin size={15} />}>
                    <div className="reg-row">
                      <RegField id="reg-district" label="District *" error={formErrors.district}>
                        <select
                          id="reg-district"
                          className={`reg-select${formErrors.district ? ' reg-input-err' : ''}`}
                          value={formData.district}
                          onChange={e => updateForm('district', e.target.value)}
                        >
                          <option value="">Select district</option>
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </RegField>

                      <RegField id="reg-area" label="Area Type *" error={formErrors.area}>
                        <select
                          id="reg-area"
                          className={`reg-select${formErrors.area ? ' reg-input-err' : ''}`}
                          value={formData.area}
                          onChange={e => updateForm('area', e.target.value)}
                        >
                          <option value="">Select area</option>
                          {AREA_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </RegField>

                      <RegField id="reg-assemblyConstituencyAc" label="Assembly Constituency (AC) *" error={formErrors.assemblyConstituencyAc} col="2">
                        <input
                          id="reg-assemblyConstituencyAc"
                          className={`reg-input${formErrors.assemblyConstituencyAc ? ' reg-input-err' : ''}`}
                          type="text"
                          placeholder="e.g. Panchkula AC"
                          value={formData.assemblyConstituencyAc}
                          onChange={e => updateForm('assemblyConstituencyAc', e.target.value)}
                        />
                      </RegField>

                      <RegField id="reg-boothId" label="Booth ID *" error={formErrors.boothId}>
                        <input
                          id="reg-boothId"
                          className={`reg-input${formErrors.boothId ? ' reg-input-err' : ''}`}
                          type="text"
                          placeholder="e.g. B-141"
                          value={formData.boothId}
                          onChange={e => updateForm('boothId', e.target.value.toUpperCase())}
                        />
                      </RegField>

                      <RegField id="reg-partNumber" label="Part Number">
                        <input
                          id="reg-partNumber"
                          className="reg-input"
                          type="text"
                          placeholder="e.g. 12"
                          value={formData.partNumber}
                          onChange={e => updateForm('partNumber', e.target.value)}
                        />
                      </RegField>

                      <RegField id="reg-partName" label="Part Name" col="2">
                        <input
                          id="reg-partName"
                          className="reg-input"
                          type="text"
                          placeholder="e.g. Ward 5 North"
                          value={formData.partName}
                          onChange={e => updateForm('partName', e.target.value)}
                        />
                      </RegField>

                      <RegField id="reg-houseNumber" label="House Number">
                        <input
                          id="reg-houseNumber"
                          className="reg-input"
                          type="text"
                          placeholder="e.g. 14-A"
                          value={formData.houseNumber}
                          onChange={e => updateForm('houseNumber', e.target.value)}
                        />
                      </RegField>

                      <RegField id="reg-section" label="Section">
                        <input
                          id="reg-section"
                          className="reg-input"
                          type="text"
                          placeholder="e.g. Section C"
                          value={formData.section}
                          onChange={e => updateForm('section', e.target.value)}
                        />
                      </RegField>
                    </div>
                  </RegSection>

                  {/* ── Section 3: Category & Social Profile ── */}
                  <RegSection title="Category & Social Profile" icon={<Users size={15} />}>
                    <div className="reg-row">
                      <RegField id="reg-casteCategory" label="Caste Category *" error={formErrors.casteCategory}>
                        <select
                          id="reg-casteCategory"
                          className={`reg-select${formErrors.casteCategory ? ' reg-input-err' : ''}`}
                          value={formData.casteCategory}
                          onChange={e => updateForm('casteCategory', e.target.value)}
                        >
                          <option value="">Select category</option>
                          {CASTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </RegField>

                      <RegField label="Additional Identifiers">
                        <div className="reg-checks">
                          <label className="reg-check">
                            <input type="checkbox" checked={formData.isDisability} onChange={e => updateForm('isDisability', e.target.checked)} />
                            <span>Person with Disability</span>
                          </label>
                          <label className="reg-check">
                            <input type="checkbox" checked={formData.isMinority} onChange={e => updateForm('isMinority', e.target.checked)} />
                            <span>Minority Community</span>
                          </label>
                          <label className="reg-check">
                            <input type="checkbox" checked={formData.isStudent} onChange={e => updateForm('isStudent', e.target.checked)} />
                            <span>Currently a Student</span>
                          </label>
                        </div>
                      </RegField>
                    </div>
                  </RegSection>

                  {/* ── Section 4: Employment ── */}
                  <RegSection title="Employment Details" icon={<Briefcase size={15} />}>
                    <div className="reg-row">
                      <RegField id="reg-employmentStatus" label="Employment Status *" error={formErrors.employmentStatus}>
                        <select
                          id="reg-employmentStatus"
                          className={`reg-select${formErrors.employmentStatus ? ' reg-input-err' : ''}`}
                          value={formData.employmentStatus}
                          onChange={e => {
                            updateForm('employmentStatus', e.target.value)
                            // Reset downstream fields on change
                            updateForm('isGovernmentEmployee', false)
                            updateForm('occupation', '')
                          }}
                        >
                          <option value="">Select status</option>
                          {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                      </RegField>

                      {showGovtEmployee && (
                        <RegField label="Government Employee?">
                          <div className="reg-checks">
                            <label className="reg-check">
                              <input
                                type="checkbox"
                                checked={formData.isGovernmentEmployee}
                                onChange={e => updateForm('isGovernmentEmployee', e.target.checked)}
                              />
                              <span>Yes, I am a Government Employee</span>
                            </label>
                          </div>
                        </RegField>
                      )}

                      {showOccupation && (
                        <RegField id="reg-occupation" label="Occupation">
                          <select
                            id="reg-occupation"
                            className="reg-select"
                            value={formData.occupation}
                            onChange={e => updateForm('occupation', e.target.value)}
                          >
                            <option value="">Select occupation</option>
                            {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </RegField>
                      )}
                    </div>
                  </RegSection>

                  {/* ── Section 5: Economic Profile ── */}
                  <RegSection title="Economic Profile" icon={<IndianRupee size={15} />}>
                    <div className="reg-row">
                      <RegField label="BPL Status">
                        <div className="reg-checks">
                          <label className="reg-check">
                            <input type="checkbox" checked={formData.isBpl} onChange={e => updateForm('isBpl', e.target.checked)} />
                            <span>I hold a BPL (Below Poverty Line) card</span>
                          </label>
                        </div>
                      </RegField>

                      <RegField id="reg-annualIncome" label="Family Annual Income (₹)">
                        <input
                          id="reg-annualIncome"
                          className="reg-input"
                          type="number"
                          min="0"
                          placeholder="e.g. 180000"
                          value={formData.annualIncome}
                          onChange={e => updateForm('annualIncome', e.target.value)}
                        />
                      </RegField>
                    </div>
                  </RegSection>

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`dgl-btn${loading ? ' loading' : ''}`}
                    disabled={loading}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {loading
                      ? <><RefreshCw size={15} className="dgl-spin" /> Submitting…</>
                      : <>Complete Registration <ChevronRight size={16} /></>
                    }
                  </button>
                </form>
              </div>
            )}

            {/* ── Step: Success ─────────────────────────────────────── */}
            {step === 'success' && (
              <div className="dgl-success-wrap">
                <div className="dgl-success-icon"><CheckCircle2 size={44} /></div>
                <div className="dgl-success-title">Verification Successful</div>
                <p>Welcome, {formData.name || 'Citizen'}. Redirecting to your portal…</p>
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

/* ── Sub-components ─────────────────────────────────────────────── */

function RegSection({ title, icon, children }) {
  return (
    <div className="reg-section">
      <div className="reg-section-title">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}

function RegField({ id, label, error, children, col }) {
  return (
    <div
      className="reg-field"
      style={col === '2' ? { gridColumn: 'span 2' } : {}}
    >
      {label && <label className="reg-label" htmlFor={id}>{label}</label>}
      {children}
      {error && <span className="reg-err">{error}</span>}
    </div>
  )
}
