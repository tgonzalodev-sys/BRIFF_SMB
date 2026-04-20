import { html } from '../../lib/html.js';

export default function EmptyState({ icon: Icon, iconSize = 44, title, description, action }) {
  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
      ${Icon && html`<div style=${{ marginBottom: 16, color: '#D1D5DB' }}><${Icon} size=${iconSize} strokeWidth=${1.33} /></div>`}
      <h3 style=${{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif' }}>${title}</h3>
      ${description && html`<p style=${{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', maxWidth: 360, textWrap: 'pretty' }}>${description}</p>`}
      ${action && action}
    </div>
  `;
}
