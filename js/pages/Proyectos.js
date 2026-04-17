import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import BurnBar from '../components/ui/BurnBar.js';
import { useAppState } from '../context.js';
import { formatARS, formatDate, initials } from '../lib/utils.js';

const TYPE_INFO = {
  campaña:  { label: 'Campaña',  color: '#7C3AED', bg: '#F5F3FF' },
  digital:  { label: 'Digital',  color: '#0891B2', bg: '#ECFEFF' },
  branding: { label: 'Branding', color: '#D97706', bg: '#FFFBEB' },
  retainer: { label: 'Retainer', color: '#059669', bg: '#F0FDF4' },
};

function TeamAvatars({ team, users, max = 4 }) {
  const members = team.slice(0, max).map(id => users.find(u => u.id === id)).filter(Boolean);
  const extra   = team.length - max;
  return html`
    <div style=${{ display: 'flex', alignItems: 'center' }}>
      ${members.map((u, i) => html`
        <div key=${u.id} title=${u.name} style=${{
          width: 26, height: 26, borderRadius: '50%', background: u.avatar_color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#fff',
          marginLeft: i > 0 ? -8 : 0, border: '2px solid #fff', zIndex: members.length - i,
          position: 'relative', flexShrink: 0,
        }}>${initials(u.name)}</div>
      `)}
      ${extra > 0 && html`
        <div style=${{ width: 26, height: 26, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#6B7280', marginLeft: -8, border: '2px solid #fff' }}>
          +${extra}
        </div>
      `}
    </div>
  `;
}

export default function Proyectos() {
  const { projects, clients, users } = useAppState();
  const navigate = useNavigate();

  const active    = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((s, p) => s + (p.budget_ars || 0), 0);
  const totalPlanned = projects.reduce((s, p) => s + p.planned_hours, 0);
  const totalActual  = projects.reduce((s, p) => s + p.actual_hours, 0);

  return html`
    <div>
      <${PageHeader}
        title="Proyectos"
        subtitle="Gestión de proyectos del estudio"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nuevo Proyecto
          </button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Proyectos Activos', value: active, color: '#0046F3' },
          { label: 'Presupuesto Total', value: formatARS(totalBudget), color: '#111827' },
          { label: 'Horas Planif.', value: totalPlanned + 'h', color: '#111827' },
          { label: 'Horas Registradas', value: totalActual + 'h', color: totalActual > totalPlanned ? '#FF6467' : '#009966' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <!-- Project cards grid -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        ${projects.map(project => {
          const client  = clients.find(c => c.id === project.client);
          const typeInfo = TYPE_INFO[project.type] || { label: project.type, color: '#6B7280', bg: '#F3F4F6' };
          return html`
            <div
              key=${project.id}
              onClick=${() => navigate('/proyectos/' + project.id)}
              style=${{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 24, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(16,24,40,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <!-- Top row: client + status -->
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style=${{ fontSize: 11, fontWeight: 700, color: client ? '#0046F3' : '#6B7280', background: '#EEF4FF', padding: '3px 10px', borderRadius: 99 }}>
                  ${client?.name || '—'}
                </span>
                <${StatusBadge} status=${project.status} variant="project" />
              </div>

              <!-- Title -->
              <h3 style=${{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.3 }}>${project.title}</h3>

              <!-- Type + dates -->
              <div style=${{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style=${{ fontSize: 11, fontWeight: 600, color: typeInfo.color, background: typeInfo.bg, padding: '2px 10px', borderRadius: 99 }}>${typeInfo.label}</span>
                <span style=${{ fontSize: 11, color: '#9CA3AF' }}>${formatDate(project.start)} – ${formatDate(project.end)}</span>
              </div>

              <!-- Burn bar -->
              <div style=${{ marginBottom: 16 }}>
                <${BurnBar} planned=${project.planned_hours} actual=${project.actual_hours} />
              </div>

              <!-- Footer: team + budget -->
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <${TeamAvatars} team=${project.team} users=${users} />
                <span style=${{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(project.budget_ars)}</span>
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
