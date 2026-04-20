import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import PageHeader from '../components/ui/PageHeader.js';
import { ChevronLeft, ChevronRight, Hourglass, SquareKanban } from 'lucide-react';
import { TODAY } from '../lib/utils.js';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function weekDates(offset) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date('2026-04-14T12:00:00Z');
    d.setDate(d.getDate() + offset * 7 + i);
    return d.toISOString().split('T')[0];
  });
}

function weekLabel(offset) {
  const dates = weekDates(offset);
  const fmt = s => { const [,m,d] = s.split('-'); return `${d}/${m}`; };
  return `Semana ${16 + offset}  ·  ${fmt(dates[0])} – ${fmt(dates[4])}`;
}

function weekKey(offset) {
  return `2026-W${String(16 + offset).padStart(2, '0')}`;
}

const STATUS_MAP = {
  draft:    { label: 'Borrador',    bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
  pending:  { label: 'En revisión', bg: '#FEF3C6', color: '#FF8041', border: '#FDE68A' },
  approved: { label: 'Aprobado',    bg: '#D0FAE5', color: '#009966', border: '#6EE7B7' },
};

const inputBase = {
  width: 52, height: 34, border: '1px solid #E5E7EB', borderRadius: 8,
  textAlign: 'center', fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
  outline: 'none', color: '#111827', display: 'block', margin: '0 auto',
};

export default function Timesheets() {
  const navigate = useNavigate();
  const { currentUser, projects, jobs, timesheetEntries, timesheetWeeks } = useAppState();
  const dispatch = useDispatch();
  const toast = useToast();
  const [weekOffset, setWeekOffset] = useState(0);

  const dates = weekDates(weekOffset);
  const wk = weekKey(weekOffset);
  const weekRecord = timesheetWeeks.find(w => w.user === currentUser.id && w.week === wk);
  const status = weekRecord?.status || 'draft';
  const isEditable = status === 'draft';

  const myProjects = projects.filter(p => p.team?.includes(currentUser.id));
  const myJobs = jobs.filter(j => myProjects.some(p => p.id === j.project));

  function getHours(projectId, jobId, date) {
    const e = timesheetEntries.find(e =>
      e.user === currentUser.id && e.project === projectId && e.job === jobId && e.date === date
    );
    return e?.hours ?? '';
  }

  function handleChange(projectId, jobId, date, val) {
    const hours = parseFloat(val);
    if (val === '' || isNaN(hours) || hours < 0) return;
    dispatch({ type: 'UPSERT_TIMESHEET_ENTRY', entry: { user: currentUser.id, project: projectId, job: jobId, date, hours } });
  }

  function rowTotal(projectId, jobId) {
    return dates.reduce((s, d) => s + (parseFloat(getHours(projectId, jobId, d)) || 0), 0);
  }

  function dayTotal(date) {
    return myJobs.reduce((s, j) => s + (parseFloat(getHours(j.project, j.id, date)) || 0), 0);
  }

  const weekTotal = dates.reduce((s, d) => s + dayTotal(d), 0);

  function handleSubmit() {
    dispatch({ type: 'SUBMIT_TIMESHEET_WEEK', userId: currentUser.id, week: wk });
    toast('Timesheet enviado para aprobación');
  }

  // Copy previous week's entries
  function handleCopyPrevWeek() {
    const prevDates = weekDates(weekOffset - 1);
    let copied = 0;
    myProjects.forEach(project => {
      myJobs.filter(j => j.project === project.id).forEach(job => {
        prevDates.forEach((prevDate, i) => {
          const prevHours = getHours(project.id, job.id, prevDate);
          if (prevHours !== '' && parseFloat(prevHours) > 0) {
            dispatch({ type: 'UPSERT_TIMESHEET_ENTRY', entry: { user: currentUser.id, project: project.id, job: job.id, date: dates[i], hours: parseFloat(prevHours) } });
            copied++;
          }
        });
      });
    });
    if (copied > 0) toast(`${copied} entradas copiadas de la semana anterior`);
    else toast('La semana anterior no tiene horas registradas');
  }

  const st = STATUS_MAP[status] || STATUS_MAP.draft;
  const pendingCount = timesheetWeeks.filter(w => w.status === 'pending').length;
  const isApprover = currentUser.role === 'Director' || currentUser.role === 'Finance';

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <${PageHeader}
        title="Timesheets"
        subtitle="Registro de horas semanales"
        actions=${html`
          ${isApprover && pendingCount > 0 && html`
            <button onClick=${() => navigate('/timesheets/pendientes')}
              style=${{ background: '#FEF3C6', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#FF8041', fontFamily: 'Host Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <${Hourglass} size=${14} strokeWidth=${1.33} />
              ${pendingCount} pendiente${pendingCount > 1 ? 's' : ''} de aprobación
            </button>
          `}
        `}
      />

      <!-- Week Navigator -->
      <div style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick=${() => setWeekOffset(weekOffset - 1)}
            style=${{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave=${e => e.currentTarget.style.background = '#fff'}>
            <${ChevronLeft} size=${16} strokeWidth=${1.33} />
          </button>
          <span style=${{ fontSize: 14, fontWeight: 600, color: '#111827', minWidth: 280, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>${weekLabel(weekOffset)}</span>
          <button onClick=${() => setWeekOffset(weekOffset + 1)}
            style=${{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave=${e => e.currentTarget.style.background = '#fff'}>
            <${ChevronRight} size=${16} strokeWidth=${1.33} />
          </button>
        </div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 12 }}>
          ${isEditable && html`
            <button onClick=${handleCopyPrevWeek}
              style=${{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#6B7280', fontFamily: 'Host Grotesk, sans-serif' }}
              onMouseEnter=${e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827'; }}
              onMouseLeave=${e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#6B7280'; }}>
              Copiar semana anterior
            </button>
          `}
          <span style=${{ fontSize: 12, background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 9999, padding: '4px 14px', fontWeight: 600 }}>
            ${st.label}
          </span>
          ${isEditable && weekTotal > 0 && html`
            <button onClick=${handleSubmit}
              style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Host Grotesk, sans-serif', whiteSpace: 'nowrap' }}
              onMouseEnter=${e => e.currentTarget.style.background = '#011BB8'}
              onMouseLeave=${e => e.currentTarget.style.background = '#0046F3'}>
              Enviar para aprobación
            </button>
          `}
        </div>
      </div>

      <!-- Grid -->
      <div style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'auto' }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
              <th style=${{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 220 }}>Proyecto / Job</th>
              ${dates.map((date, i) => {
                const isToday = date === TODAY;
                return html`
                  <th key=${date} style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: isToday ? '#0046F3' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', width: 80, background: isToday ? '#E0E6F6' : 'transparent' }}>
                    ${DAY_LABELS[i]}<br/>
                    <span style=${{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 }}>${date.slice(8)}</span>
                  </th>
                `;
              })}
              <th style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', width: 72 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            ${myProjects.map(project => {
              const pJobs = myJobs.filter(j => j.project === project.id);
              if (!pJobs.length) return null;
              return html`
                <tr key=${'ph-' + project.id} style=${{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                  <td colspan=${7} style=${{ padding: '7px 20px', fontSize: 12, fontWeight: 700, color: '#0046F3' }}>${project.title}</td>
                </tr>
                ${pJobs.map(job => {
                  const rt = rowTotal(project.id, job.id);
                  return html`
                    <tr key=${job.id} style=${{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                      onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                      <td style=${{ padding: '7px 20px 7px 32px', fontSize: 13, color: '#4B5563' }}>${job.title}</td>
                      ${dates.map(date => {
                        const val = getHours(project.id, job.id, date);
                        const isToday = date === TODAY;
                        return html`
                          <td key=${date} style=${{ padding: '5px 8px', textAlign: 'center', background: isToday ? '#E0E6F6' : 'transparent' }}>
                            <input
                              type="number" min="0" max="24" step="0.5"
                              value=${val}
                              disabled=${!isEditable}
                              placeholder="—"
                              onChange=${e => handleChange(project.id, job.id, date, e.target.value)}
                              style=${{ ...inputBase, background: isEditable ? '#fff' : '#F9FAFB', cursor: isEditable ? 'text' : 'default' }}
                              onFocus=${e => { e.currentTarget.style.borderColor = '#0046F3'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,70,243,0.15)'; }}
                              onBlur=${e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                          </td>
                        `;
                      })}
                      <td style=${{ padding: '7px 8px', textAlign: 'center', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: rt > 0 ? '#111827' : '#D1D5DB' }}>
                        ${rt > 0 ? rt + 'h' : '—'}
                      </td>
                    </tr>
                  `;
                })}
              `;
            })}

            <!-- Daily totals row -->
            <tr style=${{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
              <td style=${{ padding: '10px 20px', fontSize: 12, fontWeight: 700, color: '#111827' }}>Total diario</td>
              ${dates.map(date => {
                const dt = dayTotal(date);
                return html`
                  <td key=${date} style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: dt > 8 ? '#FF8041' : dt > 0 ? '#111827' : '#D1D5DB' }}>
                    ${dt > 0 ? dt + 'h' : '—'}
                  </td>
                `;
              })}
              <td style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 15, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: weekTotal > 0 ? '#0046F3' : '#D1D5DB' }}>
                ${weekTotal > 0 ? weekTotal + 'h' : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        ${myProjects.length === 0 && html`
          <div style=${{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <${SquareKanban} size=${44} strokeWidth=${1.33} color="#D1D5DB" />
            <div style=${{ fontSize: 16, fontWeight: 600, color: '#111827' }}>No estás asignado a proyectos activos</div>
            <div style=${{ fontSize: 14, color: '#6B7280', maxWidth: 360 }}>Hablá con tu director de cuentas para sumarte a un equipo.</div>
          </div>
        `}
      </div>
    </div>
  `;
}
