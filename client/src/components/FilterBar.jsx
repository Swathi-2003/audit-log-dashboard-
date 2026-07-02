import React from 'react';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES   = ['Resolved', 'Unresolved'];

export default function FilterBar({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={s.wrap}>
      <div style={s.row}>
        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            style={s.search}
            type="text"
            placeholder="Search actor, action, resource, IP address…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
          {filters.search && (
            <button style={s.clearBtn} onClick={() => set('search', '')}>✕</button>
          )}
        </div>

        {/* Severity */}
        <select style={s.select} value={filters.severity} onChange={e => set('severity', e.target.value)}>
          <option value="">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Status */}
        <select style={s.select} value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Region */}
        <input
          style={{ ...s.select, fontFamily: 'var(--mono)', fontSize: 12 }}
          type="text"
          placeholder="Region (e.g. ap-south)"
          value={filters.region}
          onChange={e => set('region', e.target.value)}
        />

        {/* Clear all */}
        {hasFilters && (
          <button style={s.clearAll} onClick={() => onChange({ severity: '', status: '', region: '', search: '' })}>
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div style={s.chips}>
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span key={k} style={s.chip}>
              {k}: <strong>{v}</strong>
              <button style={s.chipX} onClick={() => set(k, '')}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap:       { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 },
  row:        { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: '1 1 260px' },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 18, pointerEvents: 'none' },
  search:     { width: '100%', padding: '8px 32px 8px 34px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font)', outline: 'none' },
  clearBtn:   { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 2 },
  select:     { padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, cursor: 'pointer', outline: 'none', minWidth: 130 },
  clearAll:   { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' },
  chips:      { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  chip:       { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 20, fontSize: 12, color: 'var(--accent)' },
  chipX:      { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 11, padding: 0, lineHeight: 1 },
};
