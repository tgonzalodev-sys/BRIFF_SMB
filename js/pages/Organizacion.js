import { useState } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState } from '../context.js';

const CURRENCIES = ['ARS', 'USD', 'EUR'];
const TIMEZONES  = [
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'America/Bogota',
  'America/Lima',
  'America/Mexico_City',
];

function Field({ label, value, editing, onChange, type = 'text', options }) {
  return html`
    <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style=${{ fontSize: 12, color: '#9CA3AF', minWidth: 180 }}>${label}</span>
      ${editing
        ? options
          ? html`
            <select
              value=${value}
              onChange=${e => onChange(e.target.value)}
              style=${{ padding: '5px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', background: '#fff', minWidth: 200 }}
            >
              ${options.map(o => html`<option key=${o} value=${o}>${o}</option>`)}
            </select>
          `
          : html`
            <input
              type=${type}
              value=${value}
              onChange=${e => onChange(e.target.value)}
              style=${{ padding: '5px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', minWidth: 200 }}
            />
          `
        : html`<span style=${{ fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'right' }}>${value}</span>`
      }
    </div>
  `;
}

export default function Organizacion() {
  const { organization } = useAppState();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(organization || {});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const sections = [
    {
      title: 'Identidad',
      fields: [
        { label: 'Nombre del estudio',    key: 'name' },
        { label: 'Razón social',          key: 'legal_name' },
        { label: 'CUIT',                  key: 'cuit' },
        { label: 'Dirección fiscal',      key: 'fiscal_address' },
      ],
    },
    {
      title: 'Configuración Operativa',
      fields: [
        { label: 'Moneda principal',      key: 'currency',            options: CURRENCIES },
        { label: 'Zona horaria',          key: 'timezone',            options: TIMEZONES },
        { label: 'Horas semanales',       key: 'weekly_hours',        type: 'number' },
        { label: 'Objetivo facturable %', key: 'billable_target_pct', type: 'number' },
      ],
    },
  ];

  return html`
    <div>
      <${PageHeader}
        title="Organización"
        subtitle="Configuración del estudio"
        actions=${html`
          ${editing
            ? html`
              <div style=${{ display: 'flex', gap: 8 }}>
                <button
                  onClick=${() => { setEditing(false); setForm(organization || {}); }}
                  style=${{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                >Cancelar</button>
                <button
                  onClick=${() => setEditing(false)}
                  style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                >Guardar Cambios</button>
              </div>
            `
            : html`
              <button
                onClick=${() => setEditing(true)}
                style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
              >Editar</button>
            `
          }
        `}
      />

      <div style=${{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <!-- Main settings -->
        <div style=${{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          ${sections.map(section => html`
            <div key=${section.title} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '18px 24px' }}>
              <h3 style=${{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>${section.title}</h3>
              <div>
                ${section.fields.map(f => html`
                  <${Field}
                    key=${f.key}
                    label=${f.label}
                    value=${form[f.key] ?? ''}
                    editing=${editing}
                    onChange=${v => set(f.key, v)}
                    type=${f.type || 'text'}
                    options=${f.options}
                  />
                `)}
              </div>
            </div>
          `)}
        </div>

        <!-- Sidebar: quick stats -->
        <div style=${{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Datos Rápidos</h3>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              ${[
                { label: 'Moneda',          value: form.currency || 'ARS' },
                { label: 'Horas/semana',    value: (form.weekly_hours || 40) + 'h' },
                { label: 'Target facturable', value: (form.billable_target_pct || 70) + '%' },
                { label: 'Zona horaria',    value: (form.timezone || '').split('/').pop()?.replace('_', ' ') || '—' },
              ].map(r => html`
                <div key=${r.label} style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style=${{ color: '#9CA3AF' }}>${r.label}</span>
                  <span style=${{ fontWeight: 600, color: '#374151' }}>${r.value}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Billable target gauge -->
          <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <h3 style=${{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Objetivo Facturable</h3>
            <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
              <span>Meta mensual</span>
              <span style=${{ fontWeight: 700, color: '#0046F3' }}>${form.billable_target_pct || 70}%</span>
            </div>
            <div style=${{ height: 8, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden', marginBottom: 8 }}>
              <div style=${{ height: '100%', width: (form.billable_target_pct || 70) + '%', background: '#0046F3', borderRadius: 99 }} />
            </div>
            <div style=${{ fontSize: 11, color: '#9CA3AF' }}>
              ${Math.round((form.weekly_hours || 40) * 4 * (form.billable_target_pct || 70) / 100)}h facturables / mes por persona
            </div>
          </div>

          <!-- Status badge -->
          <div style=${{ background: '#D0FAE5', borderRadius: 8, border: '1px solid #BBF7D0', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style=${{ width: 8, height: 8, borderRadius: '50%', background: '#009966', flexShrink: 0 }} />
            <div>
              <div style=${{ fontSize: 12, fontWeight: 600, color: '#009966' }}>Configuración activa</div>
              <div style=${{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Todos los módulos operativos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
