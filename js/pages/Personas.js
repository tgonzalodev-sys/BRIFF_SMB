import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { formatARS, initials } from '../lib/utils.js';

const ROLE_INFO = {
  Director:        { label: 'Director/a',      color: '#7C3AED', bg: '#F5F3FF' },
  'Account Manager': { label: 'Account',       color: '#0046F3', bg: '#EEF4FF' },
  Creative:        { label: 'Creativo/a',       color: '#D97706', bg: '#FFFBEB' },
  Finance:         { label: 'Finanzas',         color: '#059669', bg: '#F0FDF4' },
  Production:      { label: 'Producción',       color: '#0891B2', bg: '#ECFEFF' },
};

const CONTRACT_TYPES = ['Relación de Dependencia', 'Monotributo', 'Factura Empresa'];

function NewPersonaModal({ typologies, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', role: 'Creative', dept: 'Creatividad',
    typology: typologies[0]?.name || '', hourly_cost: '',
    contract_type: CONTRACT_TYPES[0],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const colors = ['#2A2AFF','#7C3AED','#059669','#D97706','#DC2626','#0891B2','#0046F3','#374151'];
  const avatar_color = colors[Math.floor(Math.random() * colors.length)];

  return html`
    <div style=${{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick=${onClose}>
      <div style=${{ background: '#fff', borderRadius: 12, padding: 28, width: 480, maxWidth: '95vw' }} onClick=${e => e.stopPropagation()}>
        <h2 style=${{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>Nueva Persona</h2>
        <div style=${{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          ${[
            { label: 'Nombre completo', key: 'name', type: 'text', placeholder: 'Ej. María García' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'nombre@estudio.com' },
          ].map(f => html`
            <div key=${f.key}>
              <label style=${{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>${f.label}</label>
              <input
                type=${f.type}
                placeholder=${f.placeholder}
                value=${form[f.key]}
                onChange=${e => set(f.key, e.target.value)}
                style=${{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 13, fontFamily: 'inherit' }}
              />
            </div>
          `)}
          <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style=${{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Typología</label>
              <select value=${form.typology} onChange=${e => set('typology', e.target.value)} style=${{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
                ${typologies.map(t => html`<option key=${t.id} value=${t.name}>${t.name}</option>`)}
              </select>
            </div>
            <div>
              <label style=${{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Costo/hora (ARS)</label>
              <input type="number" value=${form.hourly_cost} onChange=${e => set('hourly_cost', e.target.value)} placeholder="50000" style=${{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
          </div>
          <div>
            <label style=${{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Tipo de Contrato</label>
            <select value=${form.contract_type} onChange=${e => set('contract_type', e.target.value)} style=${{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
              ${CONTRACT_TYPES.map(c => html`<option key=${c} value=${c}>${c}</option>`)}
            </select>
          </div>
        </div>
        <div style=${{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick=${onClose} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          <button
            onClick=${() => {
              if (!form.name || !form.email) return;
              onSave({ id: 'u' + Date.now(), ...form, hourly_cost: Number(form.hourly_cost) || 0, avatar_color, role: 'Creative' });
            }}
            style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >Guardar</button>
        </div>
      </div>
    </div>
  `;
}

export default function Personas() {
  const { users, typologies, teamUtilization, projects } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.typology.toLowerCase().includes(search.toLowerCase()) ||
    u.dept.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(user) {
    dispatch({ type: 'ADD_USER', user });
    toast('Persona agregada al equipo');
    setShowModal(false);
  }

  const avgUtil = teamUtilization.length
    ? Math.round(teamUtilization.reduce((s, u) => s + u.utilization_pct, 0) / teamUtilization.length)
    : 0;

  const totalBillable = teamUtilization.reduce((s, u) => s + u.billable, 0);

  return html`
    <div>
      <${PageHeader}
        title="Personas"
        subtitle="Equipo del estudio"
        actions=${html`
          <button
            onClick=${() => setShowModal(true)}
            style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >+ Agregar Persona</button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Total equipo',     value: users.length.toString(),   color: '#111827' },
          { label: 'Utilización media', value: avgUtil + '%',            color: avgUtil >= 70 ? '#009966' : '#D97706' },
          { label: 'Horas facturables', value: totalBillable + 'h',     color: '#0046F3' },
          { label: 'Typologías',        value: typologies.length.toString(), color: '#111827' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <!-- Search -->
      <div style=${{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre, typología o área..."
          value=${search}
          onChange=${e => setSearch(e.target.value)}
          style=${{ width: '100%', boxSizing: 'border-box', padding: '9px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff', outline: 'none' }}
        />
      </div>

      <!-- Team table -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Persona','Área / Typología','Contrato','Costo/h','Proyectos','Utilización'].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${filtered.map((user, i) => {
              const util = teamUtilization.find(u => u.user === user.id);
              const pct  = util?.utilization_pct ?? 0;
              const userProjects = projects.filter(p => p.team.includes(user.id));
              const roleInfo = ROLE_INFO[user.role] || { label: user.role, color: '#6B7280', bg: '#F3F4F6' };
              return html`
                <tr key=${user.id} style=${{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <!-- Avatar + name -->
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style=${{ width: 34, height: 34, borderRadius: '50%', background: user.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        ${initials(user.name)}
                      </div>
                      <div>
                        <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${user.name}</div>
                        <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>${user.email}</div>
                      </div>
                    </div>
                  </td>
                  <!-- Dept + typology -->
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ fontSize: 12, fontWeight: 600, color: '#374151' }}>${user.typology}</div>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <span style=${{ fontSize: 11, fontWeight: 600, color: roleInfo.color, background: roleInfo.bg, padding: '1px 7px', borderRadius: 99 }}>${roleInfo.label}</span>
                      <span style=${{ fontSize: 11, color: '#9CA3AF' }}>${user.dept}</span>
                    </div>
                  </td>
                  <!-- Contract type -->
                  <td style=${{ padding: '14px 16px', fontSize: 12, color: '#374151' }}>
                    ${user.contract_type || 'Rel. de Dependencia'}
                  </td>
                  <!-- Hourly cost -->
                  <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151', fontWeight: 600 }}>
                    ${formatARS(user.hourly_cost * 1000)}
                  </td>
                  <!-- Active projects -->
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      ${userProjects.slice(0, 2).map(p => html`
                        <span key=${p.id} style=${{ fontSize: 11, color: '#374151', background: '#F3F4F6', padding: '1px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>${p.title.length > 22 ? p.title.slice(0, 22) + '…' : p.title}</span>
                      `)}
                      ${userProjects.length > 2 && html`<span style=${{ fontSize: 11, color: '#9CA3AF' }}>+${userProjects.length - 2} más</span>`}
                      ${userProjects.length === 0 && html`<span style=${{ fontSize: 11, color: '#9CA3AF' }}>Sin proyectos activos</span>`}
                    </div>
                  </td>
                  <!-- Utilization bar -->
                  <td style=${{ padding: '14px 16px', minWidth: 140 }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style=${{ flex: 1, height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                        <div style=${{ height: '100%', width: Math.min(pct, 100) + '%', background: pct >= 70 ? '#009966' : pct >= 50 ? '#D97706' : '#FF6467', borderRadius: 99, transition: 'width 0.4s' }} />
                      </div>
                      <span style=${{ fontSize: 12, fontWeight: 700, color: pct >= 70 ? '#009966' : pct >= 50 ? '#D97706' : '#FF6467', minWidth: 36, textAlign: 'right' }}>${pct}%</span>
                    </div>
                    ${util && html`<div style=${{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>${util.billable}h fact. / ${util.available_hours}h disp.</div>`}
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      ${showModal && html`
        <${NewPersonaModal}
          typologies=${typologies}
          onSave=${handleAdd}
          onClose=${() => setShowModal(false)}
        />
      `}
    </div>
  `;
}
