import { useEffect, useRef, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Users, MapPin, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Download, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { BOOTHS, ACTIVITY } from '../data/mockData.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const KPIs = [
  { label: 'Total Voters',   value: 18420, delta: '+4.2%', up: true,  icon: Users,         color: '#6366f1', bg: 'rgba(99,102,241,.12)',  accent: '#6366f1' },
  { label: 'Active Booths',  value: 6,     delta: '100%',  up: true,  icon: MapPin,        color: '#10b981', bg: 'rgba(16,185,129,.12)',  accent: '#10b981' },
  { label: 'Survey Complete',value: 72,    delta: '+8.1%', up: true,  icon: TrendingUp,    color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  accent: '#f59e0b', suffix: '%' },
  { label: 'Open Issues',    value: 5,     delta: '-2',    up: false, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,.12)',   accent: '#ef4444' },
  { label: 'Resolved Today', value: 24,    delta: '+6',    up: true,  icon: CheckCircle,   color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  accent: '#3b82f6' },
]

function animateCount(from, to, duration, cb) {
  const start = performance.now()
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1)
    cb(Math.round(from + (to - from) * p))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function KpiCard({ item }) {
  const [val, setVal] = useState(0)
  useEffect(() => { animateCount(0, item.value, 1200, setVal) }, [item.value])
  const Icon = item.icon
  return (
    <div className="kpi-card" style={{ '--kpi-accent': item.accent }}>
      <div className="kpi-icon" style={{ background: item.bg }}>
        <Icon size={20} color={item.color} />
      </div>
      <div className="kpi-body">
        <div className="kpi-label">{item.label}</div>
        <div className="kpi-value">{val.toLocaleString()}{item.suffix || ''}</div>
        <div className={`kpi-delta ${item.up ? 'positive' : 'negative'}`}>
          {item.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {item.delta} vs last week
        </div>
      </div>
    </div>
  )
}

const chartOpts = (dark) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { bodyColor: '#fff', backgroundColor: dark ? '#1c2330' : '#0f1724' } },
  scales: {
    x: { grid: { color: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)' }, ticks: { color: dark ? '#8b949e' : '#9099ae', font: { size: 11 } } },
    y: { grid: { color: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)' }, ticks: { color: dark ? '#8b949e' : '#9099ae', font: { size: 11 } } },
  }
})

export default function Dashboard() {
  const { darkMode, showToast } = useApp()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul']

  const engagementData = {
    labels: BOOTHS.map(b => b.name.replace('Booth ','B')),
    datasets: [{
      label: 'Engagement %',
      data: BOOTHS.map(b => b.engagement),
      backgroundColor: BOOTHS.map(b =>
        b.engagement >= 80 ? 'rgba(99,102,241,.85)' : b.engagement >= 65 ? 'rgba(99,102,241,.55)' : 'rgba(99,102,241,.35)'
      ),
      borderRadius: 6, borderSkipped: false,
    }]
  }

  const trendData = {
    labels: months,
    datasets: [{
      label: 'Voter Coverage',
      data: [42, 55, 61, 68, 72, 77, 83],
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.12)',
      borderWidth: 2.5, tension: .4, fill: true, pointRadius: 4, pointBackgroundColor: '#6366f1'
    },{
      label: 'Issue Resolution',
      data: [30, 38, 50, 58, 65, 71, 78],
      borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)',
      borderWidth: 2.5, tension: .4, fill: true, pointRadius: 4, pointBackgroundColor: '#10b981'
    }]
  }

  const segmentData = {
    labels: ['Farmers','Students','Senior','Women','Business'],
    datasets: [{
      data: [4200, 3100, 2800, 5200, 3120],
      backgroundColor: ['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6'],
      borderWidth: 0, hoverOffset: 8,
    }]
  }

  const issueData = {
    labels: ['Water','Roads','Electric','Health','Schools','Safety'],
    datasets: [{
      label: 'Count',
      data: [12, 19, 8, 15, 7, 10],
      backgroundColor: 'rgba(239,68,68,.75)', borderRadius: 6, borderSkipped: false,
    }]
  }

  const lineOpts = {
    ...chartOpts(darkMode),
    plugins: {
      ...chartOpts(darkMode).plugins,
      legend: {
        display: true, position: 'top',
        labels: { color: darkMode ? '#8b949e' : '#5a6478', boxWidth: 12, font: { size: 11 } }
      }
    }
  }

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: darkMode ? '#8b949e' : '#5a6478', boxWidth: 10, font: { size: 11 }, padding: 14 } },
      tooltip: { bodyColor: '#fff', backgroundColor: darkMode ? '#1c2330' : '#0f1724' }
    },
    cutout: '68%'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Command Dashboard</div>
          <div className="page-subtitle">Real-time overview of all booth operations</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => showToast('Data refreshed')}><RefreshCw size={14}/>Refresh</button>
          <button className="btn btn-primary" onClick={() => showToast('Report downloaded!')}><Download size={14}/>Export Report</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {KPIs.map(k => <KpiCard key={k.label} item={k} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ gridTemplateRows: 'auto' }}>
        <div className="chart-card" style={{ gridColumn:'1/3' }}>
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Voter Coverage Trend</div>
              <div className="chart-subtitle">Monthly progression across all booths</div>
            </div>
          </div>
          <div style={{ height: 200 }}><Line data={trendData} options={lineOpts} /></div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Voter Segments</div>
              <div className="chart-subtitle">Distribution by category</div>
            </div>
          </div>
          <div style={{ height: 200 }}><Doughnut data={segmentData} options={doughnutOpts} /></div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">Booth Engagement</div>
          </div>
          <div style={{ height: 200 }}><Bar data={engagementData} options={chartOpts(darkMode)} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">Issue Distribution</div>
          </div>
          <div style={{ height: 200 }}><Bar data={issueData} options={chartOpts(darkMode)} /></div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="two-col-grid">
        {/* Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
          </div>
          <div className="activity-list">
            {ACTIVITY.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.color }} />
                <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                <div className="activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Booth Performance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Booth Performance</span>
          </div>
          <div className="booth-perf-list">
            {BOOTHS.map(b => (
              <div className="booth-perf-row" key={b.id}>
                <div className="booth-perf-name">{b.name.replace('Booth ','B-')}</div>
                <div className="booth-bar-bg">
                  <div className="booth-bar-fill" style={{ width: b.engagement + '%', background: b.engagement >= 80 ? '#10b981' : b.engagement >= 65 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <div className="booth-perf-score">{b.engagement}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
