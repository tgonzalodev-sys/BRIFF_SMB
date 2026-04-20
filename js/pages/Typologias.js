import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState } from '../context.js';
import { formatARS } from '../lib/utils.js';

const DEPT_COLORS = {
  'Dirección':   { color: '#8E51FF', bg: '#F5F3FF' },
  'Cuentas':     { color: '#0046F3', bg: '#E0E6F6' },
  'Creatividad': { color: '#FE9A00', bg: '#FEF3C6' },
  'Finanzas':    { color: '#00BC7D', bg: '#D0FAE5' },
  'Producción':  { color: '#00B8DB', bg: '#E0F9FF' },
};

export default function Typologias() {
  const { typologies, users } = useAppState();

  const depts = [...new Set(typologies.map(t => t.dept))];

  return html`
    <div>
      <${PageHeader}
        title="Typologías"
        subtitle="Roles y tarifas base del equipo"
        actions=${html`
          <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            + Nueva Typología
          </button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Typologías',  value: typologies.length.toString(), color: '#111827' },
          { label: 'Áreas',       value: depts.length.toString(),      color: '#111827' },
          { label: 'Costo promedio/h', value: formatARS(Math.round(typologies.reduce((s, t) => s + t.cost_hour_default, 0) / (typologies.length || 1))), color: '#374151' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <!-- Typologies table -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style=${{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Typologías del Estudio</h2>
          <span style=${{ fontSize: 12, color: '#9CA3AF' }}>${typologies.length} roles</span>
        </div>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Typología','Área','Personas','Costo/h (ARS)','Venta/h (ARS)','Margen',''].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${typologies.map((ty, i) => {
              const members = users.filter(u => u.typology === ty.name);
              const margin  = ty.sell_hour_default > 0
                ? Math.round(((ty.sell_hour_default - ty.cost_hour_default) / ty.sell_hour_default) * 100)
                : 0;
              const dInfo   = DEPT_COLORS[ty.dept] || { color: '#6B7280', bg: '#F3F4F6' };
              return html`
                <tr key=${ty.id} style=${{ borderBottom: i < typologies.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${ty.name}</div>
                  </td>
                  <td style=${{ padding: '14px 16px' }}>
                    <span style=${{ fontSize: 12, fontWeight: 600, color: dInfo.color, background: dInfo.bg, padding: '2px 10px', borderRadius: 99 }}>${ty.dept}</span>
                  </td>
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style=${{ display: 'flex' }}>
                        ${members.slice(0, 4).map((u, mi) => html`
                          <div key=${u.id} title=${u.name} style=${{
                            width: 22, height: 22, borderRadius: '50%', background: u.avatar_color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, fontWeight: 700, color: '#fff',
                            marginLeft: mi > 0 ? -6 : 0, border: '2px solid #fff', zIndex: 4 - mi,
                            position: 'relative', flexShrink: 0,
                          }}>
                            ${u.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                          </div>
                        `)}
                      </div>
                      <span style=${{ fontSize: 12, color: '#374151' }}>${members.length}</span>
                    </div>
                  </td>
                  <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>
                    ${formatARS(ty.cost_hour_default)}
                  </td>
                  <td style=${{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151', fontWeight: 600 }}>
                    ${formatARS(ty.sell_hour_default)}
                  </td>
                  <td style=${{ padding: '14px 16px' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style=${{ width: 80, height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                        <div style=${{ height: '100%', width: margin + '%', background: margin >= 35 ? '#009966' : '#FE9A00', borderRadius: 99 }} />
                      </div>
                      <span style=${{ fontSize: 12, fontWeight: 700, color: margin >= 35 ? '#009966' : '#FE9A00' }}>${margin}%</span>
                    </div>
                  </td>
                  <td style=${{ padding: '14px 16px', textAlign: 'right' }}>
                    <button style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Editar</button>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      <!-- Dept summary cards -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        ${depts.map(dept => {
          const deptTypes = typologies.filter(t => t.dept === dept);
          const deptUsers = users.filter(u => deptTypes.some(t => t.name === u.typology));
          const dInfo = DEPT_COLORS[dept] || { color: '#6B7280', bg: '#F3F4F6' };
          const avgCost = deptTypes.length ? Math.round(deptTypes.reduce((s, t) => s + t.cost_hour_default, 0) / deptTypes.length) : 0;
          return html`
            <div key=${dept} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
              <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style=${{ fontSize: 12, fontWeight: 700, color: dInfo.color, background: dInfo.bg, padding: '3px 10px', borderRadius: 99 }}>${dept}</span>
                <span style=${{ fontSize: 11, color: '#9CA3AF' }}>${deptTypes.length} rol${deptTypes.length !== 1 ? 'es' : ''}</span>
              </div>
              <div style=${{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>${deptUsers.length}</div>
              <div style=${{ fontSize: 11, color: '#9CA3AF' }}>persona${deptUsers.length !== 1 ? 's' : ''} · costo medio ${formatARS(avgCost)}/h</div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
