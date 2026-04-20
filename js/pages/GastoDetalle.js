import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { formatARS, formatDate, initials } from '../lib/utils.js';
import { ArrowLeft, Receipt, Check } from 'lucide-react';

const EXPENSE_STATUS = {
  draft:    { label: 'Borrador',  color: '#6B7280', bg: '#F3F4F6' },
  pending:  { label: 'Pendiente', color: '#FE9A00', bg: '#FEF3C6' },
  approved: { label: 'Aprobado',  color: '#009966', bg: '#D0FAE5' },
  rejected: { label: 'Rechazado', color: '#FF6467', bg: '#FFF0F0' },
};

const STATUS_TRANSITIONS = {
  draft:    [{ to: 'pending',  label: 'Enviar para Aprobación', primary: true }],
  pending:  [{ to: 'approved', label: 'Aprobar',   primary: true }, { to: 'rejected', label: 'Rechazar', danger: true }],
  approved: [],
  rejected: [{ to: 'draft',   label: 'Reabrir como Borrador', primary: true }],
};

const CATEGORY_COLORS = {
  'Transporte': '#0046F3',
  'Comidas':    '#FE9A00',
  'Materiales': '#8E51FF',
  'Software':   '#00B8DB',
};

export default function GastoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenseSheets, expenseItems, users } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'Transporte', date: '', description: '', amount: '' });

  const sheet = expenseSheets.find(s => s.id === id);
  if (!sheet) return html`
    <div style=${{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
      <div style=${{ marginBottom: 8, color: '#D1D5DB' }}><${Receipt} size=${44} strokeWidth=${1.33} /></div>
      <div>Hoja de gastos no encontrada.</div>
      <button onClick=${() => navigate('/gastos')} style=${{ marginTop: 16, background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Volver</button>
    </div>
  `;

  const creator     = users.find(u => u.id === sheet.created_by);
  const items       = expenseItems.filter(e => e.sheet === id);
  const info        = EXPENSE_STATUS[sheet.status] || EXPENSE_STATUS.draft;
  const transitions = STATUS_TRANSITIONS[sheet.status] || [];

  function changeStatus(to) {
    dispatch({ type: 'UPDATE_EXPENSE_SHEET_STATUS', id, status: to });
    toast(to === 'approved' ? 'Hoja aprobada' : to === 'rejected' ? 'Hoja rechazada' : 'Estado actualizado');
  }

  function addItem() {
    if (!newItem.date || !newItem.description || !newItem.amount) return;
    dispatch({ type: 'ADD_EXPENSE_ITEM', item: { id: 'exi' + Date.now(), sheet: id, ...newItem, amount: Number(newItem.amount), currency: 'ARS', receipt: false } });
    setNewItem({ category: 'Transporte', date: '', description: '', amount: '' });
    setShowAddItem(false);
    toast('Ítem agregado');
  }

  const totalItems = items.reduce((s, i) => s + i.amount, 0);

  return html`
    <div>
      <!-- Back + header -->
      <div style=${{ marginBottom: 20 }}>
        <button onClick=${() => navigate('/gastos')} style=${{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}><${ArrowLeft} size=${14} strokeWidth=${1.33} /> Volver a Gastos</button>
        <div style=${{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style=${{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style=${{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${sheet.title}</h1>
              <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '3px 10px', borderRadius: 99 }}>${info.label}</span>
            </div>
            <p style=${{ margin: 0, fontSize: 13, color: '#6B7280' }}>${sheet.dept} · Período ${sheet.period}${creator ? ' · Creado por ' + creator.name : ''}</p>
          </div>
          <div style=${{ display: 'flex', gap: 8 }}>
            ${transitions.map(t => html`
              <button
                key=${t.to}
                onClick=${() => changeStatus(t.to)}
                style=${{
                  border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                  background: t.danger ? '#FF6467' : '#0046F3',
                  color: '#fff',
                }}
              >${t.label}</button>
            `)}
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Items table -->
        <div style=${{ flex: 1, minWidth: 0 }}>
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Ítems de Gasto</h2>

              ${sheet.status === 'draft' && html`
                <button
                  onClick=${() => setShowAddItem(v => !v)}
                  style=${{ background: '#E0E6F6', color: '#0046F3', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >+ Agregar Ítem</button>
              `}
            </div>

            ${showAddItem && html`
              <div style=${{ padding: '16px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Categoría</label>
                  <select
                    value=${newItem.category}
                    onChange=${e => setNewItem(v => ({ ...v, category: e.target.value }))}
                    style=${{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}
                  >
                    ${['Transporte','Comidas','Materiales','Software','Otro'].map(c => html`<option key=${c} value=${c}>${c}</option>`)}
                  </select>
                </div>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Fecha</label>
                  <input
                    type="date"
                    value=${newItem.date}
                    onChange=${e => setNewItem(v => ({ ...v, date: e.target.value }))}
                    style=${{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                </div>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
                  <label style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción del gasto"
                    value=${newItem.description}
                    onChange=${e => setNewItem(v => ({ ...v, description: e.target.value }))}
                    style=${{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                  />
                </div>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Monto (ARS)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value=${newItem.amount}
                    onChange=${e => setNewItem(v => ({ ...v, amount: e.target.value }))}
                    style=${{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', width: 120 }}
                  />
                </div>
                <div style=${{ display: 'flex', gap: 6 }}>
                  <button onClick=${addItem} style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
                  <button onClick=${() => setShowAddItem(false)} style=${{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                </div>
              </div>
            `}

            <div style=${{ overflowX: 'auto' }}>
            <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  ${['Fecha','Categoría','Descripción','Comprobante','Monto'].map(h => html`
                    <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
                  `)}
                </tr>
              </thead>
              <tbody>
                ${items.length === 0 ? html`
                  <tr><td colspan="5" style=${{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Sin ítems registrados.</td></tr>
                ` : items.map((item, i) => {
                  const catColor = CATEGORY_COLORS[item.category] || '#6B7280';
                  return html`
                    <tr key=${item.id} style=${{ borderBottom: i < items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style=${{ padding: '12px 16px', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${formatDate(item.date)}</td>
                      <td style=${{ padding: '12px 16px' }}>
                        <span style=${{ fontSize: 11, fontWeight: 600, color: catColor, background: catColor + '18', padding: '2px 8px', borderRadius: 99 }}>${item.category}</span>
                      </td>
                      <td style=${{ padding: '12px 16px', color: '#374151' }}>${item.description}</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'center' }}>
                        ${item.receipt
                          ? html`<span style=${{ color: '#009966', display: 'flex', justifyContent: 'center' }}><${Check} size=${14} strokeWidth=${2.5} /></span>`
                          : html`<span style=${{ color: '#FF6467', display: 'flex', justifyContent: 'center' }}>—</span>`
                        }
                      </td>
                      <td style=${{ padding: '12px 16px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(item.amount)}</td>
                    </tr>
                  `;
                })}
              </tbody>
              ${items.length > 0 && html`
                <tfoot>
                  <tr style=${{ borderTop: '2px solid #E5E7EB', background: '#F9FAFB' }}>
                    <td colspan="4" style=${{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</td>
                    <td style=${{ padding: '12px 16px', fontWeight: 700, color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif', fontSize: 16 }}>${formatARS(totalItems)}</td>
                  </tr>
                </tfoot>
              `}
            </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div style=${{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Resumen</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              ${[
                { label: 'Área',      value: sheet.dept },
                { label: 'Período',   value: sheet.period },
                { label: 'Creado por', value: creator?.name || '—' },
                { label: 'N° de ítems', value: items.length.toString() },
                { label: 'Total',     value: formatARS(totalItems) },
              ].map(row => html`
                <div key=${row.label} style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
                  <span style=${{ color: '#9CA3AF' }}>${row.label}</span>
                  <span style=${{ fontWeight: 600, color: '#374151', textAlign: 'right' }}>${row.value}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Category breakdown -->
          ${items.length > 0 && html`
            <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
              <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Por Categoría</h3>
              <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                ${Object.entries(
                  items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + i.amount; return acc; }, {})
                ).map(([cat, amt]) => {
                  const pct = totalItems > 0 ? (amt / totalItems) * 100 : 0;
                  const color = CATEGORY_COLORS[cat] || '#6B7280';
                  return html`
                    <div key=${cat}>
                      <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style=${{ color: '#374151', fontWeight: 500 }}>${cat}</span>
                        <span style=${{ color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>${formatARS(amt)}</span>
                      </div>
                      <div style=${{ height: 4, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                        <div style=${{ height: '100%', width: pct + '%', background: color, borderRadius: 99 }} />
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
