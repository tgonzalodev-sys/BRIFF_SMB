import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import FilterBar from '../components/ui/FilterBar.js';
import { useAppState } from '../context.js';
import { formatARS, formatDate } from '../lib/utils.js';

const PO_STATUS = {
  pending: { label: 'Pendiente', color: '#FE9A00', bg: '#FEF3C6' },
  issued:  { label: 'Emitida',   color: '#0046F3', bg: '#E0E6F6' },
  paid:    { label: 'Pagada',    color: '#009966', bg: '#D0FAE5' },
};

export default function OrdenesCompra() {
  const { purchaseOrders, projects, suppliers } = useAppState();
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');

  const filteredPOs = purchaseOrders.filter(po => {
    const supplier = suppliers.find(s => s.id === po.supplier);
    const project  = projects.find(p => p.id === po.project);
    const matchSearch = !search ||
      po.code.toLowerCase().includes(search.toLowerCase()) ||
      (supplier?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (project?.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || po.status === statusF;
    return matchSearch && matchStatus;
  });

  const totalPaid    = purchaseOrders.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalIssued  = purchaseOrders.filter(p => p.status === 'issued').reduce((s, p) => s + p.amount, 0);
  const totalPending = purchaseOrders.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return html`
    <div>
      <${PageHeader}
        title="Órdenes de Compra"
        subtitle="OCs generadas a proveedores"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nueva OC
          </button>
        `}
      />

      <!-- KPIs -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Total OCs',    value: purchaseOrders.length.toString(), color: '#111827' },
          { label: 'Pagadas',      value: formatARS(totalPaid),             color: '#009966' },
          { label: 'Emitidas',     value: formatARS(totalIssued),           color: '#0046F3' },
          { label: 'Pendientes',   value: formatARS(totalPending),          color: '#FE9A00' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <${FilterBar}
        search=${search} onSearch=${setSearch}
        filters=${[
          { label: 'Estado', value: statusF, onChange: setStatusF, options: [
            { value: 'pending', label: 'Pendiente' },
            { value: 'issued',  label: 'Emitida' },
            { value: 'paid',    label: 'Pagada' },
          ]},
        ]}
        count=${filteredPOs.length}
      />

      <!-- Table -->
      <div style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginTop: 12 }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
              ${['Código','Proveedor','Proyecto','Descripción','Fecha','Monto','Estado'].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${filteredPOs.map((po, i) => {
              const supplier = suppliers?.find(s => s.id === po.supplier);
              const project  = projects.find(p => p.id === po.project);
              const info     = PO_STATUS[po.status] || PO_STATUS.pending;
              return html`
                <tr key=${po.id} style=${{ borderBottom: i < filteredPOs.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151', fontWeight: 600 }}>${po.code}</td>
                  <td style=${{ padding: '14px 16px', color: '#374151', fontWeight: 500 }}>${supplier?.name || po.supplier}</td>
                  <td style=${{ padding: '14px 16px', color: '#6B7280', fontSize: 12 }}>${project?.title || '—'}</td>
                  <td style=${{ padding: '14px 16px', color: '#6B7280', fontSize: 12 }}>${po.description}</td>
                  <td style=${{ padding: '14px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(po.date)}</td>
                  <td style=${{ padding: '14px 16px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(po.amount)}</td>
                  <td style=${{ padding: '14px 16px' }}>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '3px 10px', borderRadius: 99 }}>${info.label}</span>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
