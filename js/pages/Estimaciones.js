import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import KpiCard from '../components/ui/KpiCard.js';
import { useAppState } from '../context.js';
import { formatARS, formatPct, formatDate } from '../lib/utils.js';

const STATUS_FILTERS = [
  { value: 'all',             label: 'Todas' },
  { value: 'draft',           label: 'Borrador' },
  { value: 'internal_review', label: 'En Revisión' },
  { value: 'sent_client',     label: 'Al Cliente' },
  { value: 'approved_client', label: 'Aprobada' },
  { value: 'rejected',        label: 'Rechazada' },
];

export default function Estimaciones() {
  const { estimates, clients, projects } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = estimates.filter(e => {
    const cl = clients.find(c => c.id === e.client);
    const pr = projects.find(p => p.id === e.project);
    const matchSearch = !search ||
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      (cl?.name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (pr?.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSell   = estimates.reduce((s, e) => s + e.total_sell, 0);
  const approved    = estimates.filter(e => e.status === 'approved_client');
  const pending     = estimates.filter(e => ['draft','internal_review','approved_internal','sent_client'].includes(e.status));

  return html`
    <div>
      <${PageHeader}
        title="Estimaciones"
        subtitle="Presupuestos y propuestas comerciales"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nueva Estimación
          </button>
        `}
      />

      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <${KpiCard} label="Total Estimaciones" value=${estimates.length} />
        <${KpiCard} label="Pipeline" value=${formatARS(totalSell)} accentColor="#0046F3" />
        <${KpiCard} label="Aprobadas" value=${approved.length} subtitle=${formatARS(approved.reduce((s,e)=>s+e.total_sell,0))} />
        <${KpiCard} label="En Proceso" value=${pending.length} />
      </div>

      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por código, cliente o proyecto…"
          value=${search}
          onInput=${e => setSearch(e.target.value)}
          style=${{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 13, outline: 'none', color: '#111827', fontFamily: 'inherit' }}
        />
        <div style=${{ display: 'flex', gap: 4 }}>
          ${STATUS_FILTERS.map(f => html`
            <button
              key=${f.value}
              onClick=${() => setStatusFilter(f.value)}
              style=${{
                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: statusFilter === f.value ? '1.5px solid #0046F3' : '1px solid #E5E7EB',
                background: statusFilter === f.value ? '#EEF4FF' : '#fff',
                color: statusFilter === f.value ? '#0046F3' : '#6B7280',
              }}
            >${f.label}</button>
          `)}
        </div>
      </div>

      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              ${['Código','Cliente','Proyecto','Estado','Versión','Total Venta','Margen','Creada'].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${filtered.map((e, i) => {
              const cl = clients.find(c => c.id === e.client);
              const pr = projects.find(p => p.id === e.project);
              return html`
                <tr
                  key=${e.id}
                  style=${{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                  onMouseEnter=${ev => ev.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave=${ev => ev.currentTarget.style.background = 'transparent'}
                  onClick=${() => navigate('/estimaciones/' + e.id)}
                >
                  <td style=${{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: '#111827' }}>${e.code}</td>
                  <td style=${{ padding: '12px 16px', color: '#374151', fontWeight: 500 }}>${cl?.name || '—'}</td>
                  <td style=${{ padding: '12px 16px', color: '#6B7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${pr?.title || '—'}</td>
                  <td style=${{ padding: '12px 16px' }}><${StatusBadge} status=${e.status} variant="estimate" /></td>
                  <td style=${{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B7280' }}>v${e.version}</td>
                  <td style=${{ padding: '12px 16px', fontWeight: 600, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(e.total_sell)}</td>
                  <td style=${{ padding: '12px 16px' }}>
                    <span style=${{ fontWeight: 600, color: e.margin_pct >= 45 ? '#009966' : e.margin_pct >= 40 ? '#FD9A00' : '#FF6467' }}>${formatPct(e.margin_pct)}</span>
                  </td>
                  <td style=${{ padding: '12px 16px', color: '#9CA3AF', fontSize: 12 }}>${formatDate(e.created_at)}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
        ${filtered.length === 0 && html`
          <div style=${{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No se encontraron estimaciones con estos filtros.
          </div>
        `}
      </div>
    </div>
  `;
}
