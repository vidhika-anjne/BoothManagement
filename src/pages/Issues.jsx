import { Bar, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS, RadialLinearScale, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js'
import { ISSUES } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import { AlertTriangle, Download, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'

ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend)

const ISSUE_KPIS = [
  { label: 'Total Issues',  value: 47, color: '#6366f1' },
  { label: 'Open',          value: 5,  color: '#ef4444' },
  { label: 'In Progress',   value: 18, color: '#f59e0b' },
  { label: 'Resolved',      value: 24, color: '#10b981' },
]

export default function Issues() {
  const { darkMode, showToast } = useApp()

  const categories = ['Water Supply','Roads','Electricity','Healthcare','Schools','Safety','Housing']

  const radarData = {
    labels: categories,
    datasets: [{
      label: 'Issue Count',
      data: [12, 19, 8, 15, 7, 10, 9],
      backgroundColor: 'rgba(99,102,241,.2)',
      borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#6366f1', pointRadius: 4
    }]
  }
  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: {
        grid: { color: darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)' },
        pointLabels: { color: darkMode ? '#8b949e' : '#5a6478', font: { size: 11 } },
        ticks: { display: false }
      }
    },
    plugins: { legend: { display: false }, tooltip: { backgroundColor: darkMode ? '#1c2330' : '#0f1724' } }
  }

  const barData = {
    labels: categories,
    datasets: [
      { label: 'Open', data: [3, 5, 2, 4, 2, 3, 2], backgroundColor: 'rgba(239,68,68,.7)', borderRadius: 4, borderSkipped: false },
      { label: 'In Progress', data: [5, 8, 3, 6, 3, 4, 3], backgroundColor: 'rgba(245,158,11,.7)', borderRadius: 4, borderSkipped: false },
      { label: 'Resolved', data: [4, 6, 3, 5, 2, 3, 4], backgroundColor: 'rgba(16,185,129,.7)', borderRadius: 4, borderSkipped: false },
    ]
  }
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: darkMode ? '#8b949e' : '#5a6478', boxWidth: 12, font: { size: 11 } } }, tooltip: { backgroundColor: darkMode ? '#1c2330' : '#0f1724' } },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: darkMode ? '#8b949e' : '#9099ae', font: { size: 11 } } },
      y: { stacked: true, grid: { color: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)' }, ticks: { color: darkMode ? '#8b949e' : '#9099ae', font: { size: 11 } } }
    }
  }

  const statusIcon = { Open: <XCircle size={13}/>, 'In Progress': <Clock size={13}/>, Resolved: <CheckCircle size={13}/> }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Issues Tracker</div>
          <div className="page-subtitle">Monitor and resolve booth-level community issues</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => showToast('Report exported!')}><Download size={14}/>Export</button>
          <button className="btn btn-primary" onClick={() => showToast('Issue creation coming soon!')}><Plus size={14}/>New Issue</button>
        </div>
      </div>

      <div className="issue-kpis" style={{ marginBottom: '1.5rem' }}>
        {ISSUE_KPIS.map(k => (
          <div className="issue-kpi card" key={k.label}>
            <div className="issue-kpi-num" style={{ color: k.color }}>{k.value}</div>
            <div className="issue-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">Issue Category Radar</div>
          </div>
          <div style={{ height: 240 }}><Radar data={radarData} options={radarOpts} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">Issues by Category & Status</div>
          </div>
          <div style={{ height: 240 }}><Bar data={barData} options={barOpts} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Issues</span>
          <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{ISSUES.length} records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Title</th><th>Category</th><th>Booth</th>
                <th>Reporter</th><th>Priority</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ISSUES.map(issue => (
                <tr key={issue.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>{issue.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</td>
                  <td>{issue.category}</td>
                  <td>{issue.booth}</td>
                  <td>{issue.reporter}</td>
                  <td>
                    <span className={`priority-badge priority-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${issue.status === 'Open' ? 'status-open' : issue.status === 'In Progress' ? 'status-progress' : 'status-resolved'}`}>
                      {statusIcon[issue.status]} {issue.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{issue.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
