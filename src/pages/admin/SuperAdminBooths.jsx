import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';

export default function SuperAdminBooths() {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getBooths()
      .then(setBooths)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading booths...</div>;

  return (
    <div className="page-content fade-in">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>All Booths</h1>
        <p className="text-muted">Directory of all polling booths.</p>
      </header>
      
      <div className="card glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Part ID</th>
              <th style={{ padding: '1rem' }}>Part Number</th>
              <th style={{ padding: '1rem' }}>Part Name</th>
              <th style={{ padding: '1rem' }}>AC Number</th>
              <th style={{ padding: '1rem' }}>District</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(booths) ? booths : []).slice(0, 100).map(booth => (
              <tr key={booth.partId || booth.id || Math.random()} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{booth.partId}</td>
                <td style={{ padding: '1rem' }}>{booth.partNumber}</td>
                <td style={{ padding: '1rem' }}>{booth.partName}</td>
                <td style={{ padding: '1rem' }}>{booth.ac?.acNumber} - {booth.ac?.name}</td>
                <td style={{ padding: '1rem' }}>{booth.ac?.district?.name}</td>
              </tr>
            ))}
            {(Array.isArray(booths) ? booths : []).length > 100 && (
              <tr>
                <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Showing top 100 of {booths.length.toLocaleString()} booths.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
