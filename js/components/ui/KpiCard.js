import { html } from '../../lib/html.js';

export default function KpiCard({ label, value, subtitle, delta, deltaType, accentColor, children }) {
  const deltaColor = deltaType === 'up' ? '#059669' : deltaType === 'down' ? '#FF3B3B' : '#6B6B80';
  const deltaIcon = deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '';
  return html`
    <div
      style=${{ background: '#fff', borderRadius: 10, padding: '20px 24px', border: '1px solid #E2E2EC', display: 'flex', flexDirection: 'column', gap: 8, transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'default' }}
      onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style=${{ fontSize: 12, fontWeight: 500, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>${label}</div>
      <div style=${{ fontSize: 28, fontWeight: 700, color: accentColor || '#0A0A0A', fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>${value}</div>
      ${(subtitle || delta) && html`
        <div style=${{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B6B80' }}>
          ${subtitle && html`<span>${subtitle}</span>`}
          ${delta && html`<span style=${{ color: deltaColor, fontWeight: 600 }}>${deltaIcon} ${delta}</span>`}
        </div>
      `}
      ${children}
    </div>
  `;
}
