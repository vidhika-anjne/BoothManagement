import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { Filter, Users, UserCheck, PersonStanding, Search, Download, RotateCw, XCircle } from 'lucide-react';

export default function SuperAdminVoters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ partId: '', sectionId: '', gender: '', casteCategory: '', search: '' });
  
  // Custom Dropdown State
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showCasteMenu, setShowCasteMenu] = useState(false);

  const fetchVoters = () => {
    setLoading(true);
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([key, v]) => v !== '' && key !== 'search'));
    superAdminApi.getVoters(activeFilters)
      .then(res => {
        if (filters.search) {
          const s = filters.search.toLowerCase();
          setVoters(res.filter(v => 
            v.name?.toLowerCase().includes(s) || 
            v.voterId?.toLowerCase().includes(s)
          ));
        } else {
          setVoters(res);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVoters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.partId, filters.sectionId, filters.gender, filters.casteCategory]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = () => {
    if (voters.length === 0) return alert('No data to export');
    const headers = ['Voter ID', 'Name', 'Age', 'Gender', 'Caste', 'Part', 'Section'];
    const rows = voters.map(v => [v.voterId, v.name, v.age || 'N/A', v.gender, v.casteCategory, v.partId, v.section || 'N/A']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Voters_Database_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCasteTag = (caste) => {
    const colors = {
      'General': { bg: '#e0f2fe', text: '#0369a1' },
      'OBC': { bg: '#ffedd5', text: '#9a3412' },
      'SC': { bg: '#fef2f2', text: '#991b1b' },
      'ST': { bg: '#f0fdf4', text: '#166534' }
    };
    const style = colors[caste] || { bg: '#f3f4f6', text: '#374151' };
    return (
      <span style={{ 
        padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
        background: style.bg, color: style.text, textTransform: 'uppercase'
      }}>
        {caste || 'N/A'}
      </span>
    );
  };

  const stats = [
    { label: 'Total in View', value: voters.length, icon: Users, color: 'var(--primary)', bg: '#ede9fe' },
    { label: 'Male', value: voters.filter(v => v.gender === 'Male').length, icon: UserCheck, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Female', value: voters.filter(v => v.gender === 'Female').length, icon: PersonStanding, color: '#ec4899', bg: '#fce7f3' },
  ];

  return (
    <div className="page-content fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(to right, var(--primary), #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Voters Database</h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Executive-level oversight of 1.55 Crore Voters across Delhi.</p>
        </div>
        <button className="btn-primary premium-export-btn" onClick={handleExport}>
          <Download size={20} /> <span>Export Dataset</span>
        </button>
      </header>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: s.bg, borderRadius: '12px' }}>
              <s.icon size={24} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Filtering Control Center */}
      <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 3, minWidth: '350px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              name="search" 
              placeholder="System search across elections, names, and IDs..." 
              value={filters.search} 
              onChange={handleFilterChange} 
              className="form-input search-input-refinement" 
              style={{ paddingLeft: '3.25rem', width: '100%', height: '52px', fontSize: '1rem', borderRadius: '12px' }} 
            />
          </div>

          {/* Custom Gender Dropdown */}
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <div 
              className="custom-select-trigger" 
              onClick={() => { setShowGenderMenu(!showGenderMenu); setShowCasteMenu(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <PersonStanding size={18} color={filters.gender ? "var(--primary)" : "var(--text-muted)"} />
                <span>{filters.gender || 'All Genders'}</span>
              </div>
              <Filter size={14} className="chevron" />
            </div>
            {showGenderMenu && (
              <div className="custom-dropdown-menu glass-panel">
                <div className="dropdown-item" onClick={() => { setFilters({...filters, gender: ''}); setShowGenderMenu(false); }}>All Genders</div>
                <div className="dropdown-item" onClick={() => { setFilters({...filters, gender: 'Male'}); setShowGenderMenu(false); }}>
                  <UserCheck size={16} /> Male Voters
                </div>
                <div className="dropdown-item" onClick={() => { setFilters({...filters, gender: 'Female'}); setShowGenderMenu(false); }}>
                  <Users size={16} /> Female Voters
                </div>
              </div>
            )}
          </div>

          {/* Custom Caste Dropdown */}
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <div 
              className="custom-select-trigger" 
              onClick={() => { setShowCasteMenu(!showCasteMenu); setShowGenderMenu(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: filters.casteCategory ? 'var(--primary)' : '#ccc' }} />
                <span>{filters.casteCategory || 'All Categories'}</span>
              </div>
              <Filter size={14} className="chevron" />
            </div>
            {showCasteMenu && (
              <div className="custom-dropdown-menu glass-panel">
                <div className="dropdown-item" onClick={() => { setFilters({...filters, casteCategory: ''}); setShowCasteMenu(false); }}>All Categories</div>
                {['General', 'OBC', 'SC', 'ST'].map(c => (
                  <div key={c} className="dropdown-item" onClick={() => { setFilters({...filters, casteCategory: c}); setShowCasteMenu(false); }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getCasteTag(c).props.style.color }} />
                    {c} (Roll Update)
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="premium-btn-circle reset-btn" onClick={() => setFilters({ partId: '', sectionId: '', gender: '', casteCategory: '', search: '' })} title="Clear All Filters">
              <XCircle size={22} />
            </button>
            <button className="premium-btn-circle refresh-btn" onClick={fetchVoters} disabled={loading} title="Refresh Live Data">
              <RotateCw size={22} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Voter Table */}
      <div className="card glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto', maxHeight: '700px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Voter Identification</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Demographics</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Booth Location</th>
              </tr>
            </thead>
            <tbody>
              {voters.slice(0, 100).map(voter => (
                <tr key={voter.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{voter.voterId}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Elector Roll 2025</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{voter.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age: {voter.age || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem' }}>{voter.gender}</span>
                      {getCasteTag(voter.casteCategory)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.85rem' }}>Part {voter.partId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Section {voter.section || 'N/A'}</div>
                  </td>
                </tr>
              ))}
              {voters.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No voters matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {voters.length > 100 && (
          <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--surface-1)', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing top 100 voters. Refine search to see specific entries.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Custom Styles ──────────────────────────────────────────────────────────
const styles = `
  .custom-select-trigger {
    height: 52px;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    user-select: none;
  }
  .custom-select-trigger:hover {
    border-color: var(--primary);
    background: #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
  }
  .custom-select-trigger .chevron {
    transition: transform 0.3s ease;
    color: var(--text-muted);
  }
  .custom-select-trigger:hover .chevron {
    transform: rotate(180deg);
    color: var(--primary);
  }
  .custom-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
  }
  .dropdown-item {
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .dropdown-item:hover {
    background: var(--surface-2);
    color: var(--primary);
    padding-left: 1.5rem;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .premium-export-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.75rem;
    background: linear-gradient(135deg, var(--primary) 0%, #4338ca 100%);
    color: white;
    font-weight: 700;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .premium-export-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
  }

  .premium-btn-circle {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border);
    background: var(--surface-1);
    color: var(--text);
  }
  .reset-btn:hover {
    background: #fef2f2;
    border-color: #ef4444;
    color: #ef4444;
    transform: rotate(-10deg);
  }
  .refresh-btn:hover {
    background: #f0fdf4;
    border-color: #22c55e;
    color: #22c55e;
    transform: rotate(10deg);
  }

  .search-input-refinement {
    border: 1px solid var(--border) !important;
    transition: all 0.2s ease;
  }
  .search-input-refinement:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .spin {
    animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);
