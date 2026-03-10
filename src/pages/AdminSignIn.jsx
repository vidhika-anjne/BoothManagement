import { useState } from 'react'
import { Lock, Mail, MapPin, Settings } from 'lucide-react'

const ADMIN_NAME = 'Neha Diwedi'

export default function AdminSignIn({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [boothId, setBoothId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate authentication
    if (email && password && boothId) {
      setTimeout(() => {
        onSignIn({ email, boothId, name: ADMIN_NAME })
        setLoading(false)
      }, 800)
    } else {
      setError('All fields are required')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0px',
        padding: '2.5rem'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #2d3a1e, #5a6b3a)',
            margin: '0 auto 1rem',
            borderRadius: '0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f5f0e8',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            🏛️
          </div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '.2rem',
            fontFamily: "'Zilla Slab', serif",
            letterSpacing: '-.3px'
          }}>
            Booth Admin Portal
          </h1>
          <p style={{
            fontSize: '.82rem',
            color: 'var(--text-muted)',
            fontFamily: "'IBM Plex Mono', monospace"
          }}>
            Government Services Hyper-Local Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
            <label style={{
              fontSize: '.75rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              fontFamily: "'IBM Plex Mono', monospace"
            }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.5rem',
              border: '1px solid var(--border)',
              borderRadius: '0px',
              background: 'var(--surface)',
              padding: '0 .75rem'
            }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@booth.gov"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '.52rem 0',
                  fontSize: '.84rem',
                  fontFamily: "'Zilla Slab', serif",
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Booth ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
            <label style={{
              fontSize: '.75rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              fontFamily: "'IBM Plex Mono', monospace"
            }}>
              Booth ID
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.5rem',
              border: '1px solid var(--border)',
              borderRadius: '0px',
              background: 'var(--surface)',
              padding: '0 .75rem'
            }}>
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={boothId}
                onChange={(e) => setBoothId(e.target.value.toUpperCase())}
                placeholder="B-141"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '.52rem 0',
                  fontSize: '.84rem',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--text-primary)',
                  outline: 'none',
                  letterSpacing: '.08em'
                }}
              />
            </div>
            <span style={{
              fontSize: '.72rem',
              color: 'var(--text-muted)'
            }}>
              Enter your assigned booth ID (e.g., B-141, B-142)
            </span>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
            <label style={{
              fontSize: '.75rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              fontFamily: "'IBM Plex Mono', monospace"
            }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.5rem',
              border: '1px solid var(--border)',
              borderRadius: '0px',
              background: 'var(--surface)',
              padding: '0 .75rem'
            }}>
              <Lock size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '.52rem 0',
                  fontSize: '.84rem',
                  fontFamily: "'Zilla Slab', serif",
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '.75rem 1rem',
              background: 'rgba(239, 68, 68, .1)',
              border: '1px solid #ef4444',
              borderRadius: '0px',
              color: '#ef4444',
              fontSize: '.82rem',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '.65rem 1rem',
              borderRadius: '0px',
              fontSize: '.84rem',
              fontWeight: '600',
              fontFamily: "'Zilla Slab', serif",
              cursor: 'pointer',
              border: 'none',
              background: 'var(--primary)',
              color: '#f5f0e8',
              transition: 'all .18s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Note */}
        <div style={{
          marginTop: '1.5rem',
          padding: '.75rem 1rem',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '0px',
          fontSize: '.72rem',
          color: 'var(--text-muted)',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace" }}>Demo:</strong> Use any email, booth ID (B-141 to B-152), and password to sign in as {ADMIN_NAME}.
        </div>
      </div>
    </div>
  )
}
