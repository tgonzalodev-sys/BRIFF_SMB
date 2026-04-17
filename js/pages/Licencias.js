import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import StatusBadge from '../components/ui/StatusBadge.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { getMonthGrid, toISO, formatDate, formatDateShort } from '../lib/utils.js';

const LEAVE_INFO = {
  vacation:     { label: 'Vacaciones',    color: '#0046F3', bg: '#EEF4FF' },
  sick:         { label: 'Enfermedad',    color: '#FF6467', bg: '#FFF0F0' },
  personal:     { label: 'Personal',      color: '#FD9A00', bg: '#FFF7ED' },
  compensatory: { label: 'Compensatorio', color: '#009966', bg: '#F0FDF4' },
};

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_NAMES   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

function getDateRange(start, end) {
  const dates = [];
  const d = new Date(start + 'T12:00:00');
  const endD = new Date((end || start) + 'T12:00:00');
  while (d <= endD) { dates.push(toISO(d)); d.setDate(d.getDate() + 1); }
  return dates;
}

function NewRequestModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'vacation', start: '', end: '', half_day: false, notes: '', status: 'pending' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: 13, outline: 'none', color: '#111827', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };

  return html`
    <div
      style=${{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick=${e => e.target === e.currentTarget && onClose()}
    >
      <div style=${{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px -10px rgba(16,24,40,0.25)', overflow: 'hidden' }}>
        <div style=${{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style=${{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>Solicitar Licencia</h2>
          <button onClick=${onClose} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>✕</button>
        </div>
        <div style=${{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style=${labelStyle}>Tipo de licencia</label>
            <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              ${Object.entries(LEAVE_INFO).map(([type, info]) => html`
                <button
                  key=${type}
                  onClick=${() => set('type', type)}
                  style=${{
                    padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    border: form.type === type ? '2px solid ' + info.color : '1.5px solid #E5E7EB',
                    background: form.type === type ? info.bg : '#fff',
                    color: form.type === type ? info.color : '#6B7280',
                  }}
                >${info.label}</button>
              `)}
            </div>
          </div>
          <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style=${labelStyle}>Desde</label>
              <input type="date" style=${inputStyle} value=${form.start} onInput=${e => set('start', e.target.value)} />
            </div>
            <div>
              <label style=${labelStyle}>Hasta</label>
              <input type="date" style=${inputStyle} value=${form.end || form.start} onInput=${e => set('end', e.target.value)} />
            </div>
          </div>
          <label style=${{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked=${form.half_day} onChange=${e => set('half_day', e.target.checked)} />
            Medio día
          </label>
          <div>
            <label style=${labelStyle}>Notas (opcional)</label>
            <textarea style=${{ ...inputStyle, resize: 'vertical', minHeight: 64 }} value=${form.notes} onInput=${e => set('notes', e.target.value)} placeholder="Motivo o comentario…" />
          </div>
        </div>
        <div style=${{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick=${onClose} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>Cancelar</button>
          <button
            onClick=${() => { if (form.start) { onSubmit({ ...form, end: form.end || form.start }); } }}
            style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >Enviar Solicitud</button>
        </div>
      </div>
    </div>
  `;
}

export default function Licencias() {
  const { currentUser, leaveRequests, leaveBalances } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [month, setMonth]     = useState(3);
  const [year, setYear]       = useState(2026);
  const [showModal, setShowModal] = useState(false);

  const myRequests = leaveRequests.filter(r => r.user === currentUser.id);
  const myBalances = leaveBalances[currentUser.id] || {};
  const grid       = getMonthGrid(year, month);

  const leaveDays = {};
  myRequests.forEach(r => getDateRange(r.start, r.end).forEach(d => { leaveDays[d] = r; }));

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  function handleSubmit(form) {
    dispatch({ type: 'ADD_LEAVE_REQUEST', request: { id: 'lr' + Date.now(), user: currentUser.id, ...form } });
    toast('Solicitud enviada correctamente');
    setShowModal(false);
  }

  return html`
    <div>
      <${PageHeader}
        title="Mis Licencias"
        subtitle="Vacaciones y ausencias"
        actions=${html`
          <button
            onClick=${() => setShowModal(true)}
            style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >+ Solicitar Licencia</button>
        `}
      />

      <!-- Balance cards -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${Object.entries(LEAVE_INFO).map(([type, info]) => {
          const bal = myBalances[type] || { used: 0, total: 0 };
          const remaining = bal.total - bal.used;
          const pct = bal.total > 0 ? (bal.used / bal.total) * 100 : 0;
          return html`
            <div key=${type} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
              <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>${info.label}</div>
              <div style=${{ fontSize: 28, fontWeight: 700, color: info.color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>${remaining}</div>
              <div style=${{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 10px' }}>${bal.used} usados de ${bal.total}</div>
              <div style=${{ height: 4, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                <div style=${{ height: '100%', width: pct + '%', background: info.color, borderRadius: 99 }} />
              </div>
            </div>
          `;
        })}
      </div>

      <!-- Calendar + Requests -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'flex-start' }}>

        <!-- Monthly calendar -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick=${prevMonth} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>‹</button>
            <span style=${{ fontSize: 15, fontWeight: 600, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${MONTH_NAMES[month]} ${year}</span>
            <button onClick=${nextMonth} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>›</button>
          </div>

          <div style=${{ padding: '16px 20px' }}>
            <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
              ${DAY_NAMES.map(d => html`
                <div key=${d} style=${{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#9CA3AF', padding: '2px 0' }}>${d}</div>
              `)}
            </div>
            ${grid.map((week, wi) => html`
              <div key=${wi} style=${{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                ${week.map((day, di) => {
                  if (!day) return html`<div key=${di} />`;
                  const iso   = toISO(day);
                  const leave = leaveDays[iso];
                  const info  = leave ? LEAVE_INFO[leave.type] : null;
                  const isToday   = iso === '2026-04-17';
                  const isWeekend = di >= 5;
                  return html`
                    <div key=${di} style=${{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 8, fontSize: 13, fontWeight: isToday || leave ? 700 : 400,
                      background: info ? info.bg : isToday ? '#EEF4FF' : 'transparent',
                      color: info ? info.color : isToday ? '#0046F3' : isWeekend ? '#D1D5DB' : '#374151',
                      border: isToday ? '1.5px solid #0046F3' : '1.5px solid transparent',
                      position: 'relative',
                    }}>
                      ${day.getDate()}
                      ${leave?.half_day && html`<span style=${{ position: 'absolute', bottom: 3, right: 3, width: 4, height: 4, borderRadius: '50%', background: info?.color }} />`}
                    </div>
                  `;
                })}
              </div>
            `)}
          </div>

          <div style=${{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            ${Object.entries(LEAVE_INFO).map(([type, info]) => html`
              <div key=${type} style=${{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
                <span style=${{ width: 10, height: 10, borderRadius: 3, background: info.bg, border: '1.5px solid ' + info.color }} />
                ${info.label}
              </div>
            `)}
          </div>
        </div>

        <!-- My requests list -->
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style=${{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Mis Solicitudes</h3>
          </div>
          ${myRequests.length === 0 ? html`
            <div style=${{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Sin solicitudes registradas.</div>
          ` : myRequests.map((r, i) => {
            const info = LEAVE_INFO[r.type] || {};
            const same = r.start === r.end;
            const dates = same ? formatDate(r.start) : formatDateShort(r.start) + ' – ' + formatDate(r.end);
            return html`
              <div key=${r.id} style=${{ padding: '12px 16px', borderBottom: i < myRequests.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style=${{ fontSize: 12, fontWeight: 700, color: info.color }}>${info.label}</span>
                  <${StatusBadge} status=${r.status} variant="leave" />
                </div>
                <div style=${{ fontSize: 12, color: '#6B7280' }}>${dates}${r.half_day ? ' · Medio día' : ''}</div>
                ${r.notes && html`<div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2, fontStyle: 'italic' }}>${r.notes}</div>`}
              </div>
            `;
          })}
        </div>

      </div>

      ${showModal && html`<${NewRequestModal} onClose=${() => setShowModal(false)} onSubmit=${handleSubmit} />`}
    </div>
  `;
}
