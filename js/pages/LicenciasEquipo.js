import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { getMonthGrid, toISO, formatDate, formatDateShort, initials } from '../lib/utils.js';

const LEAVE_INFO = {
  vacation:     { label: 'Vacaciones',    color: '#0046F3', bg: '#EEF4FF' },
  sick:         { label: 'Enfermedad',    color: '#FF6467', bg: '#FFF0F0' },
  personal:     { label: 'Personal',      color: '#FD9A00', bg: '#FFF7ED' },
  compensatory: { label: 'Compensatorio', color: '#009966', bg: '#F0FDF4' },
};

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_NAMES   = ['L','M','X','J','V','S','D'];

function getDateRange(start, end) {
  const dates = [];
  const d = new Date(start + 'T12:00:00');
  const endD = new Date((end || start) + 'T12:00:00');
  while (d <= endD) { dates.push(toISO(d)); d.setDate(d.getDate() + 1); }
  return dates;
}

function getDaysInMonth(year, month) {
  const days = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= count; d++) days.push(new Date(year, month, d));
  return days;
}

export default function LicenciasEquipo() {
  const { users, leaveRequests, leaveBalances, currentUser } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [month, setMonth] = useState(3);
  const [year, setYear]   = useState(2026);
  const [tab, setTab]     = useState('calendar'); // 'calendar' | 'requests'

  const days = getDaysInMonth(year, month);

  // Build leaveDays map: userId → Set of ISO dates with leave info
  const userLeaveDays = {};
  leaveRequests.forEach(r => {
    if (!userLeaveDays[r.user]) userLeaveDays[r.user] = {};
    getDateRange(r.start, r.end).forEach(d => { userLeaveDays[r.user][d] = r; });
  });

  // Pending requests for approval
  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
  const canApprove = ['Director', 'Account Manager'].includes(currentUser.role);

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  function handleApprove(id, status) {
    dispatch({ type: 'UPDATE_LEAVE_STATUS', id, status });
    toast(status === 'approved' ? 'Licencia aprobada' : 'Licencia rechazada');
  }

  const tabBtn = (key, label) => html`
    <button
      onClick=${() => setTab(key)}
      style=${{
        padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        background: tab === key ? '#fff' : 'transparent',
        color: tab === key ? '#111827' : '#6B7280',
        boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >${label}${key === 'requests' && pendingRequests.length > 0 ? html` <span style=${{ background: '#FF6467', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 5px', marginLeft: 4 }}>${pendingRequests.length}</span>` : ''}</button>
  `;

  return html`
    <div>
      <${PageHeader}
        title="Licencias del Equipo"
        subtitle="Vista mensual de ausencias"
        actions=${html`
          <div style=${{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
            ${tabBtn('calendar', 'Calendario')}
            ${tabBtn('requests', 'Solicitudes')}
          </div>
        `}
      />

      ${tab === 'calendar' ? html`
        <!-- Team calendar -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <!-- Month nav -->
          <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick=${prevMonth} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>‹</button>
            <span style=${{ fontSize: 15, fontWeight: 600, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${MONTH_NAMES[month]} ${year}</span>
            <button onClick=${nextMonth} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>›</button>
          </div>

          <div style=${{ overflowX: 'auto' }}>
            <table style=${{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <!-- Day header row -->
              <thead>
                <tr style=${{ background: '#F9FAFB' }}>
                  <th style=${{ padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', width: 160, borderBottom: '1px solid #E5E7EB' }}>Persona</th>
                  ${days.map(day => {
                    const iso = toISO(day);
                    const dow = (day.getDay() + 6) % 7;
                    const isToday   = iso === '2026-04-17';
                    const isWeekend = dow >= 5;
                    return html`
                      <th key=${iso} style=${{
                        padding: '6px 2px', textAlign: 'center', fontSize: 10, fontWeight: isToday ? 700 : 500,
                        color: isToday ? '#0046F3' : isWeekend ? '#D1D5DB' : '#6B7280',
                        borderBottom: '1px solid #E5E7EB', minWidth: 24,
                      }}>
                        <div>${DAY_NAMES[dow]}</div>
                        <div style=${{ fontWeight: isToday ? 800 : 600, color: isToday ? '#0046F3' : isWeekend ? '#D1D5DB' : '#374151' }}>${day.getDate()}</div>
                      </th>
                    `;
                  })}
                </tr>
              </thead>
              <tbody>
                ${users.map((user, ui) => html`
                  <tr key=${user.id} style=${{ borderBottom: ui < users.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <!-- User cell -->
                    <td style=${{ padding: '10px 16px' }}>
                      <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style=${{ width: 28, height: 28, borderRadius: '50%', background: user.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          ${initials(user.name)}
                        </div>
                        <div>
                          <div style=${{ fontSize: 12, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>${user.name.split(' ')[0]}</div>
                          <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${user.typology}</div>
                        </div>
                      </div>
                    </td>
                    <!-- Day cells -->
                    ${days.map(day => {
                      const iso   = toISO(day);
                      const leave = (userLeaveDays[user.id] || {})[iso];
                      const info  = leave ? LEAVE_INFO[leave.type] : null;
                      const dow   = (day.getDay() + 6) % 7;
                      const isWeekend = dow >= 5;
                      return html`
                        <td key=${iso} style=${{ padding: '2px', textAlign: 'center' }}>
                          <div style=${{
                            width: 24, height: 24, borderRadius: 4, margin: '0 auto',
                            background: info ? info.bg : isWeekend ? '#FAFAFA' : 'transparent',
                            border: info ? '1px solid ' + info.color + '40' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            ${info && html`<span style=${{ width: 8, height: 8, borderRadius: '50%', background: info.color }} />`}
                          </div>
                        </td>
                      `;
                    })}
                  </tr>
                `)}
              </tbody>
            </table>
          </div>

          <!-- Legend -->
          <div style=${{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            ${Object.entries(LEAVE_INFO).map(([type, info]) => html`
              <div key=${type} style=${{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
                <span style=${{ width: 8, height: 8, borderRadius: '50%', background: info.color }} />
                ${info.label}
              </div>
            `)}
          </div>
        </div>

        <!-- Balance table -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginTop: 16 }}>
          <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Saldos del Equipo</h3>
          </div>
          <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style=${{ background: '#F9FAFB' }}>
                <th style=${{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Persona</th>
                ${Object.entries(LEAVE_INFO).map(([type, info]) => html`
                  <th key=${type} style=${{ padding: '8px 16px', textAlign: 'center', fontWeight: 600, color: info.color, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>${info.label}</th>
                `)}
              </tr>
            </thead>
            <tbody>
              ${users.map((user, ui) => {
                const bal = leaveBalances[user.id] || {};
                return html`
                  <tr key=${user.id} style=${{ borderTop: '1px solid #F3F4F6' }}>
                    <td style=${{ padding: '10px 16px' }}>
                      <div style=${{ fontSize: 12, fontWeight: 600, color: '#111827' }}>${user.name}</div>
                    </td>
                    ${Object.entries(LEAVE_INFO).map(([type, info]) => {
                      const b = bal[type] || { used: 0, total: 0 };
                      const rem = b.total - b.used;
                      return html`
                        <td key=${type} style=${{ padding: '10px 16px', textAlign: 'center' }}>
                          <span style=${{ fontWeight: 600, color: rem > 0 ? info.color : '#FF6467' }}>${rem}</span>
                          <span style=${{ color: '#9CA3AF', marginLeft: 2 }}>/ ${b.total}</span>
                        </td>
                      `;
                    })}
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      ` : html`
        <!-- Requests list -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Todas las Solicitudes</h3>
            ${pendingRequests.length > 0 && html`
              <span style=${{ fontSize: 12, color: '#FF6467', fontWeight: 600 }}>${pendingRequests.length} pendiente${pendingRequests.length > 1 ? 's' : ''} de aprobación</span>
            `}
          </div>
          <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                ${['Persona','Tipo','Período','Estado',''].map(h => html`
                  <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
                `)}
              </tr>
            </thead>
            <tbody>
              ${leaveRequests.map((r, i) => {
                const user = users.find(u => u.id === r.user);
                const info = LEAVE_INFO[r.type] || {};
                const same = r.start === r.end;
                const dates = same ? formatDate(r.start) : formatDateShort(r.start) + ' – ' + formatDate(r.end);
                return html`
                  <tr key=${r.id} style=${{ borderBottom: i < leaveRequests.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style=${{ padding: '12px 16px' }}>
                      <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style=${{ width: 26, height: 26, borderRadius: '50%', background: user?.avatar_color || '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                          ${user ? initials(user.name) : '?'}
                        </div>
                        <div style=${{ fontSize: 13, fontWeight: 500, color: '#111827' }}>${user?.name || '—'}</div>
                      </div>
                    </td>
                    <td style=${{ padding: '12px 16px' }}>
                      <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '2px 8px', borderRadius: 99 }}>${info.label}</span>
                      ${r.half_day && html`<span style=${{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>½ día</span>`}
                    </td>
                    <td style=${{ padding: '12px 16px', color: '#6B7280', fontSize: 12 }}>${dates}</td>
                    <td style=${{ padding: '12px 16px' }}><${StatusBadge} status=${r.status} variant="leave" /></td>
                    <td style=${{ padding: '12px 16px', textAlign: 'right' }}>
                      ${r.status === 'pending' && canApprove && html`
                        <div style=${{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick=${() => handleApprove(r.id, 'approved')}
                            style=${{ background: '#F0FDF4', border: '1px solid #009966', color: '#009966', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                          >Aprobar</button>
                          <button
                            onClick=${() => handleApprove(r.id, 'rejected')}
                            style=${{ background: '#FFF5F5', border: '1px solid #FF6467', color: '#FF6467', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                          >Rechazar</button>
                        </div>
                      `}
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
