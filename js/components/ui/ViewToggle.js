import { html } from '../../lib/html.js';

// Two-button toggle for personal vs full view. tabs = [{ key, label }]
export default function ViewToggle({ tabs, active, onChange }) {
  return html`
    <div style=${{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
      ${tabs.map(({ key, label }) => html`
        <button
          key=${key}
          onClick=${() => onChange(key)}
          style=${{
            padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: active === key ? '#fff' : 'transparent',
            color: active === key ? '#111827' : '#6B7280',
            boxShadow: active === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'background 0.12s, color 0.12s',
          }}
        >${label}</button>
      `)}
    </div>
  `;
}
