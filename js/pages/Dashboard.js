import { html } from '../lib/html.js';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context.js';
import { formatARS, formatTimeAgo, initials } from '../lib/utils.js';
import PageHeader from '../components/ui/PageHeader.js';
import KpiCard from '../components/ui/KpiCard.js';
import BurnBar from '../components/ui/BurnBar.js';
import StatusBadge from '../components/ui/StatusBadge.js';

const LEAVE_LABELS = { vacation: 'Vacaciones', sick: 'Enfermedad', personal: 'Personal', compensatory: 'Compensatorio' };
const LEAVE_COLORS = { vacation: '#2A2AFF', sick: '#FF3B3B', personal: '#7C3AED', compensatory: '#059669' };

const card = { background: '#fff', borderRadius: 10, border: '1px solid #E2E2EC', padding: '20px 24px' };
const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, tasks, timesheetWeeks, leaveRequests, invoiceAuthorizations,
          activityFeed, users, currentUser, expenseSheets, clients, jobs } = useAppState();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_review');

  const monthlyBilling = invoiceAuthorizations
    .filter(i => i.date.startsWith('2026-04'))
    .reduce((s, i) => s + i.amount, 0);

  const pendingCount =
    timesheetWeeks.filter(w => w.status === 'pending').length +
    expenseSheets.filter(s => s.status === 'pending').length +
    leaveRequests.filter(r => r.status === 'pending').length;

  const avgUtil = 68;

  const myTasks = tasks.filter(t => t.assigned === currentUser.id && t.status !== 'done').slice(0, 5);
  const allMyTasks = tasks.filter(t => t.assigned === currentUser.id);
  const myDone = allMyTasks.filter(t => t.status === 'done').length;

  const upcomingLeaves = leaveRequests
    .filter(r => r.status !== 'rejected' && r.start >= '2026-04-17')
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 4);

  function getUser(id) { return users.find(u => u.id === id) || {}; }
  function getClient(id) { return clients.find(c => c.id === id) || {}; }
  function getJobTitle(task) { const j = jobs.find(j => j.id === task.job); return j ? j.title : ''; }

  const TASK_STATUS_STYLE = {
    in_progress: { bg: '#EEF2FF', color: '#2A2AFF', label: 'En progreso' },
    pending:     { bg: '#FFF7ED', color: '#D97706', label: 'Pendiente' },
    done:        { bg: '#F0FDF4', color: '#059669', label: 'Listo' },
  };

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <${PageHeader} title="Dashboard" subtitle="Resumen ejecutivo — Estudio Cóndor" />

      <!-- KPI Row -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <${KpiCard}
          label="Facturación Abril"
          value=${formatARS(monthlyBilling)}
          subtitle="2 facturas emitidas"
          delta="+14% vs. Marzo"
          deltaType="up"
        />
        <${KpiCard}
          label="Proyectos activos"
          value=${activeProjects.length}
          subtitle="${projects.filter(p => p.status === 'in_review').length} en revisión"
        />
        <${KpiCard}
          label="Utilización equipo"
          value="${avgUtil}%"
          subtitle="target 70%"
          delta=${avgUtil >= 70 ? 'En objetivo' : 'Por debajo'}
          deltaType=${avgUtil >= 70 ? 'up' : 'down'}
        />
        <${KpiCard}
          label="Aprobaciones"
          value=${pendingCount}
          subtitle="pendientes de acción"
          accentColor=${pendingCount > 0 ? '#FF6B2B' : '#059669'}
        />
      </div>

      <!-- Middle Row -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        <!-- Projects Burn -->
        <div style=${card}>
          <div style=${sectionTitle}>
            <span>Proyectos — Burn de horas</span>
            <button onClick=${() => navigate('/proyectos')} style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2A2AFF', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Ver todos →</button>
          </div>
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            ${activeProjects.map((p, i) => {
              const client = getClient(p.client);
              const burnPct = p.planned_hours > 0 ? Math.round((p.actual_hours / p.planned_hours) * 100) : 0;
              return html`
                <div key=${p.id}
                  onClick=${() => navigate('/proyectos/' + p.id)}
                  style=${{ padding: '14px 0', borderBottom: i < activeProjects.length - 1 ? '1px solid #F0F0F5' : 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 200px 80px', gap: 16, alignItems: 'center' }}
                  onMouseEnter=${e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <div style=${{ fontSize: 14, fontWeight: 500, color: '#0A0A0A' }}>${p.title}</div>
                    <div style=${{ fontSize: 12, color: '#6B6B80', marginTop: 2 }}>${client.name}</div>
                  </div>
                  <${BurnBar} planned=${p.planned_hours} actual=${p.actual_hours} height=${7} />
                  <${StatusBadge} status=${p.status} type="project" />
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Mi Semana -->
        <div style=${card}>
          <div style=${sectionTitle}>
            <span>Mi semana</span>
            <span style=${{ fontSize: 12, color: '#6B6B80', fontWeight: 400 }}>${myDone}/${allMyTasks.length} listas</span>
          </div>
          ${myTasks.length === 0 && html`
            <div style=${{ textAlign: 'center', padding: '32px 0', color: '#6B6B80', fontSize: 13 }}>
              <div style=${{ fontSize: 28, marginBottom: 8 }}>✓</div>
              Todo al día
            </div>
          `}
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            ${myTasks.map(task => {
              const s = TASK_STATUS_STYLE[task.status] || TASK_STATUS_STYLE.pending;
              const overdue = task.due < '2026-04-17';
              return html`
                <div key=${task.id} style=${{ padding: '12px', borderRadius: 8, background: '#FAFAFA', border: '1px solid #F0F0F5' }}>
                  <div style=${{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', marginBottom: 6, lineHeight: 1.4 }}>${task.title}</div>
                  <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style=${{ fontSize: 11, background: s.bg, color: s.color, borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>${s.label}</span>
                    <span style=${{ fontSize: 11, color: overdue ? '#FF3B3B' : '#6B6B80', fontWeight: overdue ? 600 : 400 }}>
                      ${overdue ? '⚠ ' : ''}Vence ${task.due.slice(5).replace('-', '/')}
                    </span>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <!-- Activity Feed -->
        <div style=${card}>
          <div style=${sectionTitle}><span>Actividad reciente</span></div>
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            ${activityFeed.map((item, i) => {
              const u = getUser(item.user);
              const TYPE_ICONS = { estimate: '📋', task: '✅', timesheet: '🕒', project: '📁', crm: '🎯' };
              return html`
                <div key=${item.id} style=${{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < activityFeed.length - 1 ? '1px solid #F0F0F5' : 'none' }}>
                  <div style=${{ width: 32, height: 32, borderRadius: '50%', background: u.avatar_color || '#2A2AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    ${initials(u.name || '?')}
                  </div>
                  <div style=${{ flex: 1, minWidth: 0 }}>
                    <div style=${{ fontSize: 13, color: '#0A0A0A', lineHeight: 1.4 }}>
                      <strong style=${{ fontWeight: 600 }}>${u.name}</strong>
                      ${' '}<span style=${{ color: '#6B6B80' }}>${item.action}</span>
                      ${' '}<span style=${{ fontWeight: 500 }}>${item.subject}</span>
                    </div>
                    <div style=${{ fontSize: 11, color: '#6B6B80', marginTop: 2 }}>${formatTimeAgo(item.time)}</div>
                  </div>
                  <span style=${{ fontSize: 16 }}>${TYPE_ICONS[item.type] || '•'}</span>
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Licencias próximas -->
        <div style=${card}>
          <div style=${sectionTitle}>
            <span>Licencias próximas</span>
            <button onClick=${() => navigate('/licencias/equipo')} style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2A2AFF', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Ver equipo →</button>
          </div>
          ${upcomingLeaves.length === 0 && html`
            <div style=${{ textAlign: 'center', padding: '32px 0', color: '#6B6B80', fontSize: 13 }}>Sin licencias próximas</div>
          `}
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            ${upcomingLeaves.map(req => {
              const u = getUser(req.user);
              const color = LEAVE_COLORS[req.type] || '#6B6B80';
              const label = LEAVE_LABELS[req.type] || req.type;
              const isSameDay = req.start === req.end;
              const dateStr = isSameDay
                ? req.start.slice(5).replace('-', '/')
                : req.start.slice(5).replace('-', '/') + ' – ' + req.end.slice(5).replace('-', '/');
              return html`
                <div key=${req.id} style=${{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: '#FAFAFA', border: '1px solid #F0F0F5' }}>
                  <div style=${{ width: 3, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div style=${{ width: 30, height: 30, borderRadius: '50%', background: u.avatar_color || '#2A2AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    ${initials(u.name || '?')}
                  </div>
                  <div style=${{ flex: 1, minWidth: 0 }}>
                    <div style=${{ fontSize: 13, fontWeight: 500, color: '#0A0A0A' }}>${u.name}</div>
                    <div style=${{ fontSize: 11, color: '#6B6B80', marginTop: 1 }}>${label}${req.half_day ? ' (medio día)' : ''}</div>
                  </div>
                  <div style=${{ textAlign: 'right' }}>
                    <div style=${{ fontSize: 12, fontWeight: 600, color, fontFamily: 'DM Mono, monospace' }}>${dateStr}</div>
                    <div style=${{ fontSize: 11, marginTop: 2 }}>
                      <span style=${{ background: req.status === 'approved' ? '#F0FDF4' : '#FFF7ED', color: req.status === 'approved' ? '#059669' : '#D97706', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                        ${req.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>

      </div>
    </div>
  `;
}
