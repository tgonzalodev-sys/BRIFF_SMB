import { useParams, useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import BurnBar from '../components/ui/BurnBar.js';
import { useAppState } from '../context.js';
import { formatARS, formatDate, initials } from '../lib/utils.js';

const STATUS_INFO = {
  active:   { label: 'Activo',    color: '#009966', bg: '#F0FDF4' },
  prospect: { label: 'Prospecto', color: '#D97706', bg: '#FFFBEB' },
  inactive: { label: 'Inactivo',  color: '#6B7280', bg: '#F3F4F6' },
};

const INDUSTRY_COLORS = {
  'Finanzas':   { color: '#0046F3', bg: '#EEF4FF' },
  'Alimentos':  { color: '#059669', bg: '#F0FDF4' },
  'Tecnología': { color: '#0891B2', bg: '#ECFEFF' },
};

const TYPE_INFO = {
  campaña:  { label: 'Campaña',  color: '#7C3AED', bg: '#F5F3FF' },
  digital:  { label: 'Digital',  color: '#0891B2', bg: '#ECFEFF' },
  branding: { label: 'Branding', color: '#D97706', bg: '#FFFBEB' },
  retainer: { label: 'Retainer', color: '#059669', bg: '#F0FDF4' },
};

const INVOICE_STATUS = {
  pending: { label: 'Pendiente', color: '#D97706', bg: '#FFFBEB' },
  issued:  { label: 'Emitida',   color: '#0046F3', bg: '#EEF4FF' },
  paid:    { label: 'Cobrada',   color: '#009966', bg: '#F0FDF4' },
};

export default function CRMClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, projects, contracts, users, invoiceAuthorizations, leads } = useAppState();

  const client = clients.find(c => c.id === id);
  if (!client) return html`
    <div style=${{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
      <div style=${{ fontSize: 28, marginBottom: 8 }}>◻</div>
      <div>Cliente no encontrado.</div>
      <button onClick=${() => navigate('/crm/clientes')} style=${{ marginTop: 16, background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Volver</button>
    </div>
  `;

  const manager         = users.find(u => u.id === client.manager);
  const clientProjects  = projects.filter(p => p.client === id);
  const clientContract  = contracts.find(c => c.client === id);
  const clientInvoices  = invoiceAuthorizations.filter(i => i.client === id);
  const clientLeads     = leads?.filter(l => l.client === id) || [];
  const statusInfo      = STATUS_INFO[client.status] || STATUS_INFO.inactive;
  const industryInfo    = INDUSTRY_COLORS[client.industry] || { color: '#6B7280', bg: '#F3F4F6' };

  const totalBilled  = clientInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid    = clientInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = clientInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

  return html`
    <div>
      <!-- Back + header -->
      <div style=${{ marginBottom: 20 }}>
        <button onClick=${() => navigate('/crm/clientes')} style=${{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12, fontFamily: 'inherit' }}>← Volver a Clientes</button>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style=${{ width: 52, height: 52, borderRadius: 12, background: industryInfo.bg, border: '1px solid ' + industryInfo.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: industryInfo.color, fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
            ${client.code}
          </div>
          <div>
            <div style=${{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style=${{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${client.name}</h1>
              <span style=${{ fontSize: 12, fontWeight: 600, color: statusInfo.color, background: statusInfo.bg, padding: '3px 10px', borderRadius: 99 }}>${statusInfo.label}</span>
            </div>
            <p style=${{ margin: 0, fontSize: 13, color: '#6B7280' }}>${client.industry} · ${client.address}</p>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Main column -->
        <div style=${{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Billing summary -->
          <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            ${[
              { label: 'Total Facturado', value: formatARS(totalBilled),  color: '#111827' },
              { label: 'Cobrado',         value: formatARS(totalPaid),    color: '#009966' },
              { label: 'Pendiente',       value: formatARS(totalPending), color: totalPending > 0 ? '#D97706' : '#9CA3AF' },
            ].map(k => html`
              <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '14px 18px' }}>
                <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>${k.label}</div>
                <div style=${{ fontSize: 18, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
              </div>
            `)}
          </div>

          <!-- Projects -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Proyectos</h2>
              <span style=${{ fontSize: 12, color: '#9CA3AF' }}>${clientProjects.length} proyectos</span>
            </div>
            ${clientProjects.length === 0 ? html`
              <div style=${{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Sin proyectos registrados.</div>
            ` : clientProjects.map((p, i) => {
              const typeInfo = TYPE_INFO[p.type] || { label: p.type, color: '#6B7280', bg: '#F3F4F6' };
              return html`
                <div key=${p.id} style=${{ padding: '14px 20px', borderBottom: i < clientProjects.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style=${{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${p.title}</span>
                        <span style=${{ fontSize: 11, fontWeight: 600, color: typeInfo.color, background: typeInfo.bg, padding: '1px 7px', borderRadius: 99 }}>${typeInfo.label}</span>
                        <${StatusBadge} status=${p.status} variant="project" />
                      </div>
                      <span style=${{ fontSize: 11, color: '#9CA3AF' }}>${formatDate(p.start)} – ${formatDate(p.end)}</span>
                    </div>
                    <span style=${{ fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>${formatARS(p.budget_ars)}</span>
                  </div>
                  <${BurnBar} planned=${p.planned_hours} actual=${p.actual_hours} height=${5} />
                </div>
              `;
            })}
          </div>

          <!-- Invoices -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Historial de Facturación</h2>
            </div>
            ${clientInvoices.length === 0 ? html`
              <div style=${{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Sin facturas registradas.</div>
            ` : html`
              <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    ${['Código','Proyecto','Fecha','Vencimiento','Neto','Estado'].map(h => html`
                      <th key=${h} style=${{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
                    `)}
                  </tr>
                </thead>
                <tbody>
                  ${clientInvoices.map((inv, i) => {
                    const proj = projects.find(p => p.id === inv.project);
                    const info = INVOICE_STATUS[inv.status] || INVOICE_STATUS.pending;
                    return html`
                      <tr key=${inv.id} style=${{ borderBottom: i < clientInvoices.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style=${{ padding: '11px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#374151' }}>${inv.code}</td>
                        <td style=${{ padding: '11px 16px', color: '#374151', fontSize: 12 }}>${proj?.title?.slice(0, 22) || '—'}${proj?.title?.length > 22 ? '…' : ''}</td>
                        <td style=${{ padding: '11px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(inv.date)}</td>
                        <td style=${{ padding: '11px 16px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>${formatDate(inv.due_date)}</td>
                        <td style=${{ padding: '11px 16px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(inv.amount)}</td>
                        <td style=${{ padding: '11px 16px' }}>
                          <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '2px 8px', borderRadius: 99 }}>${info.label}</span>
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <!-- Sidebar -->
        <div style=${{ width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Contact info -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Información</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              ${[
                { label: 'Industria',      value: client.industry },
                { label: 'Moneda',         value: client.currency },
                { label: 'Plazo de pago',  value: client.payment_terms + ' días' },
                { label: 'Dirección',      value: client.address },
              ].map(row => html`
                <div key=${row.label} style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
                  <span style=${{ color: '#9CA3AF', flexShrink: 0 }}>${row.label}</span>
                  <span style=${{ fontWeight: 600, color: '#374151', textAlign: 'right' }}>${row.value}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Account manager -->
          ${manager && html`
            <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
              <h3 style=${{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Account Manager</h3>
              <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style=${{ width: 36, height: 36, borderRadius: '50%', background: manager.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  ${initials(manager.name)}
                </div>
                <div>
                  <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${manager.name}</div>
                  <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${manager.typology}</div>
                </div>
              </div>
            </div>
          `}

          <!-- Contract -->
          ${clientContract && html`
            <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
              <h3 style=${{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Contrato Activo</h3>
              <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style=${{ color: '#9CA3AF' }}>Tipo</span>
                <span style=${{ fontWeight: 600, color: '#374151' }}>${clientContract.type}</span>
              </div>
              <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                <span>Consumido</span>
                <span style=${{ fontWeight: 700, color: '#111827' }}>${Math.round((clientContract.consumed / clientContract.value) * 100)}%</span>
              </div>
              <div style=${{ height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden', marginBottom: 6 }}>
                <div style=${{ height: '100%', width: Math.min(Math.round((clientContract.consumed / clientContract.value) * 100), 100) + '%', background: '#0046F3', borderRadius: 99 }} />
              </div>
              <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
                <span>${formatARS(clientContract.consumed)}</span>
                <span>${formatARS(clientContract.value)}</span>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
