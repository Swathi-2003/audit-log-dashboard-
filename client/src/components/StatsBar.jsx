import React from 'react';

export default function StatsBar({ total, loading }) {
  const stats = [
    { label: 'Total Events',  value: loading ? '—' : total.toLocaleString(), color: 'var(--accent)' },
    { label: 'Showing',       value: loading ? '—' : '25 / page',            color: 'var(--text)'   },
    { label: 'Data Source',   value: 'MongoDB Atlas',                         color: 'var(--low)'    },
    { label: 'Stack',         value: 'React · Node · Express',                color: 'var(--muted)'  },
  ];

  return (
    <div style={s.bar}>
      {stats.map(({ label, value, color }) => (
        <div key={label} style={s.card}>
          <div style={{ ...s.value, color }}>{value}</div>
          <div style={s.label}>{label}</div>
        </div>
      ))}
    </div>
  );
}

const s = {
  bar:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  card:  { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px' },
  value: { fontWeight: 700, fontSize: 18, fontFamily: 'var(--mono)', marginBottom: 2 },
  label: { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
};
