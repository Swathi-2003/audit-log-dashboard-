import React from 'react';

export default function Pagination({ page, totalPages, total, onPageChange }) {
  const from = total === 0 ? 0 : (page - 1) * 25 + 1;
  const to   = Math.min(page * 25, total);

  return (
    <div style={s.wrap}>
      <span style={s.info}>
        {total === 0 ? 'No results' : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()} events`}
      </span>
      <div style={s.btns}>
        <button style={{ ...s.btn, opacity: page <= 1 ? 0.4 : 1 }} disabled={page <= 1} onClick={() => onPageChange(1)}>«</button>
        <button style={{ ...s.btn, opacity: page <= 1 ? 0.4 : 1 }} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹ Prev</button>
        <span style={s.pageInfo}>Page {page} of {totalPages}</span>
        <button style={{ ...s.btn, opacity: page >= totalPages ? 0.4 : 1 }} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next ›</button>
        <button style={{ ...s.btn, opacity: page >= totalPages ? 0.4 : 1 }} disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>»</button>
      </div>
    </div>
  );
}

const s = {
  wrap:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', flexWrap: 'wrap', gap: 8 },
  info:     { color: 'var(--muted)', fontSize: 13 },
  btns:     { display: 'flex', alignItems: 'center', gap: 6 },
  btn:      { padding: '6px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', fontSize: 13, transition: 'border-color .15s' },
  pageInfo: { padding: '6px 14px', color: 'var(--muted)', fontSize: 13 },
};
