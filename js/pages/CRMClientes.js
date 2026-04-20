import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import FilterBar from '../components/ui/FilterBar.js';
import { useAppState } from '../context.js';
import { formatARS, initials } from '../lib/utils.js';

const STATUS_INFO = {
  active:   { label: 'Activo',    color: '#009966', bg: '#D0FAE5' },
  prospect: { label: 'Prospecto', color: '#FE9A00', bg: '#FEF3C6' },
  inactive: { label: 'Inactivo',  color: '#6B7280', bg: '#F3F4F6' },
};

const INDUSTRY_COLORS = {
  'Finanzas':    { color: '#0046F3', bg: '#E0E6F6' },
  'Alimentos':   { color: '#00BC7D', bg: '#D0FAE5' },
  'Tecnología':  { color: '#00B8DB', bg: '#E0F9FF' },
  'Retail':      { color: '#FE9A00', bg: '#FEF3C6' },
  'Salud':       { color: '#8E51FF', bg: '#F5F3FF' },
};

export default function CRMClientes() {
  const navigate = useNavigate();
  const { clients, projects, contracts, users, invoiceAuthorizations } = useAppState();
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [indF, setIndF]       = useState('');

  const filteredClients = clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || c.status === statusF;
    const matchInd    = !indF   || c.industry === indF;
    return matchSearch && matchStatus && matchInd;
  });

  const activeCount   = clients.filter(c => c.status === 'active').length;
  const totalBilled   = invoiceAuthorizations.reduce((s, i) => s + i.amount, 0);
  const totalContracts = contracts.length;

  return html`
    <div>
      <${PageHeader}
        title="Clientes"
        subtitle="Directorio de clientes del estudio"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nuevo Cliente
          </button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Clientes activos',  value: activeCount.toString(),   color: '#009966' },
          { label: 'Total clientes',    value: clients.length.toString(), color: '#111827' },
          { label: 'Contratos activos', value: totalContracts.toString(), color: '#0046F3' },
          { label: 'Facturado total',   value: formatARS(totalBilled),   color: '#111827' },
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
            { value: 'active',   label: 'Activo' },
            { value: 'prospect', label: 'Prospecto' },
            { value: 'inactive', label: 'Inactivo' },
          ]},
          { label: 'Industria', value: indF, onChange: setIndF, options: [
            { value: 'Finanzas',   label: 'Finanzas' },
            { value: 'Alimentos',  label: 'Alimentos' },
            { value: 'Tecnología', label: 'Tecnología' },
            { value: 'Retail',     label: 'Retail' },
            { value: 'Salud',      label: 'Salud' },
          ]},
        ]}
        count=${filteredClients.length}
      />

      <!-- Client cards -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 12 }}>
        ${filteredClients.map(client => {
          const manager       = users.find(u => u.id === client.manager);
          const clientProjects = projects.filter(p => p.client === client.id);
          const activeProjects = clientProjects.filter(p => p.status === 'active' || p.status === 'in_review');
          const clientContract = contracts.find(c => c.client === client.id);
          const billed        = invoiceAuthorizations.filter(i => i.client === client.id).reduce((s, i) => s + i.amount, 0);
          const statusInfo    = STATUS_INFO[client.status] || STATUS_INFO.inactive;
          const industryInfo  = INDUSTRY_COLORS[client.industry] || { color: '#6B7280', bg: '#F3F4F6' };

          return html`
            <div
              key=${client.id}
              role="button"
              tabIndex=${0}
              onClick=${() => navigate('/crm/clientes/' + client.id)}
              onKeyDown=${e => (e.key === 'Enter' || e.key === ' ') && navigate('/crm/clientes/' + client.id)}
              style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(16,24,40,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <!-- Header -->
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style=${{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <!-- Logo placeholder -->
                  <div style=${{ width: 42, height: 42, borderRadius: 12, background: industryInfo.bg, border: '1px solid ' + industryInfo.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: industryInfo.color, fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
                    ${client.code}
                  </div>
                  <div>
                    <h3 style=${{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${client.name}</h3>
                    <span style=${{ fontSize: 11, color: '#9CA3AF' }}>${client.industry}</span>
                  </div>
                </div>
                <span style=${{ fontSize: 12, fontWeight: 600, color: statusInfo.color, background: statusInfo.bg, padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>${statusInfo.label}</span>
              </div>

              <!-- Stats row -->
              <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14, padding: '12px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                ${[
                  { label: 'Proyectos',  value: clientProjects.length.toString() },
                  { label: 'Activos',    value: activeProjects.length.toString() },
                  { label: 'Facturado',  value: formatARS(billed) },
                ].map(s => html`
                  <div key=${s.label} style=${{ textAlign: 'center' }}>
                    <div style=${{ fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${s.value}</div>
                    <div style=${{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>${s.label}</div>
                  </div>
                `)}
              </div>

              <!-- Footer -->
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <div style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  ${manager && html`
                    <div style=${{ width: 22, height: 22, borderRadius: '50%', background: manager.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                      ${initials(manager.name)}
                    </div>
                    <span style=${{ color: '#6B7280' }}>${manager.name.split(' ')[0]}</span>
                  `}
                </div>
                <div style=${{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style=${{ fontSize: 11, color: '#9CA3AF' }}>Pago: ${client.payment_terms}d</span>
                  <span style=${{ fontSize: 11, fontWeight: 600, color: client.currency === 'USD' ? '#00BC7D' : '#374151', background: client.currency === 'USD' ? '#D0FAE5' : '#F3F4F6', padding: '1px 7px', borderRadius: 99 }}>${client.currency}</span>
                </div>
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
