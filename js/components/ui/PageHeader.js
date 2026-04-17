import { html } from '../../lib/html.js';

export default function PageHeader({ title, subtitle, actions }) {
  return html`
    <div style=${{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
      <div>
        <h1 style=${{ fontSize: 24, fontWeight: 600, color: '#0A0A0A', lineHeight: 1.2, margin: 0 }}>${title}</h1>
        ${subtitle && html`<p style=${{ fontSize: 14, color: '#6B6B80', margin: '4px 0 0' }}>${subtitle}</p>`}
      </div>
      ${actions && html`<div style=${{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>${actions}</div>`}
    </div>
  `;
}
