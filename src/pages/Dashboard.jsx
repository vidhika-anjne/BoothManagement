import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar as BarChartJS, Doughnut } from 'react-chartjs-2'
import {
  Users, MapPin, BookOpen, MessageSquare,
  ArrowUpRight, RefreshCw, ChevronDown, 
  TrendingUp, Activity, Wifi, WifiOff, 
  Send, Trash2
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell
} from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import dashboardService from '../services/dashboardService.js'
import { websocketService } from '../services/websocketService.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// ── Animate number ──────────────────────────────────────────────────────────
function animateCount(to, duration, cb) {
  const start = performance.now()
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1)
    cb(Math.round(to * p))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// ── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, bg, accent }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => { animateCount(value, 1000, setDisplay) }, [value])
  return (
    <div className="kpi-card" style={{ '--kpi-accent': accent }}>
      <div className="kpi-icon" style={{ background: bg }}>
        <Icon size={20} color={color} />
      </div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{display.toLocaleString()}</div>
        <div className="kpi-delta positive">
          <ArrowUpRight size={12} /> Live
        </div>
      </div>
    </div>
  )
}

// ── Chart theme helper ───────────────────────────────────────────────────────
function chartOpts(dark, stacked = false) {
  const gridColor = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'
  const tickColor = dark ? '#8b949e' : '#9099ae'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: stacked, position: 'top', labels: { color: tickColor, boxWidth: 10, font: { size: 11 } } },
      tooltip: { backgroundColor: dark ? '#1c2330' : '#0f1724', bodyColor: '#fff' },
    },
    scales: {
      x: {
        stacked,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 10 }, maxRotation: 35, minRotation: 0 },
      },
      y: {
        stacked,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 10 } },
      },
    },
  }
}

const PALETTE = ['#2563eb','#6366f1','#3b82f6','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6']

const SEGMENT_FILTERS = [
  { value: 'gender',        label: 'Gender' },
  { value: 'age',           label: 'Age Group' },
  { value: 'occupation',    label: 'Occupation' },
  { value: 'castecategory', label: 'Caste Category' },
  { value: 'area',          label: 'Area Type' },
]

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { darkMode, showToast } = useApp()

  // State
  const [stats,         setStats]         = useState(null)
  const [segments,      setSegments]      = useState([])
  const [segFilter,     setSegFilter]     = useState('gender')
  const [boothParts,    setBoothParts]    = useState([])
  const [boothPerformance, setBoothPerformance] = useState([])
  const [issueData,     setIssueData]     = useState(null)
  const [issueFilter,   setIssueFilter]   = useState('summary') // 'summary' or 'detailed'
  const [wsConnected,   setWsConnected]   = useState(false)
  const [loading,       setLoading]       = useState(true)
  const pollRef = useRef(null)

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [voters, parts, perf] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getBoothParts(),
        dashboardService.getBoothPerformance()
      ])
      setStats(voters)
      setBoothParts(parts)
      setBoothPerformance(perf)
    } catch {
      showToast('Failed to load dashboard data — retrying…')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const fetchIssues = useCallback(async (detailed = false) => {
    try {
      const data = await dashboardService.getIssueDistribution(detailed)
      setIssueData(data)
    } catch (e) {
      console.error('Failed to fetch issues:', e)
    }
  }, [])

  const fetchSegments = useCallback(async (filter) => {
    try {
      const data = await dashboardService.getVoterSegments(filter)
      setSegments(data)
    } catch { /* fallback handled by poll */ }
  }, [])

  // ── WebSocket + fallback poll ──────────────────────────────────────────────
  useEffect(() => {
    fetchAll()
    fetchSegments(segFilter)

    const unsubDashboard = websocketService.subscribe('/topic/dashboard', (payload) => {
      if (payload.stats) setStats(payload.stats);
      if (payload.performance) setBoothPerformance(payload.performance);
      setWsConnected(true);
    });

    // Fallback: poll every 5 s
    pollRef.current = setInterval(() => {
      fetchAll()
    }, 5000)

    return () => {
      unsubDashboard();
      clearInterval(pollRef.current)
    }
  }, []) // eslint-disable-line

  // Re-fetch segments/issues when filter changes
  useEffect(() => { fetchSegments(segFilter) }, [segFilter, fetchSegments])
  useEffect(() => { fetchIssues(issueFilter === 'detailed') }, [issueFilter, fetchIssues])


  // ── Chart data builders ────────────────────────────────────────────────────
  const segChartData = {
    labels: segments.map(s => s.label),
    datasets: [{
      label: 'Voters',
      data: segments.map(s => s.count),
      backgroundColor: segments.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'),
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 80,
    }]
  }

  const partsChartData = boothParts && boothParts.length ? {
    labels: boothParts.map(b => b.partName),
    datasets: [{
      label: 'Voters',
      data: boothParts.map(b => b.voterCount),
      backgroundColor: boothParts.map((_, i) => PALETTE[i % PALETTE.length]),
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 40,
    }]
  } : null


  const issueChartData = (issueData && issueData.labels && issueData.labels.length) ? {
    labels: issueData.labels,
    datasets: [
      {
        label: 'Resolved',
        data: issueData.resolved || [],
        backgroundColor: '#3b82f6', // Consistent Blue for Resolved
        borderRadius: 4,
      },
      {
        label: 'Open',
        data: issueData.open || [],
        backgroundColor: '#f87171', // Redish for Open
        borderRadius: 4,
      }
    ]
  } : null

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Loading dashboard…</div>
        <div style={{ fontSize: '0.8rem' }}>Connecting to backend</div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Command Dashboard</div>
          <div className="page-subtitle">Real-time overview of all booth operations</div>
        </div>
        <div className="page-actions" style={{ alignItems: 'center', gap: '0.75rem', display: 'flex' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.72rem', color: wsConnected ? '#10b981' : '#f59e0b',
            background: wsConnected ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)',
            padding: '0.25rem 0.6rem', borderRadius: '999px',
          }}>
            {wsConnected ? <Wifi size={12}/> : <WifiOff size={12}/>}
            {wsConnected ? 'Live' : 'Polling'}
          </span>
          <button type="button" className="btn btn-secondary" onClick={() => { fetchAll(); fetchSegments(segFilter); showToast('Refreshed') }}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {stats && (
        <div className="kpi-grid">
          <KpiCard label="Total Voters"   value={stats.totalVoters}   icon={Users}         color="#6366f1" bg="rgba(99,102,241,.12)"  accent="#6366f1" />
          <KpiCard label="Total Booths"   value={stats.totalBooths}   icon={MapPin}         color="#10b981" bg="rgba(16,185,129,.12)"  accent="#10b981" />
          <KpiCard label="Total Schemes"  value={stats.totalSchemes}  icon={BookOpen}       color="#f59e0b" bg="rgba(245,158,11,.12)"  accent="#f59e0b" />
          <KpiCard label="Total Feedback" value={stats.totalFeedback} icon={MessageSquare}  color="#3b82f6" bg="rgba(59,130,246,.12)"  accent="#3b82f6" />
        </div>
      )}

      {/* ── Row 1: Voter Segmentation + Booth Parts ── */}
      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Dynamic Voter Segmentation */}
        <div className="chart-card">
          <div className="chart-card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div className="chart-title">Dynamic Voter Segmentation</div>
              <div className="chart-subtitle">Filter voters by demographic</div>
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={segFilter}
                onChange={e => setSegFilter(e.target.value)}
                style={{
                  appearance: 'none', padding: '0.35rem 2rem 0.35rem 0.75rem',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  background: 'var(--surface)', color: 'var(--text)',
                  fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                {SEGMENT_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}/>
            </div>
          </div>
          <div style={{ height: 260, position: 'relative' }}>
            {segments && segments.length > 0 ? (
              <BarChartJS data={segChartData} options={chartOpts(darkMode)} />
            ) : (
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                justifyContent: 'center', height: '100%', color: 'var(--text-muted)', 
                fontSize: '0.85rem', gap: '0.5rem', background: 'var(--surface-2)',
                borderRadius: '8px'
              }}>
                <Activity size={24} opacity={0.5} />
                <span>No data available for this segment</span>
              </div>
            )}
          </div>
        </div>

        {/* Booth Parts Visualization */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Booth Parts Distribution</div>
              <div className="chart-subtitle">Voters per booth part (top 20)</div>
            </div>
          </div>
          <div style={{ height: 260 }}>
            {partsChartData ? (
              <BarChartJS data={partsChartData} options={chartOpts(darkMode)} />
            ) : (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)', fontSize:'0.85rem' }}>Loading booth data…</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Issue Distribution + Booth Performance ── */}
      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Issue Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <div className="chart-title">Issue Distribution</div>
                <div className="chart-subtitle">{issueFilter === 'summary' ? 'Open vs resolved by category' : 'Detailed booth-level analysis'}</div>
              </div>
              <select 
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
                style={{
                  appearance: 'none', padding: '0.2rem 1.5rem 0.2rem 0.5rem',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  background: 'var(--surface-2)', color: 'var(--text)',
                  fontSize: '0.7rem', cursor: 'pointer',
                }}
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
          <div style={{ height: 260 }}>
            {issueFilter === 'summary' ? (
              issueChartData ? (
                issueData.totalVoters > 0 ? (
                  <ResponsiveContainer width="99%" height="99%">
                    <BarChart data={issueChartData.labels.map((l, i) => ({
                      name: l,
                      resolved: issueChartData.datasets[0].data[i],
                      open: issueChartData.datasets[1].data[i]
                    }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        cursor={{ fill: 'var(--primary)', fillOpacity: 0.05 }}
                        contentStyle={{ 
                          backgroundColor: 'var(--surface)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--text-primary)', 
                          fontSize: '11px',
                          borderRadius: '4px',
                          boxShadow: 'var(--shadow-md)'
                        }} 
                      />
                      <RechartsLegend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
                      <Bar dataKey="resolved" stackId="a" barSize={60} fill="#2563eb" radius={[0, 0, 0, 0]}>
                        {issueChartData.labels.map((label, index) => (
                          <Cell key={`res-${index}`} fill="#2563eb" fillOpacity={0.9} />
                        ))}
                      </Bar>
                      <Bar dataKey="open" stackId="a" radius={[4, 4, 0, 0]} barSize={60} fill="#818cf8">
                        {issueChartData.labels.map((label, index) => (
                          <Cell key={`open-${index}`} fill="#818cf8" fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'center', height: '100%', color: 'var(--text-muted)', 
                    fontSize: '0.85rem', gap: '0.5rem', background: 'var(--surface-2)',
                    borderRadius: '8px'
                  }}>
                    <Activity size={24} opacity={0.5} />
                    <span>No data available for issue distribution</span>
                  </div>
                )
              ) : <div className="loading-faded">Loading summary…</div>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead style={{ background: 'var(--surface-2)', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Booth</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Type</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Sev</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issueData?.detailedData ? issueData.detailedData.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{item.booth}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{item.type}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                          <span style={{ 
                            padding:'1px 5px', borderRadius:'4px', fontSize:'0.6rem', fontWeight: 600,
                            background: item.severity === 'High' ? '#fee2e2' : item.severity === 'Medium' ? '#fef3c7' : '#d1fae5',
                            color: item.severity === 'High' ? '#991b1b' : item.severity === 'Medium' ? '#92400e' : '#065f46'
                          }}>{item.severity}</span>
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{item.count}</td>
                      </tr>
                    )) : <tr><td colSpan="4" style={{ textAlign:'center', padding:'2rem' }}>No detailed data available</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Booth Performance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <Activity size={16} color="#6366f1"/> Booth Performance
            </span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 240, padding: '0 0.5rem' }}>
            {boothPerformance.length ? boothPerformance.map((b, i) => {
              const score = b.performanceScore || 0;
              const resRate = b.resolutionRate || 0;
              const color = score >= 70 ? '#4f46e5' : score >= 30 ? '#0ea5e9' : '#94a3b8';
              
              return (
                <div key={i} className="booth-perf-row" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem', alignItems:'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color:'var(--text)' }}>{b.boothName}</span>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Load: {b.issueLoad} issues</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ color, fontWeight: 700, fontSize: '0.85rem' }}>{score.toFixed(1)}%</span>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Res: {resRate}%</div>
                    </div>
                  </div>
                  <div className="booth-bar-bg" style={{ background: 'var(--surface-2)', height: '6px', borderRadius: '3px' }}>
                    <div
                      style={{ 
                        width: `${Math.min(score, 100)}%`, background: color, height: '100%', 
                        borderRadius: '3px', transition: 'width 0.8s ease' 
                      }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding:'2rem', color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center' }}>Calculating real-time scores…</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
