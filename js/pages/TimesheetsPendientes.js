import { html } from '../lib/html.js';
import { useNavigate } from 'react-router-dom';
import { useAppState, useDispatch, useToast } from '../context.js';
import PageHeader from '../components/ui/PageHeader.js';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function weekDates(weekStr) {
  const wk = parseInt(weekStr.split('-W')[1]);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date('2026-04-14T12:00:00Z');
    d.setDate(d.getDate() + (wk - 16) * 7 + i);
    return d.toISOString().split('T')[0];
  });
}

function weekLabel(weekStr) {
  const dates = weekDates(weekStr);
  const fmt = s => { const [,m,d] = s.split('-'); return `${d}/${m}`; };
  return `Sem ${weekStr.split('-W')[1]}  ${fmt(dates[0])}–${fmt(dates[4])}`;
}

export default function TimesheetsPendientes() {
  const navigate = useNavigate();
  const { timesheetWeeks, timesheetEntries, users, projects, jobs } = useAppState();
  const dispatch = useDispatch();
  const toast = useToast();

  const pending = timesheetWeeks.filter(w => w.status === 'pending');

  function getUser(id) { return users.find(u => u.id === id) || {}; }

  function weekTotal(userId, weekStr) {
    const dates = weekDates(weekStr);
    return timesheetEntries
      .filter(e => e.user === userId && dates.includes(e.date))
      .reduce((s, e) => s + (e.hours || 0), 0);
  }

  function weekProjects(userId, weekStr) {
    const dates = weekDates(weekStr);
    const entries = timesheetEntries.filter(e => e.user === userId && dates.includes(e.date));
    const pIds = [...new Set(entries.map(e => e.project))];
    return pIds.map(id => projects.find(p => p.id === id)?.title).filter(Boolean).join(', ');
  }

  function handleApprove(userId, week) {
    dispatch({ type: 'APPROVE_TIMESHEET_WEEK', userId, week });
    toast('Timesheet aprobado');
  }

  const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <${PageHeader}
        title="Timesheets Pendientes"
        subtitle="Aprobación de horas del equipo"
        actions=${html`
          <button onClick=${() => navigate('/timesheets')}
            style=${{ background: '#F5F5FA', border: '1px solid #E2E2EC', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#6B6B80', fontFamily: 'DM Sans, sans-serif' }}>
            ← Mi timesheet
          </button>
        `}
      />

      ${pending.length === 0 && html`
        <div style=${{ background: '#fff', borderRadius: 10, border: '1px solid #E2E2EC', padding: '64px 24px', textAlign: 'center' }}>
          <div style=${{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <div style=${{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', marginBottom: 6 }}>Todo aprobado</div>
          <div style=${{ fontSize: 14, color: '#6B6B80' }}>No hay timesheets pendientes de revisión.</div>
        </div>
      `}

      ${pending.length > 0 && html`
        <div style=${{ background: '#fff', borderRadius: 10, border: '1px solid #E2E2EC', overflow: 'hidden' }}>
          <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style=${{ background: '#F5F5FA', borderBottom: '2px solid #E2E2EC' }}>
                <th style=${{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Persona</th>
                <th style=${{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semana</th>
                <th style=${{ padding: '11px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total hs</th>
                <th style=${{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Proyectos</th>
                <th style=${{ padding: '11px 20px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${pending.map((w, i) => {
                const u = getUser(w.user);
                const total = weekTotal(w.user, w.week);
                const projs = weekProjects(w.user, w.week);
                return html`
                  <tr key=${w.user + w.week}
                    style=${{ borderBottom: i < pending.length - 1 ? '1px solid #F0F0F5' : 'none' }}
                    onMouseEnter=${e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                    <td style=${{ padding: '14px 20px' }}>
                      <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style=${{ width: 34, height: 34, borderRadius: '50%', background: u.avatar_color || '#2A2AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                          ${initials(u.name || '?')}
                        </div>
                        <div>
                          <div style=${{ fontSize: 14, fontWeight: 500, color: '#0A0A0A' }}>${u.name}</div>
                          <div style=${{ fontSize: 12, color: '#6B6B80' }}>${u.typology}</div>
                        </div>
                      </div>
                    </td>
                    <td style=${{ padding: '14px 12px', fontSize: 13, color: '#4B4B60', fontFamily: 'DM Mono, monospace' }}>
                      ${weekLabel(w.week)}
                    </td>
                    <td style=${{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style=${{ fontSize: 15, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: total > 40 ? '#FF6B2B' : total > 0 ? '#0A0A0A' : '#C0C0CC' }}>
                        ${total > 0 ? total + 'h' : '—'}
                      </span>
                    </td>
                    <td style=${{ padding: '14px 12px', fontSize: 13, color: '#6B6B80', maxWidth: 260 }}>
                      <span style=${{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        ${projs || '—'}
                      </span>
                    </td>
                    <td style=${{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style=${{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick=${() => navigate('/timesheets')}
                          style=${{ background: '#F5F5FA', border: '1px solid #E2E2EC', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#4B4B60', fontFamily: 'DM Sans, sans-serif' }}
                          onMouseEnter=${e => e.currentTarget.style.background = '#EBEBF5'}
                          onMouseLeave=${e => e.currentTarget.style.background = '#F5F5FA'}>
                          Ver detalle
                        </button>
                        <button
                          onClick=${() => handleApprove(w.user, w.week)}
                          style=${{ background: '#2A2AFF', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                          onMouseEnter=${e => e.currentTarget.style.background = '#1a1aee'}
                          onMouseLeave=${e => e.currentTarget.style.background = '#2A2AFF'}>
                          Aprobar ✓
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}
