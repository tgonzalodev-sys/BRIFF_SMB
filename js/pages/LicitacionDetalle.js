import { useParams, useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import { useAppState } from '../context.js';
import { formatARS, formatDate } from '../lib/utils.js';
import { ArrowLeft, FileSearch, Check } from 'lucide-react';

const TENDER_STATUS = {
  draft:       { label: 'Borrador',   color: '#6B7280', bg: '#F3F4F6' },
  open:        { label: 'Abierta',    color: '#0046F3', bg: '#E0E6F6' },
  adjudicated: { label: 'Adjudicada', color: '#009966', bg: '#D0FAE5' },
  cancelled:   { label: 'Cancelada',  color: '#FF6467', bg: '#FFF0F0' },
};

export default function LicitacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenders, projects, suppliers } = useAppState();

  const tender = tenders.find(t => t.id === id);
  if (!tender) return html`
    <div style=${{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
      <div style=${{ marginBottom: 8, color: '#D1D5DB' }}><${FileSearch} size=${44} strokeWidth=${1.33} /></div>
      <div>Licitación no encontrada.</div>
      <button onClick=${() => navigate('/proveedores/licitaciones')} style=${{ marginTop: 16, background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Volver</button>
    </div>
  `;

  const project  = projects.find(p => p.id === tender.project);
  const invited  = (tender.suppliers_invited || []).map(sid => suppliers.find(s => s.id === sid)).filter(Boolean);
  const info     = TENDER_STATUS[tender.status] || TENDER_STATUS.draft;

  // Build quotes matrix: items × suppliers
  const items = tender.items || [];
  const quotes = tender.quotes || [];
  const adj   = tender.adjudicated_to || {};

  function getQuote(supplierId, itemId) {
    return quotes.find(q => q.supplier === supplierId && q.item === itemId);
  }

  // Best (lowest) quote per item
  function bestQuote(itemId) {
    const qs = quotes.filter(q => q.item === itemId);
    return qs.length ? Math.min(...qs.map(q => q.amount)) : null;
  }

  return html`
    <div>
      <!-- Back + header -->
      <div style=${{ marginBottom: 20 }}>
        <button onClick=${() => navigate('/proveedores/licitaciones')} style=${{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}><${ArrowLeft} size=${14} strokeWidth=${1.33} /> Volver a Licitaciones</button>
        <div style=${{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style=${{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
              <h1 style=${{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${tender.title}</h1>
              <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '3px 10px', borderRadius: 99 }}>${info.label}</span>
            </div>
            <p style=${{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              Proyecto: ${project?.title || '—'} · Cierre: ${formatDate(tender.deadline)}
            </p>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Main: quotes comparison table -->
        <div style=${{ flex: 1, minWidth: 0 }}>
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Comparativa de Cotizaciones</h2>
            </div>
            <div style=${{ overflowX: 'auto' }}>
              <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
                <thead>
                  <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 180 }}>Ítem</th>
                    ${invited.map(s => html`
                      <th key=${s.id} style=${{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 140 }}>${s.name}</th>
                    `)}
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item, ii) => {
                    const best = bestQuote(item.id);
                    return html`
                      <tr key=${item.id} style=${{ borderBottom: ii < items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style=${{ padding: '14px 16px' }}>
                          <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${item.description}</div>
                          <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Unidad: ${item.unit}</div>
                        </td>
                        ${invited.map(s => {
                          const q       = getQuote(s.id, item.id);
                          const isAdj   = adj[item.id] === s.id;
                          const isBest  = q && q.amount === best;
                          return html`
                            <td key=${s.id} style=${{
                              padding: '14px 16px', textAlign: 'right',
                              background: isAdj ? '#D0FAE5' : 'transparent',
                            }}>
                              ${q ? html`
                                <div>
                                  <div style=${{ fontSize: 14, fontWeight: 700, color: isAdj ? '#009966' : isBest ? '#0046F3' : '#374151', fontFamily: 'Space Grotesk, sans-serif' }}>
                                    ${formatARS(q.amount)}
                                    ${isAdj && html`<${Check} size=${12} strokeWidth=${2.5} color="#009966" style=${{ marginLeft: 4, display: 'inline-block', verticalAlign: 'middle' }} />`}
                                  </div>
                                  ${isBest && !isAdj && html`<div style=${{ fontSize: 10, color: '#0046F3', fontWeight: 600 }}>Más bajo</div>`}
                                  ${q.notes && html`<div style=${{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>${q.notes}</div>`}
                                </div>
                              ` : html`
                                <span style=${{ fontSize: 12, color: '#D1D5DB' }}>—</span>
                              `}
                            </td>
                          `;
                        })}
                      </tr>
                    `;
                  })}
                </tbody>
                <!-- Totals row -->
                <tfoot>
                  <tr style=${{ borderTop: '2px solid #E5E7EB', background: '#F9FAFB' }}>
                    <td style=${{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</td>
                    ${invited.map(s => {
                      const total = quotes.filter(q => q.supplier === s.id).reduce((sum, q) => sum + q.amount, 0);
                      const isAdjSupplier = Object.values(adj).some(sid => sid === s.id);
                      return html`
                        <td key=${s.id} style=${{ padding: '12px 16px', textAlign: 'right', background: isAdjSupplier ? '#D0FAE5' : 'transparent' }}>
                          <span style=${{ fontSize: 15, fontWeight: 700, color: isAdjSupplier ? '#009966' : '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>
                            ${total > 0 ? formatARS(total) : '—'}
                          </span>
                        </td>
                      `;
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div style=${{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Summary -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Información</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              ${[
                { label: 'Proyecto',     value: project?.title || '—' },
                { label: 'Cierre',       value: formatDate(tender.deadline) },
                { label: 'Ítems',        value: items.length.toString() },
                { label: 'Cotizaciones', value: quotes.length.toString() },
              ].map(row => html`
                <div key=${row.label} style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
                  <span style=${{ color: '#9CA3AF' }}>${row.label}</span>
                  <span style=${{ fontWeight: 600, color: '#374151', textAlign: 'right' }}>${row.value}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Invited suppliers -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Proveedores Invitados (${invited.length})</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              ${invited.map(s => {
                const hasAdj = Object.values(adj).some(sid => sid === s.id);
                return html`
                  <div key=${s.id} style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style=${{ fontSize: 12, fontWeight: 600, color: '#111827' }}>${s.name}</div>
                      <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${s.category}</div>
                    </div>
                    ${hasAdj && html`<span style=${{ fontSize: 11, fontWeight: 700, color: '#009966', background: '#D0FAE5', padding: '2px 8px', borderRadius: 99 }}>Adjudicado</span>`}
                  </div>
                `;
              })}
            </div>
          </div>

          <!-- Adjudication summary -->
          ${Object.keys(adj).length > 0 && html`
            <div style=${{ background: '#D0FAE5', borderRadius: 8, border: '1px solid #BBF7D0', padding: 18 }}>
              <h3 style=${{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#009966', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Adjudicación</h3>
              <div style=${{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                ${Object.entries(adj).map(([itemId, supplierId]) => {
                  const item = items.find(i => i.id === itemId);
                  const sup  = suppliers.find(s => s.id === supplierId);
                  const q    = getQuote(supplierId, itemId);
                  return item && sup ? html`
                    <div key=${itemId} style=${{ fontSize: 12 }}>
                      <div style=${{ fontWeight: 600, color: '#111827' }}>${item.description}</div>
                      <div style=${{ color: '#374151' }}>${sup.name} — ${q ? formatARS(q.amount) : '—'}</div>
                    </div>
                  ` : null;
                })}
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
