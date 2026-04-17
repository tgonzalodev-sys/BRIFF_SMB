import { html } from '../../lib/html.js';

export default function PageHeader({ title, subtitle, actions }) {
  return html`
    <div style=${{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
      <div>
        <h1 style=${{ fontSize: 22, fontWeight: 600, color: '#111827', lineHeight: 1.2, margin: 0, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em' }}>${title}</h1>
        ${subtitle && html`<p style=${{ fontSize: 13, color: '#6B7280', margin: '3px 0 0', fontWeight: 400 }}>${subtitle}</p>`}
      </div>
      ${actions && html`<div style=${{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>${actions}</div>`}
    </div>
  `;
}
