import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { Filter } from 'lucide-react';

export default function SuperAdminVoters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ boothId: '', sectionId: '', gender: '', casteCategory: '' });

  const fetchVoters = () => {
    setLoading(true);
    // Remove empty filters
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
    superAdminApi.getVoters(activeFilters)
      .then(setVoters)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-content fade-in">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>All Voters</h1>
        <p className="text-muted">Directory of all voters across booths.</p>
      </header>
      
      <div className="card glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <Filter size={18} /> Filters
        </div>
        <input name="boothId" placeholder="Booth ID" value={filters.boothId} onChange={handleFilterChange} className="form-input" style={{ flex: 1, minWidth: '120px' }} />
        <input name="sectionId" placeholder="Section ID" value={filters.sectionId} onChange={handleFilterChange} className="form-input" style={{ flex: 1, minWidth: '120px' }} />
        <select name="gender" value={filters.gender} onChange={handleFilterChange} className="form-input" style={{ flex: 1, minWidth: '120px' }}>
          <option value="">Any Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non_Binary">Non Binary</option>
          <option value="Other">Other</option>
        </select>
        <select name="casteCategory" value={filters.casteCategory} onChange={handleFilterChange} className="form-input" style={{ flex: 1, minWidth: '120px' }}>
          <option value="">Any Caste</option>
          <option value="General">General</option>
          <option value="OBC">OBC</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="PVTG">PVTG</option>
          <option value="DNT">DNT</option>
        </select>
        <button className="btn-primary" onClick={fetchVoters} disabled={loading}>
          {loading ? 'Applying...' : 'Apply Filters'}
        </button>
      </div>

      <div className="card glass-panel" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Voter ID</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Gender</th>
              <th style={{ padding: '1rem' }}>Caste</th>
              <th style={{ padding: '1rem' }}>Booth/Section</th>
            </tr>
          </thead>
          <tbody>
            {voters.slice(0, 100).map(voter => (
              <tr key={voter.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{voter.voterId}</td>
                <td style={{ padding: '1rem' }}>{voter.name}</td>
                <td style={{ padding: '1rem' }}>{voter.gender}</td>
                <td style={{ padding: '1rem' }}>{voter.casteCategory}</td>
                <td style={{ padding: '1rem' }}>{voter.boothId} / {voter.section || 'N/A'}</td>
              </tr>
            ))}
            {voters.length > 100 && !loading && (
              <tr>
                <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Showing top 100 of {voters.length.toLocaleString()} voters. Adjust filters to refine.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
