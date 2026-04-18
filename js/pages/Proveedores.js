import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState } from '../context.js';
import { formatDate } from '../lib/utils.js';

const CAT_COLORS = {
  'Fotografía':    { color: '#7C3AED', bg: '#F5F3FF' },
  'Audio & Música':{ color: '#0891B2', bg: '#ECFEFF' },
  'Impresión':     { color: '#D97706', bg: '#FFFBEB' },
  'Video & Cine':  { color: '#DC2626', bg: '#FEF2F2' },
};

export default function Proveedores() {
  const navigate  = useNavigate();
  const { suppliers, purchaseOrders, projects } = useAppState();
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(suppliers.map(s => s.category))];

  return html`
    <div>
      <${PageHeader}
        title="Proveedores"
        subtitle="Directorio de proveedores y terceros"
        actions=${html`
          <div style=${{ display: 'flex', gap: 8 }}>
            <button
              onClick=${() => navigate('/proveedores/licitaciones')}
              style=${{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >Ver Licitaciones</button>
            <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              + Nuevo Proveedor
            </button>
          </div>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Total proveedores', value: suppliers.length.toString(),                                         color: '#111827' },
          { label: 'Con proyectos activos', value: suppliers.filter(s => s.active_projects > 0).length.toString(), color: '#009966' },
          { label: 'Categorías',        value: categories.length.toString(),                                        color: '#111827' },
          { label: 'OCs emitidas',      value: purchaseOrders.length.toString(),                                    color: '#0046F3' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <!-- Search -->
      <div style=${{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre, categoría o contacto..."
          value=${search}
          onChange=${e => setSearch(e.target.value)}
          style=${{ width: '100%', boxSizing: 'border-box', padding: '9px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}
        />
      </div>

      <!-- Suppliers table -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Proveedor','Categoría','Contacto','Email','Teléfono','OCs activas',''].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${filtered.map((s, i) => {
              const catInfo = CAT_COLORS[s.category] || { color: '#6B7280', bg: '#F3F4F6' };
              const activePOs = purchaseOrders.filter(po => po.supplier === s.id && po.status !== 'paid');
              return html`
                <tr key=${s.id} style=${{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${s.name}</div>
                  </td>
                  <td style=${{ padding: '14px 16px' }}>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: catInfo.color, background: catInfo.bg, padding: '2px 10px', borderRadius: 99 }}>${s.category}</span>
                  </td>
                  <td style=${{ padding: '14px 16px', color: '#374151', fontSize: 12 }}>${s.contact}</td>
                  <td style=${{ padding: '14px 16px', color: '#0046F3', fontSize: 12 }}>${s.email}</td>
                  <td style=${{ padding: '14px 16px', color: '#374151', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>${s.phone}</td>
                  <td style=${{ padding: '14px 16px' }}>
                    ${activePOs.length > 0
                      ? html`<span style=${{ fontSize: 12, fontWeight: 600, color: '#0046F3', background: '#EEF4FF', padding: '2px 10px', borderRadius: 99 }}>${activePOs.length} OC${activePOs.length > 1 ? 's' : ''}</span>`
                      : html`<span style=${{ fontSize: 12, color: '#9CA3AF' }}>—</span>`
                    }
                  </td>
                  <td style=${{ padding: '14px 16px', textAlign: 'right' }}>
                    <button style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Ver detalle</button>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      <!-- Purchase orders summary -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginTop: 16 }}>
        <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Órdenes de Compra Recientes</h3>
        </div>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Código','Proveedor','Proyecto','Descripción','Fecha','Monto','Estado'].map(h => html`
                <th key=${h} style=${{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${purchaseOrders.map((po, i) => {
              const sup  = suppliers.find(s => s.id === po.supplier);
              const proj = projects.find(p => p.id === po.project);
              const statusInfo = {
                pending: { label: 'Pendiente', color: '#D97706', bg: '#FFFBEB' },
                issued:  { label: 'Emitida',   color: '#0046F3', bg: '#EEF4FF' },
                paid:    { label: 'Pagada',     color: '#009966', bg: '#F0FDF4' },
              }[po.status] || {};
              return html`
                <tr key=${po.id} style=${{ borderBottom: i < purchaseOrders.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style=${{ padding: '11px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#374151' }}>${po.code}</td>
                  <td style=${{ padding: '11px 16px', color: '#374151' }}>${sup?.name || '—'}</td>
                  <td style=${{ padding: '11px 16px', color: '#6B7280', fontSize: 12 }}>${proj?.title?.slice(0, 20) || '—'}${proj?.title?.length > 20 ? '…' : ''}</td>
                  <td style=${{ padding: '11px 16px', color: '#6B7280', fontSize: 12 }}>${po.description}</td>
                  <td style=${{ padding: '11px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(po.date)}</td>
                  <td style=${{ padding: '11px 16px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>$ ${po.amount.toLocaleString('es-AR')}</td>
                  <td style=${{ padding: '11px 16px' }}>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: statusInfo.color, background: statusInfo.bg, padding: '2px 8px', borderRadius: 99 }}>${statusInfo.label}</span>
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
