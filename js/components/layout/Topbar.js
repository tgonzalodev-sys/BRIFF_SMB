import { useState } from 'react';
import { html } from '../../lib/html.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState, useDispatch } from '../../context.js';
import { initials } from '../../lib/utils.js';

const BREADCRUMBS = {
  '/dashboard':               [{ label: 'Dashboard' }],
  '/proyectos':               [{ label: 'Operaciones' }, { label: 'Proyectos' }],
  '/timesheets':              [{ label: 'Operaciones' }, { label: 'Timesheets' }],
  '/timesheets/pendientes':   [{ label: 'Operaciones' }, { label: 'Timesheets', path: '/timesheets' }, { label: 'Pendientes' }],
  '/licencias':               [{ label: 'Operaciones' }, { label: 'Licencias' }],
  '/licencias/equipo':        [{ label: 'Operaciones' }, { label: 'Licencias', path: '/licencias' }, { label: 'Equipo' }],
  '/gastos':                  [{ label: 'Operaciones' }, { label: 'Gastos' }],
  '/crm/clientes':            [{ label: 'Comercial' }, { label: 'Clientes' }],
  '/crm/pipeline':            [{ label: 'Comercial' }, { label: 'Pipeline' }],
  '/estimaciones':            [{ label: 'Comercial' }, { label: 'Estimaciones' }],
  '/contratos':               [{ label: 'Comercial' }, { label: 'Contratos' }],
  '/contratos/rate-cards':    [{ label: 'Comercial' }, { label: 'Contratos', path: '/contratos' }, { label: 'Rate Cards' }],
  '/proveedores':             [{ label: 'Comercial' }, { label: 'Proveedores' }],
  '/proveedores/licitaciones':[{ label: 'Comercial' }, { label: 'Proveedores', path: '/proveedores' }, { label: 'Licitaciones' }],
  '/facturacion':             [{ label: 'Finanzas' }, { label: 'Facturación' }],
  '/facturacion/oc':          [{ label: 'Finanzas' }, { label: 'Facturación', path: '/facturacion' }, { label: 'Órdenes de Compra' }],
  '/finanzas':                [{ label: 'Finanzas' }, { label: 'Reportes' }],
  '/personas':                [{ label: 'Equipo' }, { label: 'Personas' }],
  '/personas/typologias':     [{ label: 'Equipo' }, { label: 'Personas', path: '/personas' }, { label: 'Typologías' }],
  '/organizacion':            [{ label: 'Config' }, { label: 'Organización' }],
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications } = useAppState();
  const dispatch = useDispatch();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const unread = notifications.filter(n => !n.read).length;
  const crumbs = (() => {
    const exact = BREADCRUMBS[location.pathname];
    if (exact) return exact;
    const parts = location.pathname.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 1; i--) {
      const p = '/' + parts.slice(0, i).join('/');
      if (BREADCRUMBS[p]) return [...BREADCRUMBS[p], { label: decodeURIComponent(parts[i]) }];
    }
    return [{ label: 'Briff' }];
  })();

  return html`
    <header style=${{ position: 'fixed', top: 0, left: 240, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #E2E2EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 40 }}>
      <!-- Breadcrumb -->
      <nav style=${{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
        ${crumbs.map((c, i) => html`
          <span key=${i} style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>
            ${i > 0 && html`<span style=${{ color: '#C0C0CC' }}>/</span>`}
            ${c.path
              ? html`<button onClick=${() => navigate(c.path)} style=${{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6B6B80', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}
                  onMouseEnter=${e => e.currentTarget.style.color = '#2A2AFF'}
                  onMouseLeave=${e => e.currentTarget.style.color = '#6B6B80'}>${c.label}</button>`
              : html`<span style=${{ color: i === crumbs.length - 1 ? '#0A0A0A' : '#6B6B80', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>${c.label}</span>`
            }
          </span>
        `)}
      </nav>

      <!-- Right -->
      <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick=${() => setShowSearch(true)} style=${{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5FA', border: '1px solid #E2E2EC', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#6B6B80', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
          🔍 Buscar…<span style=${{ marginLeft: 8, fontSize: 11, background: '#E2E2EC', borderRadius: 4, padding: '1px 6px' }}>⌘K</span>
        </button>

        <div style=${{ position: 'relative' }}>
          <button onClick=${() => setShowNotifs(!showNotifs)} style=${{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E2E2EC', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, position: 'relative' }}>
            🔔
            ${unread > 0 && html`<span style=${{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#FF6B2B', border: '1.5px solid #fff' }}/>`}
          </button>
          ${showNotifs && html`
            <div style=${{ position: 'absolute', right: 0, top: 44, width: 360, background: '#fff', border: '1px solid #E2E2EC', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200 }}>
              <div style=${{ padding: '14px 16px', borderBottom: '1px solid #E2E2EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style=${{ fontWeight: 600, fontSize: 14 }}>Notificaciones</span>
                <button onClick=${() => { dispatch({ type: 'MARK_ALL_READ' }); setShowNotifs(false); }} style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2A2AFF', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Marcar todo leído</button>
              </div>
              <div style=${{ maxHeight: 360, overflowY: 'auto' }}>
                ${notifications.slice(0, 6).map(n => html`
                  <div key=${n.id} onClick=${() => { dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id }); setShowNotifs(false); navigate(n.link); }}
                    style=${{ padding: '12px 16px', borderBottom: '1px solid #F0F0F5', cursor: 'pointer', background: n.read ? '#fff' : '#F8F8FF', display: 'flex', gap: 10, alignItems: 'flex-start' }}
                    onMouseEnter=${e => e.currentTarget.style.background = '#F5F5FA'}
                    onMouseLeave=${e => e.currentTarget.style.background = n.read ? '#fff' : '#F8F8FF'}>
                    ${!n.read && html`<div style=${{ width: 6, height: 6, borderRadius: '50%', background: '#2A2AFF', marginTop: 5, flexShrink: 0 }}/>`}
                    <div style=${{ flex: 1 }}>
                      <div style=${{ fontSize: 13, color: '#0A0A0A', lineHeight: 1.4 }}>${n.text}</div>
                      <div style=${{ fontSize: 11, color: '#6B6B80', marginTop: 2 }}>${new Date(n.time).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `}
        </div>

        <div style=${{ width: 32, height: 32, borderRadius: '50%', background: currentUser.avatar_color || '#2A2AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }} title=${currentUser.name}>
          ${initials(currentUser.name)}
        </div>
      </div>

      ${showNotifs && html`<div onClick=${() => setShowNotifs(false)} style=${{ position: 'fixed', inset: 0, zIndex: 199 }}/>`}

      ${showSearch && html`
        <div style=${{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.4)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
          onClick=${() => setShowSearch(false)}>
          <div className="modal-enter" onClick=${e => e.stopPropagation()} style=${{ background: '#fff', borderRadius: 12, width: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style=${{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #E2E2EC', gap: 10 }}>
              <span style=${{ fontSize: 18, color: '#6B6B80' }}>🔍</span>
              <input autoFocus placeholder="Buscar proyectos, clientes, estimaciones…" style=${{ border: 'none', outline: 'none', flex: 1, fontSize: 15, color: '#0A0A0A', fontFamily: 'DM Sans, sans-serif' }}/>
              <span style=${{ fontSize: 12, color: '#6B6B80' }}>ESC para cerrar</span>
            </div>
            <div style=${{ padding: '48px 24px', textAlign: 'center', color: '#6B6B80', fontSize: 14 }}>Escribe para buscar en Briff…</div>
          </div>
        </div>
      `}
    </header>
  `;
}
