import { html } from '../../lib/html.js';
import { useAppState, useDispatch } from '../../context.js';

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const COLORS = { success: '#CCFF44', error: '#FF3B3B', warning: '#FF6B2B', info: '#2A2AFF' };

export default function ToastContainer() {
  const { toasts } = useAppState();
  const dispatch = useDispatch();
  if (!toasts.length) return null;
  return html`
    <div style=${{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      ${toasts.map(t => html`
        <div key=${t.id} className="toast-enter" style=${{ display: 'flex', alignItems: 'center', gap: 10, background: '#0A0A0A', color: '#fff', padding: '12px 16px', borderRadius: 10, minWidth: 280, maxWidth: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 500 }}>
          <span style=${{ color: COLORS[t.kind] || COLORS.success, fontSize: 16, flexShrink: 0 }}>${ICONS[t.kind] || ICONS.success}</span>
          <span style=${{ flex: 1 }}>${t.message}</span>
          <button onClick=${() => dispatch({ type: 'REMOVE_TOAST', id: t.id })} style=${{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}>✕</button>
        </div>
      `)}
    </div>
  `;
}
