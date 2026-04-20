import { useState } from 'react';
import { html } from '../lib/html.js';
import { useNavigate } from 'react-router-dom';
import { useAppState, useDispatch, useToast } from '../context.js';
import PageHeader from '../components/ui/PageHeader.js';
import FilterBar from '../components/ui/FilterBar.js';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

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

  const [search, setSearch] = useState('');
  const allPending = timesheetWeeks.filter(w => w.status === 'pending');
  const pending = allPending.filter(w => {
    if (!search) return true;
    const u = users.find(u => u.id === w.user);
    return (u?.name || '').toLowerCase().includes(search.toLowerCase());
  });

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
            style=${{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#6B7280', fontFamily: 'Host Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <${ArrowLeft} size=${14} strokeWidth=${1.33} /> Mi timesheet
          </button>
        `}
      />

      <${FilterBar}
        search=${search} onSearch=${setSearch}
        placeholder="Buscar por nombre…"
        count=${pending.length}
      />

      ${pending.length === 0 && html`
        <div style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <${CheckCircle2} size=${44} strokeWidth=${1.33} color="#00BC7D" />
          <div style=${{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Todo aprobado</div>
          <div style=${{ fontSize: 14, color: '#6B7280' }}>No hay timesheets pendientes de revisión.</div>
        </div>
      `}

      ${pending.length > 0 && html`
        <div style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style=${{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style=${{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Persona</th>
                <th style=${{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semana</th>
                <th style=${{ padding: '11px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total hs</th>
                <th style=${{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Proyectos</th>
                <th style=${{ padding: '11px 20px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${pending.map((w, i) => {
                const u = getUser(w.user);
                const total = weekTotal(w.user, w.week);
                const projs = weekProjects(w.user, w.week);
                return html`
                  <tr key=${w.user + w.week}
                    style=${{ borderBottom: i < pending.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter=${e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}>
                    <td style=${{ padding: '14px 20px' }}>
                      <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style=${{ width: 34, height: 34, borderRadius: '50%', background: u.avatar_color || '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                          ${initials(u.name || '?')}
                        </div>
                        <div>
                          <div style=${{ fontSize: 14, fontWeight: 500, color: '#111827' }}>${u.name}</div>
                          <div style=${{ fontSize: 12, color: '#6B7280' }}>${u.typology}</div>
                        </div>
                      </div>
                    </td>
                    <td style=${{ padding: '14px 12px', fontSize: 13, color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${weekLabel(w.week)}
                    </td>
                    <td style=${{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style=${{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: total > 40 ? '#FF8041' : total > 0 ? '#111827' : '#D1D5DB' }}>
                        ${total > 0 ? total + 'h' : '—'}
                      </span>
                    </td>
                    <td style=${{ padding: '14px 12px', fontSize: 13, color: '#6B7280', maxWidth: 260 }}>
                      <span style=${{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        ${projs || '—'}
                      </span>
                    </td>
                    <td style=${{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style=${{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick=${() => navigate('/timesheets')}
                          style=${{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#4B5563', fontFamily: 'Host Grotesk, sans-serif' }}
                          onMouseEnter=${e => e.currentTarget.style.background = '#EBEBF5'}
                          onMouseLeave=${e => e.currentTarget.style.background = '#F9FAFB'}>
                          Ver detalle
                        </button>
                        <button
                          onClick=${() => handleApprove(w.user, w.week)}
                          style=${{ background: '#0046F3', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Host Grotesk, sans-serif' }}
                          onMouseEnter=${e => e.currentTarget.style.background = '#011BB8'}
                          onMouseLeave=${e => e.currentTarget.style.background = '#0046F3'}>
                          Aprobar
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
