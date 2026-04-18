import { html } from '../../lib/html.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState, useDispatch } from '../../context.js';
import { initials } from '../../lib/utils.js';

const NAV = [
  { group: 'OPERACIONES', items: [
    { path: '/proyectos',   label: 'Proyectos'     },
    { path: '/timesheets',  label: 'Timesheets',  badge: 2 },
    { path: '/licencias',   label: 'Licencias'    },
    { path: '/gastos',      label: 'Gastos',      badge: 3 },
  ]},
  { group: 'COMERCIAL', items: [
    { path: '/crm/pipeline', label: 'Pipeline CRM' },
    { path: '/crm/clientes', label: 'Clientes' },
    { path: '/estimaciones', label: 'Estimaciones' },
    { path: '/contratos',    label: 'Contratos'    },
    { path: '/proveedores',  label: 'Proveedores'  },
  ]},
  { group: 'FINANZAS', items: [
    { path: '/facturacion',  label: 'Facturación', badge: 2 },
    { path: '/finanzas',     label: 'Finanzas'    },
  ]},
  { group: 'EQUIPO', items: [
    { path: '/personas',              label: 'Personas'    },
    { path: '/personas/typologias',   label: 'Typologías'  },
  ]},
  { group: 'CONFIG', items: [
    { path: '/organizacion', label: 'Organización' },
  ]},
];

const ROLE_OPTIONS = [
  { value: 'u1', label: 'Valentina Ros — Directora' },
  { value: 'u2', label: 'Matías F. — Account' },
  { value: 'u3', label: 'Lucía Paredes — Arte' },
  { value: 'u4', label: 'Tomás Blanco — Copy' },
  { value: 'u5', label: 'Ana Gómez — Finanzas' },
  { value: 'u6', label: 'Diego Núñez — Motion' },
];

const BRIFF_LOGO_WHITE = `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="33" viewBox="0 0 175 52" fill="none">
  <g transform="translate(6 8)">
    <path d="M 30.755 7.093 L 20.948 7.093 C 20.255 7.093 19.603 6.749 19.201 6.169 L 15.554 0.925 C 15.152 0.345 14.5 0 13.807 0 L 2.155 0 C 0.966 0 0 0.999 0 2.23 L 0 26.979 C 0 32.039 3.965 36.139 8.853 36.139 L 32.626 36.139 C 36.482 36.139 39.612 32.904 39.612 28.912 L 39.612 16.262 C 39.612 11.202 35.646 7.102 30.758 7.102 L 30.755 7.102 Z M 33.103 17.549 L 29.402 27.214 C 29.112 27.969 28.405 28.466 27.617 28.466 L 9.577 28.466 C 8.224 28.466 7.296 27.054 7.793 25.751 L 11.494 16.086 C 11.784 15.331 12.491 14.835 13.279 14.835 L 31.319 14.835 C 32.672 14.835 33.6 16.247 33.103 17.549 Z" fill="#FFFFFF"/>
  </g>
  <text x="55" y="36" font-family="Host Grotesk, sans-serif" font-weight="700" font-size="28" letter-spacing="-0.02em" fill="#FFFFFF">briff</text>
</svg>`;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAppState();
  const dispatch = useDispatch();

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  return html`
    <aside style=${{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 232,
      background: '#111827', display: 'flex', flexDirection: 'column',
      zIndex: 50, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)'
    }}>
      <!-- Logo -->
      <div style=${{ padding: '20px 20px 16px', flexShrink: 0 }}
        dangerouslySetInnerHTML=${{ __html: BRIFF_LOGO_WHITE }}
      />

      <!-- Nav -->
      <nav style=${{ flex: 1, padding: '4px 10px' }}>
        ${NAV.map(({ group, items }) => html`
          <div key=${group} style=${{ marginBottom: 4 }}>
            <div style=${{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', padding: '10px 8px 4px', textTransform: 'uppercase' }}>
              ${group}
            </div>
            ${items.map(({ path, label, badge }) => {
              const active = isActive(path);
              return html`
                <button key=${path} onClick=${() => navigate(path)}
                  style=${{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: 6, border: 'none',
                    background: active ? 'rgba(0,70,243,0.25)' : 'transparent',
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    cursor: 'pointer', marginBottom: 1, textAlign: 'left',
                    fontSize: 13.5, fontWeight: active ? 600 : 400,
                    fontFamily: 'Host Grotesk, sans-serif',
                    transition: 'background 0.12s, color 0.12s',
                    borderLeft: active ? '2px solid #0046F3' : '2px solid transparent',
                  }}
                  onMouseEnter=${e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                  onMouseLeave=${e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}>
                  <span>${label}</span>
                  ${badge > 0 && html`
                    <span style=${{ background: '#0046F3', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                      ${badge}
                    </span>
                  `}
                </button>
              `;
            })}
          </div>
        `)}
      </nav>

      <!-- User section -->
      <div style=${{ padding: '10px 10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style=${{ marginBottom: 8 }}>
          <div style=${{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase', paddingLeft: 4 }}>Vista como</div>
          <select value=${currentUser.id} onChange=${e => dispatch({ type: 'SET_USER', userId: e.target.value })}
            style=${{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12, padding: '7px 10px', cursor: 'pointer', outline: 'none', fontFamily: 'Host Grotesk, sans-serif' }}>
            ${ROLE_OPTIONS.map(o => html`<option key=${o.value} value=${o.value} style=${{ background: '#1a1a2e', color: '#fff' }}>${o.label}</option>`)}
          </select>
        </div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
          <div style=${{ width: 30, height: 30, borderRadius: '50%', background: currentUser.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            ${initials(currentUser.name)}
          </div>
          <div style=${{ minWidth: 0 }}>
            <div style=${{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${currentUser.name}</div>
            <div style=${{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${currentUser.typology}</div>
          </div>
        </div>
      </div>
    </aside>
  `;
}
