import { useEffect } from 'react';
import { html } from '../../lib/html.js';
import { X } from 'lucide-react';

export default function DrawerForm({ open, onClose, title, subtitle, children, width = 480 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return html`
    <div style=${{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <div onClick=${onClose} style=${{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.4)', backdropFilter: 'blur(2px)' }} />
      <div className="drawer-enter" style=${{ position: 'absolute', right: 0, top: 0, bottom: 0, width, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 40px rgba(0,0,0,0.12)' }}>
        <div style=${{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style=${{ fontSize: 18, fontWeight: 600, margin: 0 }}>${title}</h2>
              ${subtitle && html`<p style=${{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>${subtitle}</p>`}
            </div>
            <button onClick=${onClose} style=${{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6B7280', display: 'flex' }}><${X} size=${20} strokeWidth=${1.5} /></button>
          </div>
        </div>
        <div style=${{ flex: 1, overflowY: 'auto', padding: 24 }}>${children}</div>
      </div>
    </div>
  `;
}

export function FormField({ label, required, children, hint }) {
  return html`
    <div style=${{ marginBottom: 16 }}>
      <label style=${{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 6 }}>
        ${label}${required && html`<span style=${{ color: '#FF6467', marginLeft: 2 }}>*</span>`}
      </label>
      ${children}
      ${hint && html`<p style=${{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>${hint}</p>`}
    </div>
  `;
}

export const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid #E5E7EB', borderRadius: 8,
  background: '#fff', color: '#111827',
  outline: 'none', transition: 'border-color 0.15s',
  fontFamily: 'Host Grotesk, sans-serif',
};

export function FormActions({ onCancel, onSubmit, submitLabel = 'Guardar', cancelLabel = 'Cancelar', loading }) {
  return html`
    <div style=${{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
      <button onClick=${onCancel} style=${{ padding: '9px 20px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#111827' }}>
        ${cancelLabel}
      </button>
      <button onClick=${onSubmit} disabled=${loading} style=${{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0046F3', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, opacity: loading ? 0.7 : 1 }}>
        ${loading ? 'Guardando…' : submitLabel}
      </button>
    </div>
  `;
}
