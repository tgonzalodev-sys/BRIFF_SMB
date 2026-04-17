import { html } from '../../lib/html.js';

export default function BurnBar({ planned, actual, showLabel = true, height = 6 }) {
  const pct   = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  const color = pct < 70 ? '#0046F3' : pct < 90 ? '#FD9A00' : '#FF6467';
  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
      ${showLabel && html`
        <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280' }}>
          <span style=${{ fontFamily: 'JetBrains Mono, monospace' }}>${actual}h / ${planned}h</span>
          <span style=${{ fontWeight: 600, color }}>${Math.round(pct)}%</span>
        </div>
      `}
      <div style=${{ height, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
        <div style=${{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  `;
}
