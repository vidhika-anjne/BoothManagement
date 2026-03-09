import { useState } from 'react'
import { VOTERS, SEGMENTS } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import { Search, Filter, Download, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 8

export default function Voters() {
  const { showToast } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [boothFilter, setBoothFilter] = useState('All')
  const [page, setPage] = useState(1)

  const booths = ['All', ...Array.from(new Set(VOTERS.map(v => v.booth)))]
  const statuses = ['All', 'Active', 'Inactive', 'Pending']

  const filtered = VOTERS.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || v.status === statusFilter
    const matchBooth  = boothFilter === 'All' || v.booth === boothFilter
    return matchSearch && matchStatus && matchBooth
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Voter Management</div>
          <div className="page-subtitle">Manage and analyze voter records across all booths</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => showToast('Report exported!')}><Download size={14}/>Export</button>
          <button className="btn btn-primary" onClick={() => showToast('Add Voter form coming soon!')}><UserPlus size={14}/>Add Voter</button>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="segment-grid" style={{ marginBottom: '1.5rem' }}>
        {SEGMENTS.map(s => (
          <div className="segment-card" key={s.id}>
            <div className="seg-emoji">{s.emoji}</div>
            <div className="seg-name">{s.name}</div>
            <div className="seg-count">{s.count.toLocaleString()}</div>
            <div className="seg-label">Registered</div>
            <div className="seg-issues">Top Issue: {s.topIssue}</div>
            <div>
              <span className="seg-scheme-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {s.scheme}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-toolbar">
          <div className="search-box small">
            <Search size={13} />
            <input placeholder="Search name or voter ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select className="select-sm" value={boothFilter} onChange={e => { setBoothFilter(e.target.value); setPage(1) }}>
              {booths.map(b => <option key={b}>{b}</option>)}
            </select>
            <select className="select-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Voter ID</th><th>Name</th><th>Age</th><th>Gender</th>
                <th>Booth</th><th>Category</th><th>Schemes</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => (
                <tr key={v.id}>
                  <td><code style={{ fontSize: '.78rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{v.id}</code></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                  <td>{v.age}</td>
                  <td>{v.gender}</td>
                  <td>{v.booth}</td>
                  <td>{v.category}</td>
                  <td style={{ fontSize: '.75rem' }}>{v.schemes.join(', ')}</td>
                  <td><span className={`status-badge status-${v.status.toLowerCase()}`}>{v.status}</span></td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No voters found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(p-1,1))} disabled={page===1}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: totalPages }, (_,i) => (
              <button key={i+1} className={`page-btn${page===i+1?' active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(p+1,totalPages))} disabled={page===totalPages}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
