import { useState, useEffect, useCallback, useRef } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import { useApp } from '../../context/AppContext.jsx';
import dashboardService from '../../services/dashboardService.js';
import {
  Users, Award, Activity,
  Zap, ChevronDown, ArrowUpRight,
  RefreshCw, MapPin, TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar as BarChartJS } from 'react-chartjs-2';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell
} from 'recharts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// ── Animate number ─────────────────────────────────────────────────────────────
function animateCount(to, duration, cb) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    cb(Math.round((to || 0) * p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Numerical Formatter ──────────────────────────────────────────────────────
const formatIndianNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Crore';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' Lakh';
  return num.toLocaleString('en-IN');
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, bg, accent }) {
  const [display, setDisplay] = useState(0);
  const isLarge = value >= 100000;

  useEffect(() => {
    // For very large numbers, we don't animate the full count to avoid lag
    // but we can animate a percentage or just set it
    if (!isLarge) animateCount(value || 0, 1000, setDisplay);
  }, [value, isLarge]);

  return (
    <div className="kpi-card" style={{ '--kpi-accent': accent }}>
      <div className="kpi-icon" style={{ background: bg }}>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">
          {isLarge ? formatIndianNumber(value) : display.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// ── Chart options (same as Dashboard.jsx) ─────────────────────────────────────
function chartOpts(dark) {
  const gridColor = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
  const tickColor = dark ? '#8b949e' : '#9099ae';
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: dark ? '#1c2330' : '#0f1724', bodyColor: '#fff' },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 }, maxRotation: 35, minRotation: 0 } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
    },
  };
}

const PALETTE = ['#2563eb', '#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SEGMENT_FILTERS = [
  { value: 'gender',     label: 'Gender' },
  { value: 'age',        label: 'Age Group' },
  { value: 'occupation', label: 'Occupation' },
  { value: 'caste',      label: 'Caste Category' },
];

// Convert segData → bar chart segments based on selected filter
function buildSegments(segData, filter) {
  if (!segData) return [];
  if (filter === 'gender') return [
    { label: 'Male',        count: segData.gender?.male        || 0 },
    { label: 'Female',      count: segData.gender?.female      || 0 },
    { label: 'Transgender', count: segData.gender?.transgender || 0 },
  ];
  if (filter === 'age') return [
    { label: 'Youth (18–25)', count: segData.age?.youth  || 0 },
    { label: 'Adult (26–50)', count: segData.age?.adult  || 0 },
    { label: 'Senior (51+)',  count: segData.age?.senior || 0 },
  ];
  if (filter === 'occupation') return [
    { label: 'Farmers',     count: segData.occupation?.farmers     || 0 },
    { label: 'Businessmen', count: segData.occupation?.businessmen || 0 },
    { label: 'Others',      count: segData.occupation?.others      || 0 },
  ];
  if (filter === 'caste') return [
    { label: 'General', count: segData.caste?.general || 0 },
    { label: 'OBC',     count: segData.caste?.obc     || 0 },
    { label: 'SC',      count: segData.caste?.sc      || 0 },
    { label: 'ST',      count: segData.caste?.st      || 0 },
  ];
  return [];
}

// ── Main SuperAdminDashboard ───────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const { darkMode } = useApp();

  // ── Super admin stats ─────────────────────────────────────────────────────
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);

  // ── Segmentation: filter + location dropdowns + data ─────────────────────
  const [segFilter,   setSegFilter]   = useState('gender');
  const [districts,   setDistricts]   = useState([]);
  const [acs,         setAcs]         = useState([]);
  const [parts,       setParts]       = useState([]);
  const [selDistrict, setSelDistrict] = useState('');
  const [selAc,       setSelAc]       = useState('');
  const [selPart,     setSelPart]     = useState('');
  const [segData,     setSegData]     = useState(null);
  const [segLoading,  setSegLoading]  = useState(true);

  // Custom Dropdown Menus State
  const [showSegMenu,      setShowSegMenu]      = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const [showAcMenu,       setShowAcMenu]       = useState(false);
  const [showPartMenu,     setShowPartMenu]     = useState(false);

  // ── Issue distribution ────────────────────────────────────────────────────
  const [issueData,   setIssueData]   = useState(null);
  const [issueFilter, setIssueFilter] = useState('summary');

  // ── Booth performance ─────────────────────────────────────────────────────
  const [boothPerformance, setBoothPerformance] = useState([]);

  const pollRef = useRef(null);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { setData(await superAdminApi.getDashboardStats()); setError(null); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchSeg = useCallback((district, ac, partNumber) => {
    setSegLoading(true);
    superAdminApi.getHierarchicalSegmentation(
      district || undefined, ac || undefined, partNumber
    ).then(setSegData).catch(() => {}).finally(() => setSegLoading(false));
  }, []);

  const fetchIssues = useCallback(async (detailed = false) => {
    try { setIssueData(await dashboardService.getIssueDistribution(detailed)); } catch (err) { console.error('Issue fetch error:', err); }
  }, []);

  const fetchBoothPerf = useCallback(async () => {
    try { setBoothPerformance(await dashboardService.getBoothPerformance()); } catch (err) { console.error('Booth perf error:', err); }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
    superAdminApi.getDistricts().then(setDistricts).catch(() => {});
    fetchSeg('', '', null);  // All Delhi on mount
    fetchIssues(false);
    fetchBoothPerf();
    pollRef.current = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(pollRef.current);
  }, []); // eslint-disable-line

  // District change → load ACs, re-fetch segmentation
  useEffect(() => {
    setSelAc(''); setSelPart(''); setAcs([]); setParts([]);
    if (selDistrict) {
      superAdminApi.getAcs(selDistrict).then(setAcs).catch(() => {});
      fetchSeg(selDistrict, '', null);
    } else {
      fetchSeg('', '', null);
    }
  }, [selDistrict]); // eslint-disable-line

  // AC change → load parts, re-fetch segmentation
  useEffect(() => {
    setSelPart(''); setParts([]);
    if (selAc) {
      superAdminApi.getParts(selAc).then(setParts).catch(() => {});
      fetchSeg(selDistrict, selAc, null);
    } else if (selDistrict) {
      fetchSeg(selDistrict, '', null);
    }
  }, [selAc]); // eslint-disable-line

  // Part change
  useEffect(() => {
    if (selPart) fetchSeg(selDistrict, selAc, parseInt(selPart, 10));
    else if (selAc) fetchSeg(selDistrict, selAc, null);
  }, [selPart]); // eslint-disable-line

  useEffect(() => { fetchIssues(issueFilter === 'detailed'); }, [issueFilter, fetchIssues]);

  // ── Derived bar chart data from segData ───────────────────────────────────
  const segments = buildSegments(segData, segFilter);
  const segChartData = {
    labels: segments.map(s => s.label),
    datasets: [{
      label: 'Voters',
      data: segments.map(s => s.count),
      backgroundColor: segments.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'),
      borderRadius: 6, borderSkipped: false, maxBarThickness: 80,
    }]
  };

  // ── Status label ──────────────────────────────────────────────────────────
  const isReal = segData && !segData.isEstimated;
  const statusLabel = () => {
    if (!selDistrict && !selAc) return 'Delhi (All Citizens)';
    if (selPart) {
      const p = parts.find(x => String(x.partNumber) === String(selPart));
      return `${p ? `P-${p.partNumber} · ${p.partName}` : `Part ${selPart}`} (${isReal ? 'Real' : 'Estimated'} Data)`;
    }
    if (selAc) return `${selAc} (${isReal ? 'Real' : 'Estimated'} Data)`;
    return `${selDistrict} (Estimated Data)`;
  };

  // ── Issue chart ───────────────────────────────────────────────────────────
  const issueChartData = (issueData?.labels?.length) ? {
    labels: issueData.labels,
    datasets: [
      { label: 'Resolved', data: issueData.resolved || [], backgroundColor: '#3b82f6', borderRadius: 4 },
      { label: 'Open',     data: issueData.open     || [], backgroundColor: '#f87171', borderRadius: 4 },
    ]
  } : null;

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
        <Activity size={20} /> Loading Insight Engine…
      </div>
    </div>
  );
  if (error) return <div className="glass-panel" style={{ padding: '2rem', color: 'var(--danger)' }}>Error: {error}</div>;
  if (!data) return null;

  const { systemSnapshot, boothIntelligence, schemeImpact, recentActivity } = data;

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Super Admin Executive Dashboard</div>
          <div className="page-subtitle">Comprehensive system visibility &amp; insights</div>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,.1)', padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live
          </span>
          <button className="btn btn-secondary" onClick={() => { setRefreshing(true); fetchStats(true); }} disabled={refreshing}>
            <RefreshCw size={14} /> {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        <KpiCard label="Total Voters"     value={systemSnapshot.totalVoters}       icon={Users}  color="#6366f1" bg="rgba(99,102,241,.12)"  accent="#6366f1" />
        <KpiCard label="Total Booths"     value={systemSnapshot.totalBooths}        icon={MapPin} color="#10b981" bg="rgba(16,185,129,.12)"  accent="#10b981" />
        <KpiCard label="Key Demographics" value={systemSnapshot.totalKeyVoters}     icon={Zap}    color="#f59e0b" bg="rgba(245,158,11,.12)"  accent="#f59e0b" />
        <KpiCard label="Beneficiaries"    value={systemSnapshot.totalBeneficiaries} icon={Award}  color="#8b5cf6" bg="rgba(139,92,246,.12)"  accent="#8b5cf6" />
      </div>

      {/* ── Row 1: Dynamic Voter Segmentation + Issue Distribution ── */}
      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>

        {/* ── Dynamic Voter Segmentation — exact Dashboard.jsx style ── */}
        <div className="chart-card">
          {/* Header row: title + demographic dropdown (same as Dashboard.jsx) */}
          <div className="chart-card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div className="chart-title">Dynamic Voter Segmentation</div>
              <div className="chart-subtitle">Filter voters by demographic</div>
            </div>
            <div className="custom-seg-select-container">
              <div 
                className="custom-seg-trigger" 
                onClick={() => { setShowSegMenu(!showSegMenu); setShowDistrictMenu(false); setShowAcMenu(false); setShowPartMenu(false); }}
              >
                <span>{SEGMENT_FILTERS.find(f => f.value === segFilter)?.label}</span>
                <ChevronDown size={14} className={showSegMenu ? 'rotate-180' : ''} />
              </div>
              {showSegMenu && (
                <div className="custom-seg-menu glass-panel">
                  {SEGMENT_FILTERS.map(f => (
                    <div key={f.value} className="custom-seg-item" onClick={() => { setSegFilter(f.value); setShowSegMenu(false); }}>
                      {f.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location filter row: Delhi → District → AC → Part */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.6rem 0 0.4rem', alignItems: 'center' }}>
            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'var(--primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Delhi
            </span>

            {/* District */}
            <div className="custom-loc-select-container">
              <div 
                className="custom-loc-trigger" 
                onClick={() => { setShowDistrictMenu(!showDistrictMenu); setShowSegMenu(false); setShowAcMenu(false); setShowPartMenu(false); }}
              >
                <span>{selDistrict || 'All Districts'}</span>
                <ChevronDown size={12} className={showDistrictMenu ? 'rotate-180' : ''} />
              </div>
              {showDistrictMenu && (
                <div className="custom-loc-menu glass-panel">
                  <div className="custom-loc-item" onClick={() => { setSelDistrict(''); setShowDistrictMenu(false); }}>All Districts</div>
                  {districts.map(d => (
                    <div key={d} className="custom-loc-item" onClick={() => { setSelDistrict(d); setShowDistrictMenu(false); }}>{d}</div>
                  ))}
                </div>
              )}
            </div>

            {/* AC */}
            <div className={`custom-loc-select-container ${!selDistrict ? 'disabled' : ''}`}>
              <div 
                className="custom-loc-trigger" 
                onClick={() => { if(selDistrict) { setShowAcMenu(!showAcMenu); setShowSegMenu(false); setShowDistrictMenu(false); setShowPartMenu(false); } }}
              >
                <span>{selAc || (selDistrict ? 'All ACs' : '— District —')}</span>
                <ChevronDown size={12} className={showAcMenu ? 'rotate-180' : ''} />
              </div>
              {showAcMenu && (
                <div className="custom-loc-menu glass-panel">
                  <div className="custom-loc-item" onClick={() => { setSelAc(''); setShowAcMenu(false); }}>All ACs</div>
                  {acs.map(a => (
                    <div key={a} className="custom-loc-item" onClick={() => { setSelAc(a); setShowAcMenu(false); }}>{a}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Part */}
            <div className={`custom-loc-select-container ${!selAc ? 'disabled' : ''}`}>
              <div 
                className="custom-loc-trigger" 
                onClick={() => { if(selAc) { setShowPartMenu(!showPartMenu); setShowSegMenu(false); setShowDistrictMenu(false); setShowAcMenu(false); } }}
              >
                <span className="truncate">{selPart ? `P-${selPart}` : (selAc ? 'All Booths' : '— AC first —')}</span>
                <ChevronDown size={12} className={showPartMenu ? 'rotate-180' : ''} />
              </div>
              {showPartMenu && (
                <div className="custom-loc-menu glass-panel">
                  <div className="custom-loc-item" onClick={() => { setSelPart(''); setShowPartMenu(false); }}>All Booths</div>
                  {parts.map(p => (
                    <div key={p.partNumber} className="custom-loc-item" onClick={() => { setSelPart(p.partNumber); setShowPartMenu(false); }}>
                      P-{p.partNumber} · {p.partName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status label (same pill style as Dashboard.jsx) */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.7rem', fontWeight: 500, marginBottom: '0.5rem',
            padding: '0.18rem 0.65rem', borderRadius: '999px',
            background: isReal ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)',
            color: isReal ? 'var(--primary)' : '#f59e0b',
          }}>
            {isReal ? '●' : '⚠'} {statusLabel()}
          </div>

          {/* Bar chart — height 260, same as Dashboard.jsx */}
          <div style={{ height: 260, position: 'relative' }}>
            {segLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem', gap: '0.5rem' }}>
                <Activity size={20} opacity={0.5} style={{ animation: 'spin 1.2s linear infinite' }} />
                <span>Loading segmentation…</span>
              </div>
            ) : segments.length > 0 ? (
              <BarChartJS data={segChartData} options={chartOpts(darkMode)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: '8px' }}>
                <Activity size={24} opacity={0.5} />
                <span>No data available for this segment</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Issue Distribution ── */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <div className="chart-title">Issue Distribution</div>
                <div className="chart-subtitle">
                  {issueFilter === 'summary' ? 'Open vs resolved by category' : 'Detailed booth-level analysis'}
                </div>
              </div>
              <select
                value={issueFilter}
                onChange={e => setIssueFilter(e.target.value)}
                style={{ appearance: 'none', padding: '0.2rem 1.5rem 0.2rem 0.5rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--text)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
          <div style={{ height: 260 }}>
            {issueFilter === 'summary' ? (
              issueChartData && issueData.totalVoters > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={issueChartData.labels.map((l, i) => ({ name: l, resolved: issueChartData.datasets[0].data[i], open: issueChartData.datasets[1].data[i] }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: 'var(--primary)', fillOpacity: 0.05 }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontSize: '11px', borderRadius: '4px' }} />
                    <RechartsLegend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
                    <Bar dataKey="resolved" stackId="a" barSize={60} fill="#2563eb" radius={[0, 0, 0, 0]}>
                      {issueChartData.labels.map((_, i) => <Cell key={i} fill="#2563eb" fillOpacity={0.9} />)}
                    </Bar>
                    <Bar dataKey="open" stackId="a" radius={[4, 4, 0, 0]} barSize={60} fill="#818cf8">
                      {issueChartData.labels.map((_, i) => <Cell key={i} fill="#818cf8" fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: '8px' }}>
                  <Activity size={24} opacity={0.5} />
                  <span>No data available for issue distribution</span>
                </div>
              )
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead style={{ background: 'var(--surface-2)', position: 'sticky', top: 0 }}>
                    <tr>
                      {['Booth', 'Type', 'Sev', 'Count'].map((h, i) => (
                        <th key={h} style={{ padding: '0.5rem', textAlign: i === 3 ? 'right' : i === 2 ? 'center' : 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {issueData?.detailedData ? issueData.detailedData.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{item.booth}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{item.type}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                          <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, background: item.severity === 'High' ? '#fee2e2' : item.severity === 'Medium' ? '#fef3c7' : '#d1fae5', color: item.severity === 'High' ? '#991b1b' : item.severity === 'Medium' ? '#92400e' : '#065f46' }}>{item.severity}</span>
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{item.count}</td>
                      </tr>
                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No detailed data</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Booth Performance ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="#6366f1" /> Booth Performance
            </span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 280, padding: '0 0.5rem' }}>
            {boothPerformance.length ? boothPerformance.map((b, i) => {
              const score = b.performanceScore || 0;
              const color = score >= 70 ? '#4f46e5' : score >= 30 ? '#0ea5e9' : '#94a3b8';
              return (
                <div key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{b.boothName}</span>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Load: {b.issueLoad} issues</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color, fontWeight: 700, fontSize: '0.85rem' }}>{score.toFixed(1)}%</span>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Res: {b.resolutionRate || 0}%</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', height: '6px', borderRadius: '3px' }}>
                    <div style={{ width: `${Math.min(score, 100)}%`, background: color, height: '100%', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Calculating real-time scores…</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Scheme Impact + Activity Feed ── */}
      <div className="two-col-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="#6366f1" /> Scheme Impact
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.25rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{schemeImpact.schemeCoveragePercentage}%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Overall Coverage</div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', marginTop: '0.75rem' }}>
                  <div style={{ width: `${schemeImpact.schemeCoveragePercentage}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px', transition: 'width 1s ease' }} />
                </div>
              </div>
              <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{schemeImpact.totalBeneficiaries?.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Enrolled Beneficiaries</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <ArrowUpRight size={11} /> Growing
                </div>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', letterSpacing: '0.05em', fontWeight: 600 }}>MOST POPULAR SCHEME</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{schemeImpact.mostPopularScheme}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="#6366f1" /> Recent Activity
              <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,.15)', color: '#6366f1', borderRadius: '999px', padding: '0.1rem 0.5rem', marginLeft: '0.3rem' }}>
                {recentActivity.length}
              </span>
            </span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 270, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{ padding: '0.65rem 0.8rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.2rem' }}>{activity.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{activity.location}</span>
                  <span style={{ background: 'var(--surface-2)', padding: '1px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .custom-seg-select-container, .custom-loc-select-container {
          position: relative;
          user-select: none;
        }
        .custom-seg-trigger, .custom-loc-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .custom-seg-trigger {
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          min-width: 120px;
          font-size: 0.78rem;
        }
        .custom-loc-trigger {
          padding: 0.28rem 0.6rem;
          border-radius: 7px;
          font-size: 0.73rem;
          height: 32px;
        }
        .custom-seg-trigger:hover, .custom-loc-trigger:hover:not(.disabled) {
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
        }
        .custom-loc-select-container.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .custom-seg-menu, .custom-loc-menu {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
          animation: slideDownFade 0.2s ease-out;
        }
        .custom-seg-item, .custom-loc-item {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .custom-seg-item:hover, .custom-loc-item:hover {
          background: var(--surface-2);
          color: var(--primary);
          padding-left: 0.9rem;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
