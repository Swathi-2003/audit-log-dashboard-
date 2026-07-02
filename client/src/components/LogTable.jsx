import React from 'react';

const COLS = [
  { key: 'timestamp',   label: 'Timestamp',    mono: true },
  { key: 'actor',       label: 'Actor',        mono: true },
  { key: 'action',      label: 'Action',       mono: true },
  { key: 'resource',    label: 'Resource',     mono: true },
  { key: 'severity',    label: 'Severity' },
  { key: 'status',      label: 'Status'   },
  { key: 'region',      label: 'Region',   mono: true },
];

const SEV_STYLE = {
  LOW:      { color: 'var(--low)',      background: '#0d2e0d', border: '1px solid #1a4a1a'   },
  MEDIUM:   { color: 'var(--medium)',   background: '#2e1f00', border: '1px solid #4a3300'   },
  HIGH:     { color: 'var(--high)',     background: '#2e0d0d', border: '1px solid #4a1a1a'   },
  CRITICAL: { color: 'var(--critical)', background: '#2e0d0d', border: '1px solid #ff7b7244' },
};

const STA_STYLE = {
  Resolved:   { color: 'var(--resolved)',   background: '#0d2e0d' },
  Unresolved: { color: 'var(--unresolved)', background: '#2e1f00' },
};

function Skeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i}>
          {COLS.map(c => (
            <td key={c.key} style={td}>
              <div style={{ height: 14, borderRadius: 4, background: 'var(--border)', opacity: 0.5, width: c.key === 'actor' ? '80%' : '60%', animation: 'pulse 1.4s ease-in-out infinite' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function LogTable({ logs, sortBy, order, onSort, loading }) {
  const arrow = (key) => sortBy === key ? (order === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div style={s.wrap}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.6} }
        tr:hover td { background: #1c2128 !important; }
      `}</style>
      <table style={s.table}>
        <thead>
          <tr>
            {COLS.map(col => (
              <th key={col.key} style={s.th} onClick={() => onSort(col.key)}>
                {col.label}{arrow(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? <Skeleton /> : logs.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} style={{ ...td, textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
                No events found — try adjusting your filters
              </td>
            </tr>
          ) : logs.map(log => (
            <tr key={log._id}>
              <td style={{ ...td, ...mono }}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={{ ...td, ...mono, color: 'var(--accent)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.actor}</td>
              <td style={{ ...td, ...mono }}>{log.action}</td>
              <td style={{ ...td, ...mono, color: 'var(--muted)', fontSize: 12 }}>{log.resource}</td>
              <td style={td}>
                <span style={{ ...badge, ...SEV_STYLE[log.severity] }}>{log.severity}</span>
              </td>
              <td style={td}>
                <span style={{ ...badge, ...STA_STYLE[log.status] }}>{log.status}</span>
              </td>
              <td style={{ ...td, ...mono, fontSize: 12 }}>{log.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrap:  { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th:    { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', userSelect: 'none', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', whiteSpace: 'nowrap' },
};
const td    = { padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, transition: 'background .1s' };
const mono  = { fontFamily: 'var(--mono)', fontSize: 12 };
const badge = { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: '0.3px' };
