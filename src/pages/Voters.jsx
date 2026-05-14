import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Search, Filter, Download, UserPlus, ChevronLeft, ChevronRight, ChevronDown, X, Briefcase, Heart, GraduationCap, Building2, HelpCircle, CheckCircle, Clock, AlertCircle, FileText, Sprout, Zap, UserCheck, Trophy, Home, Shield, Bus, Trash2, MapPin, RefreshCw, Plus, Users } from 'lucide-react'
import { voterService } from '../services/voterService'
import { websocketService } from '../services/websocketService'

const PAGE_SIZE = 8

// ── Premium Custom Select ──────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder, searchable, icon: Icon }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = () => { if (ref.current && !ref.current.contains(document.activeElement)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && searchable && searchRef.current) searchRef.current.focus()
  }, [open, searchable])

  const selected = options.find(o => o.value === value)
  const label = selected ? selected.label : placeholder

  const filtered = searchable && query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: '150px', userSelect: 'none' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setQuery('') }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
          width: '100%', padding: '0.55rem 0.9rem',
          background: 'var(--surface-2)', border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '10px', cursor: 'pointer', color: value === 'All' ? 'var(--text-muted)' : 'var(--text-primary)',
          fontFamily: "'Zilla Slab', serif", fontSize: '0.875rem', fontWeight: value === 'All' ? 400 : 600,
          transition: 'all 0.18s ease', outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {Icon && <Icon size={14} style={{ color: value === 'All' ? 'var(--text-muted)' : 'var(--primary)', flexShrink: 0 }} />}
          {label}
        </span>
        {value !== 'All' && (
          <span
            onClick={() => { onChange('All'); setOpen(false) }}
            style={{ display:'flex', alignItems:'center', color:'var(--text-muted)', padding:'1px 2px', borderRadius:'4px', cursor:'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          ><X size={12} /></span>
        )}
        {value === 'All' && <ChevronDown size={15} style={{ flexShrink: 0, color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%', zIndex: 999,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          animation: 'dropIn 0.15s ease',
        }}>
          <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px);} to { opacity:1; transform:translateY(0); } }`}</style>

          {/* Search box (searchable only) */}
          {searchable && (
            <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)' }}>
              <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  border: 'none', outline: 'none', background: 'transparent', width: '100%',
                  fontFamily: "'Zilla Slab', serif", fontSize: '0.82rem', color: 'var(--text-primary)',
                }}
              />
              {query && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Options list */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', overflowX: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: "'Zilla Slab', serif" }}>
                No results found
              </div>
            ) : filtered.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); setQuery('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.55rem 1rem', cursor: 'pointer',
                  fontFamily: "'Zilla Slab', serif", fontSize: '0.875rem',
                  fontWeight: opt.value === value ? 700 : 400,
                  color: opt.value === value ? 'var(--primary)' : 'var(--text-primary)',
                  background: opt.value === value ? 'var(--primary-light)' : 'transparent',
                  transition: 'background 0.12s ease',
                  borderLeft: opt.value === value ? '3px solid var(--primary)' : '3px solid transparent',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.value !== 'All' && opt.dot && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                )}
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Voters() {
  const { showToast } = useApp()
  const [voters, setVoters] = useState([])
  const [stats, setStats] = useState({ totalVoters: 0, domainInsights: [], statusCounts: {}, booths: [] })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    partId: 'All',
    domain: 'All',
    issue: 'All'
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, voter: null })
  const [newVoter, setNewVoter] = useState({
    name: '',
    age: '',
    gender: 'Male',
    partId: '',
    mobileNumber: '',
    district: 'Digital District',
    assemblyConstituency: 'AC-01',
    domain: 'Agriculture',
    issue: '',
    status: 'PENDING'
  })

  // ── Data Fetching ──────────────────────────────────────────────────────
  const fetchData = useCallback(async (f = filters, p = page) => {
    setLoading(true)
    try {
      const data = await voterService.getVoters({
        search: f.search,
        status: f.status,
        partId: f.partId,
        domain: f.domain,
        issue: f.issue,
        page: p,
        size: PAGE_SIZE,
        sort: 'id,desc'
      })
      setVoters(data.content || [])
      setTotalElements(data.totalElements || 0)
      
      const statData = await voterService.getVoterStats()
      setStats(statData || { totalVoters: 0, domainInsights: [], statusCounts: {}, booths: [] })
    } catch (err) {
      console.error('Failed to fetch voter data:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    // Re-fetch on filter change or page change
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // ── WebSocket Sync ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = websocketService.subscribe('/topic/voters', (msg) => {
      if (msg === 'REFRESH') {
        // Use functional state updates or refs if needed, but here we just re-fetch
        fetchData(filters, page)
        showToast('Real-time update received')
      }
    })
    return () => unsub()
  }, [fetchData, showToast]) // Removed filters, page to break the loop

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }))
    setPage(0)
  }

  const handleExport = async () => {
    try {
      showToast('Preparing your real-time export...')
      const blob = await voterService.downloadExport(filters)
      const filename = `voters_export_${new Date().toISOString().split('T')[0]}.csv`

      // 1. Try modern File System Access API (provides native "Save As" dialog)
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'CSV File',
              accept: { 'text/csv': ['.csv'] },
            }],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          showToast('Export saved successfully!')
          return
        } catch (err) {
          // User cancelled the picker - do nothing or fall back if it was an error
          if (err.name === 'AbortError') return
          console.warn('FilePicker error, falling back:', err)
        }
      }

      // 2. Fallback: Standard browser download (may or may not prompt depending on browser settings)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('Export downloaded successfully!')
    } catch (err) {
      console.error('Export failed:', err)
      showToast('Export failed. Please try again.', 'error')
    }
  }

  const handleAddVoterSubmit = async (e) => {
    e.preventDefault()
    if (!newVoter.name || !newVoter.partId) {
      showToast('Please fill all required fields', 'error')
      return
    }
    try {
      await voterService.addVoter({ ...newVoter, partId: parseInt(newVoter.partId) })
      showToast('New voter registered successfully!')
      setShowAddModal(false)
      setNewVoter({ name: '', age: '', gender: 'Male', partId: '', mobileNumber: '', district: 'Digital District', assemblyConstituency: 'AC-01', domain: 'Agriculture', issue: '', status: 'PENDING' })
      fetchData(filters, page) // Refresh list
    } catch (err) {
      const msg = err.response?.data?.message || 'Error registering voter'
      showToast(msg, 'error')
      console.error('Registration error:', err)
    }
  }

  const handleDeleteVoter = async (voter) => {
    setDeleteConfirm({ show: true, voter })
  }

  const confirmDelete = async () => {
    const voterId = deleteConfirm.voter.id
    try {
      await voterService.deleteVoter(voterId)
      showToast('Voter deleted successfully')
      setDeleteConfirm({ show: false, voter: null })
      fetchData(filters, page)
    } catch {
      showToast('Error deleting voter', 'error')
    }
  }

  const totalPages = Math.ceil(totalElements / PAGE_SIZE)

  const getDomainIcon = (name) => {
    switch (name) {
      case 'Agriculture': return <Sprout size={20} />;
      case 'Women Empowerment': return <Heart size={20} />;
      case 'Senior Citizens': return <UserCheck size={20} />;
      case 'Utility Services': return <Zap size={20} />;
      case 'Sports & Youth': return <Trophy size={20} />;
      case 'Housing': return <Home size={20} />;
      case 'Social Welfare': return <Shield size={20} />;
      case 'Public Transport': return <Bus size={20} />;
      case 'Education': return <GraduationCap size={20} />;
      case 'Health': return <Heart size={20} />;
      case 'Employment': return <Briefcase size={20} />;
      case 'Infrastructure': return <Building2 size={20} />;
      default: return <HelpCircle size={20} />;
    }
  }

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A'
    const date = new Date(ts)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="voter-management-container fade-in">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Voter Management</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="live-pulse"></span> Live PostgreSQL Sync: {totalElements} Records
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Download size={16}/> Export Data
          </button>
          <button type="button" className="btn-v2" onClick={() => setShowAddModal(true)} style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', border: 'none' }}>
            <Plus size={18}/> Add New Voter
          </button>
        </div>
      </div>

      {/* Sliding Domain Cards */}
      <div className="domain-scroller" style={{ display: 'flex', overflowX: 'auto', gap: '1.25rem', paddingBottom: '1.5rem', marginBottom: '1.5rem', scrollbarWidth: 'thin', scrollSnapType: 'x mandatory' }}>
        {(stats.domainInsights || []).map((domain, idx) => {
          const Icon = getDomainIcon(domain.name);
          return (
            <div className="insight-card glass-panel" key={idx} style={{ flex: '0 0 300px', padding: '1.5rem', borderRadius: '16px', scrollSnapAlign: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--surface-2)', color: 'var(--primary)' }}>
                  {Icon}
                </div>
                <span className="status-badge status-approved" style={{ fontSize: '0.7rem' }}>Live</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{domain.name}</h3>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{domain.count} <small style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>Voters</small></div>
              
              <div className="status-mini-breakdown" style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--surface-3)', marginBottom: '1rem' }}>
                 <div style={{ flex: domain.statusBreakdown?.APPROVED || 0, background: '#22c55e' }}></div>
                 <div style={{ flex: domain.statusBreakdown?.PENDING || 0, background: '#f59e0b' }}></div>
                 <div style={{ flex: domain.statusBreakdown?.REJECTED || 0, background: '#ef4444' }}></div>
                 <div style={{ flex: domain.statusBreakdown?.APPLIED || 0, background: '#3b82f6' }}></div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '60px', overflowY: 'auto' }}>
                {(domain.schemes || []).map((s, si) => (
                  <span key={si} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Filters and Table */}
      <div className="card" style={{ background: 'var(--surface-1)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div className="table-filters" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="search-box" style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="filter-input"
              style={{ paddingLeft: '40px', width: '100%' }} 
              placeholder="Search Name, Voter ID, or Issue..." 
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <CustomSelect
              value={filters.domain}
              onChange={val => handleFilterChange('domain', val)}
              placeholder="All Domains"
              options={[
                { value: 'All', label: 'All Domains' },
                ...(stats.domainInsights || []).map(d => ({ value: d.name, label: d.name }))
              ]}
            />

            <CustomSelect
              value={filters.partId}
              onChange={val => handleFilterChange('partId', val)}
              placeholder="All Parts"
              searchable
              options={[
                { value: 'All', label: 'All Parts' },
                ...(stats.booths || []).map(b => ({ value: b, label: `Part ${b}` }))
              ]}
            />

            <CustomSelect
              value={filters.status}
              onChange={val => handleFilterChange('status', val)}
              placeholder="All Statuses"
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'APPROVED', label: 'Approved', dot: '#22c55e' },
                { value: 'PENDING', label: 'Pending', dot: '#f59e0b' },
                { value: 'REJECTED', label: 'Rejected', dot: '#ef4444' },
                { value: 'APPLIED', label: 'Applied', dot: '#3b82f6' },
              ]}
            />
          </div>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table luxury" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voter Profile</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Part Info</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status & Domain</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Added On</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '4rem' }}><RefreshCw className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : voters.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: "'Zilla Slab', serif" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: "'Zilla Slab', serif" }}>
                        {v.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.72rem', marginBottom: '2px', letterSpacing: '0.04em', fontFamily: "'IBM Plex Mono', monospace" }}>{v.voterId}</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', fontFamily: "'Zilla Slab', serif" }}>{v.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Zilla Slab', serif" }}>{v.gender} • {v.age} yrs</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: "'Zilla Slab', serif" }}>
                    <div style={{ fontWeight: 600 }}>Part {v.partId}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Zilla Slab', serif" }}>{v.partName || 'Main Section'}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: "'Zilla Slab', serif" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                       <span className={`status-pill status-${(v.status || 'PENDING').toLowerCase()}`} style={{
                         padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                         fontFamily: "'Zilla Slab', serif",
                         background: v.status === 'APPROVED' ? '#dcfce7' : v.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                         color: v.status === 'APPROVED' ? '#166534' : v.status === 'REJECTED' ? '#991b1b' : '#92400e',
                         border: `1px solid ${v.status === 'APPROVED' ? '#bbf7d0' : v.status === 'REJECTED' ? '#fecaca' : '#fde68a'}`
                       }}>
                         {v.status}
                       </span>
                       <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Zilla Slab', serif" }}>{v.domain}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: "'Zilla Slab', serif" }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: "'Zilla Slab', serif" }}>
                      {formatTimestamp(v.createdAt)}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteVoter(v)}
                      className="action-btn-v2 delete"
                      title="Delete Voter"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ padding: '1rem 1.5rem', background: 'var(--surface-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Page {page + 1} of {totalPages || 1} ({totalElements} total)
          </span>
          <div className="pagination-minimal" style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="page-btn-v2" onClick={() => setPage(p => Math.max(p-1,0))} disabled={page===0}><ChevronLeft size={16}/></button>
            <button type="button" className="page-btn-v2" onClick={() => setPage(p => Math.min(p+1,totalPages-1))} disabled={page >= totalPages - 1}><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {/* Modern Add Voter Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel luxury fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add New Voter</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secure real-time sync to PostgreSQL</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}><X size={24}/></button>
            </div>

            <form onSubmit={handleAddVoterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">FullName *</label>
                  <input required className="voter-input" value={newVoter.name} onChange={e => setNewVoter({...newVoter, name: e.target.value})} placeholder="Enter voter full name"/>
                </div>
                <div>
                  <label className="input-label">Age *</label>
                  <input required type="number" className="voter-input" value={newVoter.age} onChange={e => setNewVoter({...newVoter, age: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select className="voter-input" value={newVoter.gender} onChange={e => setNewVoter({...newVoter, gender: e.target.value})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Part ID *</label>
                  <input required type="number" className="voter-input" value={newVoter.partId} onChange={e => setNewVoter({...newVoter, partId: e.target.value})} placeholder="e.g. 31850"/>
                </div>
                <div>
                  <label className="input-label">District *</label>
                  <input required className="voter-input" value={newVoter.district} onChange={e => setNewVoter({...newVoter, district: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Constituency *</label>
                  <input required className="voter-input" value={newVoter.assemblyConstituency} onChange={e => setNewVoter({...newVoter, assemblyConstituency: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Contact Details</label>
                  <input className="voter-input" value={newVoter.mobileNumber} onChange={e => setNewVoter({...newVoter, mobileNumber: e.target.value})} placeholder="Phone number"/>
                </div>
                <div>
                  <label className="input-label">Domain</label>
                  <select className="voter-input" value={newVoter.domain} onChange={e => setNewVoter({...newVoter, domain: e.target.value})}>
                    <option>Agriculture</option>
                    <option>Women Empowerment</option>
                    <option>Senior Citizens</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>Employment</option>
                    <option>Infrastructure</option>
                    <option>Utility Services</option>
                    <option>Sports & Youth</option>
                    <option>Housing</option>
                    <option>Social Welfare</option>
                    <option>Public Transport</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Registration Status</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {['APPLIED', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                      <button key={s} type="button" 
                        onClick={() => setNewVoter({...newVoter, status: s})}
                        style={{ flex: 1, minWidth: '100px' }}
                        className={`status-opt-btn ${newVoter.status === s ? 'active' : ''}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-v2 btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-v2 btn-filled" style={{ flex: 1.5 }}>Add Voter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel luxury fade-in" style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <AlertCircle size={32} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Confirm Deletion</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Are you sure you want to delete <strong>{deleteConfirm.voter?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-v2 btn-outline" style={{ flex: 1 }} onClick={() => setDeleteConfirm({ show: false, voter: null })}>Cancel</button>
              <button type="button" className="btn-v2" style={{ flex: 1, background: '#ef4444', color: 'white' }} onClick={confirmDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Professional UI Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .voter-management-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .live-pulse { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 rgba(34, 197, 94, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); } }
        
        .insight-card { border: 1px solid var(--border-color); background: var(--surface-1); box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: 0.3s; }
        .insight-card:hover { transform: translateY(-5px); border-color: var(--primary); }
        
        .domain-scroller::-webkit-scrollbar { height: 6px; }
        .domain-scroller::-webkit-scrollbar-track { background: var(--surface-2); border-radius: 10px; }
        .domain-scroller::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
        .domain-scroller::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

        .filter-input, .filter-select { height: 42px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--surface-2); padding: 0 1rem; color: var(--text-primary); font-size: 0.9rem; outline: none; transition: 0.2s; }
        .filter-input:focus, .filter-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1); }
        
        .data-table.luxury { width: 100%; border-collapse: collapse; }
        .data-table.luxury th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); background: var(--surface-2); }
        .data-table.luxury td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
        .data-table.luxury tr:hover { background: rgba(var(--primary-rgb), 0.02); }
        
        .page-btn-v2 { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid var(--border-color); background: var(--surface-1); color: var(--text-primary); cursor: pointer; transition: 0.2s; }
        .page-btn-v2:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
        .page-btn-v2:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
        .modal-content.luxury { background: var(--surface-1); width: 100%; max-width: 650px; border-radius: 24px; padding: 2.5rem; position: relative; border: 1px solid var(--border-color); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
        .modal-close { position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; color: var(--text-muted); cursor: pointer; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .modal-close:hover { background: var(--surface-2); color: var(--text-primary); }
        
        .voter-input { width: 100%; height: 48px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--surface-2); padding: 0 1rem; font-size: 0.95rem; outline: none; transition: 0.2s; color: var(--text-primary); text-align: left; }
        .voter-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1); }
        .input-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-align: left; }
        
        .status-opt-btn { padding: 0.6rem; border-radius: 10px; border: 1.5px solid var(--border-color); background: var(--surface-2); font-size: 0.75rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .status-opt-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
        
        .btn-v2 { height: 50px; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; padding: 0 1.5rem; border: none; display: flex; align-items: center; justify-content: center; }
        .btn-filled { background: var(--primary); color: white; box-shadow: 0 8px 16px rgba(var(--primary-rgb), 0.3); }
        .btn-filled:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(var(--primary-rgb), 0.4); filter: brightness(1.1); }
        .btn-outline { background: var(--surface-2); border: 1.5px solid var(--border-color); color: var(--text-primary); box-sizing: border-box; }
        .btn-outline:hover { background: var(--surface-3); }

        .status-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; line-height: 1.4; display: inline-flex; align-items: center; }
        .status-approved { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .status-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .status-applied { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
        
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}
