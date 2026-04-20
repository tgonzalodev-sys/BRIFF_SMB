import { html } from '../lib/html.js';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context.js';
import { formatARS, formatTimeAgo, initials, TODAY } from '../lib/utils.js';
import PageHeader from '../components/ui/PageHeader.js';
import KpiCard from '../components/ui/KpiCard.js';
import BurnBar from '../components/ui/BurnBar.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import { FileSpreadsheet, CheckCircle2, Clock, Folder, Target, AlertTriangle } from 'lucide-react';

const LEAVE_LABELS = { vacation: 'Vacaciones', sick: 'Enfermedad', personal: 'Personal', compensatory: 'Compensatorio' };
const LEAVE_COLORS = { vacation: '#0046F3', sick: '#FF6467', personal: '#8E51FF', compensatory: '#00BC7D' };

const card = { background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px' };
const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' };

const TYPE_ICONS = {
  estimate:  FileSpreadsheet,
  task:      CheckCircle2,
  timesheet: Clock,
  project:   Folder,
  crm:       Target,
};

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
    .filter(r => r.status !== 'rejected' && r.start >= TODAY)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 4);

  function getUser(id) { return users.find(u => u.id === id) || {}; }
  function getClient(id) { return clients.find(c => c.id === id) || {}; }

  const TASK_STATUS_STYLE = {
    in_progress: { bg: '#E0E6F6', color: '#0046F3', label: 'En progreso' },
    pending:     { bg: '#FEF3C6', color: '#FF8041', label: 'Pendiente' },
    done:        { bg: '#D0FAE5', color: '#009966', label: 'Listo' },
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
          accentColor="#0046F3"
          sparkline=${[2100000, 2800000, 2400000, 3100000, 2700000, 3500000, 3960000]}
        />
        <${KpiCard}
          label="Proyectos activos"
          value=${activeProjects.length}
          subtitle="${projects.filter(p => p.status === 'in_review').length} en revisión"
          sparkline=${[3, 4, 3, 5, 4, 4, activeProjects.length]}
        />
        <${KpiCard}
          label="Utilización equipo"
          value="${avgUtil}%"
          subtitle="target 70%"
          delta=${avgUtil >= 70 ? 'En objetivo' : 'Por debajo'}
          deltaType=${avgUtil >= 70 ? 'up' : 'down'}
          accentColor=${avgUtil >= 70 ? '#009966' : '#FF8041'}
          sparkline=${[62, 58, 65, 70, 67, 72, avgUtil]}
        />
        <${KpiCard}
          label="Aprobaciones"
          value=${pendingCount}
          subtitle="pendientes de acción"
          accentColor=${pendingCount > 0 ? '#FF8041' : '#009966'}
        />
      </div>

      <!-- Middle Row -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        <!-- Projects Burn -->
        <div style=${card}>
          <div style=${sectionTitle}>
            <span>Proyectos — Burn de horas</span>
            <button onClick=${() => navigate('/proyectos')} style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0046F3', fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif' }}>Ver todos →</button>
          </div>
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            ${activeProjects.map((p, i) => {
              const client = getClient(p.client);
              return html`
                <div key=${p.id}
                  role="button"
                  tabIndex=${0}
                  onClick=${() => navigate('/proyectos/' + p.id)}
                  onKeyDown=${e => (e.key === 'Enter' || e.key === ' ') && navigate('/proyectos/' + p.id)}
                  style=${{ padding: '14px 0', borderBottom: i < activeProjects.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 200px 80px', gap: 16, alignItems: 'center' }}
                  onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <div style=${{ fontSize: 14, fontWeight: 500, color: '#111827' }}>${p.title}</div>
                    <div style=${{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>${client.name}</div>
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
            <span style=${{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>${myDone}/${allMyTasks.length} listas</span>
          </div>
          ${myTasks.length === 0 && html`
            <div style=${{ textAlign: 'center', padding: '32px 0', color: '#6B7280', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <${CheckCircle2} size=${40} strokeWidth=${1.33} color="#00BC7D" />
              <span style=${{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Sin tareas para hoy</span>
              <span>Tu lista está al día — buen momento para cargar horas.</span>
              <button onClick=${() => navigate('/timesheets')}
                style=${{ marginTop: 4, background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Host Grotesk, sans-serif' }}>
                Cargar horas
              </button>
            </div>
          `}
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            ${myTasks.map(task => {
              const s = TASK_STATUS_STYLE[task.status] || TASK_STATUS_STYLE.pending;
              const overdue = task.due < TODAY;
              return html`
                <div key=${task.id} style=${{ padding: '12px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                  <div style=${{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 6, lineHeight: 1.4 }}>${task.title}</div>
                  <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style=${{ fontSize: 11, background: s.bg, color: s.color, borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>${s.label}</span>
                    <span style=${{ fontSize: 11, color: overdue ? '#FF6467' : '#6B7280', fontWeight: overdue ? 600 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                      ${overdue && html`<${AlertTriangle} size=${11} strokeWidth=${1.5} />`}
                      Vence ${task.due.slice(5).replace('-', '/')}
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
              const IconComp = TYPE_ICONS[item.type] || Folder;
              return html`
                <div key=${item.id} style=${{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < activityFeed.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style=${{ width: 32, height: 32, borderRadius: '50%', background: u.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    ${initials(u.name || '?')}
                  </div>
                  <div style=${{ flex: 1, minWidth: 0 }}>
                    <div style=${{ fontSize: 13, color: '#111827', lineHeight: 1.4 }}>
                      <strong style=${{ fontWeight: 600 }}>${u.name}</strong>
                      ${' '}<span style=${{ color: '#6B7280' }}>${item.action}</span>
                      ${' '}<span style=${{ fontWeight: 500 }}>${item.subject}</span>
                    </div>
                    <div style=${{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>${formatTimeAgo(item.time)}</div>
                  </div>
                  <div style=${{ color: '#9CA3AF', flexShrink: 0 }}>
                    <${IconComp} size=${16} strokeWidth=${1.33} />
                  </div>
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Licencias próximas -->
        <div style=${card}>
          <div style=${sectionTitle}>
            <span>Licencias próximas</span>
            <button onClick=${() => navigate('/licencias/equipo')} style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0046F3', fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif' }}>Ver equipo →</button>
          </div>
          ${upcomingLeaves.length === 0 && html`
            <div style=${{ textAlign: 'center', padding: '32px 0', color: '#6B7280', fontSize: 13 }}>Sin licencias próximas</div>
          `}
          <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            ${upcomingLeaves.map(req => {
              const u = getUser(req.user);
              const color = LEAVE_COLORS[req.type] || '#6B7280';
              const label = LEAVE_LABELS[req.type] || req.type;
              const isSameDay = req.start === req.end;
              const dateStr = isSameDay
                ? req.start.slice(5).replace('-', '/')
                : req.start.slice(5).replace('-', '/') + ' – ' + req.end.slice(5).replace('-', '/');
              return html`
                <div key=${req.id} style=${{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                  <div style=${{ width: 3, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div style=${{ width: 30, height: 30, borderRadius: '50%', background: u.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    ${initials(u.name || '?')}
                  </div>
                  <div style=${{ flex: 1, minWidth: 0 }}>
                    <div style=${{ fontSize: 13, fontWeight: 500, color: '#111827' }}>${u.name}</div>
                    <div style=${{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>${label}${req.half_day ? ' (medio día)' : ''}</div>
                  </div>
                  <div style=${{ textAlign: 'right' }}>
                    <div style=${{ fontSize: 12, fontWeight: 600, color, fontFamily: 'JetBrains Mono, monospace' }}>${dateStr}</div>
                    <div style=${{ fontSize: 11, marginTop: 2 }}>
                      <span style=${{ background: req.status === 'approved' ? '#D0FAE5' : '#FEF3C6', color: req.status === 'approved' ? '#009966' : '#FF8041', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
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
