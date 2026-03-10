import { useState } from 'react'
import { Users, Award, TrendingUp, Download } from 'lucide-react'
import { VOTERS } from '../data/mockData.js'

const SCHEMES = [
  {
    id: 'ayushman',
    name: 'Ayushman Bharat',
    description: 'Health insurance for eligible families',
    icon: '🏥',
    beneficiaries: 312,
    enrolled: 245,
    pending: 67,
    color: '#ef4444'
  },
  {
    id: 'pm-awas',
    name: 'PM Awas Yojana',
    description: 'Housing scheme for economically weaker sections',
    icon: '🏠',
    beneficiaries: 487,
    enrolled: 356,
    pending: 131,
    color: '#10b981'
  },
  {
    id: 'ujjwala',
    name: 'Ujjwala Scheme',
    description: 'LPG gas connections for women',
    icon: '🔥',
    beneficiaries: 678,
    enrolled: 645,
    pending: 33,
    color: '#f59e0b'
  },
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman',
    description: 'Direct cash transfer to farmers',
    icon: '🌾',
    beneficiaries: 523,
    enrolled: 487,
    pending: 36,
    color: '#3b82f6'
  }
]

export default function BeneficiaryLinkage() {
  const [selectedScheme, setSelectedScheme] = useState('ayushman')
  const scheme = SCHEMES.find(s => s.id === selectedScheme)

  // Filter voters by scheme
  const schemeBeneficiaries = VOTERS.filter(v => v.schemes?.includes(
    selectedScheme === 'ayushman' ? 'Ayushman' :
    selectedScheme === 'pm-awas' ? 'PM Awas' :
    selectedScheme === 'ujjwala' ? 'Ujjwala' :
    'PM Kisan'
  ))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Beneficiary Linkage</div>
          <div className="page-subtitle">Track government scheme beneficiaries and strengthen leader-citizen bonds</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => {}}>
            <Download size={14}/> Export Report
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {SCHEMES.map(s => (
          <div
            key={s.id}
            onClick={() => setSelectedScheme(s.id)}
            style={{
              background: 'var(--surface)',
              border: selectedScheme === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '0px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all .2s'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '.3rem', fontFamily: "'IBM Plex Mono', monospace" }}>
              {s.name.toUpperCase()}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace" }}>
              {s.enrolled}/{s.beneficiaries}
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>
              {Math.round((s.enrolled / s.beneficiaries) * 100)}% Enrolled
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Details */}
      {scheme && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0px',
          marginBottom: '1.5rem'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '2rem' }}>{scheme.icon}</div>
            <div>
              <div style={{ fontSize: '.95rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Zilla Slab', serif" }}>
                {scheme.name}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                {scheme.description}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                Coverage
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: scheme.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                {Math.round((scheme.enrolled / scheme.beneficiaries) * 100)}%
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ padding: '1.25rem', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.75rem', fontWeight: '600', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '.5rem' }}>
                ELIGIBLE
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {scheme.beneficiaries}
              </div>
            </div>
            <div style={{ padding: '1.25rem', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.75rem', fontWeight: '600', color: 'var(--success)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '.5rem' }}>
                ENROLLED
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {scheme.enrolled}
              </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '.75rem', fontWeight: '600', color: '#f59e0b', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '.5rem' }}>
                PENDING
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', fontFamily: "'IBM Plex Mono', monospace" }}>
                {scheme.pending}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ padding: '1.5rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: '.8rem' }}>
              <span style={{ fontWeight: '600', fontFamily: "'IBM Plex Mono', monospace" }}>ENROLLMENT PROGRESS</span>
              <span style={{ color: 'var(--text-muted)' }}>{scheme.enrolled}/{scheme.beneficiaries}</span>
            </div>
            <div style={{
              height: '8px',
              background: 'var(--border)',
              borderRadius: '0px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(scheme.enrolled / scheme.beneficiaries) * 100}%`,
                background: scheme.color,
                borderRadius: '0px',
                transition: 'width .6s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Beneficiaries Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem'
        }}>
          <Users size={16} />
          <div style={{ fontSize: '.9rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Zilla Slab', serif" }}>
            Registered Beneficiaries ({schemeBeneficiaries.length})
          </div>
        </div>

        <table className="data-table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th>Beneficiary ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Booth</th>
              <th>Status</th>
              <th>Enrollment Date</th>
            </tr>
          </thead>
          <tbody>
            {schemeBeneficiaries.length > 0 ? (
              schemeBeneficiaries.map((voter, idx) => (
                <tr key={voter.id} style={{
                  background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                }}>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: '600' }}>{voter.id}</td>
                  <td>{voter.name}</td>
                  <td><span style={{ background: 'rgba(45, 58, 30, .1)', color: '#2d3a1e', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '.72rem', fontWeight: '700' }}>{voter.category}</span></td>
                  <td>{voter.booth}</td>
                  <td>
                    <span className={`status-badge status-${voter.status?.toLowerCase() || 'active'}`}>
                      {voter.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '.8rem', color: 'var(--text-muted)' }}>2026-03-01</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No beneficiaries found for this scheme
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
