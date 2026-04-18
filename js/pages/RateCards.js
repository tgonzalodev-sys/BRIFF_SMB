import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState } from '../context.js';
import { formatARS } from '../lib/utils.js';

export default function RateCards() {
  const { rateCards, clients } = useAppState();
  const [selected, setSelected] = useState(rateCards[0]?.id || null);

  const rc = rateCards.find(r => r.id === selected);

  const avgMargin = rc?.rates.length
    ? Math.round(rc.rates.reduce((s, r) => s + r.margin_pct, 0) / rc.rates.length)
    : 0;

  const fmtRate = (n, currency) =>
    currency === 'USD' ? `U$D ${n.toLocaleString('es-AR')}` : formatARS(n);

  return html`
    <div>
      <${PageHeader}
        title="Rate Cards"
        subtitle="Tarifas por typología de recurso"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nueva Rate Card
          </button>
        `}
      />

      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Left: rate card selector list -->
        <div style=${{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          ${rateCards.map(r => {
            const rcClient = clients.find(c => c.id === r.client);
            const isActive = r.id === selected;
            return html`
              <div
                key=${r.id}
                onClick=${() => setSelected(r.id)}
                style=${{
                  background: isActive ? '#0046F3' : '#fff',
                  borderRadius: 8,
                  border: isActive ? '1px solid #0046F3' : '1px solid #E5E7EB',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                <div style=${{ fontSize: 13, fontWeight: 600, color: isActive ? '#fff' : '#111827', marginBottom: 4 }}>${r.name}</div>
                <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style=${{ color: isActive ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>
                    ${rcClient?.name || 'General'}
                  </span>
                  <span style=${{
                    fontWeight: 700,
                    color: isActive ? '#fff' : (r.currency === 'USD' ? '#059669' : '#0046F3'),
                    background: isActive ? 'rgba(255,255,255,0.15)' : (r.currency === 'USD' ? '#F0FDF4' : '#EEF4FF'),
                    padding: '1px 6px', borderRadius: 99,
                  }}>${r.currency}</span>
                </div>
                <div style=${{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#9CA3AF', marginTop: 3 }}>
                  ${r.rates.length} roles · ${r.valid_from} → ${r.valid_to}
                </div>
              </div>
            `;
          })}
        </div>

        <!-- Right: selected rate card detail -->
        ${rc ? html`
          <div style=${{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            <!-- Summary cards -->
            <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              ${[
                { label: 'Roles',          value: rc.rates.length.toString(), color: '#111827' },
                { label: 'Margen promedio', value: avgMargin + '%',           color: avgMargin >= 35 ? '#009966' : '#D97706' },
                { label: 'Moneda',          value: rc.currency,              color: rc.currency === 'USD' ? '#059669' : '#0046F3' },
              ].map(k => html`
                <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '14px 18px' }}>
                  <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>${k.label}</div>
                  <div style=${{ fontSize: 20, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
                </div>
              `)}
            </div>

            <!-- Rates table -->
            <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>${rc.name}</h2>
                <span style=${{ fontSize: 12, color: '#9CA3AF' }}>Vigencia: ${rc.valid_from} → ${rc.valid_to}</span>
              </div>
              <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    ${['Typología','Costo/hora','Venta/hora','Margen','Diferencial'].map(h => html`
                      <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
                    `)}
                  </tr>
                </thead>
                <tbody>
                  ${rc.rates.map((rate, i) => {
                    const diff  = rate.sell_hour - rate.cost_hour;
                    const color = rate.margin_pct >= 40 ? '#009966' : rate.margin_pct >= 33 ? '#D97706' : '#FF6467';
                    return html`
                      <tr key=${rate.typology} style=${{ borderBottom: i < rc.rates.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style=${{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>${rate.typology}</td>
                        <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>
                          ${fmtRate(rate.cost_hour, rc.currency)}
                        </td>
                        <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#111827' }}>
                          ${fmtRate(rate.sell_hour, rc.currency)}
                        </td>
                        <td style=${{ padding: '14px 16px' }}>
                          <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style=${{ width: 70, height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                              <div style=${{ height: '100%', width: rate.margin_pct + '%', background: color, borderRadius: 99 }} />
                            </div>
                            <span style=${{ fontSize: 12, fontWeight: 700, color }}>${rate.margin_pct}%</span>
                          </div>
                        </td>
                        <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#009966', fontWeight: 600 }}>
                          +${fmtRate(diff, rc.currency)}
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              </table>
            </div>

            <!-- Margin visualization -->
            <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
              <h3 style=${{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Margen por Typología</h3>
              <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                ${[...rc.rates].sort((a, b) => b.margin_pct - a.margin_pct).map(rate => {
                  const color = rate.margin_pct >= 40 ? '#009966' : rate.margin_pct >= 33 ? '#D97706' : '#FF6467';
                  return html`
                    <div key=${rate.typology}>
                      <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style=${{ color: '#374151' }}>${rate.typology}</span>
                        <span style=${{ fontWeight: 700, color }}>${rate.margin_pct}%</span>
                      </div>
                      <div style=${{ height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                        <div style=${{ height: '100%', width: rate.margin_pct + '%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          </div>
        ` : html`
          <div style=${{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            Seleccioná una rate card para ver el detalle.
          </div>
        `}
      </div>
    </div>
  `;
}
