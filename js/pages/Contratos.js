import { useState } from 'react';
import { html } from '../lib/html.js';
import { AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.js';
import FilterBar from '../components/ui/FilterBar.js';
import { useAppState } from '../context.js';
import { formatARS, formatDate } from '../lib/utils.js';

const CONTRACT_STATUS = {
  active:   { label: 'Activo',    color: '#009966', bg: '#D0FAE5' },
  expired:  { label: 'Vencido',   color: '#FF6467', bg: '#FFF0F0' },
  draft:    { label: 'Borrador',  color: '#6B7280', bg: '#F3F4F6' },
};

const CONTRACT_TYPE_COLORS = {
  'Proyecto':  { color: '#0046F3', bg: '#E0E6F6' },
  'Retainer':  { color: '#00BC7D', bg: '#D0FAE5' },
  'Servicio':  { color: '#FE9A00', bg: '#FEF3C6' },
};

export default function Contratos() {
  const { contracts, clients, rateCards } = useAppState();
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');

  const filteredContracts = contracts.filter(c => {
    const client = clients.find(cl => cl.id === c.client);
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || c.status === statusF;
    return matchSearch && matchStatus;
  });

  const totalValue    = contracts.reduce((s, c) => s + c.value, 0);
  const totalConsumed = contracts.reduce((s, c) => s + c.consumed, 0);
  const activeCount   = contracts.filter(c => c.status === 'active').length;

  return html`
    <div>
      <${PageHeader}
        title="Contratos"
        subtitle="Contratos y acuerdos comerciales"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nuevo Contrato
          </button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Contratos activos', value: activeCount.toString(),                                                                    color: '#009966' },
          { label: 'Valor total',       value: formatARS(totalValue),                                                                     color: '#111827' },
          { label: 'Consumido',         value: formatARS(totalConsumed),                                                                  color: '#0046F3' },
          { label: 'Disponible',        value: formatARS(totalValue - totalConsumed),                                                     color: totalValue - totalConsumed > 0 ? '#009966' : '#FF6467' },
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
            { value: 'active',  label: 'Activo' },
            { value: 'expired', label: 'Vencido' },
            { value: 'draft',   label: 'Borrador' },
          ]},
        ]}
        count=${filteredContracts.length}
      />

      <!-- Contracts list -->
      <div style=${{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        ${filteredContracts.map(contract => {
          const client      = clients.find(c => c.id === contract.client);
          const rc          = rateCards.find(r => r.id === contract.rate_card);
          const pct         = contract.value > 0 ? Math.round((contract.consumed / contract.value) * 100) : 0;
          const remaining   = contract.value - contract.consumed;
          const statusInfo  = CONTRACT_STATUS[contract.status] || CONTRACT_STATUS.draft;
          const typeInfo    = CONTRACT_TYPE_COLORS[contract.type] || { color: '#6B7280', bg: '#F3F4F6' };
          const barColor    = pct >= 90 ? '#FF6467' : pct >= 70 ? '#FE9A00' : '#0046F3';

          return html`
            <div key=${contract.id} style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
              <!-- Header row -->
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style=${{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <h3 style=${{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${client?.name || '—'}</h3>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: typeInfo.color, background: typeInfo.bg, padding: '2px 10px', borderRadius: 99 }}>${contract.type}</span>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: statusInfo.color, background: statusInfo.bg, padding: '2px 10px', borderRadius: 99 }}>${statusInfo.label}</span>
                  </div>
                  <div style=${{ fontSize: 12, color: '#9CA3AF' }}>
                    ${formatDate(contract.period_start)} – ${formatDate(contract.period_end)}
                    ${rc ? html` · Rate Card: <span style=${{ color: '#374151', fontWeight: 500 }}>${rc.name}</span>` : ''}
                  </div>
                </div>
                <div style=${{ textAlign: 'right' }}>
                  <div style=${{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(contract.value)}</div>
                  <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>valor total del contrato</div>
                </div>
              </div>

              <!-- Consumption bar -->
              <div style=${{ marginBottom: 10 }}>
                <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                  <span>Consumido: <strong style=${{ color: '#374151' }}>${formatARS(contract.consumed)}</strong></span>
                  <span>Disponible: <strong style=${{ color: remaining > 0 ? '#009966' : '#FF6467' }}>${formatARS(remaining)}</strong></span>
                </div>
                <div style=${{ height: 8, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                  <div style=${{ height: '100%', width: Math.min(pct, 100) + '%', background: barColor, borderRadius: 99, transition: 'width 0.4s' }} />
                </div>
                <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  <span>${pct}% consumido</span>
                  ${pct >= 80 && html`<span style=${{ color: pct >= 90 ? '#FF6467' : '#FE9A00', fontWeight: 600 }}>${pct >= 90 ? html`<span style=${{ display: 'flex', alignItems: 'center', gap: 3 }}><${AlertTriangle} size=${11} strokeWidth=${1.5} /> Casi agotado</span>` : 'Consumo elevado'}</span>`}
                </div>
              </div>
            </div>
          `;
        })}
      </div>

      <!-- Rate Cards preview -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginTop: 16 }}>
        <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Rate Cards Vinculadas</h3>
          <span style=${{ fontSize: 12, color: '#9CA3AF' }}>${rateCards.length} rate cards</span>
        </div>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Nombre','Cliente','Moneda','Vigencia','Roles'].map(h => html`
                <th key=${h} style=${{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${rateCards.map((rc, i) => {
              const rcClient = clients.find(c => c.id === rc.client);
              return html`
                <tr key=${rc.id} style=${{ borderBottom: i < rateCards.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style=${{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>${rc.name}</td>
                  <td style=${{ padding: '12px 16px', color: '#374151' }}>${rcClient?.name || 'General'}</td>
                  <td style=${{ padding: '12px 16px' }}>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: rc.currency === 'USD' ? '#00BC7D' : '#0046F3', background: rc.currency === 'USD' ? '#D0FAE5' : '#E0E6F6', padding: '2px 8px', borderRadius: 99 }}>${rc.currency}</span>
                  </td>
                  <td style=${{ padding: '12px 16px', color: '#6B7280', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>${rc.valid_from} → ${rc.valid_to}</td>
                  <td style=${{ padding: '12px 16px', color: '#374151' }}>${rc.rates.length} roles</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
