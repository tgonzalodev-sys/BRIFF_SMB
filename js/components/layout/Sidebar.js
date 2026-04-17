import { html } from '../../lib/html.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState, useDispatch } from '../../context.js';
import { initials } from '../../lib/utils.js';

const NAV = [
  { group: 'OPERACIONES', items: [
    { path: '/proyectos',   label: 'Proyectos',      badge: null },
    { path: '/timesheets',  label: 'Timesheets',     badge: 2    },
    { path: '/licencias',   label: 'Licencias',      badge: null },
    { path: '/gastos',      label: 'Gastos',         badge: 3    },
  ]},
  { group: 'COMERCIAL', items: [
    { path: '/crm/clientes', label: 'CRM',           badge: null },
    { path: '/estimaciones', label: 'Estimaciones',  badge: null },
    { path: '/contratos',    label: 'Contratos',     badge: null },
    { path: '/proveedores',  label: 'Proveedores',   badge: null },
  ]},
  { group: 'FINANZAS', items: [
    { path: '/facturacion',  label: 'Facturación',   badge: 2    },
    { path: '/finanzas',     label: 'Finanzas',      badge: null },
  ]},
  { group: 'EQUIPO', items: [
    { path: '/personas',     label: 'Personas',      badge: null },
  ]},
  { group: 'CONFIG', items: [
    { path: '/organizacion', label: 'Organización',  badge: null },
  ]},
];

const ROLE_OPTIONS = [
  { value: 'u1', label: 'Director — Valentina Ros' },
  { value: 'u2', label: 'Account Manager — Matías F.' },
  { value: 'u3', label: 'Creative — Lucía Paredes' },
  { value: 'u4', label: 'Creative — Tomás Blanco' },
  { value: 'u5', label: 'Finance — Ana Gómez' },
  { value: 'u6', label: 'Creative — Diego Núñez' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAppState();
  const dispatch = useDispatch();

  function isActive(path) {
    if (path === '/crm/clientes') return location.pathname.startsWith('/crm');
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  return html`
    <aside style=${{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: '#0A0A0A', display: 'flex', flexDirection: 'column', zIndex: 50, overflowY: 'auto' }}>
      <!-- Logo -->
      <div style=${{ padding: '20px 20px 12px', flexShrink: 0 }}>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2A2AFF"/>
            <path d="M8 8h10c3.3 0 6 2.7 6 6s-2.7 6-6 6H8V8z" fill="white"/>
            <rect x="8" y="22" width="16" height="2.5" rx="1.25" fill="#CCFF44"/>
          </svg>
          <span style=${{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>briff</span>
        </div>
      </div>

      <!-- Nav groups -->
      <nav style=${{ flex: 1, padding: '4px 12px' }}>
        ${NAV.map(({ group, items }) => html`
          <div key=${group} style=${{ marginBottom: 6 }}>
            <div style=${{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', padding: '10px 8px 5px', textTransform: 'uppercase' }}>
              ${group}
            </div>
            ${items.map(({ path, label, badge }) => {
              const active = isActive(path);
              return html`
                <button key=${path} onClick=${() => navigate(path)}
                  style=${{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 7, border: 'none', background: active ? '#2A2AFF' : 'transparent', borderLeft: active ? '3px solid #CCFF44' : '3px solid transparent', color: active ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', marginBottom: 1, textAlign: 'left', fontSize: 13.5, fontWeight: active ? 500 : 400, fontFamily: 'DM Sans, sans-serif', transition: 'background 0.1s' }}
                  onMouseEnter=${e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave=${e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <span>${label}</span>
                  ${badge > 0 && html`<span style=${{ background: '#FF6B2B', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>${badge}</span>`}
                </button>
              `;
            })}
          </div>
        `)}
      </nav>

      <!-- User section -->
      <div style=${{ padding: '10px 12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style=${{ marginBottom: 10 }}>
          <div style=${{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Vista como</div>
          <select value=${currentUser.id} onChange=${e => dispatch({ type: 'SET_USER', userId: e.target.value })}
            style=${{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#fff', fontSize: 12, padding: '7px 10px', cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
            ${ROLE_OPTIONS.map(o => html`<option key=${o.value} value=${o.value} style=${{ background: '#1a1a1a', color: '#fff' }}>${o.label}</option>`)}
          </select>
        </div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
          <div style=${{ width: 30, height: 30, borderRadius: '50%', background: currentUser.avatar_color || '#2A2AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            ${initials(currentUser.name)}
          </div>
          <div style=${{ minWidth: 0 }}>
            <div style=${{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${currentUser.name}</div>
            <div style=${{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${currentUser.typology}</div>
          </div>
        </div>
      </div>
    </aside>
  `;
}
