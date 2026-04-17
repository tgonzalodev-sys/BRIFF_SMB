import { html } from '../../lib/html.js';

export default function BurnBar({ planned, actual, showLabel = true, height = 6 }) {
  const pct = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  const color = pct < 70 ? '#2A2AFF' : pct < 90 ? '#FF6B2B' : '#FF3B3B';
  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
      ${showLabel && html`
        <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6B80' }}>
          <span style=${{ fontFamily: 'DM Mono, monospace' }}>${actual}h / ${planned}h</span>
          <span style=${{ fontWeight: 600, color }}>${Math.round(pct)}%</span>
        </div>
      `}
      <div style=${{ height, borderRadius: 99, background: '#E2E2EC', overflow: 'hidden' }}>
        <div style=${{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  `;
}
