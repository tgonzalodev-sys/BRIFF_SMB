import { html } from '../../lib/html.js';
import { useAppState, useDispatch } from '../../context.js';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};
const COLOR_MAP = {
  success: '#00BC7D',
  error:   '#FF6467',
  warning: '#FF8041',
  info:    '#0046F3',
};

export default function ToastContainer() {
  const { toasts } = useAppState();
  const dispatch = useDispatch();
  if (!toasts.length) return null;
  return html`
    <div style=${{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      ${toasts.map(t => {
        const IconComp = ICON_MAP[t.kind] || ICON_MAP.success;
        const iconColor = COLOR_MAP[t.kind] || COLOR_MAP.success;
        return html`
          <div key=${t.id} className="toast-enter" style=${{ display: 'flex', alignItems: 'center', gap: 10, background: '#111827', color: '#fff', padding: '12px 16px', borderRadius: 12, minWidth: 280, maxWidth: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 500 }}>
            <span style=${{ color: iconColor, flexShrink: 0, display: 'flex' }}>
              <${IconComp} size=${18} strokeWidth=${1.5} />
            </span>
            <span style=${{ flex: 1 }}>${t.message}</span>
            <button onClick=${() => dispatch({ type: 'REMOVE_TOAST', id: t.id })}
              style=${{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex' }}>
              <${X} size=${16} strokeWidth=${1.5} />
            </button>
          </div>
        `;
      })}
    </div>
  `;
}
