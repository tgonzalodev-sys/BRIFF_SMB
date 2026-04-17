import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import PageHeader from '../components/ui/PageHeader.js';

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
  draft:    { label: 'Borrador',    bg: '#F5F5FA', color: '#6B6B80', border: '#E2E2EC' },
  pending:  { label: 'En revisión', bg: '#FFF7ED', color: '#D97706', border: '#FDE68A' },
  approved: { label: 'Aprobado ✓', bg: '#F0FDF4', color: '#059669', border: '#BBF7D0' },
};

const inputBase = {
  width: 52, height: 34, border: '1px solid #E2E2EC', borderRadius: 6,
  textAlign: 'center', fontSize: 13, fontFamily: 'DM Mono, monospace',
  outline: 'none', color: '#0A0A0A', display: 'block', margin: '0 auto',
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
              style=${{ background: '#FFF7ED', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#D97706', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⏳ ${pendingCount} pendiente${pendingCount > 1 ? 's' : ''} de aprobación
            </button>
          `}
        `}
      />

      <!-- Week Navigator -->
      <div style=${{ background: '#fff', borderRadius: 10, border: '1px solid #E2E2EC', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick=${() => setWeekOffset(weekOffset - 1)}
            style=${{ width: 32, height: 32, borderRadius: 7, border: '1px solid #E2E2EC', background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter=${e => e.currentTarget.style.background = '#F5F5FA'}
            onMouseLeave=${e => e.currentTarget.style.background = '#fff'}>‹</button>
          <span style=${{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', minWidth: 280, textAlign: 'center', fontFamily: 'DM Mono, monospace' }}>${weekLabel(weekOffset)}</span>
          <button onClick=${() => setWeekOffset(weekOffset + 1)}
            style=${{ width: 32, height: 32, borderRadius: 7, border: '1px solid #E2E2EC', background: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter=${e => e.currentTarget.style.background = '#F5F5FA'}
            onMouseLeave=${e => e.currentTarget.style.background = '#fff'}>›</button>
        </div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style=${{ fontSize: 12, background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 20, padding: '4px 14px', fontWeight: 600 }}>
            ${st.label}
          </span>
          ${isEditable && weekTotal > 0 && html`
            <button onClick=${handleSubmit}
              style=${{ background: '#2A2AFF', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter=${e => e.currentTarget.style.background = '#1a1aee'}
              onMouseLeave=${e => e.currentTarget.style.background = '#2A2AFF'}>
              Enviar para aprobación
            </button>
          `}
        </div>
      </div>

      <!-- Grid -->
      <div style=${{ background: '#fff', borderRadius: 10, border: '1px solid #E2E2EC', overflow: 'auto' }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style=${{ background: '#F5F5FA', borderBottom: '2px solid #E2E2EC' }}>
              <th style=${{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 220 }}>Proyecto / Job</th>
              ${dates.map((date, i) => {
                const isToday = date === '2026-04-17';
                return html`
                  <th key=${date} style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: isToday ? '#2A2AFF' : '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em', width: 80, background: isToday ? '#F0F0FF' : 'transparent' }}>
                    ${DAY_LABELS[i]}<br/>
                    <span style=${{ fontFamily: 'DM Mono, monospace', fontWeight: 400 }}>${date.slice(8)}</span>
                  </th>
                `;
              })}
              <th style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em', width: 72 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            ${myProjects.map(project => {
              const pJobs = myJobs.filter(j => j.project === project.id);
              if (!pJobs.length) return null;
              return html`
                <tr key=${'ph-' + project.id} style=${{ background: '#FAFAFA', borderTop: '2px solid #E2E2EC' }}>
                  <td colspan=${7} style=${{ padding: '7px 20px', fontSize: 12, fontWeight: 700, color: '#2A2AFF' }}>${project.title}</td>
                </tr>
                ${pJobs.map(job => {
                  const rt = rowTotal(project.id, job.id);
                  return html`
                    <tr key=${job.id} style=${{ borderBottom: '1px solid #F0F0F5', transition: 'background 0.1s' }}
                      onMouseEnter=${e => e.currentTarget.style.background = '#FAFAFE'}
                      onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                      <td style=${{ padding: '7px 20px 7px 32px', fontSize: 13, color: '#4B4B60' }}>${job.title}</td>
                      ${dates.map(date => {
                        const val = getHours(project.id, job.id, date);
                        const isToday = date === '2026-04-17';
                        return html`
                          <td key=${date} style=${{ padding: '5px 8px', textAlign: 'center', background: isToday ? '#F8F8FF' : 'transparent' }}>
                            <input
                              type="number" min="0" max="24" step="0.5"
                              value=${val}
                              disabled=${!isEditable}
                              placeholder="—"
                              onChange=${e => handleChange(project.id, job.id, date, e.target.value)}
                              style=${{ ...inputBase, background: isEditable ? '#fff' : '#FAFAFA', cursor: isEditable ? 'text' : 'default' }}
                              onFocus=${e => { e.currentTarget.style.borderColor = '#2A2AFF'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(42,42,255,0.1)'; }}
                              onBlur=${e => { e.currentTarget.style.borderColor = '#E2E2EC'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                          </td>
                        `;
                      })}
                      <td style=${{ padding: '7px 8px', textAlign: 'center', fontSize: 13, fontFamily: 'DM Mono, monospace', fontWeight: 600, color: rt > 0 ? '#0A0A0A' : '#C0C0CC' }}>
                        ${rt > 0 ? rt + 'h' : '—'}
                      </td>
                    </tr>
                  `;
                })}
              `;
            })}

            <!-- Daily totals row -->
            <tr style=${{ background: '#F5F5FA', borderTop: '2px solid #E2E2EC' }}>
              <td style=${{ padding: '10px 20px', fontSize: 12, fontWeight: 700, color: '#0A0A0A' }}>Total diario</td>
              ${dates.map(date => {
                const dt = dayTotal(date);
                return html`
                  <td key=${date} style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 13, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: dt > 8 ? '#FF6B2B' : dt > 0 ? '#0A0A0A' : '#C0C0CC' }}>
                    ${dt > 0 ? dt + 'h' : '—'}
                  </td>
                `;
              })}
              <td style=${{ padding: '10px 8px', textAlign: 'center', fontSize: 15, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: weekTotal > 0 ? '#2A2AFF' : '#C0C0CC' }}>
                ${weekTotal > 0 ? weekTotal + 'h' : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        ${myProjects.length === 0 && html`
          <div style=${{ padding: '48px', textAlign: 'center', color: '#6B6B80', fontSize: 14 }}>
            No estás asignado a ningún proyecto activo.
          </div>
        `}
      </div>
    </div>
  `;
}
