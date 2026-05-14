import { useState, useEffect, useCallback, useMemo } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { 
  Users, Filter, BarChart2, PieChart, Activity, 
  TrendingUp, ArrowUpRight, ChevronDown 
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement 
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Formatting helper: 40.3 -> "40.3 Lakh"
const formatLakh = (val) => {
  if (val >= 100) return `${(val / 100).toFixed(2)} Crore`;
  return `${val.toFixed(2)} Lakh`;
};

export default function SuperAdminSegmentation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    ageGroup: '',
    gender: '',
    caste: ''
  });

  // Custom Dropdown Menus State
  const [showAgeMenu,    setShowAgeMenu]    = useState(false);
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showCasteMenu,  setShowCasteMenu]  = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getVoterStats(filters);
      setData(res);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch voter statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${formatLakh(context.raw)}`
        }
      }
    }
  }), []);

  const barOptions = useMemo(() => ({
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val) => `${val}L` }
      }
    }
  }), [chartOptions]);

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--error)' }}>
        <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h3>Data Fetch Error</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchData} style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Delhi 2025: Voter Segmentation</h1>
          <p className="text-muted" style={{ margin: '0.4rem 0 0 0' }}>Comprehensive breakdown of 1.55 Crore registered voters.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.2rem' }}>TOTAL BASE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data ? formatLakh(data.totalVoters) : '1.55 Crore'}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
          <Filter size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>SLICE DATA:</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flex: 1, position: 'relative', zIndex: 100 }}>
          {/* Custom Age Group Dropdown */}
          <div style={{ position: 'relative', flex: 1 }}>
            <div 
              className="custom-filter-trigger" 
              onClick={() => { setShowAgeMenu(!showAgeMenu); setShowGenderMenu(false); setShowCasteMenu(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={18} color={filters.ageGroup ? "var(--primary)" : "var(--text-muted)"} />
                <span>{filters.ageGroup ? `${filters.ageGroup} Group` : 'All Age Groups'}</span>
              </div>
              <ChevronDown size={14} className={showAgeMenu ? 'rotate-180' : ''} />
            </div>
            {showAgeMenu && (
              <div className="custom-filter-menu glass-panel">
                <div className="filter-item" onClick={() => { setFilters({...filters, ageGroup: ''}); setShowAgeMenu(false); }}>All Age Groups</div>
                {[
                  { value: '18-24', label: '18–24 Youth', desc: 'First-time voters' },
                  { value: '25-35', label: '25–35 Young Adult', desc: 'Working professionals' },
                  { value: '36-45', label: '36–45 Adult', desc: 'Family focus' },
                  { value: '46-60', label: '46–60 Senior Adult', desc: 'Core demographic' },
                  { value: '60+',   label: '60+ Senior Citizens', desc: 'Experienced voters' }
                ].map(opt => (
                  <div key={opt.value} className="filter-item" onClick={() => { setFilters({...filters, ageGroup: opt.value}); setShowAgeMenu(false); }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Gender Dropdown */}
          <div style={{ position: 'relative', flex: 1 }}>
            <div 
              className="custom-filter-trigger" 
              onClick={() => { setShowGenderMenu(!showGenderMenu); setShowAgeMenu(false); setShowCasteMenu(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} color={filters.gender ? "var(--primary)" : "var(--text-muted)"} />
                <span>{filters.gender || 'All Genders'}</span>
              </div>
              <ChevronDown size={14} className={showGenderMenu ? 'rotate-180' : ''} />
            </div>
            {showGenderMenu && (
              <div className="custom-filter-menu glass-panel">
                <div className="filter-item" onClick={() => { setFilters({...filters, gender: ''}); setShowGenderMenu(false); }}>All Genders</div>
                <div className="filter-item" onClick={() => { setFilters({...filters, gender: 'Male'}); setShowGenderMenu(false); }}>Male Participants</div>
                <div className="filter-item" onClick={() => { setFilters({...filters, gender: 'Female'}); setShowGenderMenu(false); }}>Female Participants</div>
              </div>
            )}
          </div>

          {/* Custom Caste Dropdown */}
          <div style={{ position: 'relative', flex: 1 }}>
            <div 
              className="custom-filter-trigger" 
              onClick={() => { setShowCasteMenu(!showCasteMenu); setShowAgeMenu(false); setShowGenderMenu(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={18} color={filters.caste ? "var(--primary)" : "var(--text-muted)"} />
                <span>{filters.caste || 'All Categories'}</span>
              </div>
              <ChevronDown size={14} className={showCasteMenu ? 'rotate-180' : ''} />
            </div>
            {showCasteMenu && (
              <div className="custom-filter-menu glass-panel">
                <div className="filter-item" onClick={() => { setFilters({...filters, caste: ''}); setShowCasteMenu(false); }}>All Categories</div>
                {['General', 'OBC', 'SC', 'ST'].map(c => (
                  <div key={c} className="filter-item" onClick={() => { setFilters({...filters, caste: c}); setShowCasteMenu(false); }}>
                    Category: {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && <Activity size={18} className="animate-spin" style={{ color: 'var(--primary)' }} />}
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Age Group - Bar Chart */}
        <div className="card glass-panel" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Age Distribution</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voters across life stages</div>
            </div>
            <BarChart2 size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {data && (
              <Bar 
                data={{
                  labels: Object.keys(data.ageBreakdown),
                  datasets: [{
                    label: 'Lakhs',
                    data: Object.values(data.ageBreakdown),
                    backgroundColor: 'rgba(59, 130, 246, 0.75)',
                    borderRadius: 4
                  }]
                }} 
                options={barOptions} 
              />
            )}
          </div>
        </div>

        {/* Gender - Pie Chart */}
        <div className="card glass-panel" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Gender Composition</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Participation breakdown</div>
            </div>
            <PieChart size={20} color="#ec4899" />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {data && (
              <Pie 
                data={{
                  labels: Object.keys(data.genderBreakdown),
                  datasets: [{
                    data: Object.values(data.genderBreakdown),
                    backgroundColor: ['#6366f1', '#ec4899', '#94a3b8'],
                    borderWidth: 0
                  }]
                }} 
                options={chartOptions} 
              />
            )}
          </div>
        </div>

        {/* Caste - Donut Chart */}
        <div className="card glass-panel" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Social Composition</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Caste category distribution</div>
            </div>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {data && (
              <Doughnut 
                data={{
                  labels: Object.keys(data.casteBreakdown),
                  datasets: [{
                    data: Object.values(data.casteBreakdown),
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    cutout: '65%'
                  }]
                }} 
                options={chartOptions} 
              />
            )}
          </div>
        </div>

      </div>

      {/* Summary Insights */}
      <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px dashed var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
          <ArrowUpRight size={18} /> Dynamic Segment Insight
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Currently viewing a subset based on filters: <b>{data?.activeFilter}</b>. 
          The largest segment in this view is <b>{data ? Object.keys(data.ageBreakdown).reduce((a, b) => data.ageBreakdown[a] > data.ageBreakdown[b] ? a : b) : '...'}</b>.
          Infrastructure planning should prioritize high-density demographic zones identified in the distribution above.
        </p>
      </div>

      <style>{`
        .custom-filter-trigger {
          height: 48px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          user-select: none;
        }
        .custom-filter-trigger:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
          background: #fff;
        }
        .custom-filter-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          overflow: hidden;
          z-index: 1000;
          animation: slideDownFade 0.2s ease-out;
        }
        .filter-item {
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--border-subtle);
        }
        .filter-item:last-child {
          border-bottom: none;
        }
        .filter-item:hover {
          background: var(--surface-2);
          color: var(--primary);
          padding-left: 1.5rem;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
