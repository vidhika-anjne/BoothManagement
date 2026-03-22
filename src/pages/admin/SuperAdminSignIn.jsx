import { useState } from 'react';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';

export default function SuperAdminSignIn({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    // For demonstration, simply mimicking a sign-in delay
    // Real implementation would call a backend auth endpoint
    if (email === 'admin@booth.ai' && password === 'admin') {
      onSignIn();
    } else {
      setError('Invalid super admin credentials. (Hint: admin@booth.ai / admin)');
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh',
      background: 'var(--bg-secondary)'
    }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)',
            color: 'white', marginBottom: '1rem'
          }}>
            <ShieldAlert size={32} />
          </div>
          <h2>Super Admin Portal</h2>
          <p className="text-muted">Sign in to manage the BoothAI platform.</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--error-light, #fee2e2)', color: 'var(--error, #ef4444)',
            padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@booth.ai"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', marginTop: '0.5rem' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="#/" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back to Officer Portal
          </a>
        </div>
      </div>
    </div>
  );
}
