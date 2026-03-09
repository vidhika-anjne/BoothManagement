import { useState } from 'react'
import {
  User, Search, AlertCircle, Award, BarChart2, ClipboardList,
  Shield, Landmark, CheckCircle2, ArrowRight, ChevronRight,
  Info, Check, X, Star, Phone, Home, FileText
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { BOOTHS, ISSUES } from '../data/mockData.js'

// ─── Indian ID Validators ───────────────────────────────────────────────────
const AADHAAR_RE = /^\d{12}$/
const PAN_RE     = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const VOTER_RE   = /^[A-Z]{3}[0-9]{7}$/

function fmtAadhaar(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 12)
  return d.replace(/(.{4})(.{0,4})(.{0,4})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(' ')
  )
}

const CATEGORIES = ['Farmer', 'Student', 'Senior Citizen', 'Women', 'Business Owner', 'BPL Family', 'SC/ST', 'General']

const SCHEMES = {
  'PM Kisan Samman Nidhi':           { cats: ['Farmer'],                         maxIncome: 200000, desc: '₹6,000/year direct benefit for small & marginal farmers' },
  'Ayushman Bharat – PM-JAY':        { cats: ['BPL Family', 'Senior Citizen'],    maxIncome: 300000, desc: '₹5 lakh/year health insurance per family' },
  'PM Awas Yojana (Urban)':          { cats: ['BPL Family', 'Women', 'SC/ST'],    maxIncome: 180000, desc: 'Affordable housing subsidy for urban poor' },
  'Pradhan Mantri Ujjwala Yojana':   { cats: ['BPL Family', 'Women'],             maxIncome: 150000, desc: 'Free LPG connection + cylinder for BPL households' },
  'NS Scholarship (Post-Matric)':    { cats: ['Student', 'SC/ST'],                maxIncome: 250000, desc: 'Education scholarship for post-matric studies' },
  'Indira Gandhi Pension Scheme':    { cats: ['Senior Citizen', 'BPL Family'],    maxIncome: 120000, desc: '₹500–3,000/month old-age pension' },
  'MSME Mudra Loan':                 { cats: ['Business Owner'],                  maxIncome: 1500000, desc: 'Collateral-free loans up to ₹10 lakh for small businesses' },
  'PMFBY Crop Insurance':            { cats: ['Farmer'],                          maxIncome: 500000, desc: 'Insurance against crop loss due to natural calamities' },
  'Beti Bachao Beti Padhao':         { cats: ['Women'],                           maxIncome: 600000, desc: 'Education & welfare support for girl child' },
  'National Food Security (NFSA)':   { cats: ['BPL Family', 'SC/ST'],             maxIncome: 150000, desc: 'Subsidised grain @₹2–3/kg for BPL households' },
}

const SURVEY_QS = [
  { id: 'q1', text: 'How satisfied are you with drinking water supply in your area?',
    opts: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
  { id: 'q2', text: 'What is the most urgent issue in your locality?',
    opts: ['Roads / Drainage', 'Water Supply', 'Electricity', 'Healthcare', 'Schools', 'Jobs & Employment'] },
  { id: 'q3', text: 'Are you aware of the government schemes you are eligible for?',
    opts: ['Fully Aware', 'Partially Aware', 'Not Aware at All'] },
  { id: 'q4', text: 'How would you rate your Booth Officer\'s responsiveness?',
    opts: ['Excellent', 'Good', 'Average', 'Poor', 'Never Met Them'] },
  { id: 'q5', text: 'How confident are you that your vote will be counted correctly?',
    opts: ['Very Confident', 'Confident', 'Neutral', 'Not Confident'] },
  { id: 'q6', text: 'Would you recommend your neighbours to register as voters?',
    opts: ['Definitely Yes', 'Probably Yes', 'Not Sure', 'No'] },
]

const COMPLAINT_CATS = {
  'Water Supply':      ['Pipeline Leakage', 'Water Shortage / No Supply', 'Water Contamination', 'Burst Main', 'Meter Tamper', 'Other'],
  'Roads & Drainage':  ['Pothole / Crater', 'Open Drainage / Nala', 'Road Flooding', 'Broken Footpath', 'Pavement Encroachment', 'Other'],
  'Electricity':       ['Power Cut (Scheduled)', 'Unscheduled Outage', 'Voltage Fluctuation', 'Broken Street Light', 'Meter Issue', 'Other'],
  'Healthcare':        ['No Doctor at PHC', 'Medicine Shortage', 'Health Center Closed', 'Ambulance Unavailable', 'Unhygienic Conditions', 'Other'],
  'Sanitation':        ['Garbage Not Collected', 'Public Toilet Blocked', 'Open Defecation', 'Waste Dumping', 'Other'],
  'Education':         ['School / Anganwadi Closed', 'Teacher Absent', 'No Mid-Day Meal', 'Missing Infrastructure', 'Other'],
  'Infrastructure':    ['Broken Bridge / Culvert', 'Damaged Water Tank', 'Collapsed Wall', 'Public Property Damage', 'Other'],
  'Other':             ['Encroachment', 'Noise Pollution', 'Animal Nuisance', 'Other'],
}

// ─── MOCK DB for status check ──────────────────────────────────────────────
const VOTER_DB = [
  { voterId: 'MH2401001', name: 'Ramesh Yadav', aadhaar: '234567890123', dob: '1980-03-10', booth: 'Booth 142', status: 'Active', officer: 'Priya Singh', enrolled: '2024-01-15', gender: 'Male' },
  { voterId: 'MH2401002', name: 'Sunita Devi',  aadhaar: '345678901234', dob: '1987-07-22', booth: 'Booth 142', status: 'Active', officer: 'Priya Singh', enrolled: '2024-02-01', gender: 'Female' },
  { voterId: 'MH2401003', name: 'Aakash Singh', aadhaar: '456789012345', dob: '2004-11-05', booth: 'Booth 141', status: 'Active', officer: 'Ranjit Kamble', enrolled: '2024-07-10', gender: 'Male' },
  { voterId: 'MH2401004', name: 'Kamla Bai',    aadhaar: '567890123456', dob: '1958-01-20', booth: 'Booth 143', status: 'Active', officer: 'Sonal Mishra', enrolled: '2024-03-05', gender: 'Female' },
]

// ─── Field components ──────────────────────────────────────────────────────
function Field({ label, error, hint, children, full }) {
  return (
    <div className={`cpf-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="cpf-error">{error}</span>}
      {hint && !error && <span className="cpf-hint">{hint}</span>}
    </div>
  )
}

function Inp({ error, ...props }) {
  return <input className={`cpf-input${error ? ' error' : ''}`} {...props} />
}

function Sel({ error, children, ...props }) {
  return <select className={`cpf-input${error ? ' error' : ''}`} {...props}>{children}</select>
}

// ─── SUCCESS SCREEN ────────────────────────────────────────────────────────
function SuccessCard({ icon: Icon, iconColor, title, message, refId, refLabel = 'Reference ID', note, steps, onReset, resetLabel = 'Start Again' }) {
  return (
    <div className="cpf-success">
      <div className="cpf-success-icon" style={{ color: iconColor || 'var(--success)' }}>
        <Icon size={52} />
      </div>
      <h2 className="cpf-success-title">{title}</h2>
      <p className="cpf-success-msg">{message}</p>
      {refId && (
        <div className="cpf-ref-box">
          {refLabel}: <strong>{refId}</strong>
        </div>
      )}
      {steps && (
        <div className="cpf-steps">
          {steps.map((s, i) => (
            <div key={i} className="cpf-step-row">
              <div className={`cpf-step${i === 0 ? ' done' : ''}`}>
                {i === 0 ? <Check size={12} /> : <span>{i + 1}</span>}
              </div>
              <span>{s}</span>
              {i < steps.length - 1 && <div className="cpf-step-line" />}
            </div>
          ))}
        </div>
      )}
      {note && <p className="cpf-success-note">{note}</p>}
      <button className="cpf-btn primary" onClick={onReset}>{resetLabel}</button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 1 – VOTER REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════
function RegisterTab({ showToast }) {
  const blank = { fullName: '', dob: '', gender: '', category: '', phone: '', address: '', pincode: '', booth: '', idType: 'aadhaar', aadhaar: '', pan: '', voterExisting: '' }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 3) e.fullName = 'Enter full name as on government ID'
    if (!form.dob) e.dob = 'Date of birth is mandatory'
    else {
      const age = Math.floor((Date.now() - new Date(form.dob)) / 3.156e10)
      if (age < 18) e.dob = 'You must be at least 18 years old to register'
    }
    if (!form.gender) e.gender = 'Select gender'
    if (!form.category) e.category = 'Select your voter category'
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit Indian mobile number'
    if (!form.address.trim()) e.address = 'Residential address is mandatory for electoral roll'
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit PIN code required'
    if (!form.booth) e.booth = 'Select your polling booth'

    if (!form.aadhaar) {
      e.aadhaar = 'Aadhaar number is mandatory for identity verification'
    } else if (!AADHAAR_RE.test(form.aadhaar.replace(/\s/g, ''))) {
      e.aadhaar = 'Invalid Aadhaar — must be 12 digits (issued by UIDAI)'
    }

    if (form.pan && !PAN_RE.test(form.pan.toUpperCase())) {
      e.pan = 'Invalid PAN format — must be ABCDE1234F (10 characters)'
    }

    if (form.voterExisting && !VOTER_RE.test(form.voterExisting.toUpperCase())) {
      e.voterExisting = 'Invalid Voter ID — expected format: ABC0000000 (3 letters + 7 digits)'
    }
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    const ref = 'REG-MH-' + Date.now().toString().slice(-7)
    setDone({ ref, phone: form.phone })
    showToast('Registration submitted — you will get an SMS shortly!')
  }

  if (done) return (
    <SuccessCard
      icon={CheckCircle2}
      title="Registration Submitted!"
      message="Your voter registration request has been received and forwarded to the Electoral Registration Officer (ERO) for verification."
      refId={done.ref}
      note={`You will receive an SMS on +91-${done.phone} within 7 working days after field verification. You may also visit your Booth Officer at your selected booth.`}
      steps={['Application Received', 'Field Verification', 'ERO Approval', 'Voter ID Issued']}
      onReset={() => { setDone(null); setForm(blank); setErrors({}) }}
      resetLabel="Register Another Voter"
    />
  )

  const today = new Date()
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0]
  const minDob = new Date(today.getFullYear() - 110, 0, 1).toISOString().split('T')[0]

  return (
    <div className="cpf-form">
      {/* Personal */}
      <div className="cpf-section">
        <div className="cpf-sec-title"><User size={15} /> Personal Information</div>
        <div className="cpf-grid">
          <Field label="Full Name (as on ID)*" error={errors.fullName} full>
            <Inp error={errors.fullName} placeholder="e.g. Ramesh Kumar Yadav" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
          </Field>
          <Field label="Date of Birth*" error={errors.dob}>
            <Inp type="date" error={errors.dob} value={form.dob} min={minDob} max={maxDob} onChange={e => set('dob', e.target.value)} />
          </Field>
          <Field label="Gender*" error={errors.gender}>
            <Sel error={errors.gender} value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Transgender</option>
            </Sel>
          </Field>
          <Field label="Voter Category*" error={errors.category}>
            <Sel error={errors.category} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label="Mobile Number*" error={errors.phone} hint="Must start with 6, 7, 8, or 9">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span className="cpf-prefix">+91</span>
              <Inp error={errors.phone} placeholder="XXXXX XXXXX" maxLength={10} value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ flex: 1 }} />
            </div>
          </Field>
          <Field label="PIN Code*" error={errors.pincode} hint="6-digit postal PIN of your residence area">
            <Inp error={errors.pincode} placeholder="e.g. 400001" maxLength={6} value={form.pincode}
              onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} />
          </Field>
          <Field label="Residential Address*" error={errors.address} full>
            <textarea className={`cpf-input${errors.address ? ' error' : ''}`} rows={2}
              placeholder="Flat/House No., Street, Locality, City, District, State"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
          <Field label="Select Polling Booth*" error={errors.booth} full>
            <Sel error={errors.booth} value={form.booth} onChange={e => set('booth', e.target.value)}>
              <option value="">Select your booth</option>
              {BOOTHS.map(b => <option key={b.id} value={b.id}>{b.name} — Booth Officer: {b.officer}</option>)}
            </Sel>
          </Field>
        </div>
      </div>

      {/* Identity */}
      <div className="cpf-section">
        <div className="cpf-sec-title"><Shield size={15} /> Identity Documents</div>
        <div className="cpf-id-notice">
          <Info size={14} className="cpf-notice-icon" />
          <span>
            As per <strong>Representation of the People Act, 1950</strong>, Aadhaar linkage is used to de-duplicate voter rolls.
            Your data is encrypted and used solely for electoral verification as per <strong>UIDAI regulations</strong>.
          </span>
        </div>
        <div className="cpf-grid">
          <Field label="Aadhaar Number* (UIDAI)" error={errors.aadhaar}
            hint="12-digit Unique Identification Number issued by UIDAI">
            <Inp error={errors.aadhaar} className="cpf-input mono" placeholder="XXXX XXXX XXXX"
              value={form.aadhaar} maxLength={14}
              onChange={e => set('aadhaar', fmtAadhaar(e.target.value))} />
          </Field>
          <Field label="PAN Card (optional — Income Tax Dept.)" error={errors.pan}
            hint="10-character alpha-numeric code — format: ABCDE1234F">
            <Inp error={errors.pan} className="cpf-input mono" placeholder="ABCDE1234F"
              value={form.pan} maxLength={10}
              onChange={e => set('pan', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
          </Field>
          <Field label="Existing Voter ID / EPIC No. (if any)" error={errors.voterExisting}
            hint="EPIC number on your existing Voter Photo Identity Card — format: ABC0000000">
            <Inp error={errors.voterExisting} className="cpf-input mono" placeholder="ABC0000000"
              value={form.voterExisting} maxLength={10}
              onChange={e => set('voterExisting', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
          </Field>
        </div>
      </div>

      <div className="cpf-form-footer">
        <p className="cpf-consent">
          By submitting, I declare that the above information is true and correct. I understand that false declaration
          is an offence under Section 31 of the Representation of the People Act, 1950.
        </p>
        <button className="cpf-btn primary lg" onClick={handleSubmit}>
          Submit Registration <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 2 – CHECK STATUS
// ═══════════════════════════════════════════════════════════════════════════
function StatusTab() {
  const [mode, setMode] = useState('voter_id')
  const [val, setVal] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(undefined) // undefined = not searched, null = not found

  const reset = (m) => { setMode(m); setVal(''); setDob(''); setError(''); setResult(undefined) }

  const handleChange = (v) => {
    if (mode === 'voter_id') setVal(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
    else if (mode === 'aadhaar') setVal(fmtAadhaar(v))
    else setVal(v)
    setError('')
  }

  const doSearch = () => {
    setError('')
    if (!val.trim()) { setError('Please enter a value to search'); return }

    if (mode === 'voter_id') {
      if (!VOTER_RE.test(val)) { setError('Invalid Voter ID format — expected ABC0000000 (3 uppercase letters + 7 digits)'); return }
      setResult(VOTER_DB.find(r => r.voterId.toUpperCase() === val.toUpperCase()) || null)
    } else if (mode === 'aadhaar') {
      const clean = val.replace(/\s/g, '')
      if (!AADHAAR_RE.test(clean)) { setError('Invalid Aadhaar — must be exactly 12 digits'); return }
      setResult(VOTER_DB.find(r => r.aadhaar === clean) || null)
    } else {
      if (val.trim().length < 3) { setError('Enter at least 3 characters of your name'); return }
      if (!dob) { setError('Date of birth is required for name search to ensure uniqueness'); return }
      setResult(VOTER_DB.find(r =>
        r.name.toLowerCase().includes(val.toLowerCase()) && r.dob === dob
      ) || null)
    }
  }

  const placeholder = mode === 'voter_id' ? 'e.g. MH2401001'
    : mode === 'aadhaar' ? 'XXXX XXXX XXXX'
    : 'Enter your full name'

  return (
    <div className="cpf-form">
      <div className="cpf-section">
        <div className="cpf-sec-title"><Search size={15} /> Voter Registration Status</div>
        <div className="cpf-mode-tabs">
          {[['voter_id', 'Voter ID / EPIC'], ['aadhaar', 'Aadhaar Number'], ['name', 'Name + Date of Birth']].map(([id, label]) => (
            <button key={id} className={`cpf-mode-tab${mode === id ? ' active' : ''}`} onClick={() => reset(id)}>{label}</button>
          ))}
        </div>
        <div className="cpf-search-block">
          <div className="cpf-search-row">
            <Inp error={error} placeholder={placeholder} value={val}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()} style={{ flex: 1 }} />
            {mode === 'name' && (
              <Inp type="date" value={dob} onChange={e => setDob(e.target.value)}
                placeholder="Date of Birth" style={{ width: '170px' }} />
            )}
            <button className="cpf-btn primary" onClick={doSearch}>
              <Search size={15} /> Search
            </button>
          </div>
          {error && <div className="cpf-field-error">{error}</div>}
        </div>
      </div>

      {result === null && (
        <div className="cpf-no-result">
          <X size={36} strokeWidth={1.5} />
          <strong>No Record Found</strong>
          <p>No voter registration found for the provided details.</p>
          <p>If you recently registered, verification may be pending (7–10 working days). You may also visit the Booth Officer or the local Electoral Registration Office.</p>
        </div>
      )}

      {result && result.voterId && (
        <div className="cpf-result-card">
          <div className="cpf-result-top">
            <div className="cpf-result-avatar">
              {result.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="cpf-result-info">
              <div className="cpf-result-name">{result.name}</div>
              <div className="cpf-result-sub">Voter ID: {result.voterId} &nbsp;·&nbsp; {result.gender}</div>
            </div>
            <div className={`cpf-status-pill ${result.status === 'Active' ? 'active' : 'pending'}`}>
              {result.status === 'Active' ? <Check size={12} /> : null} {result.status}
            </div>
          </div>
          <div className="cpf-result-grid">
            <div className="cpf-result-item"><span>Polling Booth</span><strong>{result.booth}</strong></div>
            <div className="cpf-result-item"><span>Booth Officer</span><strong>{result.officer}</strong></div>
            <div className="cpf-result-item"><span>Enrolled On</span><strong>{result.enrolled}</strong></div>
            <div className="cpf-result-item"><span>Aadhaar Linked</span><strong>{'XXXXXXXX' + result.aadhaar.slice(-4)}</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 3 – FILE COMPLAINT
// ═══════════════════════════════════════════════════════════════════════════
function ComplaintTab({ showToast }) {
  const blank = { category: '', subcat: '', booth: '', title: '', description: '', phone: '', priority: 'Medium', idType: 'none', idNumber: '' }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.category) e.category = 'Select issue category'
    if (!form.booth) e.booth = 'Select your booth / area'
    if (!form.title.trim() || form.title.trim().length < 10) e.title = 'Provide a clear title (min 10 characters)'
    if (!form.description.trim() || form.description.trim().length < 30) e.description = 'Describe the issue in detail (min 30 characters)'
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit mobile number required for follow-up'
    if (form.idType === 'aadhaar' && form.idNumber && !AADHAAR_RE.test(form.idNumber.replace(/\s/g, ''))) e.idNumber = 'Invalid Aadhaar'
    if (form.idType === 'voter_id' && form.idNumber && !VOTER_RE.test(form.idNumber.toUpperCase())) e.idNumber = 'Invalid Voter ID'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    const id = 'ISS-' + String(1000 + Math.floor(Math.random() * 9000))
    setDone({ id, phone: form.phone, priority: form.priority })
    showToast(`Complaint ${id} filed successfully!`)
  }

  const daysMap = { High: '2–3', Medium: '5–7', Low: '10–15' }

  if (done) return (
    <SuccessCard
      icon={CheckCircle2} iconColor="var(--warning)"
      title="Complaint Filed!"
      message="Your grievance has been logged and assigned to the local Booth Officer and Ward Councillor for resolution."
      refId={done.id} refLabel="Complaint ID"
      steps={['Filed & Acknowledged', 'Assigned to Officer', 'Under Investigation', 'Resolved']}
      note={`Expected resolution: ${daysMap[done.priority]} working days. Live updates will be sent to +91-${done.phone}.`}
      onReset={() => { setDone(null); setForm(blank); setErrors({}) }}
      resetLabel="File Another Complaint"
    />
  )

  return (
    <div className="cpf-form">
      <div className="cpf-section">
        <div className="cpf-sec-title"><AlertCircle size={15} /> Grievance Details</div>
        <div className="cpf-grid">
          <Field label="Issue Category*" error={errors.category}>
            <Sel error={errors.category} value={form.category} onChange={e => { set('category', e.target.value); set('subcat', '') }}>
              <option value="">Select category</option>
              {Object.keys(COMPLAINT_CATS).map(c => <option key={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label="Specific Issue Type" error={errors.subcat}>
            <Sel value={form.subcat} onChange={e => set('subcat', e.target.value)} disabled={!form.category}>
              <option value="">{form.category ? 'Select specific type' : '– select category first –'}</option>
              {(COMPLAINT_CATS[form.category] || []).map(s => <option key={s}>{s}</option>)}
            </Sel>
          </Field>
          <Field label="Your Booth / Locality*" error={errors.booth}>
            <Sel error={errors.booth} value={form.booth} onChange={e => set('booth', e.target.value)}>
              <option value="">Select booth</option>
              {BOOTHS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </Sel>
          </Field>
          <Field label="Contact Mobile*" error={errors.phone} hint="For follow-up and status updates">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span className="cpf-prefix">+91</span>
              <Inp error={errors.phone} placeholder="XXXXX XXXXX" maxLength={10} value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ flex: 1 }} />
            </div>
          </Field>
          <Field label="Complaint Title*" error={errors.title} full>
            <Inp error={errors.title} placeholder="e.g. No piped water supply for 3 days in Sector B, Booth 142"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>
          <Field label="Detailed Description*" error={errors.description}
            hint={`${form.description.length}/500 characters · minimum 30`} full>
            <textarea className={`cpf-input${errors.description ? ' error' : ''}`} rows={4}
              placeholder="Describe the exact problem — since when, exact location, how many residents affected, any previous complaints filed..."
              value={form.description} maxLength={500}
              onChange={e => set('description', e.target.value)} />
          </Field>
        </div>

        <div className="cpf-priority-block">
          <label className="cpf-label">Priority Level</label>
          <div className="cpf-priority-row">
            {['Low', 'Medium', 'High'].map(p => (
              <button key={p}
                className={`cpf-prio-btn ${p.toLowerCase()}${form.priority === p ? ' active' : ''}`}
                onClick={() => set('priority', p)}>
                {p} Priority
              </button>
            ))}
          </div>
        </div>

        {/* Optional identity */}
        <div className="cpf-section" style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '1rem', marginTop: '.5rem' }}>
          <div className="cpf-sec-title" style={{ marginBottom: '.75rem' }}><FileText size={14} /> Your Identity (Optional but helps verification)</div>
          <div className="cpf-grid">
            <Field label="Verify With">
              <Sel value={form.idType} onChange={e => { set('idType', e.target.value); set('idNumber', '') }}>
                <option value="none">Skip Identity</option>
                <option value="voter_id">Voter ID / EPIC</option>
                <option value="aadhaar">Aadhaar Number</option>
              </Sel>
            </Field>
            {form.idType !== 'none' && (
              <Field label={form.idType === 'voter_id' ? 'Voter ID (EPIC)' : 'Aadhaar Number'} error={errors.idNumber}>
                <Inp error={errors.idNumber}
                  className="cpf-input mono"
                  placeholder={form.idType === 'voter_id' ? 'ABC0000000' : 'XXXX XXXX XXXX'}
                  value={form.idNumber}
                  onChange={e => set('idNumber', form.idType === 'voter_id'
                    ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
                    : fmtAadhaar(e.target.value)
                  )} />
              </Field>
            )}
          </div>
        </div>
      </div>

      <div className="cpf-form-footer">
        <button className="cpf-btn primary lg" onClick={handleSubmit}>
          Submit Grievance <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 4 – SCHEME CHECKER
// ═══════════════════════════════════════════════════════════════════════════
function SchemesTab() {
  const [profile, setProfile] = useState({ category: '', income: '', age: '', gender: '' })
  const [errors, setErrors] = useState({})
  const [results, setResults] = useState(null)
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const check = () => {
    const e = {}
    if (!profile.category) e.category = 'Select category'
    const income = Number(profile.income.replace(/[,\s]/g, ''))
    if (!profile.income || isNaN(income) || income < 0) e.income = 'Enter valid annual family income in ₹'
    if (!profile.age || isNaN(Number(profile.age)) || Number(profile.age) < 18 || Number(profile.age) > 120) e.age = 'Enter valid age (18+)'
    setErrors(e)
    if (Object.keys(e).length) return

    const age = Number(profile.age)
    const res = Object.entries(SCHEMES).map(([name, s]) => {
      const catOk = s.cats.some(c => {
        if (c === profile.category) return true
        if (c === 'Senior Citizen' && age >= 60) return true
        if (c === 'Student' && age >= 18 && age <= 25) return true
        return false
      })
      return { name, ...s, eligible: catOk && income <= s.maxIncome, reason: !catOk ? 'Category does not match' : income > s.maxIncome ? `Income exceeds ₹${s.maxIncome.toLocaleString('en-IN')} limit` : '' }
    }).sort((a, b) => b.eligible - a.eligible)

    setResults(res)
  }

  const eligibleCount = results?.filter(r => r.eligible).length ?? 0

  return (
    <div className="cpf-form">
      <div className="cpf-section">
        <div className="cpf-sec-title"><Award size={15} /> Check Government Scheme Eligibility</div>
        <div className="cpf-grid">
          <Field label="Your Category*" error={errors.category}>
            <Sel error={errors.category} value={profile.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label="Age*" error={errors.age}>
            <Inp type="number" error={errors.age} placeholder="e.g. 45" min={18} max={120}
              value={profile.age} onChange={e => set('age', e.target.value)} />
          </Field>
          <Field label="Gender" hint="Required for some schemes like PMUJJWALA, BBBP">
            <Sel value={profile.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">Select (optional)</option>
              <option>Male</option><option>Female</option><option>Transgender</option>
            </Sel>
          </Field>
          <Field label="Annual Family Income (₹)*" error={errors.income}
            hint="Total household income before tax (approximate is fine)">
            <Inp error={errors.income} placeholder="e.g. 1,50,000" value={profile.income}
              onChange={e => set('income', e.target.value)} />
          </Field>
        </div>
        <button className="cpf-btn secondary" onClick={check}>
          Check Eligibility <ChevronRight size={15} />
        </button>
      </div>

      {results && (
        <div className="cpf-schemes-out">
          <div className="cpf-schemes-summary">
            <div className="cpf-scheme-count eligible"><CheckCircle2 size={18} />{eligibleCount} Schemes You Qualify For</div>
            <div className="cpf-scheme-count ineligible"><X size={18} />{results.length - eligibleCount} Not Eligible</div>
          </div>
          <div className="cpf-schemes-list">
            {results.map(r => (
              <div key={r.name} className={`cpf-scheme-row${r.eligible ? ' ok' : ' no'}`}>
                <div className={`cpf-scheme-icon${r.eligible ? ' ok' : ' no'}`}>
                  {r.eligible ? <Check size={15} /> : <X size={15} />}
                </div>
                <div className="cpf-scheme-body">
                  <div className="cpf-scheme-name">{r.name}</div>
                  <div className="cpf-scheme-desc">{r.desc}</div>
                  {!r.eligible && <div className="cpf-scheme-reason">{r.reason}</div>}
                </div>
                {r.eligible && (
                  <button className="cpf-btn xs primary" onClick={() => {}}>
                    Apply <ArrowRight size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 5 – SURVEY
// ═══════════════════════════════════════════════════════════════════════════
function SurveyTab({ showToast }) {
  const [answers, setAnswers] = useState({})
  const [phone, setPhone] = useState('')
  const [phoneErr, setPhoneErr] = useState('')
  const [done, setDone] = useState(false)

  const answered = SURVEY_QS.filter(q => answers[q.id]).length
  const allDone = answered === SURVEY_QS.length

  const submit = () => {
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) { setPhoneErr('Valid 10-digit mobile required'); return }
    if (!allDone) return
    setDone(true)
    showToast('Survey submitted — thank you for your feedback!')
  }

  if (done) return (
    <SuccessCard
      icon={Star} iconColor="var(--info)"
      title="Survey Submitted!"
      message="Thank you for your valuable feedback. Your opinions directly influence ward-level policy decisions."
      note="Survey results are anonymised, aggregated, and reviewed by the Ward Officer monthly. Participation is voluntary."
      onReset={() => { setDone(false); setAnswers({}); setPhone('') }}
      resetLabel="Take Survey Again"
    />
  )

  return (
    <div className="cpf-form">
      <div className="cpf-section">
        <div className="cpf-sec-title"><BarChart2 size={15} /> Citizen Opinion Survey — Ward 8</div>
        <p className="cpf-survey-intro">
          Your honest answers help the ward officer prioritise issues and allocate resources better.
          All responses are anonymous and voluntary.
        </p>

        <div className="cpf-progress-bar">
          <div className="cpf-progress-fill" style={{ width: `${(answered / SURVEY_QS.length) * 100}%` }} />
        </div>
        <div className="cpf-progress-label">{answered} of {SURVEY_QS.length} answered</div>

        {SURVEY_QS.map((q, i) => (
          <div key={q.id} className="cpf-survey-q">
            <div className="cpf-survey-label">{i + 1}. {q.text}</div>
            <div className="cpf-survey-opts">
              {q.opts.map(opt => (
                <button key={opt}
                  className={`cpf-survey-opt${answers[q.id] === opt ? ' active' : ''}`}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}>
                  {answers[q.id] === opt ? <Check size={12} /> : null} {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Field label="Mobile Number (for response tracking)" error={phoneErr}
          hint="Optional but helps link your survey to your voter profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span className="cpf-prefix">+91</span>
            <Inp error={phoneErr} placeholder="XXXXX XXXXX" maxLength={10} value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneErr('') }} style={{ flex: 1 }} />
          </div>
        </Field>

        <button className={`cpf-btn primary lg${!allDone ? ' disabled' : ''}`}
          onClick={submit} disabled={!allDone}>
          Submit Survey <ArrowRight size={16} />
        </button>
        {!allDone && <p className="cpf-notice-text">Please answer all {SURVEY_QS.length} questions before submitting.</p>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 6 – TRACK ISSUES
// ═══════════════════════════════════════════════════════════════════════════
function TrackTab() {
  const [q, setQ] = useState('')
  const [booth, setBooth] = useState('')
  const [status, setStatus] = useState('')
  const [cat, setCat] = useState('')

  const STATUS_COLOR = { Open: '#ef4444', 'In Progress': '#f59e0b', Resolved: '#10b981' }
  const PRIO_COLOR = { High: '#ef4444', Med: '#f59e0b', Low: '#10b981' }

  const filtered = ISSUES.filter(i => {
    const lq = q.toLowerCase()
    return (!q || i.title.toLowerCase().includes(lq) || i.id.toLowerCase().includes(lq) || i.reporter.toLowerCase().includes(lq))
      && (!booth || i.booth === booth)
      && (!status || i.status === status)
      && (!cat || i.category === cat)
  })

  const cats = [...new Set(ISSUES.map(i => i.category))]

  return (
    <div className="cpf-form">
      <div className="cpf-section">
        <div className="cpf-sec-title"><ClipboardList size={15} /> Public Issue Tracker</div>
        <div className="cpf-filter-bar">
          <Inp placeholder="Search issues, IDs, reporters…" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 2, minWidth: '180px' }} />
          <Sel value={booth} onChange={e => setBooth(e.target.value)} style={{ flex: 1, minWidth: '120px' }}>
            <option value="">All Booths</option>
            {BOOTHS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </Sel>
          <Sel value={cat} onChange={e => setCat(e.target.value)} style={{ flex: 1, minWidth: '130px' }}>
            <option value="">All Categories</option>
            {cats.map(c => <option key={c}>{c}</option>)}
          </Sel>
          <Sel value={status} onChange={e => setStatus(e.target.value)} style={{ flex: 1, minWidth: '120px' }}>
            <option value="">All Status</option>
            <option>Open</option><option>In Progress</option><option>Resolved</option>
          </Sel>
        </div>
        <div className="cpf-issues-count">{filtered.length} issue{filtered.length !== 1 ? 's' : ''} found</div>
      </div>

      <div className="cpf-issues-list">
        {filtered.length === 0 && (
          <div className="cpf-empty">No issues match your filters. Try broadening the search criteria.</div>
        )}
        {filtered.map(issue => (
          <div key={issue.id} className="cpf-issue-card">
            <div className="cpf-issue-meta-top">
              <span className="cpf-issue-id">{issue.id}</span>
              <span className="cpf-issue-status" style={{ background: STATUS_COLOR[issue.status] + '1a', color: STATUS_COLOR[issue.status] }}>
                {issue.status}
              </span>
            </div>
            <div className="cpf-issue-title">{issue.title}</div>
            <div className="cpf-issue-tags">
              <span className="cpf-tag">{issue.category}</span>
              <span className="cpf-tag">{issue.booth}</span>
              <span className="cpf-tag">By {issue.reporter}</span>
              <span className="cpf-tag">{issue.date}</span>
              <span className="cpf-prio-tag" style={{ background: PRIO_COLOR[issue.priority] + '1a', color: PRIO_COLOR[issue.priority] }}>
                {issue.priority === 'Med' ? 'Medium' : issue.priority} Priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'register',  label: 'Voter Registration', icon: User },
  { id: 'status',    label: 'Check Status',        icon: Search },
  { id: 'complaint', label: 'File Complaint',      icon: AlertCircle },
  { id: 'schemes',   label: 'Scheme Eligibility',  icon: Award },
  { id: 'survey',    label: 'Citizen Survey',      icon: BarChart2 },
  { id: 'track',     label: 'Track Issues',        icon: ClipboardList },
]

export default function CitizenPortal() {
  const { showToast } = useApp()
  const [activeTab, setActiveTab] = useState('register')

  const renderTab = () => {
    switch (activeTab) {
      case 'register':  return <RegisterTab showToast={showToast} />
      case 'status':    return <StatusTab />
      case 'complaint': return <ComplaintTab showToast={showToast} />
      case 'schemes':   return <SchemesTab />
      case 'survey':    return <SurveyTab showToast={showToast} />
      case 'track':     return <TrackTab />
      default:          return null
    }
  }

  return (
    <div className="cp-portal">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="cp-hero-banner">
        <div className="cp-hero-emblem">
          <Landmark size={28} />
        </div>
        <div className="cp-hero-text">
          <h1>Citizen Service Portal</h1>
          <p>Ward 8 · Maharashtra · Electoral Services &amp; Grievance Redressal</p>
        </div>
        <div className="cp-hero-badges">
          <div className="cp-hero-badge"><Phone size={13} /><span>Helpline: 1950</span></div>
          <div className="cp-hero-badge"><Home size={13} /><span>Ward Office: Booth 141</span></div>
        </div>
        <div className="cp-hero-stats">
          <div className="cp-hero-stat"><span>5,821</span><small>Registered Voters</small></div>
          <div className="cp-hero-stat"><span>10</span><small>Open Issues</small></div>
          <div className="cp-hero-stat"><span>10</span><small>Gov. Schemes</small></div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="cp-tab-bar">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`cp-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="cp-body">
        {renderTab()}
      </div>
    </div>
  )
}
