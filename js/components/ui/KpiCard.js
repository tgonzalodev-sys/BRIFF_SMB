import { html } from '../../lib/html.js';

export default function KpiCard({ label, value, subtitle, delta, deltaType, accentColor, children }) {
  const deltaColor = deltaType === 'up' ? '#009966' : deltaType === 'down' ? '#FF6467' : '#6B7280';
  const deltaIcon  = deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '';
  return html`
    <div
      style=${{ background: '#fff', borderRadius: 8, padding: '20px 24px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 6, transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'default' }}
      onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 4px 8px -2px rgba(16,24,40,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>${label}</div>
      <div style=${{ fontSize: 26, fontWeight: 700, color: accentColor || '#111827', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>${value}</div>
      ${(subtitle || delta) && html`
        <div style=${{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' }}>
          ${subtitle && html`<span>${subtitle}</span>`}
          ${delta && html`<span style=${{ color: deltaColor, fontWeight: 600 }}>${deltaIcon} ${delta}</span>`}
        </div>
      `}
      ${children}
    </div>
  `;
}
