import React, { useEffect, useState, useCallback, useRef } from 'react';
import FilterBar from './components/FilterBar.jsx';
import LogTable  from './components/LogTable.jsx';
import Pagination from './components/Pagination.jsx';
import StatsBar  from './components/StatsBar.jsx';

const API = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [filters, setFilters] = useState({ severity: '', status: '', region: '', search: '' });
  const [sortBy,  setSortBy]  = useState('timestamp');
  const [order,   setOrder]   = useState('desc');
  const [page,    setPage]    = useState(1);
  const [data,    setData]    = useState({ logs: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const debounceRef = useRef(null);

  const fetchLogs = useCallback(async (f, sb, ord, pg) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)),
        sortBy: sb, order: ord, page: pg, limit: 25
      });
      const res  = await fetch(`${API}/api/logs?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search, immediate for dropdowns
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLogs(filters, sortBy, order, page), 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters, sortBy, order, page, fetchLogs]);

  const handleFilterChange = (next) => { setFilters(next); setPage(1); };
  const handleSort = (field) => {
    if (field === sortBy) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setOrder('desc'); }
    setPage(1);
  };

  return (
    <div style={s.layout}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.brand}>
            <span style={s.brandIcon}>⬡</span>
            <div>
              <div style={s.brandName}>AuditLog</div>
              <div style={s.brandSub}>Security Dashboard</div>
            </div>
          </div>
          <div style={s.headerRight}>
            <span style={{ ...s.badge, background: '#0d2e0d', color: 'var(--low)', border: '1px solid #1a4a1a' }}>
              ● Live
            </span>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Stats */}
        <StatsBar total={data.total} loading={loading} />

        {/* Filters */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* Status bar */}
        <div style={s.statusBar}>
          {loading ? (
            <span style={{ color: 'var(--muted)' }}>⟳ Loading…</span>
          ) : error ? (
            <span style={s.errorText}>⚠ {error} — is the backend running?</span>
          ) : (
            <span style={{ color: 'var(--muted)' }}>
              {data.total.toLocaleString()} events found
              {Object.values(filters).some(Boolean) && ' (filtered)'}
            </span>
          )}
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>
            Sorted by <strong style={{ color: 'var(--text)' }}>{sortBy}</strong> {order === 'desc' ? '↓' : '↑'}
          </span>
        </div>

        {/* Table */}
        <LogTable
          logs={data.logs}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          loading={loading}
        />

        {/* Pagination */}
        <Pagination
          page={data.page || page}
          totalPages={data.totalPages || 1}
          total={data.total}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}

const s = {
  layout:      { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header:      { background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1280, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:       { display: 'flex', alignItems: 'center', gap: 12 },
  brandIcon:   { fontSize: 24, color: 'var(--accent)' },
  brandName:   { fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' },
  brandSub:    { fontSize: 11, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  badge:       { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  main:        { maxWidth: 1280, margin: '0 auto', padding: '24px', width: '100%', flex: 1 },
  statusBar:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, minHeight: 24 },
  errorText:   { color: 'var(--high)', fontSize: 13 },
};
