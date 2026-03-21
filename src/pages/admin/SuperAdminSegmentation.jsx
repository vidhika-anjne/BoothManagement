import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { Users, Filter, BarChart2, Table as TableIcon, Activity } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function SuperAdminSegmentation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ ageGroup: '', gender: '', occupation: '' });
  const [view, setView] = useState('overall'); // 'overall' or 'booth'

  useEffect(() => {
    fetchData();
  }, [filters, view]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminApi.getSegmentationData({ ...filters, view });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const buildActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.ageGroup) activeFilters.push(filters.ageGroup.charAt(0).toUpperCase() + filters.ageGroup.slice(1));
    if (filters.gender) activeFilters.push(filters.gender);
    if (filters.occupation) {
        if (filters.occupation === 'FARMER') activeFilters.push('Farmers');
        else if (filters.occupation === 'ORGANIZED_WORKER') activeFilters.push('Businessmen/Workers');
        else activeFilters.push(filters.occupation);
    }
    
    if (activeFilters.length === 0) return "Showing: All Voters (Delhi Cantt)";
    return `Showing: ${activeFilters.join(' + ')} (Delhi Cantt)`;
  };

  const renderOverallView = () => {
    if (!data || !data.breakdown) return null;
    
    const { totalVoters, filteredCount, breakdown } = data;

    const pieData = {
      labels: ['Youth', 'Adult', 'Senior'],
      datasets: [{
        data: [breakdown.youth, breakdown.adult, breakdown.senior],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 0,
      }]
    };

    const pieDemographics = {
        labels: ['Male', 'Female', 'Farmers', 'Businessmen'],
        datasets: [{
          data: [breakdown.male, breakdown.female, breakdown.farmers, breakdown.businessmen],
          backgroundColor: ['#6366f1', '#ec4899', '#22c55e', '#f97316'],
          borderWidth: 0,
        }]
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalVoters?.toLocaleString() || 0}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Constituency Voters</div>
          </div>
          <div className="card glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{filteredCount?.toLocaleString() || 0}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mismatched Result Total</div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            <div className="card glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Age Distribution</h3>
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
            <div className="card glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Demographics & Occupation</h3>
                <Pie data={pieDemographics} options={{ maintainAspectRatio: false }} />
            </div>
        </div>
      </div>
    );
  };

  const renderBoothView = () => {
    if (!data || !Array.isArray(data)) return null;
    
    return (
      <div className="card glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        {data.length === 0 ? (
           <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No voters match this segmentation criteria.</div>
        ) : (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Booth Name</th>
                <th style={{ padding: '1rem' }}>Part #</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem', color: '#3b82f6' }}>Youth</th>
                <th style={{ padding: '1rem', color: '#10b981' }}>Adult</th>
                <th style={{ padding: '1rem', color: '#f59e0b' }}>Senior</th>
                <th style={{ padding: '1rem', color: '#6366f1' }}>Male</th>
                <th style={{ padding: '1rem', color: '#ec4899' }}>Female</th>
                <th style={{ padding: '1rem', color: '#22c55e' }}>Farmers</th>
                <th style={{ padding: '1rem', color: '#f97316' }}>Businessmen</th>
                </tr>
            </thead>
            <tbody>
                {data.map((booth, idx) => (
                <tr key={`${booth.boothName}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{booth.boothName}</td>
                    <td style={{ padding: '1rem' }}>{booth.partNumber}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{booth.totalVoters}</td>
                    <td style={{ padding: '1rem' }}>{booth.youth}</td>
                    <td style={{ padding: '1rem' }}>{booth.adult}</td>
                    <td style={{ padding: '1rem' }}>{booth.senior}</td>
                    <td style={{ padding: '1rem' }}>{booth.male}</td>
                    <td style={{ padding: '1rem' }}>{booth.female}</td>
                    <td style={{ padding: '1rem' }}>{booth.farmers}</td>
                    <td style={{ padding: '1rem' }}>{booth.businessmen}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Voter Segmentation Module</h1>
          <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Multi-dimensional insight slicer via Delhi Cantt database.</p>
        </div>
        
        {/* View Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
                onClick={() => setView('overall')}
                style={{ 
                    padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', 
                    background: view === 'overall' ? 'var(--primary)' : 'transparent',
                    color: view === 'overall' ? 'white' : 'var(--text)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                }}
            >
                <BarChart2 size={16} /> Overall
            </button>
            <button 
                onClick={() => setView('booth')}
                style={{ 
                    padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', 
                    background: view === 'booth' ? 'var(--primary)' : 'transparent',
                    color: view === 'booth' ? 'white' : 'var(--text)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                }}
            >
                <TableIcon size={16} /> Booth-wise
            </button>
        </div>
      </div>

      {/* Filters Form */}
      <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Filter size={18} /> Segmentation Filters 
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Age Group</label>
                <select name="ageGroup" value={filters.ageGroup} onChange={handleFilterChange} className="input-field" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <option value="">All Ages</option>
                    <option value="youth">Youth (18-25)</option>
                    <option value="adult">Adult (26-50)</option>
                    <option value="senior">Senior (&gt; 50)</option>
                </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Gender</label>
                <select name="gender" value={filters.gender} onChange={handleFilterChange} className="input-field" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Occupation</label>
                <select name="occupation" value={filters.occupation} onChange={handleFilterChange} className="input-field" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <option value="">All Occupations</option>
                    <option value="FARMER">Farmers</option>
                    <option value="ORGANIZED_WORKER">Businessmen / Org Workers</option>
                </select>
            </div>
        </div>
        
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500, background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px', display: 'inline-block', width: 'fit-content' }}>
            {buildActiveFiltersText()}
        </div>
      </div>

      {/* Main Display Area */}
      {error && <div className="text-error glass-panel" style={{ padding: '2rem' }}>Error loading segmentation logic: {error}</div>}
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }}>
          <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity className="animate-spin" /> Computing Segmentations...
          </div>
        </div>
      ) : (
        view === 'overall' ? renderOverallView() : renderBoothView()
      )}

    </div>
  );
}
