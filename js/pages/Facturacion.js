import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { formatARS, formatDate } from '../lib/utils.js';

const INVOICE_STATUS = {
  pending: { label: 'Pendiente', color: '#D97706', bg: '#FFFBEB' },
  issued:  { label: 'Emitida',   color: '#0046F3', bg: '#EEF4FF' },
  paid:    { label: 'Cobrada',   color: '#009966', bg: '#F0FDF4' },
  overdue: { label: 'Vencida',   color: '#FF6467', bg: '#FFF0F0' },
};

const PO_STATUS = {
  pending: { label: 'Pendiente', color: '#D97706', bg: '#FFFBEB' },
  issued:  { label: 'Emitida',   color: '#0046F3', bg: '#EEF4FF' },
  paid:    { label: 'Pagada',    color: '#009966', bg: '#F0FDF4' },
};

export default function Facturacion() {
  const { invoiceAuthorizations, purchaseOrders, clients, projects, suppliers } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [tab, setTab] = useState('invoices');

  const totalPaid    = invoiceAuthorizations.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalIssued  = invoiceAuthorizations.filter(i => i.status === 'issued').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoiceAuthorizations.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);

  function markPaid(id) {
    dispatch({ type: 'UPDATE_INVOICE_STATUS', id, status: 'paid' });
    toast('Factura marcada como cobrada');
  }

  const tabBtn = (key, label) => html`
    <button
      onClick=${() => setTab(key)}
      style=${{
        padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        background: tab === key ? '#fff' : 'transparent',
        color: tab === key ? '#111827' : '#6B7280',
        boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >${label}</button>
  `;

  return html`
    <div>
      <${PageHeader}
        title="Facturación"
        subtitle="Autorizaciones de factura y órdenes de compra"
        actions=${html`
          <div style=${{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
            ${tabBtn('invoices', 'Facturas')}
            ${tabBtn('pos', 'Órdenes de Compra')}
          </div>
        `}
      />

      ${tab === 'invoices' ? html`
        <!-- Invoice KPIs -->
        <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          ${[
            { label: 'Cobrado',   value: formatARS(totalPaid),    color: '#009966' },
            { label: 'Emitido',   value: formatARS(totalIssued),  color: '#0046F3' },
            { label: 'Pendiente', value: formatARS(totalPending), color: '#D97706' },
          ].map(k => html`
            <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
              <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
              <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
            </div>
          `)}
        </div>

        <!-- Invoices table -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Facturas</h2>
            <span style=${{ fontSize: 12, color: '#9CA3AF' }}>${invoiceAuthorizations.length} facturas</span>
          </div>
          <div style=${{ overflowX: 'auto' }}>
          <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                ${['Código','Cliente','Proyecto','Fecha','Vencimiento','Neto','IVA','Total','OC Ref.','Estado',''].map(h => html`
                  <th key=${h} style=${{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>${h}</th>
                `)}
              </tr>
            </thead>
            <tbody>
              ${invoiceAuthorizations.map((inv, i) => {
                const client  = clients.find(c => c.id === inv.client);
                const project = projects.find(p => p.id === inv.project);
                const info    = INVOICE_STATUS[inv.status] || INVOICE_STATUS.pending;
                return html`
                  <tr key=${inv.id} style=${{ borderBottom: i < invoiceAuthorizations.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style=${{ padding: '12px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151', fontWeight: 600 }}>${inv.code}</td>
                    <td style=${{ padding: '12px 12px', color: '#374151' }}>${client?.name || '—'}</td>
                    <td style=${{ padding: '12px 12px', color: '#6B7280', fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${project?.title || '—'}</td>
                    <td style=${{ padding: '12px 12px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(inv.date)}</td>
                    <td style=${{ padding: '12px 12px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(inv.due_date)}</td>
                    <td style=${{ padding: '12px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>${formatARS(inv.amount)}</td>
                    <td style=${{ padding: '12px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B7280' }}>${formatARS(inv.iva)}</td>
                    <td style=${{ padding: '12px 12px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap' }}>${formatARS(inv.amount + inv.iva)}</td>
                    <td style=${{ padding: '12px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9CA3AF' }}>${inv.po_ref || '—'}</td>
                    <td style=${{ padding: '12px 12px' }}>
                      <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>${info.label}</span>
                    </td>
                    <td style=${{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      ${inv.status === 'issued' && html`
                        <button
                          onClick=${() => markPaid(inv.id)}
                          style=${{ background: '#F0FDF4', border: '1px solid #009966', color: '#009966', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >Marcar Cobrada</button>
                      `}
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
          </div>
        </div>
      ` : html`
        <!-- Purchase Orders -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Órdenes de Compra</h2>
            <span style=${{ fontSize: 12, color: '#9CA3AF' }}>${purchaseOrders.length} órdenes</span>
          </div>
          <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                ${['Código','Proveedor','Proyecto','Descripción','Fecha','Monto','Estado'].map(h => html`
                  <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
                `)}
              </tr>
            </thead>
            <tbody>
              ${purchaseOrders.map((po, i) => {
                const supplier = suppliers?.find(s => s.id === po.supplier);
                const project  = projects.find(p => p.id === po.project);
                const info     = PO_STATUS[po.status] || PO_STATUS.pending;
                return html`
                  <tr key=${po.id} style=${{ borderBottom: i < purchaseOrders.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style=${{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151', fontWeight: 600 }}>${po.code}</td>
                    <td style=${{ padding: '12px 16px', color: '#374151' }}>${supplier?.name || po.supplier}</td>
                    <td style=${{ padding: '12px 16px', color: '#6B7280', fontSize: 12 }}>${project?.title || '—'}</td>
                    <td style=${{ padding: '12px 16px', color: '#6B7280', fontSize: 12 }}>${po.description}</td>
                    <td style=${{ padding: '12px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(po.date)}</td>
                    <td style=${{ padding: '12px 16px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(po.amount)}</td>
                    <td style=${{ padding: '12px 16px' }}>
                      <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '3px 10px', borderRadius: 99 }}>${info.label}</span>
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}
