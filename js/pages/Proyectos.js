import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import BurnBar from '../components/ui/BurnBar.js';
import FilterBar from '../components/ui/FilterBar.js';
import ViewToggle from '../components/ui/ViewToggle.js';
import { useAppState, useCanSee } from '../context.js';
import { formatARS, formatDate, initials } from '../lib/utils.js';

const TYPE_INFO = {
  campaña:  { label: 'Campaña',  color: '#8E51FF', bg: '#F5F3FF' },
  digital:  { label: 'Digital',  color: '#00B8DB', bg: '#E0F9FF' },
  branding: { label: 'Branding', color: '#FE9A00', bg: '#FEF3C6' },
  retainer: { label: 'Retainer', color: '#00BC7D', bg: '#D0FAE5' },
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
  const { projects, clients, users, currentUser, viewAsTier } = useAppState();
  const canSeeAll = useCanSee();
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('');
  const [typeF, setTypeF]       = useState('');
  const showTodosTab = canSeeAll('comercial'); // power_user + admin
  const [viewMode, setViewMode] = useState(() => showTodosTab ? 'todos' : 'mis');

  // When tier changes (user selector), reset viewMode to appropriate default
  const effectiveMode = showTodosTab ? viewMode : 'mis';

  const baseProjects = effectiveMode === 'mis'
    ? projects.filter(p => p.team && p.team.includes(currentUser.id))
    : projects;

  const filtered = baseProjects.filter(p => {
    const cl = clients.find(c => c.id === p.client);
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (cl?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || p.status === statusF;
    const matchType   = !typeF   || p.type === typeF;
    return matchSearch && matchStatus && matchType;
  });

  const active    = baseProjects.filter(p => p.status === 'active').length;
  const totalBudget = baseProjects.reduce((s, p) => s + (p.budget_ars || 0), 0);
  const totalPlanned = baseProjects.reduce((s, p) => s + p.planned_hours, 0);
  const totalActual  = baseProjects.reduce((s, p) => s + p.actual_hours, 0);

  return html`
    <div>
      <${PageHeader}
        title="Proyectos"
        subtitle=${effectiveMode === 'mis' ? 'Mis proyectos asignados' : 'Gestión de proyectos del estudio'}
        actions=${html`
          <div style=${{ display: 'flex', gap: 10, alignItems: 'center' }}>
            ${showTodosTab && html`
              <${ViewToggle}
                tabs=${[{ key: 'mis', label: 'Mis Proyectos' }, { key: 'todos', label: 'Todos' }]}
                active=${effectiveMode}
                onChange=${setViewMode}
              />
            `}
            <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              + Nuevo Proyecto
            </button>
          </div>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Proyectos Activos', value: active, color: '#0046F3' },
          { label: 'Presupuesto Total', value: formatARS(totalBudget), color: '#111827' },
          { label: 'Horas Planif.', value: totalPlanned + 'h', color: '#111827' },
          { label: 'Horas Registradas', value: totalActual + 'h', color: '#111827' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <${FilterBar}
        search=${search} onSearch=${setSearch}
        filters=${[
          { label: 'Estado', value: statusF, onChange: setStatusF, options: [
            { value: 'active',    label: 'Activo' },
            { value: 'in_review', label: 'En revisión' },
            { value: 'completed', label: 'Completado' },
            { value: 'cancelled', label: 'Cancelado' },
          ]},
          { label: 'Tipo', value: typeF, onChange: setTypeF, options: [
            { value: 'campaña',  label: 'Campaña' },
            { value: 'digital',  label: 'Digital' },
            { value: 'branding', label: 'Branding' },
            { value: 'retainer', label: 'Retainer' },
          ]},
        ]}
        count=${filtered.length}
        style=${{ marginBottom: 16 }}
      />

      <!-- Project cards grid -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        ${filtered.map(project => {
          const client  = clients.find(c => c.id === project.client);
          const typeInfo = TYPE_INFO[project.type] || { label: project.type, color: '#6B7280', bg: '#F3F4F6' };
          return html`
            <div
              key=${project.id}
              role="button"
              tabIndex=${0}
              onClick=${() => navigate('/proyectos/' + project.id)}
              onKeyDown=${e => (e.key === 'Enter' || e.key === ' ') && navigate('/proyectos/' + project.id)}
              style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(16,24,40,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <!-- Top row: client + status -->
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style=${{ fontSize: 11, fontWeight: 700, color: client ? '#0046F3' : '#6B7280', background: '#E0E6F6', padding: '3px 10px', borderRadius: 99 }}>
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
