import { html } from '../../lib/html.js';

export default function BurnBar({ planned, actual, showLabel = true, height = 6 }) {
  const pct   = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  const over  = planned > 0 && actual > planned;
  // Under 90%: brand blue fill. 90–100%: amber warning. Over 100%: red/error.
  const color = over ? '#FF6467' : pct >= 90 ? '#FD9A00' : '#0046F3';
  const overHours = over ? actual - planned : 0;

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
      ${showLabel && html`
        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#6B7280' }}>
          <span style=${{ fontFamily: 'JetBrains Mono, monospace' }}>${actual}h / ${planned}h</span>
          <div style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>
            ${over && html`
              <span style=${{ fontSize: 10, fontWeight: 600, color: '#FF6467', background: '#FFE2E2', borderRadius: 9999, padding: '1px 6px' }}>
                Excedido +${overHours}h
              </span>
            `}
            <span style=${{ fontWeight: 600, color }}>${Math.round(pct)}%</span>
          </div>
        </div>
      `}
      <div style=${{ height, borderRadius: 9999, background: '#E5E7EB', overflow: 'hidden' }}>
        <div style=${{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  `;
}
