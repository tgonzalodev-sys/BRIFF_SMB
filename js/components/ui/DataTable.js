import { useState } from 'react';
import { html } from '../../lib/html.js';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'Sin resultados' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        if (va == null) return 1; if (vb == null) return -1;
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return html`
    <div style=${{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      <div style=${{ overflowX: 'auto' }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${columns.map(col => html`
                <th key=${col.key || col.label}
                  onClick=${col.sortable ? () => handleSort(col.key) : undefined}
                  style=${{ padding: '10px 16px', textAlign: col.align || 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: col.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none', width: col.width || 'auto' }}>
                  ${col.label}${col.sortable && sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${sorted.length === 0
              ? html`<tr><td colSpan=${columns.length} style=${{ padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>${emptyMessage}</td></tr>`
              : sorted.map((row, i) => html`
                <tr key=${row.id || i}
                  onClick=${onRowClick ? () => onRowClick(row) : undefined}
                  style=${{ borderBottom: i < sorted.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
                  onMouseEnter=${e => { if (onRowClick) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave=${e => { e.currentTarget.style.background = ''; }}>
                  ${columns.map(col => html`
                    <td key=${col.key || col.label} style=${{ padding: '12px 16px', fontSize: 14, color: '#111827', textAlign: col.align || 'left', verticalAlign: 'middle' }}>
                      ${col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  `)}
                </tr>
              `)
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}
