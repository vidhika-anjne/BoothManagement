import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { 
  Users, Map, Award, TrendingUp, Activity, 
  UserRound, Zap, ChevronDown
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#aaa', font: { size: 11 } } } }
};

function SegmentationSection() {
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [segData, setSegData] = useState(null);
  const [segLoading, setSegLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getBooths().then(data => setBooths(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    setSegLoading(true);
    const params = selectedBooth
      ? { view: 'booth', partNumber: selectedBooth.partNumber, acName: selectedBooth.acName }
      : { view: 'overall' };
    superAdminApi.getDashboardSegmentation(params)
      .then(setSegData)
      .finally(() => setSegLoading(false));
  }, [selectedBooth]);

  const statusLabel = () => {
    if (!selectedBooth) return 'Showing: Delhi Cantt (All Citizens)';
    if (segData?.isEstimated) return `Showing: ${selectedBooth.partName} (Estimated Data)`;
    return `Showing: ${selectedBooth.partName} (Real Data)`;
  };

  const agePie = segData ? {
    labels: ['Youth (18–25)', 'Adult (26–50)', 'Senior (50+)'],
    datasets: [{ data: [segData.age.youth, segData.age.adult, segData.age.senior], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'], borderWidth: 0 }]
  } : null;

  const genderPie = segData ? {
    labels: ['Male', 'Female'],
    datasets: [{ data: [segData.gender.male, segData.gender.female], backgroundColor: ['#6366f1', '#ec4899'], borderWidth: 0 }]
  } : null;

  const occupPie = segData ? {
    labels: ['Farmers', 'Businessmen', 'Others'],
    datasets: [{ data: [segData.occupation.farmers, segData.occupation.businessmen, segData.occupation.others], backgroundColor: ['#22c55e', '#f97316', '#94a3b8'], borderWidth: 0 }]
  } : null;

  return (
    <div className="card glass-panel" style={{ padding: '1.5rem' }}>
      {/* Header + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserRound size={20} style={{ color: 'var(--primary)' }} /> Constituency Segmentation
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedBooth(null)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border)',
              background: !selectedBooth ? 'var(--primary)' : 'var(--bg-secondary)',
              color: !selectedBooth ? 'white' : 'var(--text)',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s'
            }}
          >
            All Citizens
          </button>

          <div style={{ position: 'relative' }}>
            <select
              value={selectedBooth ? `${selectedBooth.partNumber}::${selectedBooth.acName}` : ''}
              onChange={e => {
                if (!e.target.value) { setSelectedBooth(null); return; }
                const [pn, ac] = e.target.value.split('::');
                const booth = booths.find(b => String(b.partNumber) === pn && b.acName === ac);
                if (booth) setSelectedBooth({ partNumber: booth.partNumber, acName: booth.acName, partName: booth.partName || `Booth P-${booth.partNumber}` });
              }}
              style={{
                padding: '0.5rem 2.5rem 0.5rem 1rem', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                color: 'var(--text)', cursor: 'pointer', fontSize: '0.875rem',
                appearance: 'none', minWidth: '200px'
              }}
            >
              <option value="">— Select Booth —</option>
              {booths.slice(0, 100).map(b => (
                <option key={`${b.partNumber}-${b.acName}`} value={`${b.partNumber}::${b.acName}`}>
                  {b.partName || `P-${b.partNumber}`}
                </option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Status Label */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.875rem', fontWeight: 500, marginBottom: '1.5rem',
        padding: '0.4rem 1rem', borderRadius: '20px',
        background: segData?.isEstimated ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
        color: segData?.isEstimated ? '#f59e0b' : 'var(--primary)'
      }}>
        {segData?.isEstimated ? '⚠ ' : '● '}{statusLabel()}
      </div>

      {segLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)', gap: '0.75rem' }}>
          <Activity size={20} /> Computing segmentation...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {/* Age */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Age Distribution</div>
            <div style={{ height: '220px' }}>
              {agePie && <Pie data={agePie} options={PIE_OPTS} />}
            </div>
          </div>
          {/* Gender */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gender Distribution</div>
            <div style={{ height: '220px' }}>
              {genderPie && <Pie data={genderPie} options={PIE_OPTS} />}
            </div>
          </div>
          {/* Occupation */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Occupation Distribution</div>
            <div style={{ height: '220px' }}>
              {occupPie && <Pie data={occupPie} options={PIE_OPTS} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    superAdminApi.getDashboardStats()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity /> Loading Insight Engine...
      </div>
    </div>
  );
  if (error) return <div className="text-error glass-panel" style={{ padding: '2rem' }}>Error: {error}</div>;
  if (!data) return null;

  const { systemSnapshot, boothIntelligence, schemeImpact, recentActivity } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>

      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Super Admin Executive Dashboard</h1>
        <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Comprehensive system visibility &amp; insights.</p>
      </div>

      {/* Section 1: Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Voters',      value: systemSnapshot.totalVoters,        icon: <Users size={28} />,  color: '#3b82f6' },
          { label: 'Total Booths',      value: systemSnapshot.totalBooths,         icon: <Map size={28} />,    color: '#10b981' },
          { label: 'Key Demographics',  value: systemSnapshot.totalKeyVoters,      icon: <Zap size={28} />,    color: '#f59e0b' },
          { label: 'Beneficiaries',     value: systemSnapshot.totalBeneficiaries,  icon: <Award size={28} />,  color: '#8b5cf6' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ padding: '1rem', background: `${color}18`, color, borderRadius: '12px' }}>{icon}</div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Constituency Segmentation — above Booth Intelligence & Scheme Impact */}
      <SegmentationSection />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Booth Intelligence */}
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} /> Booth Intelligence
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'TOP PERFORMING BOOTH', value: boothIntelligence.topBooth, color: '#10b981' },
              { label: 'WEAKEST BOOTH', value: boothIntelligence.weakBooth, color: '#ef4444' },
              { label: 'MAX BENEFICIARY BOOTH', value: boothIntelligence.boothWithMaxBeneficiaries, color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '1rem', background: `${color}0d`, borderRadius: '8px', borderLeft: `4px solid ${color}` }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheme Impact */}
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} /> Scheme Impact
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{schemeImpact.schemeCoveragePercentage}%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Coverage</div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{schemeImpact.totalBeneficiaries}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enrolled Beneficiaries</div>
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MOST POPULAR SCHEME</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{schemeImpact.mostPopularScheme}</div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} style={{ color: 'var(--primary)' }} /> Recent Activity (Hyper-Local)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentActivity.map((activity, index) => (
            <div key={index} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                {activity.type === 'infrastructure' ? <Map size={18} /> : activity.type === 'scheme' ? <Award size={18} /> : <Users size={18} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{activity.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>{activity.location}</span>
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px' }}>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
