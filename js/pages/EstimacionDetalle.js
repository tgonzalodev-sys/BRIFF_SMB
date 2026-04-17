import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { formatARS, formatPct, formatDate } from '../lib/utils.js';

const STATUS_TRANSITIONS = {
  draft:             [{ to: 'internal_review',   label: 'Enviar a Revisión',       primary: true }],
  internal_review:   [{ to: 'approved_internal', label: 'Aprobar Internamente',    primary: true },
                      { to: 'rejected',           label: 'Rechazar',                danger: true  }],
  approved_internal: [{ to: 'sent_client',        label: 'Enviar al Cliente',       primary: true }],
  sent_client:       [{ to: 'approved_client',    label: 'Marcar como Aprobada',    primary: true },
                      { to: 'rejected',           label: 'Rechazar',                danger: true  }],
  approved_client:   [],
  rejected:          [{ to: 'draft',              label: 'Crear Nueva Revisión',    primary: true }],
};

function nextVersion(v) {
  const parts = v.split('.').map(Number);
  parts[parts.length - 1] += 1;
  return parts.join('.');
}

export default function EstimacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estimates, estimateDeliverables, estimateResources, estimateThirdParty, estimateVersions, clients, projects, users, suppliers } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [closed, setClosed] = useState(new Set());

  const estimate = estimates.find(e => e.id === id);
  if (!estimate) return html`
    <div style=${{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
      <div style=${{ fontSize: 32, marginBottom: 12 }}>◧</div>
      <div style=${{ fontSize: 14 }}>Estimación no encontrada.</div>
      <button onClick=${() => navigate('/estimaciones')} style=${{ marginTop: 16, background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Volver</button>
    </div>
  `;

  const client       = clients.find(c => c.id === estimate.client);
  const project      = projects.find(p => p.id === estimate.project);
  const deliverables = estimateDeliverables.filter(d => d.estimate === id).sort((a, b) => a.order - b.order);
  const versions     = estimateVersions.filter(v => v.estimate === id).sort((a, b) => b.version.localeCompare(a.version));
  const transitions  = STATUS_TRANSITIONS[estimate.status] || [];

  const isOpen     = did => !closed.has(did);
  const toggleOpen = did => setClosed(prev => { const s = new Set(prev); s.has(did) ? s.delete(did) : s.add(did); return s; });

  const allResources = estimateResources.filter(r => deliverables.some(d => d.id === r.deliverable));
  const allTP        = estimateThirdParty.filter(t => deliverables.some(d => d.id === t.deliverable));
  const totalCost    = allResources.reduce((s, r) => s + r.cost, 0) + allTP.reduce((s, t) => s + t.cost, 0);
  const totalSell    = allResources.reduce((s, r) => s + r.sell, 0) + allTP.reduce((s, t) => s + t.sell, 0);
  const dispCost     = totalCost > 0 ? totalCost  : estimate.total_cost;
  const dispSell     = totalSell > 0 ? totalSell  : estimate.total_sell;
  const dispMargin   = dispSell - dispCost;
  const dispMarginPct = dispSell > 0 ? (dispMargin / dispSell) * 100 : estimate.margin_pct;

  function handleTransition(toStatus) {
    const newVersion = nextVersion(estimate.version);
    dispatch({ type: 'UPDATE_ESTIMATE_STATUS', id, status: toStatus, newVersion });
    const labels = { internal_review: 'En Revisión', approved_internal: 'Aprobada Internamente', sent_client: 'Enviada al Cliente', approved_client: 'Aprobada por Cliente', rejected: 'Rechazada', draft: 'Borrador' };
    toast('Estado actualizado: ' + (labels[toStatus] || toStatus));
  }

  const btnBase = { border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' };

  return html`
    <div>
      <!-- Page header -->
      <div style=${{ marginBottom: 20 }}>
        <button
          onClick=${() => navigate('/estimaciones')}
          style=${{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, fontFamily: 'inherit' }}
        >← Volver a Estimaciones</button>
        <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style=${{ fontSize: 22, fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>${estimate.code}</h1>
            <${StatusBadge} status=${estimate.status} variant="estimate" size="md" />
          </div>
          <div style=${{ display: 'flex', gap: 8 }}>
            ${transitions.map(t => html`
              <button
                key=${t.to}
                onClick=${() => handleTransition(t.to)}
                style=${{ ...btnBase, background: t.danger ? '#FF6467' : '#0046F3', color: '#fff' }}
              >${t.label}</button>
            `)}
          </div>
        </div>
        <p style=${{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
          ${client?.name || '—'} · ${project?.title || '—'} · v${estimate.version} · Creada ${formatDate(estimate.created_at)}
        </p>
      </div>

      <!-- Two-column layout -->
      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Main: deliverables -->
        <div style=${{ flex: 1, minWidth: 0 }}>
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Entregables</h2>
              <button style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}>+ Agregar entregable</button>
            </div>

            ${deliverables.length === 0 ? html`
              <div style=${{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                <div style=${{ fontSize: 28, marginBottom: 8 }}>◧</div>
                <div>No hay entregables en esta estimación.</div>
              </div>
            ` : deliverables.map((d, di) => {
              const resources  = estimateResources.filter(r => r.deliverable === d.id);
              const thirdParty = estimateThirdParty.filter(t => t.deliverable === d.id);
              const dCost = resources.reduce((s, r) => s + r.cost, 0) + thirdParty.reduce((s, t) => s + t.cost, 0);
              const dSell = resources.reduce((s, r) => s + r.sell, 0) + thirdParty.reduce((s, t) => s + t.sell, 0);
              const open  = isOpen(d.id);
              return html`
                <div key=${d.id} style=${{ borderBottom: di < deliverables.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                  <!-- Deliverable header -->
                  <div
                    onClick=${() => toggleOpen(d.id)}
                    style=${{ display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', userSelect: 'none', background: open ? '#FAFBFF' : '#fff', transition: 'background 0.15s' }}
                  >
                    <span style=${{ marginRight: 10, color: '#6B7280', fontSize: 11, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▶</span>
                    <span style=${{ flex: 1, fontWeight: 600, fontSize: 13, color: '#111827' }}>${d.order}. ${d.title}</span>
                    <span style=${{ fontSize: 12, color: '#9CA3AF', marginRight: 20 }}>${resources.length + thirdParty.length} items · ${resources.reduce((s, r) => s + r.hours, 0)}h</span>
                    <span style=${{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: 'Space Grotesk, sans-serif', minWidth: 110, textAlign: 'right' }}>${formatARS(dSell)}</span>
                  </div>

                  ${open && html`
                    <div style=${{ background: '#FAFBFF', borderTop: '1px solid #F3F4F6' }}>

                      ${resources.length > 0 && html`
                        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style=${{ background: '#F3F4F6' }}>
                              <th style=${{ padding: '6px 20px 6px 48px', textAlign: 'left', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Recurso</th>
                              <th style=${{ padding: '6px 12px', textAlign: 'right', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Horas</th>
                              <th style=${{ padding: '6px 12px', textAlign: 'right', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Costo</th>
                              <th style=${{ padding: '6px 12px', textAlign: 'right', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Margen</th>
                              <th style=${{ padding: '6px 20px 6px 12px', textAlign: 'right', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Venta</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${resources.map(r => {
                              const user = users.find(u => u.id === r.user);
                              return html`
                                <tr key=${r.id} style=${{ borderTop: '1px solid #F3F4F6' }}>
                                  <td style=${{ padding: '10px 20px 10px 48px' }}>
                                    <div style=${{ fontWeight: 500, color: '#374151' }}>${r.typology}</div>
                                    ${user && html`<div style=${{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>${user.name}</div>`}
                                  </td>
                                  <td style=${{ padding: '10px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#374151' }}>${r.hours}h</td>
                                  <td style=${{ padding: '10px 12px', textAlign: 'right', color: '#374151' }}>${formatARS(r.cost)}</td>
                                  <td style=${{ padding: '10px 12px', textAlign: 'right' }}>
                                    <span style=${{ color: r.margin_pct >= 50 ? '#009966' : r.margin_pct >= 40 ? '#FD9A00' : '#FF6467', fontWeight: 600 }}>${formatPct(r.margin_pct)}</span>
                                  </td>
                                  <td style=${{ padding: '10px 20px 10px 12px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>${formatARS(r.sell)}</td>
                                </tr>
                              `;
                            })}
                          </tbody>
                        </table>
                      `}

                      ${thirdParty.length > 0 && html`
                        <div style=${{ borderTop: '1px solid #F3F4F6' }}>
                          <div style=${{ padding: '8px 20px 4px 48px', fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costos de Terceros</div>
                          ${thirdParty.map(t => {
                            const sup = suppliers.find(s => s.id === t.supplier);
                            return html`
                              <div key=${t.id} style=${{ display: 'flex', alignItems: 'center', padding: '9px 20px 9px 48px', gap: 12, borderTop: '1px solid #F9FAFB' }}>
                                <div style=${{ flex: 1 }}>
                                  <div style=${{ fontWeight: 500, color: '#374151', fontSize: 12 }}>${t.description}</div>
                                  <div style=${{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>${sup?.name || t.supplier} · fee ${t.fee_pct}%</div>
                                </div>
                                <div style=${{ textAlign: 'right', minWidth: 90 }}>
                                  <div style=${{ color: '#374151', fontSize: 12 }}>${formatARS(t.cost)}</div>
                                  <div style=${{ color: '#009966', fontSize: 11, fontWeight: 600 }}>${formatARS(t.sell)}</div>
                                </div>
                              </div>
                            `;
                          })}
                        </div>
                      `}

                      <!-- Deliverable subtotal -->
                      <div style=${{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px', borderTop: '1px solid #E5E7EB', background: '#F3F4F6', gap: 24 }}>
                        <span style=${{ fontSize: 12, color: '#6B7280' }}>Costo: <strong style=${{ color: '#111827' }}>${formatARS(dCost)}</strong></span>
                        <span style=${{ fontSize: 12, color: '#6B7280' }}>Margen: <strong style=${{ color: '#009966' }}>${dSell > 0 ? formatPct((dSell - dCost) / dSell * 100) : '—'}</strong></span>
                        <span style=${{ fontSize: 12, color: '#6B7280' }}>Venta: <strong style=${{ color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(dSell)}</strong></span>
                      </div>
                    </div>
                  `}
                </div>
              `;
            })}

            ${deliverables.length > 0 && html`
              <div style=${{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px', borderTop: '2px solid #E5E7EB', background: '#F9FAFB', gap: 32 }}>
                <span style=${{ fontSize: 13, color: '#6B7280' }}>Total Costo: <strong style=${{ color: '#111827' }}>${formatARS(dispCost)}</strong></span>
                <span style=${{ fontSize: 13, color: '#6B7280' }}>Margen: <strong style=${{ color: '#009966', fontSize: 15 }}>${formatPct(dispMarginPct)}</strong></span>
                <span style=${{ fontSize: 13, color: '#6B7280' }}>Total Venta: <strong style=${{ color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif', fontSize: 16 }}>${formatARS(dispSell)}</strong></span>
              </div>
            `}
          </div>
        </div>

        <!-- Sidebar -->
        <div style=${{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Financial summary -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Resumen Financiero</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style=${{ color: '#6B7280' }}>Costo Total</span>
                <span style=${{ fontWeight: 600, color: '#111827' }}>${formatARS(dispCost)}</span>
              </div>
              <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style=${{ color: '#6B7280' }}>Venta Total</span>
                <span style=${{ fontWeight: 700, color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(dispSell)}</span>
              </div>
              <div style=${{ height: 1, background: '#E5E7EB' }} />
              <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style=${{ color: '#6B7280' }}>Margen Bruto</span>
                <span style=${{ fontWeight: 600, color: '#009966' }}>${formatARS(dispMargin)}</span>
              </div>
              <div>
                <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                  <span>Margen %</span>
                  <span style=${{ fontWeight: 700, fontSize: 15, color: dispMarginPct >= 45 ? '#009966' : dispMarginPct >= 40 ? '#FD9A00' : '#FF6467' }}>${formatPct(dispMarginPct)}</span>
                </div>
                <div style=${{ height: 8, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                  <div style=${{ height: '100%', width: Math.min(dispMarginPct, 100) + '%', background: dispMarginPct >= 45 ? '#009966' : dispMarginPct >= 40 ? '#FD9A00' : '#FF6467', borderRadius: 99, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>
          </div>

          <!-- Version history -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Historial de Versiones</h3>
            ${versions.length === 0 ? html`
              <p style=${{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>Sin versiones registradas.</p>
            ` : html`
              <div style=${{ display: 'flex', flexDirection: 'column' }}>
                ${versions.map((v, vi) => {
                  const user = users.find(u => u.id === v.user);
                  const isLatest = vi === 0;
                  return html`
                    <div key=${v.id} style=${{ display: 'flex', gap: 12, paddingBottom: vi < versions.length - 1 ? 16 : 0 }}>
                      <div style=${{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style=${{ width: 8, height: 8, borderRadius: '50%', background: isLatest ? '#0046F3' : '#D1D5DB', flexShrink: 0, marginTop: 3 }} />
                        ${vi < versions.length - 1 && html`<div style=${{ width: 1, flex: 1, background: '#E5E7EB', marginTop: 4 }} />`}
                      </div>
                      <div style=${{ flex: 1 }}>
                        <div style=${{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style=${{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: isLatest ? '#0046F3' : '#374151' }}>v${v.version}</span>
                          <span style=${{ fontSize: 11, color: '#9CA3AF' }}>${formatDate(v.date)}</span>
                        </div>
                        ${v.notes && html`<div style=${{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>${v.notes}</div>`}
                        ${user && html`<div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>${user.name}</div>`}
                      </div>
                    </div>
                  `;
                })}
              </div>
            `}
          </div>

        </div>
      </div>
    </div>
  `;
}
