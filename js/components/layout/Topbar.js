import { useState, useEffect } from 'react';
import { html } from '../../lib/html.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState, useDispatch } from '../../context.js';
import { initials } from '../../lib/utils.js';
import { Bell, Search, Clock } from 'lucide-react';

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
  const { currentUser, notifications, timesheetEntries } = useAppState();
  const dispatch = useDispatch();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

  // ⌘K / Ctrl+K opens search; Escape closes it
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifs(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  // TimeTracker: hours logged this week for current user
  const weekDates = ['2026-04-14','2026-04-15','2026-04-16','2026-04-17','2026-04-18'];
  const weeklyHours = timesheetEntries
    .filter(e => e.user === currentUser.id && weekDates.includes(e.date))
    .reduce((s, e) => s + (e.hours || 0), 0);
  const weeklyTarget = 40;
  const timerPct = Math.min(Math.round((weeklyHours / weeklyTarget) * 100), 100);

  return html`
    <header style=${{
      position: 'fixed', top: 0, left: 232, right: 0, height: 61,
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', zIndex: 40, gap: 12
    }}>
      <!-- Breadcrumb -->
      <nav style=${{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, flex: 1, minWidth: 0, flexWrap: 'nowrap' }}>
        ${crumbs.map((c, i) => html`
          <span key=${i} style=${{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: i < crumbs.length - 1 ? 0 : 1, minWidth: 0 }}>
            ${i > 0 && html`<span style=${{ color: '#D1D5DB', fontSize: 12 }}>/</span>`}
            ${c.path
              ? html`<button onClick=${() => navigate(c.path)}
                  style=${{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6B7280', fontSize: 13, fontFamily: 'Host Grotesk, sans-serif', whiteSpace: 'nowrap' }}
                  onMouseEnter=${e => e.currentTarget.style.color = '#0046F3'}
                  onMouseLeave=${e => e.currentTarget.style.color = '#6B7280'}>${c.label}</button>`
              : html`<span style=${{ color: i === crumbs.length - 1 ? '#111827' : '#6B7280', fontWeight: i === crumbs.length - 1 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${c.label}</span>`
            }
          </span>
        `)}
      </nav>

      <!-- Right side -->
      <div style=${{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        <!-- TimeTracker pill -->
        <div style=${{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid #FFB8D9', borderRadius: 9999,
          background: '#FFF5F8', padding: '5px 12px 5px 10px',
        }}>
          <${Clock} size=${14} strokeWidth=${1.5} color="#F5638E" />
          <span style=${{ fontSize: 12, fontWeight: 500, color: '#F5638E', whiteSpace: 'nowrap' }}>
            ${weeklyHours}h / ${weeklyTarget}h
          </span>
          <div style=${{ width: 56, height: 4, borderRadius: 9999, background: '#FFD6E7', overflow: 'hidden' }}>
            <div style=${{ height: '100%', width: `${timerPct}%`, background: '#F5638E', borderRadius: 9999, transition: 'width 0.4s' }} />
          </div>
          <button
            style=${{ background: '#F5638E', border: 'none', borderRadius: 9999, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'Host Grotesk, sans-serif', whiteSpace: 'nowrap' }}
            onMouseEnter=${e => e.currentTarget.style.background = '#E0457A'}
            onMouseLeave=${e => e.currentTarget.style.background = '#F5638E'}>
            Registrar
          </button>
        </div>

        <!-- Search -->
        <button onClick=${() => setShowSearch(true)}
          style=${{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#9CA3AF', fontSize: 13, fontFamily: 'Host Grotesk, sans-serif' }}
          onMouseEnter=${e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#F3F4F6'; }}
          onMouseLeave=${e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}>
          <${Search} size=${14} strokeWidth=${1.5} />
          Buscar…
          <span style=${{ marginLeft: 4, fontSize: 10, background: '#E5E7EB', borderRadius: 4, padding: '1px 5px', color: '#6B7280' }}>⌘K</span>
        </button>

        <!-- Notifications -->
        <div style=${{ position: 'relative' }}>
          <button onClick=${() => setShowNotifs(!showNotifs)}
            aria-label="${unread} notificaciones sin leer"
            style=${{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave=${e => e.currentTarget.style.background = '#fff'}>
            <${Bell} size=${16} strokeWidth=${1.5} color="#6B7280" />
            ${unread > 0 && html`
              <span style=${{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#FF6467', border: '1.5px solid #fff' }}/>
            `}
          </button>
          ${showNotifs && html`
            <div style=${{ position: 'absolute', right: 0, top: 42, width: 360, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 200 }}>
              <div style=${{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style=${{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Notificaciones</span>
                <button onClick=${() => { dispatch({ type: 'MARK_ALL_READ' }); setShowNotifs(false); }}
                  style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0046F3', fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif' }}>
                  Marcar todo leído
                </button>
              </div>
              <div style=${{ maxHeight: 360, overflowY: 'auto' }}>
                ${notifications.slice(0, 6).map(n => html`
                  <div key=${n.id}
                    onClick=${() => { dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id }); setShowNotifs(false); navigate(n.link); }}
                    style=${{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', background: n.read ? '#fff' : '#E0E6F6', display: 'flex', gap: 10, alignItems: 'flex-start' }}
                    onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave=${e => e.currentTarget.style.background = n.read ? '#fff' : '#E0E6F6'}>
                    ${!n.read && html`<div style=${{ width: 6, height: 6, borderRadius: '50%', background: '#0046F3', marginTop: 5, flexShrink: 0 }}/>`}
                    <div style=${{ flex: 1 }}>
                      <div style=${{ fontSize: 13, color: '#111827', lineHeight: 1.4 }}>${n.text}</div>
                      <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        ${new Date(n.time).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `}
        </div>

        <!-- Avatar -->
        <div style=${{ width: 32, height: 32, borderRadius: '50%', background: currentUser.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', border: '2px solid #E5E7EB' }}
          title=${currentUser.name}>
          ${initials(currentUser.name)}
        </div>
      </div>

      ${showNotifs && html`<div onClick=${() => setShowNotifs(false)} style=${{ position: 'fixed', inset: 0, zIndex: 199 }}/>`}

      ${showSearch && html`
        <div style=${{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
          onClick=${() => setShowSearch(false)}>
          <div className="modal-enter" onClick=${e => e.stopPropagation()}
            style=${{ background: '#fff', borderRadius: 12, width: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style=${{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F3F4F6', gap: 10 }}>
              <${Search} size=${16} strokeWidth=${1.5} color="#9CA3AF" />
              <input autoFocus placeholder="Buscar proyectos, clientes, estimaciones…"
                style=${{ border: 'none', outline: 'none', flex: 1, fontSize: 15, color: '#111827', fontFamily: 'Host Grotesk, sans-serif' }}/>
              <span style=${{ fontSize: 12, color: '#9CA3AF' }}>ESC para cerrar</span>
            </div>
            <div style=${{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Escribe para buscar en Briff…</div>
          </div>
        </div>
      `}
    </header>
  `;
}
