import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import FilterBar from '../components/ui/FilterBar.js';
import { useAppState } from '../context.js';
import { formatARS, formatDate, initials } from '../lib/utils.js';

const EXPENSE_STATUS = {
  draft:    { label: 'Borrador',  color: '#6B7280', bg: '#F3F4F6' },
  pending:  { label: 'Pendiente', color: '#FE9A00', bg: '#FEF3C6' },
  approved: { label: 'Aprobado',  color: '#009966', bg: '#D0FAE5' },
  rejected: { label: 'Rechazado', color: '#FF6467', bg: '#FFF0F0' },
};

export default function Gastos() {
  const navigate = useNavigate();
  const { expenseSheets, expenseItems, users } = useAppState();
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');

  const filteredSheets = expenseSheets.filter(sheet => {
    const creator = users.find(u => u.id === sheet.created_by);
    const matchSearch = !search ||
      sheet.title.toLowerCase().includes(search.toLowerCase()) ||
      (creator?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || sheet.status === statusF;
    return matchSearch && matchStatus;
  });

  const totalApproved = expenseSheets.filter(s => s.status === 'approved').reduce((s, e) => s + e.total, 0);
  const totalPending  = expenseSheets.filter(s => s.status === 'pending').reduce((s, e) => s + e.total, 0);
  const totalDraft    = expenseSheets.filter(s => s.status === 'draft').reduce((s, e) => s + e.total, 0);
  const totalAll      = expenseSheets.reduce((s, e) => s + e.total, 0);

  return html`
    <div>
      <${PageHeader}
        title="Gastos"
        subtitle="Hojas de gastos y reembolsos del equipo"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nueva Hoja
          </button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Total Registrado',  value: formatARS(totalAll),      color: '#111827' },
          { label: 'Aprobado',          value: formatARS(totalApproved), color: '#009966' },
          { label: 'Pendiente Aprob.',  value: formatARS(totalPending),  color: '#FE9A00' },
          { label: 'Borradores',        value: formatARS(totalDraft),    color: '#6B7280' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <${FilterBar}
        search=${search} onSearch=${setSearch}
        filters=${[
          { label: 'Estado', value: statusF, onChange: setStatusF, options: [
            { value: 'draft',    label: 'Borrador' },
            { value: 'pending',  label: 'Pendiente' },
            { value: 'approved', label: 'Aprobado' },
            { value: 'rejected', label: 'Rechazado' },
          ]},
        ]}
        count=${filteredSheets.length}
      />

      <!-- Sheets table -->
      <div style=${{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginTop: 12 }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
              ${['Título', 'Área', 'Período', 'Creado por', 'Estado', 'Total', ''].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${filteredSheets.map((sheet, i) => {
              const creator = users.find(u => u.id === sheet.created_by);
              const info    = EXPENSE_STATUS[sheet.status] || EXPENSE_STATUS.draft;
              const itemCount = expenseItems.filter(e => e.sheet === sheet.id).length;
              return html`
                <tr
                  key=${sheet.id}
                  tabIndex=${0}
                  onClick=${() => navigate('/gastos/' + sheet.id)}
                  onKeyDown=${e => (e.key === 'Enter' || e.key === ' ') && navigate('/gastos/' + sheet.id)}
                  style=${{ borderBottom: i < filteredSheets.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter=${e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave=${e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${sheet.title}</div>
                    <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>${itemCount} ítem${itemCount !== 1 ? 's' : ''}</div>
                  </td>
                  <td style=${{ padding: '14px 16px', color: '#374151' }}>${sheet.dept}</td>
                  <td style=${{ padding: '14px 16px', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${sheet.period}</td>
                  <td style=${{ padding: '14px 16px' }}>
                    ${creator ? html`
                      <div style=${{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style=${{ width: 24, height: 24, borderRadius: '50%', background: creator.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          ${initials(creator.name)}
                        </div>
                        <span style=${{ fontSize: 12, color: '#374151' }}>${creator.name.split(' ')[0]}</span>
                      </div>
                    ` : '—'}
                  </td>
                  <td style=${{ padding: '14px 16px' }}>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '3px 10px', borderRadius: 99 }}>${info.label}</span>
                  </td>
                  <td style=${{ padding: '14px 16px', fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>
                    ${formatARS(sheet.total)}
                  </td>
                  <td style=${{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style=${{ fontSize: 12, color: '#0046F3', fontWeight: 600 }}>Ver →</span>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
