import React, { useState, useEffect, useCallback, useRef } from 'react';
import './NotificationPanel.css';

const NOTIF_API  = 'http://localhost:8081/api/notifications';
const VOTERS_API = 'http://localhost:8081/api/voters';

const CHANNEL_ICONS = { SMS: '💬', WHATSAPP: '📱', VOICE: '📞' };
const STATUS_COLORS = {
  PENDING:   '#f59e0b',
  QUEUED:    '#3b82f6',
  SENT:      '#10b981',
  DELIVERED: '#059669',
  FAILED:    '#ef4444',
  RETRYING:  '#f97316',
  CANCELLED: '#6b7280',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPhone(raw) {
  if (!raw) return '';
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (raw.startsWith('+')) return raw;
  return `+91${cleaned}`;
}

// ─── Voter Search Picker (single) ─────────────────────────────────────────────

function VoterPicker({ onSelect, label = 'Select Voter' }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef             = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${VOTERS_API}?search=${encodeURIComponent(q)}&size=10`);
      const data = await res.json();
      setResults(data.content || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const pick = (voter) => {
    setSelected(voter);
    setQuery(voter.name);
    setOpen(false);
    onSelect(voter);
  };

  const clear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    onSelect(null);
  };

  return (
    <div className="np-voter-picker">
      <label>{label}</label>
      <div className="np-voter-picker-input-wrap">
        <input
          className="np-voter-search-input"
          placeholder="Search by name or voter ID…"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query && setOpen(true)}
        />
        {selected && (
          <button className="np-picker-clear-btn" type="button" onClick={clear}>✕</button>
        )}
      </div>

      {open && (query.trim()) && (
        <div className="np-voter-dropdown">
          {loading && <div className="np-voter-dropdown-item muted">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="np-voter-dropdown-item muted">No voters found</div>
          )}
          {results.map((v) => (
            <div
              key={v.id}
              className="np-voter-dropdown-item"
              onMouseDown={() => pick(v)}
            >
              <span className="np-vd-name">{v.name}</span>
              <span className="np-vd-meta">
                {v.voterId} · {v.mobileNumber ? fmtPhone(v.mobileNumber) : <em>No phone</em>}
              </span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="np-selected-voter-card">
          <span>👤 <strong>{selected.name}</strong></span>
          <span className="np-vd-meta">ID: {selected.voterId}</span>
          <span className="np-phone-badge">
            📞 {selected.mobileNumber ? fmtPhone(selected.mobileNumber) : '⚠️ No phone'}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Multi-Voter Picker (bulk) ────────────────────────────────────────────────

function MultiVoterPicker({ onSelectionChange }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState([]);
  const debounceRef             = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${VOTERS_API}?search=${encodeURIComponent(q)}&size=10`);
      const data = await res.json();
      setResults(data.content || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const addVoter = (voter) => {
    if (selected.find((v) => v.id === voter.id)) return;
    const next = [...selected, voter];
    setSelected(next);
    onSelectionChange(next);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const remove = (id) => {
    const next = selected.filter((v) => v.id !== id);
    setSelected(next);
    onSelectionChange(next);
  };

  return (
    <div className="np-voter-picker">
      <label>Add Voters ({selected.length} selected)</label>
      <div className="np-voter-picker-input-wrap">
        <input
          className="np-voter-search-input"
          placeholder="Search and add voters…"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query && setOpen(true)}
        />
      </div>

      {open && query.trim() && (
        <div className="np-voter-dropdown">
          {loading && <div className="np-voter-dropdown-item muted">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="np-voter-dropdown-item muted">No voters found</div>
          )}
          {results.map((v) => {
            const already = !!selected.find((s) => s.id === v.id);
            return (
              <div
                key={v.id}
                className={`np-voter-dropdown-item ${already ? 'already-added' : ''}`}
                onMouseDown={() => !already && addVoter(v)}
              >
                <span className="np-vd-name">{v.name}</span>
                <span className="np-vd-meta">
                  {v.voterId} · {v.mobileNumber ? fmtPhone(v.mobileNumber) : <em>No phone</em>}
                </span>
                {already && <span className="np-vd-badge">✓ Added</span>}
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="np-selected-chips">
          {selected.map((v) => (
            <div key={v.id} className={`np-voter-chip ${!v.mobileNumber ? 'chip-warn' : ''}`}>
              <span>👤 {v.name}</span>
              <span className="np-chip-phone">
                {v.mobileNumber ? fmtPhone(v.mobileNumber) : '⚠️ No phone'}
              </span>
              <button type="button" className="np-chip-remove" onClick={() => remove(v.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return (
    <span className="np-status-badge" style={{ background: STATUS_COLORS[status] || '#6b7280' }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="np-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="np-stat-icon">{icon}</div>
      <div className="np-stat-value">{value}</div>
      <div className="np-stat-label">{label}</div>
    </div>
  );
}

// ─── Send Form (with voter picker) ───────────────────────────────────────────

function SendNotificationForm({ onSuccess }) {
  const [voter, setVoter]       = useState(null);
  const [channel, setChannel]   = useState('SMS');
  const [message, setMessage]   = useState('');
  const [priority, setPriority] = useState(5);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!voter) { setError('Please select a voter.'); return; }
    if (!voter.mobileNumber) { setError(`${voter.name} has no phone number in the database.`); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        voterId:         voter.id,
        voterName:       voter.name,
        recipientNumber: fmtPhone(voter.mobileNumber),
        channel,
        message,
        priority: Number(priority),
      };
      const res = await fetch(`${NOTIF_API}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      onSuccess(`✅ Notification #${data.id} queued for ${voter.name}!`);
      setVoter(null);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="np-send-form" onSubmit={handleSubmit}>
      <h3 className="np-form-title"><span>✉️</span> Send to Voter</h3>
      {error && <div className="np-form-error">⚠️ {error}</div>}

      <VoterPicker label="Select Voter *" onSelect={setVoter} />

      <div className="np-form-group" style={{ marginTop: '1rem' }}>
        <label>Channel *</label>
        <div className="np-channel-selector">
          {['SMS', 'WHATSAPP', 'VOICE'].map((ch) => (
            <button
              type="button"
              key={ch}
              className={`np-channel-btn ${channel === ch ? 'active' : ''}`}
              onClick={() => setChannel(ch)}
            >
              {CHANNEL_ICONS[ch]} {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="np-form-row" style={{ marginTop: '1rem' }}>
        <div className="np-form-group" style={{ flex: 2 }}>
          <label>Message *</label>
          <textarea
            rows={4}
            placeholder="Type your notification message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div className="np-form-group" style={{ flex: 1 }}>
          <label>Priority (1=High, 10=Low)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <span className="np-priority-label">{priority}</span>
          <div className="np-priority-hint">
            {priority <= 3 ? '🔴 High' : priority <= 6 ? '🟡 Normal' : '🟢 Low'}
          </div>
        </div>
      </div>

      <button className="np-btn-primary" type="submit" disabled={loading || !voter}>
        {loading ? '⏳ Sending…' : `🚀 Send ${CHANNEL_ICONS[channel]} to ${voter ? voter.name : '—'}`}
      </button>
    </form>
  );
}

// ─── Bulk Form (with multi-voter picker) ─────────────────────────────────────

function BulkNotificationForm({ onSuccess }) {
  const [voters, setVoters]     = useState([]);
  const [channel, setChannel]   = useState('SMS');
  const [template, setTemplate] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (voters.length === 0) { setError('Add at least one voter.'); return; }

    const withPhone    = voters.filter((v) => v.mobileNumber);
    const withoutPhone = voters.filter((v) => !v.mobileNumber);

    if (withPhone.length === 0) {
      setError('None of the selected voters have phone numbers.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        channel,
        messageTemplate: template,
        recipients: withPhone.map((v) => ({
          voterId:         v.id,
          voterName:       v.name,
          recipientNumber: fmtPhone(v.mobileNumber),
        })),
      };
      const res = await fetch(`${NOTIF_API}/bulk`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const skipMsg = withoutPhone.length > 0
        ? ` (${withoutPhone.length} skipped — no phone)`
        : '';
      onSuccess(`📢 Batch ${data.batchId} — ${data.totalQueued} notifications queued${skipMsg}`);
      setVoters([]);
      setTemplate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const votersWithoutPhone = voters.filter((v) => !v.mobileNumber);

  return (
    <form className="np-send-form" onSubmit={handleSubmit}>
      <h3 className="np-form-title"><span>📢</span> Bulk Send to Voters</h3>
      {error && <div className="np-form-error">⚠️ {error}</div>}

      {votersWithoutPhone.length > 0 && (
        <div className="np-form-warning">
          ⚠️ {votersWithoutPhone.length} voter(s) have no phone number and will be skipped:&nbsp;
          {votersWithoutPhone.map((v) => v.name).join(', ')}
        </div>
      )}

      <MultiVoterPicker onSelectionChange={setVoters} />

      <div className="np-form-group" style={{ marginTop: '1rem' }}>
        <label>Channel *</label>
        <div className="np-channel-selector">
          {['SMS', 'WHATSAPP', 'VOICE'].map((ch) => (
            <button
              type="button"
              key={ch}
              className={`np-channel-btn ${channel === ch ? 'active' : ''}`}
              onClick={() => setChannel(ch)}
            >
              {CHANNEL_ICONS[ch]} {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="np-form-group" style={{ marginTop: '1rem' }}>
        <label>Message Template *</label>
        <textarea
          rows={4}
          placeholder="Message sent to all selected voters…"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          required
        />
      </div>

      <button
        className="np-btn-primary"
        type="submit"
        disabled={loading || voters.length === 0}
      >
        {loading
          ? '⏳ Queuing…'
          : `📢 Send ${CHANNEL_ICONS[channel]} to ${voters.filter(v => v.mobileNumber).length} voters`}
      </button>
    </form>
  );
}

// ─── Notification Table ───────────────────────────────────────────────────────

function NotificationTable({ notifications, loading }) {
  if (loading) {
    return (
      <div className="np-table-loading">
        <div className="np-spinner" />
        <p>Loading notifications…</p>
      </div>
    );
  }
  if (!notifications.length)
    return <div className="np-empty-state">📭 No notifications found</div>;

  return (
    <div className="np-table-wrapper">
      <table className="np-notif-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Voter</th>
            <th>Phone</th>
            <th>Channel</th>
            <th>Message</th>
            <th>Status</th>
            <th>Retries</th>
            <th>Sent At</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n.id}>
              <td className="np-id-cell">#{n.id}</td>
              <td>{n.voterName || '—'}</td>
              <td className="np-phone-cell">{n.recipientNumber}</td>
              <td>
                <span className="np-channel-chip">
                  {CHANNEL_ICONS[n.channel]} {n.channel}
                </span>
              </td>
              <td className="np-msg-cell" title={n.message}>
                {n.message?.length > 48 ? n.message.slice(0, 45) + '…' : n.message}
              </td>
              <td><StatusBadge status={n.status} /></td>
              <td>{n.retryCount}/{n.maxRetries}</td>
              <td>
                {n.sentAt
                  ? new Date(n.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Stats Dashboard ──────────────────────────────────────────────────────────

function StatsDashboard({ stats }) {
  if (!stats) return <div className="np-empty-state">📊 No stats available yet</div>;
  const { byStatus = {}, byChannel = [], last24h = 0 } = stats;

  return (
    <div className="np-stats-section">
      <div className="np-stats-grid">
        <StatCard label="Last 24h"  value={last24h}              icon="⏰" color="#6366f1" />
        <StatCard label="Sent"      value={byStatus.SENT || 0}   icon="✅" color="#10b981" />
        <StatCard label="Delivered" value={byStatus.DELIVERED||0} icon="📩" color="#059669" />
        <StatCard label="Failed"    value={byStatus.FAILED || 0} icon="❌" color="#ef4444" />
        <StatCard label="Queued"    value={byStatus.QUEUED || 0} icon="📋" color="#3b82f6" />
        <StatCard label="Retrying"  value={byStatus.RETRYING||0} icon="🔄" color="#f97316" />
      </div>

      {byChannel.length > 0 && (
        <div className="np-channel-stats">
          <h4>Channel Breakdown</h4>
          <div className="np-channel-bars">
            {byChannel.map((ch) => {
              const pct = ch.total > 0 ? Math.round((Number(ch.success) / Number(ch.total)) * 100) : 0;
              return (
                <div className="np-channel-bar-item" key={ch.channel}>
                  <div className="np-channel-bar-label">
                    <span>{CHANNEL_ICONS[ch.channel]} {ch.channel}</span>
                    <span>{pct}% success</span>
                  </div>
                  <div className="np-channel-bar-track">
                    <div
                      className="np-channel-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="np-channel-bar-meta">
                    {ch.total} total · {ch.success} sent · {ch.failed} failed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function NotificationPanel() {
  const [tab, setTab]               = useState('send');
  const [notifications, setNotifs]  = useState([]);
  const [stats, setStats]           = useState(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState('');
  const [filterChannel, setFilter]  = useState('ALL');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${NOTIF_API}?page=${page}&size=15`);
      const data = await res.json();
      setNotifs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${NOTIF_API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    const iv = setInterval(() => { fetchNotifications(); fetchStats(); }, 15000);
    return () => clearInterval(iv);
  }, [fetchNotifications, fetchStats]);

  const triggerRetry = async () => {
    await fetch(`${NOTIF_API}/retry`, { method: 'POST' });
    showToast('🔄 Retry job triggered');
    setTimeout(fetchNotifications, 2000);
  };

  const filtered =
    filterChannel === 'ALL'
      ? notifications
      : notifications.filter((n) => n.channel === filterChannel);

  return (
    <div className="notif-panel">
      {toast && <div className="np-toast">{toast}</div>}

      {/* Header */}
      <div className="np-header">
        <div>
          <h2>🔔 Notification Center</h2>
          <p>Select voters from the database · SMS · WhatsApp · Voice</p>
        </div>
        <div className="np-header-actions">
          <button className="np-btn-ghost" onClick={() => { fetchNotifications(); fetchStats(); }}>
            🔃 Refresh
          </button>
          <button className="np-btn-warning" onClick={triggerRetry}>
            🔄 Retry Failed
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="np-tabs">
        {[
          { key: 'send',    label: '✉️ Send'    },
          { key: 'bulk',    label: '📢 Bulk'    },
          { key: 'history', label: '📋 History' },
          { key: 'stats',   label: '📊 Stats'   },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`np-tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Send */}
      {tab === 'send' && (
        <div className="np-tab-content">
          <SendNotificationForm
            onSuccess={(msg) => { showToast(msg); fetchNotifications(); fetchStats(); }}
          />
        </div>
      )}

      {/* Tab: Bulk */}
      {tab === 'bulk' && (
        <div className="np-tab-content">
          <BulkNotificationForm
            onSuccess={(msg) => { showToast(msg); fetchNotifications(); fetchStats(); }}
          />
        </div>
      )}

      {/* Tab: History */}
      {tab === 'history' && (
        <div className="np-tab-content">
          <div className="np-filter-bar">
            <span>Filter:</span>
            {['ALL', 'SMS', 'WHATSAPP', 'VOICE'].map((ch) => (
              <button
                key={ch}
                className={`np-filter-btn ${filterChannel === ch ? 'active' : ''}`}
                onClick={() => setFilter(ch)}
              >
                {ch !== 'ALL' && CHANNEL_ICONS[ch]} {ch}
              </button>
            ))}
          </div>

          <NotificationTable notifications={filtered} loading={loading} />

          {totalPages > 1 && (
            <div className="np-pagination">
              <button className="np-btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                ‹ Prev
              </button>
              <span>Page {page + 1} / {totalPages}</span>
              <button className="np-btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Stats */}
      {tab === 'stats' && (
        <div className="np-tab-content">
          <StatsDashboard stats={stats} />
        </div>
      )}
    </div>
  );
}
