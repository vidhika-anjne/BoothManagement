import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { Award, Landmark, Users, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SuperAdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    superAdminApi.getSchemes()
      .then(setSchemes)
      .finally(() => setLoading(false));
  }, []);

  const ministries = ['All', ...new Set(schemes.map(s => s.ministry || 'Ministry of Delhi'))];
  const filteredSchemes = filter === 'All' ? schemes : schemes.filter(s => (s.ministry || 'Ministry of Delhi') === filter);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="shimmer" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1rem' }} />
        Loading Government Schemes...
      </div>
    );
  }

  return (
    <div className="page-content fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Government Schemes</h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Central and State initiatives available for eligible voters.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="form-input custom-select" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: '240px' }}
          >
            {ministries.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="card glass-panel" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{filteredSchemes.length}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active</span>
          </div>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
        {filteredSchemes.map(scheme => (
          <div key={scheme.id} className="card glass-panel scheme-card-hover" style={{ 
            padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
            border: '1px solid var(--border)', transition: 'all 0.3s ease'
          }}>
            {/* Ministry Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '8px', background: 'var(--surface-2)', borderRadius: '8px' }}>
                <Landmark size={18} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                {scheme.ministry || 'Ministry of Delhi'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: 'var(--text)' }}>
              {scheme.schemeName}
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>{scheme.type || 'Social Welfare'}</span>
              <span className="badge-pill" style={{ background: '#f0fdf4', color: '#166534' }}>Active 2025</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <Users size={16} className="text-muted" />
                <span><strong>Genders:</strong> {scheme.gender && scheme.gender.length > 0 ? scheme.gender.join(', ') : 'All Citizens'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <Calendar size={16} className="text-muted" />
                <span><strong>Age Range:</strong> {scheme.ageMin || 0} to {scheme.ageMax || '+'} Years</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} style={{ marginTop: '2px' }} />
                <span>{scheme.beneficiaries && scheme.beneficiaries.length > 0 ? scheme.beneficiaries.join(', ') : 'Direct Benefit Transfer'}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn-text" 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', 
                  fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', border: 'none', background: 'none', padding: 0 
                }}
              >
                View Guidelines <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {schemes.length === 0 && (
          <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>No schemes currently listed in the database.</div>
            <button className="btn-primary">Add New Scheme</button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scheme-card-hover:hover {
          transform: translateY(-5px);
          border-color: var(--primary) !important;
          box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
        }
        .badge-pill {
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
          padding-right: 2.5rem !important;
        }
      `}} />
    </div>
  );
}
