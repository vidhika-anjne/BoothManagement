import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';

export default function SuperAdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getSchemes()
      .then(setSchemes)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading schemes...</div>;

  return (
    <div className="page-content fade-in">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>All Schemes</h1>
        <p className="text-muted">Directory of all government schemes.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {schemes.map(scheme => (
          <div key={scheme.id} className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{scheme.schemeName}</h3>
            {scheme.ministry && <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{scheme.ministry}</div>}
            
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Type:</strong> {scheme.type || 'N/A'}
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Eligible Genders:</strong> {scheme.gender && scheme.gender.length > 0 ? scheme.gender.join(', ') : 'All'}
            </div>
            
            {scheme.beneficiaries && scheme.beneficiaries.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Beneficiaries:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.875rem' }}>
                  {scheme.beneficiaries.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}
            
            {(scheme.ageMin || scheme.ageMax) && (
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <strong>Age:</strong> {scheme.ageMin || 0} to {scheme.ageMax || '+'}
              </div>
            )}
          </div>
        ))}
        {schemes.length === 0 && <div>No schemes found</div>}
      </div>
    </div>
  );
}
