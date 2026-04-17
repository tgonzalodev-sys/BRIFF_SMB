import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import BurnBar from '../components/ui/BurnBar.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { formatARS, formatDate, initials } from '../lib/utils.js';

const TYPE_INFO = {
  campaña:  { label: 'Campaña',  color: '#7C3AED', bg: '#F5F3FF' },
  digital:  { label: 'Digital',  color: '#0891B2', bg: '#ECFEFF' },
  branding: { label: 'Branding', color: '#D97706', bg: '#FFFBEB' },
  retainer: { label: 'Retainer', color: '#059669', bg: '#F0FDF4' },
};

const JOB_STATUS_INFO = {
  done:        { label: 'Completado',  color: '#009966', bg: '#F0FDF4' },
  in_progress: { label: 'En Progreso', color: '#0046F3', bg: '#EEF4FF' },
  pending:     { label: 'Pendiente',   color: '#6B7280', bg: '#F3F4F6' },
};

const TASK_STATUS_INFO = {
  done:        { label: 'Completada',  color: '#009966' },
  in_progress: { label: 'En Progreso', color: '#0046F3' },
  pending:     { label: 'Pendiente',   color: '#9CA3AF' },
};

export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, clients, users, jobs, tasks } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [closedJobs, setClosedJobs] = useState(new Set());

  const project = projects.find(p => p.id === id);
  if (!project) return html`
    <div style=${{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
      <div style=${{ fontSize: 28, marginBottom: 8 }}>◻</div>
      <div>Proyecto no encontrado.</div>
      <button onClick=${() => navigate('/proyectos')} style=${{ marginTop: 16, background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Volver</button>
    </div>
  `;

  const client     = clients.find(c => c.id === project.client);
  const team       = (project.team || []).map(uid => users.find(u => u.id === uid)).filter(Boolean);
  const projectJobs = jobs.filter(j => j.project === id);
  const typeInfo   = TYPE_INFO[project.type] || { label: project.type, color: '#6B7280', bg: '#F3F4F6' };

  const isOpen     = jid => !closedJobs.has(jid);
  const toggleJob  = jid => setClosedJobs(prev => { const s = new Set(prev); s.has(jid) ? s.delete(jid) : s.add(jid); return s; });

  const doneJobs   = projectJobs.filter(j => j.status === 'done').length;
  const totalTasks = tasks.filter(t => projectJobs.some(j => j.id === t.job)).length;
  const doneTasks  = tasks.filter(t => projectJobs.some(j => j.id === t.job) && t.status === 'done').length;

  function toggleTask(tid) {
    dispatch({ type: 'TOGGLE_TASK', id: tid });
  }

  return html`
    <div>
      <!-- Back + header -->
      <div style=${{ marginBottom: 20 }}>
        <button onClick=${() => navigate('/proyectos')} style=${{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12, fontFamily: 'inherit' }}>← Volver a Proyectos</button>
        <div style=${{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style=${{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style=${{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${project.title}</h1>
              <${StatusBadge} status=${project.status} variant="project" size="md" />
              <span style=${{ fontSize: 12, fontWeight: 600, color: typeInfo.color, background: typeInfo.bg, padding: '3px 10px', borderRadius: 99 }}>${typeInfo.label}</span>
            </div>
            <p style=${{ margin: 0, fontSize: 13, color: '#6B7280' }}>${client?.name || '—'} · ${formatDate(project.start)} – ${formatDate(project.end)}</p>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Main: Jobs + Tasks -->
        <div style=${{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Progress summary -->
          <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            ${[
              { label: 'Jobs Completados', value: doneJobs + ' / ' + projectJobs.length, color: '#009966' },
              { label: 'Tareas Completadas', value: doneTasks + ' / ' + totalTasks, color: '#0046F3' },
              { label: 'Burn de Horas', value: project.actual_hours + 'h / ' + project.planned_hours + 'h', color: project.actual_hours > project.planned_hours ? '#FF6467' : '#111827' },
            ].map(k => html`
              <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '14px 18px' }}>
                <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>${k.label}</div>
                <div style=${{ fontSize: 18, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
              </div>
            `)}
          </div>

          <!-- Burn bar card -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Presupuesto de Horas</div>
            <${BurnBar} planned=${project.planned_hours} actual=${project.actual_hours} height=${8} />
          </div>

          <!-- Jobs accordion -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Jobs & Tareas</h2>
              <span style=${{ fontSize: 12, color: '#9CA3AF' }}>${projectJobs.length} jobs · ${totalTasks} tareas</span>
            </div>

            ${projectJobs.length === 0 ? html`
              <div style=${{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Sin jobs registrados.</div>
            ` : projectJobs.map((job, ji) => {
              const jobTasks  = tasks.filter(t => t.job === job.id);
              const doneCount = jobTasks.filter(t => t.status === 'done').length;
              const owner     = users.find(u => u.id === job.owner);
              const jInfo     = JOB_STATUS_INFO[job.status] || JOB_STATUS_INFO.pending;
              const open      = isOpen(job.id);

              return html`
                <div key=${job.id} style=${{ borderBottom: ji < projectJobs.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                  <!-- Job row -->
                  <div
                    onClick=${() => toggleJob(job.id)}
                    style=${{ display: 'flex', alignItems: 'center', padding: '13px 20px', cursor: 'pointer', background: open ? '#FAFBFF' : '#fff', transition: 'background 0.12s', userSelect: 'none' }}
                  >
                    <span style=${{ fontSize: 11, marginRight: 10, color: '#6B7280', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▶</span>
                    <div style=${{ flex: 1 }}>
                      <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${job.title}</div>
                      <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>${doneCount}/${jobTasks.length} tareas · ${job.planned_hours}h planif.</div>
                    </div>
                    ${owner && html`
                      <div title=${owner.name} style=${{ width: 24, height: 24, borderRadius: '50%', background: owner.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', marginRight: 12 }}>
                        ${initials(owner.name)}
                      </div>
                    `}
                    <span style=${{ fontSize: 11, fontWeight: 600, color: jInfo.color, background: jInfo.bg, padding: '2px 8px', borderRadius: 99 }}>${jInfo.label}</span>
                  </div>

                  ${open && html`
                    <div style=${{ background: '#FAFBFF', borderTop: '1px solid #F3F4F6' }}>
                      ${jobTasks.length === 0 ? html`
                        <div style=${{ padding: '12px 20px 12px 52px', fontSize: 12, color: '#9CA3AF' }}>Sin tareas asignadas.</div>
                      ` : jobTasks.map((task, ti) => {
                        const assignee = users.find(u => u.id === task.assigned);
                        const tInfo    = TASK_STATUS_INFO[task.status] || TASK_STATUS_INFO.pending;
                        return html`
                          <div
                            key=${task.id}
                            style=${{ display: 'flex', alignItems: 'center', padding: '9px 20px 9px 52px', borderTop: ti > 0 ? '1px solid #F3F4F6' : 'none', gap: 10 }}
                          >
                            <!-- Checkbox -->
                            <div
                              onClick=${e => { e.stopPropagation(); toggleTask(task.id); }}
                              style=${{ width: 16, height: 16, borderRadius: 4, border: '2px solid ' + tInfo.color, background: task.status === 'done' ? tInfo.color : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ${task.status === 'done' && html`<span style=${{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>`}
                            </div>
                            <!-- Task title -->
                            <div style=${{ flex: 1, fontSize: 12, color: task.status === 'done' ? '#9CA3AF' : '#374151', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>${task.title}</div>
                            <!-- Meta -->
                            ${assignee && html`
                              <div title=${assignee.name} style=${{ width: 20, height: 20, borderRadius: '50%', background: assignee.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                ${initials(assignee.name)}
                              </div>
                            `}
                            <span style=${{ fontSize: 11, color: '#9CA3AF', minWidth: 40, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>${task.est_hours}h</span>
                            <span style=${{ fontSize: 11, color: '#9CA3AF', minWidth: 70, textAlign: 'right' }}>${formatDate(task.due)}</span>
                          </div>
                        `;
                      })}
                    </div>
                  `}
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Sidebar -->
        <div style=${{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <!-- Project info -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Información</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              ${[
                { label: 'Cliente',      value: client?.name || '—' },
                { label: 'Tipo',         value: typeInfo.label },
                { label: 'Inicio',       value: formatDate(project.start) },
                { label: 'Fin estimado', value: formatDate(project.end) },
                { label: 'Presupuesto',  value: formatARS(project.budget_ars) },
              ].map(item => html`
                <div key=${item.label} style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
                  <span style=${{ color: '#9CA3AF' }}>${item.label}</span>
                  <span style=${{ fontWeight: 600, color: '#374151', textAlign: 'right' }}>${item.value}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Team -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Equipo (${team.length})</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              ${team.map(u => html`
                <div key=${u.id} style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style=${{ width: 28, height: 28, borderRadius: '50%', background: u.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    ${initials(u.name)}
                  </div>
                  <div>
                    <div style=${{ fontSize: 12, fontWeight: 600, color: '#111827' }}>${u.name}</div>
                    <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${u.typology}</div>
                  </div>
                </div>
              `)}
            </div>
          </div>

          <!-- Task completion -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Progreso General</h3>
            <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
              <span>Tareas completadas</span>
              <span style=${{ fontWeight: 700, color: '#111827' }}>${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
            </div>
            <div style=${{ height: 8, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden', marginBottom: 8 }}>
              <div style=${{ height: '100%', width: (totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0) + '%', background: '#0046F3', borderRadius: 99, transition: 'width 0.4s' }} />
            </div>
            <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${doneTasks} de ${totalTasks} tareas completadas</div>
          </div>

        </div>
      </div>
    </div>
  `;
}
