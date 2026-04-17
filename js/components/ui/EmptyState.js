import { html } from '../../lib/html.js';

export default function EmptyState({ icon, title, description, action }) {
  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center', background: '#fff', borderRadius: 10, border: '1px solid #E2E2EC' }}>
      ${icon && html`<div style=${{ fontSize: 40, marginBottom: 16, opacity: 0.4 }}>${icon}</div>`}
      <h3 style=${{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', margin: '0 0 8px' }}>${title}</h3>
      ${description && html`<p style=${{ fontSize: 14, color: '#6B6B80', margin: '0 0 24px', maxWidth: 360 }}>${description}</p>`}
      ${action && action}
    </div>
  `;
}
