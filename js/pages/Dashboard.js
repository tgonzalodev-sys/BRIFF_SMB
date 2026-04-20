import { html } from '../lib/html.js';
import { useNavigate } from 'react-router-dom';
import { useAppState, canSee } from '../context.js';
import { formatARS, formatTimeAgo, initials, TODAY } from '../lib/utils.js';
import BurnBar from '../components/ui/BurnBar.js';
import {
  BarChart2, CheckCircle2, Clock, Folder, Target, FileText,
  FileSpreadsheet, Users, Calendar, Receipt, TrendingUp, AlertTriangle,
} from 'lucide-react';

const card = {
  background: '#fff', borderRadius: 12,
  border: '1px solid #E5E7EB', padding: '20px 24px',
};
const secTitle = {
  fontSize: 13, fontWeight: 600, color: '#111827',
  marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};

const SHORTCUT_MAP = {
  admin: [
    { label: 'Finanzas',      path: '/finanzas',              Icon: BarChart2,      bg: 'rgba(0,70,243,0.1)',    color: '#0046F3' },
    { label: 'Aprobaciones',  path: '/timesheets/pendientes', Icon: CheckCircle2,   bg: 'rgba(255,128,65,0.1)',  color: '#FF8041' },
    { label: 'Personas',      path: '/personas',              Icon: Users,          bg: 'rgba(142,81,255,0.1)', color: '#8E51FF' },
    { label: 'Estimaciones',  path: '/estimaciones',          Icon: FileSpreadsheet,bg: 'rgba(0,188,125,0.1)',  color: '#00BC7D' },
  ],
  power_user: [
    { label: 'Pipeline CRM',  path: '/crm/pipeline',          Icon: Target,         bg: 'rgba(0,70,243,0.1)',    color: '#0046F3' },
    { label: 'Estimaciones',  path: '/estimaciones',          Icon: FileSpreadsheet,bg: 'rgba(0,188,125,0.1)',  color: '#00BC7D' },
    { label: 'Aprobaciones',  path: '/timesheets/pendientes', Icon: CheckCircle2,   bg: 'rgba(255,128,65,0.1)',  color: '#FF8041' },
    { label: 'Facturación',   path: '/facturacion',           Icon: FileText,       bg: 'rgba(142,81,255,0.1)', color: '#8E51FF' },
  ],
  team_member: [
    { label: 'Cargar horas',  path: '/timesheets',            Icon: Clock,          bg: 'rgba(198,238,106,0.2)', color: '#5A8A00' },
    { label: 'Mis proyectos', path: '/proyectos',             Icon: Folder,         bg: 'rgba(0,70,243,0.1)',    color: '#0046F3' },
    { label: 'Licencias',     path: '/licencias',             Icon: Calendar,       bg: 'rgba(255,128,65,0.1)',  color: '#FF8041' },
    { label: 'Gastos',        path: '/gastos',                Icon: Receipt,        bg: 'rgba(0,188,125,0.1)',  color: '#00BC7D' },
  ],
};

const LEAVE_LABELS = { vacation: 'Vacaciones', sick: 'Enfermedad', personal: 'Personal', compensatory: 'Compensatorio' };
const LEAVE_COLORS = { vacation: '#0046F3', sick: '#FF6467', personal: '#8E51FF', compensatory: '#00BC7D' };

function firstName(name) {
  return (name || '').split(' ')[0];
}

function formatDate(d) {
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [, m, day] = d.split('-');
  return `${parseInt(day)} de ${months[parseInt(m) - 1]}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    projects, tasks, timesheetWeeks, leaveRequests, invoiceAuthorizations,
    activityFeed, users, currentUser, expenseSheets, clients,
    viewAsTier,
  } = useAppState();

  const tier = viewAsTier || currentUser?.tier || 'team_member';
  const isTeam = tier === 'team_member';

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_review');
  const myProjects = projects.filter(p => p.team && p.team.includes(currentUser.id) &&
    (p.status === 'active' || p.status === 'in_review'));

  const allMyTasks = tasks.filter(t => t.assigned === currentUser.id);
  const myPendingTasks = allMyTasks.filter(t => t.status !== 'done');
  const myDoneTasks = allMyTasks.filter(t => t.status === 'done');

  const pendingTimesheets = timesheetWeeks.filter(w => w.status === 'pending').length;
  const pendingExpenses = expenseSheets.filter(s => s.status === 'pending').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
  const totalPending = pendingTimesheets + pendingExpenses + pendingLeaves;

  const monthlyBilling = invoiceAuthorizations
    .filter(i => i.date && i.date.startsWith('2026-04'))
    .reduce((s, i) => s + (i.amount || 0), 0);

  // Approximate hours this week from tasks (prototype estimation)
  const myCompletedCount = myDoneTasks.length;
  const myInProgressCount = allMyTasks.filter(t => t.status === 'in_progress').length;
  const estimatedHours = Math.min(40, myCompletedCount * 4 + myInProgressCount * 6 + 8);
  const hoursTarget = 40;
  const hoursPct = Math.round((estimatedHours / hoursTarget) * 100);
  const hoursColor = hoursPct >= 80 ? '#C6EE6A' : hoursPct >= 40 ? '#96B4E6' : '#FF8041';
  const hoursTextColor = hoursPct >= 80 ? '#4A7000' : hoursPct >= 40 ? '#0046F3' : '#CC4000';

  const upcomingLeaves = leaveRequests
    .filter(r => r.status !== 'rejected' && r.start >= TODAY)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 4);

  // Sort active projects by burn rate desc
  const sortedProjects = [...activeProjects]
    .map(p => ({ ...p, burnPct: p.planned_hours > 0 ? Math.round(p.actual_hours / p.planned_hours * 100) : 0 }))
    .sort((a, b) => b.burnPct - a.burnPct);

  function getClient(id) { return clients.find(c => c.id === id) || {}; }
  function getUser(id) { return users.find(u => u.id === id) || {}; }

  // Hero stats
  const heroStats = isTeam
    ? [
        { label: 'Mis proyectos', value: myProjects.length, color: '#0046F3', bg: 'rgba(0,70,243,0.1)' },
        { label: 'Tareas activas', value: myPendingTasks.length, color: '#FF8041', bg: 'rgba(255,128,65,0.1)' },
        { label: 'Completadas', value: myDoneTasks.length, color: '#00BC7D', bg: 'rgba(0,188,125,0.1)' },
        { label: `Horas esta semana`, value: `${estimatedHours}h`, color: hoursTextColor, bg: hoursPct >= 80 ? 'rgba(198,238,106,0.25)' : 'rgba(150,180,230,0.15)' },
      ]
    : [
        { label: 'Proyectos activos', value: activeProjects.length, color: '#0046F3', bg: 'rgba(0,70,243,0.1)' },
        { label: 'Aprobaciones', value: totalPending, color: totalPending > 0 ? '#FF8041' : '#00BC7D', bg: totalPending > 0 ? 'rgba(255,128,65,0.1)' : 'rgba(0,188,125,0.1)' },
        { label: 'Facturación Abril', value: formatARS(monthlyBilling), color: '#8E51FF', bg: 'rgba(142,81,255,0.1)' },
        { label: 'Tareas en progreso', value: allMyTasks.filter(t => t.status === 'in_progress').length, color: '#111827', bg: 'rgba(0,0,0,0.05)' },
      ];

  const shortcuts = SHORTCUT_MAP[tier] || SHORTCUT_MAP.team_member;

  const TASK_STYLE = {
    in_progress: { bg: '#E0E6F6', color: '#0046F3', label: 'En progreso' },
    pending:     { bg: '#FEF3C6', color: '#FF8041', label: 'Pendiente' },
    done:        { bg: '#D0FAE5', color: '#009966', label: 'Listo' },
  };

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <!-- Hero greeting strip -->
      <div style=${{
        background: '#0A0A0A',
        backgroundImage: 'radial-gradient(ellipse at 0% 0%, rgba(0,70,243,0.22) 0%, transparent 55%)',
        borderRadius: 14,
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        <div>
          <div style=${{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.15 }}>
            Hola, ${firstName(currentUser.name)}
          </div>
          <div style=${{ marginTop: 5, fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>${currentUser.role}</span>
            <span style=${{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span>${formatDate(TODAY)}</span>
          </div>
        </div>
        <div style=${{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          ${heroStats.map((s, i) => html`
            <div key=${i} style=${{
              background: s.bg,
              borderRadius: 10,
              padding: '10px 16px',
              minWidth: 100,
              textAlign: 'center',
            }}>
              <div style=${{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>${s.value}</div>
              <div style=${{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3, whiteSpace: 'nowrap' }}>${s.label}</div>
            </div>
          `)}
        </div>
      </div>

      <!-- Main layout: left (main) + right (sidebar) -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 16, alignItems: 'start' }}>

        <!-- LEFT COLUMN -->
        <div style=${{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Mi Semana -->
          <div style=${card}>
            <div style=${secTitle}>
              <span>Mi semana</span>
              <span style=${{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                ${myDoneTasks.length}/${allMyTasks.length} completadas
              </span>
            </div>

            <!-- Hours progress -->
            <div style=${{ marginBottom: myPendingTasks.length > 0 ? 16 : 0 }}>
              <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style=${{ fontSize: 12, color: '#6B7280' }}>Horas cargadas</span>
                <span style=${{ fontSize: 13, fontWeight: 700, color: hoursTextColor, fontFamily: 'JetBrains Mono, monospace' }}>
                  ${estimatedHours}/${hoursTarget}h
                </span>
              </div>
              <div style=${{ height: 7, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                <div style=${{ height: '100%', width: `${hoursPct}%`, background: hoursColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            ${myPendingTasks.length === 0 && html`
              <div style=${{ padding: '20px 0 4px', color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <${CheckCircle2} size=${18} strokeWidth=${1.5} color="#00BC7D" />
                <span style=${{ color: '#111827', fontWeight: 500 }}>Todo al día</span>
                <span style=${{ color: '#9CA3AF' }}>— sin tareas pendientes para esta semana.</span>
              </div>
            `}

            <div style=${{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              ${myPendingTasks.slice(0, 5).map(task => {
                const s = TASK_STYLE[task.status] || TASK_STYLE.pending;
                const overdue = task.due < TODAY;
                return html`
                  <div key=${task.id} style=${{ padding: '11px 12px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style=${{ fontSize: 13, fontWeight: 500, color: '#111827', flex: 1 }}>${task.title}</div>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style=${{ fontSize: 11, background: s.bg, color: s.color, borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>${s.label}</span>
                      <span style=${{ fontSize: 11, color: overdue ? '#FF6467' : '#9CA3AF', fontWeight: overdue ? 600 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                        ${overdue && html`<${AlertTriangle} size=${10} strokeWidth=${1.5} />`}
                        ${task.due.slice(5).replace('-', '/')}
                      </span>
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>

          <!-- Proyectos activos -->
          <div style=${card}>
            <div style=${secTitle}>
              <span>${isTeam ? 'Mis proyectos' : 'Proyectos activos'}</span>
              <button onClick=${() => navigate('/proyectos')}
                style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0046F3', fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif' }}>
                Ver todos →
              </button>
            </div>
            ${(isTeam ? myProjects : sortedProjects).length === 0 && html`
              <div style=${{ color: '#9CA3AF', fontSize: 13, padding: '12px 0' }}>Sin proyectos activos.</div>
            `}
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              ${(isTeam ? myProjects : sortedProjects).map((p, i) => {
                const list = isTeam ? myProjects : sortedProjects;
                const client = getClient(p.client);
                const burnPct = p.planned_hours > 0 ? Math.round(p.actual_hours / p.planned_hours * 100) : 0;
                const burnColor = burnPct >= 90 ? '#FF6467' : burnPct >= 70 ? '#FF8041' : '#00BC7D';
                const deadline = p.deadline ? p.deadline.slice(5).replace('-', '/') : '—';
                return html`
                  <div key=${p.id}
                    role="button" tabIndex=${0}
                    onClick=${() => navigate('/proyectos/' + p.id)}
                    onKeyDown=${e => (e.key === 'Enter' || e.key === ' ') && navigate('/proyectos/' + p.id)}
                    style=${{ padding: '13px 0', borderBottom: i < list.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 180px 60px 60px', gap: 16, alignItems: 'center' }}
                    onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style=${{ fontSize: 13.5, fontWeight: 500, color: '#111827' }}>${p.title}</div>
                      <div style=${{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>${client.name || '—'}</div>
                    </div>
                    <${BurnBar} planned=${p.planned_hours} actual=${p.actual_hours} height=${6} />
                    <div style=${{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: burnColor, fontFamily: 'JetBrains Mono, monospace' }}>${burnPct}%</div>
                    <div style=${{ textAlign: 'right', fontSize: 11, color: '#9CA3AF' }}>${deadline}</div>
                  </div>
                `;
              })}
            </div>
          </div>

          <!-- Aprobaciones pendientes (power_user+, only when there are some) -->
          ${!isTeam && totalPending > 0 && html`
            <div style=${{ ...card, borderLeft: '3px solid #FF8041', paddingLeft: 21 }}>
              <div style=${secTitle}>
                <span style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <${AlertTriangle} size=${15} strokeWidth=${2} color="#FF8041" />
                  Aprobaciones pendientes
                </span>
                <button onClick=${() => navigate('/timesheets/pendientes')}
                  style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#FF8041', fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif' }}>
                  Revisar →
                </button>
              </div>
              <div style=${{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                ${pendingTimesheets > 0 && html`
                  <div style=${{ display: 'flex', align: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                    <span style=${{ fontWeight: 700, color: '#FF8041', fontFamily: 'JetBrains Mono, monospace' }}>${pendingTimesheets}</span> timesheets
                  </div>
                `}
                ${pendingExpenses > 0 && html`
                  <div style=${{ display: 'flex', align: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                    <span style=${{ fontWeight: 700, color: '#FF8041', fontFamily: 'JetBrains Mono, monospace' }}>${pendingExpenses}</span> gastos
                  </div>
                `}
                ${pendingLeaves > 0 && html`
                  <div style=${{ display: 'flex', align: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                    <span style=${{ fontWeight: 700, color: '#FF8041', fontFamily: 'JetBrains Mono, monospace' }}>${pendingLeaves}</span> licencias
                  </div>
                `}
              </div>
            </div>
          `}

        </div>

        <!-- RIGHT COLUMN -->
        <div style=${{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Accesos rápidos -->
          <div style=${card}>
            <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Accesos rápidos</div>
            <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              ${shortcuts.map(({ label, path, Icon, bg, color }) => html`
                <button key=${path} onClick=${() => navigate(path)}
                  style=${{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '16px 8px', borderRadius: 10, border: '1px solid #E5E7EB',
                    background: bg, cursor: 'pointer', fontFamily: 'Host Grotesk, sans-serif',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseEnter=${e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                  onMouseLeave=${e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <${Icon} size=${22} strokeWidth=${1.75} color=${color} />
                  <span style=${{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.3 }}>${label}</span>
                </button>
              `)}
            </div>
          </div>

          <!-- Actividad reciente -->
          <div style=${card}>
            <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Actividad reciente</div>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              ${activityFeed.slice(0, 5).map((item, i) => {
                const u = getUser(item.user);
                return html`
                  <div key=${item.id} style=${{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style=${{ width: 28, height: 28, borderRadius: '50%', background: u.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      ${initials(u.name || '?')}
                    </div>
                    <div style=${{ flex: 1, minWidth: 0 }}>
                      <div style=${{ fontSize: 12.5, color: '#111827', lineHeight: 1.4 }}>
                        <strong style=${{ fontWeight: 600 }}>${u.name}</strong>
                        ${' '}<span style=${{ color: '#6B7280' }}>${item.action}</span>
                        ${' '}<span style=${{ fontWeight: 500 }}>${item.subject}</span>
                      </div>
                      <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>${formatTimeAgo(item.time)}</div>
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>

          <!-- Licencias próximas (power_user+) -->
          ${!isTeam && html`
            <div style=${card}>
              <div style=${secTitle}>
                <span>Licencias próximas</span>
                <button onClick=${() => navigate('/licencias/equipo')}
                  style=${{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0046F3', fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif' }}>
                  Ver equipo →
                </button>
              </div>
              ${upcomingLeaves.length === 0 && html`
                <div style=${{ color: '#9CA3AF', fontSize: 13, padding: '8px 0' }}>Sin licencias próximas.</div>
              `}
              <div style=${{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                ${upcomingLeaves.map(req => {
                  const u = getUser(req.user);
                  const color = LEAVE_COLORS[req.type] || '#6B7280';
                  const label = LEAVE_LABELS[req.type] || req.type;
                  const dateStr = req.start === req.end
                    ? req.start.slice(5).replace('-', '/')
                    : req.start.slice(5).replace('-', '/') + ' – ' + req.end.slice(5).replace('-', '/');
                  return html`
                    <div key=${req.id} style=${{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <div style=${{ width: 3, height: 32, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <div style=${{ width: 26, height: 26, borderRadius: '50%', background: u.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        ${initials(u.name || '?')}
                      </div>
                      <div style=${{ flex: 1, minWidth: 0 }}>
                        <div style=${{ fontSize: 12.5, fontWeight: 500, color: '#111827' }}>${u.name}</div>
                        <div style=${{ fontSize: 11, color: '#6B7280' }}>${label}</div>
                      </div>
                      <div style=${{ fontSize: 11, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>${dateStr}</div>
                    </div>
                  `;
                })}
              </div>
            </div>
          `}

        </div>
      </div>
    </div>
  `;
}
