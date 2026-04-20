import { useState, useRef } from 'react';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState, useDispatch, useToast } from '../context.js';
import { formatARS, formatUSD, formatPct, formatDate, initials } from '../lib/utils.js';
import { CRM_STAGES } from '../lib/utils.js';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const STAGE_ORDER = ['prospect','qualified','proposal','negotiation','won','lost'];

function fmtValue(value, currency) {
  return currency === 'USD' ? formatUSD(value) : formatARS(value);
}

function Avatar({ name, color, size = 26 }) {
  return html`
    <div style=${{
      width: size, height: size, borderRadius: '50%', background: color || '#6B7280',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
      fontFamily: 'Space Grotesk, sans-serif',
    }}>${initials(name)}</div>
  `;
}

function LeadCard({ lead, users, onSelect, onMove, onDragStart, onDragEnd }) {
  const owner = users.find(u => u.id === lead.owner);
  const stage = CRM_STAGES[lead.stage] || {};
  const stageIdx = STAGE_ORDER.indexOf(lead.stage);
  const canPrev = stageIdx > 0 && lead.stage !== 'won' && lead.stage !== 'lost';
  const canNext = stageIdx < STAGE_ORDER.length - 1 && lead.stage !== 'won' && lead.stage !== 'lost';

  return html`
    <div
      draggable=${true}
      onDragStart=${e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(lead.id); }}
      onDragEnd=${onDragEnd}
      style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '12px 14px', cursor: 'grab', transition: 'box-shadow 0.15s, opacity 0.15s' }}
      onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(16,24,40,0.10)'; }}
      onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; }}
      onClick=${() => onSelect(lead)}
    >
      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
        <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3, flex: 1 }}>${lead.company}</div>
        ${owner && html`<${Avatar} name=${owner.name} color=${owner.avatar_color} size=${24} />`}
      </div>

      <div style=${{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>${lead.contact}</div>

      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style=${{ fontSize: 14, fontWeight: 700, color: lead.currency === 'USD' ? '#0046F3' : '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>
          ${fmtValue(lead.value, lead.currency)}
        </div>
        <div style=${{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: lead.probability >= 60 ? '#D0FAE5' : lead.probability >= 40 ? '#FEF3C6' : '#F3F4F6', color: lead.probability >= 60 ? '#009966' : lead.probability >= 40 ? '#FD9A00' : '#6B7280' }}>
          ${lead.probability}%
        </div>
      </div>

      <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${formatDate(lead.close_date)}</div>
        <div style=${{ display: 'flex', gap: 4 }} onClick=${e => e.stopPropagation()}>
          ${canPrev && html`
            <button
              title="Etapa anterior"
              onClick=${() => onMove(lead.id, STAGE_ORDER[stageIdx - 1])}
              style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><${ArrowLeft} size=${12} strokeWidth=${1.5} /></button>
          `}
          ${canNext && html`
            <button
              title="Siguiente etapa"
              onClick=${() => onMove(lead.id, STAGE_ORDER[stageIdx + 1])}
              style=${{ background: '#E0E6F6', border: 'none', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', color: '#0046F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><${ArrowRight} size=${12} strokeWidth=${1.5} /></button>
          `}
        </div>
      </div>
    </div>
  `;
}

function KanbanColumn({ stage, stageKey, leads, users, onSelect, onMove, isDragOver, onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd }) {
  const totalARS = leads.filter(l => l.currency === 'ARS').reduce((s, l) => s + l.value, 0);
  const totalUSD = leads.filter(l => l.currency === 'USD').reduce((s, l) => s + l.value, 0);
  const valueStr = [totalARS > 0 && formatARS(totalARS), totalUSD > 0 && formatUSD(totalUSD)].filter(Boolean).join(' + ');

  const isWon  = stageKey === 'won';
  const isLost = stageKey === 'lost';

  return html`
    <div style=${{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <!-- Column header -->
      <div style=${{
        padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB',
        marginBottom: 10, borderTop: '3px solid ' + (stage.bg && isWon ? '#C6EE6A' : stage.color),
      }}>
        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style=${{ width: 7, height: 7, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
            <span style=${{ fontSize: 12, fontWeight: 700, color: '#374151' }}>${stage.label}</span>
          </div>
          <span style=${{ background: '#F3F4F6', borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>${leads.length}</span>
        </div>
        ${valueStr && html`<div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>${valueStr}</div>`}
      </div>

      <!-- Cards drop zone -->
      <div
        onDragOver=${e => { e.preventDefault(); onDragOver(stageKey); }}
        onDragLeave=${onDragLeave}
        onDrop=${e => { e.preventDefault(); onDrop(stageKey); }}
        style=${{
          display: 'flex', flexDirection: 'column', gap: 8,
          minHeight: 80, borderRadius: 8, padding: isDragOver ? 4 : 0,
          background: isDragOver ? 'rgba(0,70,243,0.04)' : 'transparent',
          border: isDragOver ? '2px dashed rgba(0,70,243,0.3)' : '2px dashed transparent',
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        ${leads.length === 0 && !isDragOver ? html`
          <div style=${{ background: '#F9FAFB', borderRadius: 8, border: '1px dashed #E5E7EB', padding: '24px 16px', textAlign: 'center', color: '#D1D5DB', fontSize: 12 }}>
            Sin leads
          </div>
        ` : leads.map(l => html`
          <${LeadCard} key=${l.id} lead=${l} users=${users} onSelect=${onSelect} onMove=${onMove} onDragStart=${onDragStart} onDragEnd=${onDragEnd} />
        `)}
      </div>
    </div>
  `;
}

function LeadDrawer({ lead, users, onClose, onMove }) {
  const owner  = users.find(u => u.id === lead.owner);
  const stage  = CRM_STAGES[lead.stage] || {};
  const stageIdx = STAGE_ORDER.indexOf(lead.stage);

  return html`
    <!-- Backdrop -->
    <div
      style=${{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 40 }}
      onClick=${onClose}
    />
    <!-- Drawer -->
    <div style=${{
      position: 'fixed', top: 0, right: 0, height: '100vh', width: 380,
      background: '#fff', borderLeft: '1px solid #E5E7EB', zIndex: 50,
      boxShadow: '-4px 0 24px -4px rgba(16,24,40,0.12)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <!-- Drawer header -->
      <div style=${{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style=${{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${lead.company}</h2>
            <span style=${{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px',
              borderRadius: 99, background: stage.bg || '#F3F4F6', color: stage.color, fontSize: 12, fontWeight: 500,
            }}>
              <span style=${{ width: 5, height: 5, borderRadius: '50%', background: stage.color }} />
              ${stage.label}
            </span>
          </div>
          <button
            onClick=${onClose}
            style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          ><${X} size=${16} strokeWidth=${1.5} /></button>
        </div>
      </div>

      <!-- Drawer body -->
      <div style=${{ padding: '20px 24px', flex: 1 }}>
        <!-- Details grid -->
        <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 20 }}>
          ${[
            { label: 'Contacto',      value: lead.contact },
            { label: 'Valor',         value: fmtValue(lead.value, lead.currency) },
            { label: 'Probabilidad',  value: lead.probability + '%' },
            { label: 'Moneda',        value: lead.currency },
            { label: 'Cierre est.',   value: formatDate(lead.close_date) },
            { label: 'Responsable',   value: owner?.name || '—' },
          ].map(item => html`
            <div key=${item.label}>
              <div style=${{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>${item.label}</div>
              <div style=${{ fontSize: 13, fontWeight: 500, color: '#111827' }}>${item.value}</div>
            </div>
          `)}
        </div>

        <!-- Probability bar -->
        <div style=${{ marginBottom: 20 }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
            <span>Probabilidad de cierre</span>
            <span style=${{ fontWeight: 700, color: lead.probability >= 60 ? '#009966' : lead.probability >= 40 ? '#FD9A00' : '#6B7280' }}>${lead.probability}%</span>
          </div>
          <div style=${{ height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style=${{ height: '100%', width: lead.probability + '%', background: lead.probability >= 60 ? '#009966' : lead.probability >= 40 ? '#FD9A00' : '#6B7280', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <!-- Notes -->
        ${lead.notes && html`
          <div style=${{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 20, borderLeft: '3px solid #E5E7EB' }}>
            ${lead.notes}
          </div>
        `}

        <!-- Stage transitions -->
        ${lead.stage !== 'won' && lead.stage !== 'lost' && html`
          <div>
            <div style=${{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Mover a etapa</div>
            <div style=${{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              ${STAGE_ORDER.filter((s, i) => i !== stageIdx).map(s => {
                const st = CRM_STAGES[s] || {};
                const isWon = s === 'won';
                const isLost = s === 'lost';
                return html`
                  <button
                    key=${s}
                    onClick=${() => { onMove(lead.id, s); onClose(); }}
                    style=${{
                      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      border: '1px solid ' + (isWon ? '#C6EE6A' : isLost ? '#FFCDD2' : '#E5E7EB'),
                      background: isWon ? '#C6EE6A' : isLost ? '#FFF5F5' : '#F9FAFB',
                      color: isWon ? '#111827' : isLost ? '#FF6467' : '#374151',
                    }}
                  >${st.label}</button>
                `;
              })}
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

const EMPTY_FORM = { company: '', contact: '', value: '', currency: 'ARS', probability: 50, stage: 'prospect', owner: 'u2', close_date: '', notes: '' };

function NewLeadModal({ users, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = { width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: 13, outline: 'none', color: '#111827', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };

  return html`
    <div
      style=${{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick=${e => e.target === e.currentTarget && onClose()}
    >
      <div style=${{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px -10px rgba(16,24,40,0.25)', overflow: 'hidden' }}>
        <div style=${{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style=${{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>Nuevo Lead</h2>
          <button onClick=${onClose} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><${X} size=${16} strokeWidth=${1.5} /></button>
        </div>
        <div style=${{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style=${labelStyle}>Empresa *</label>
              <input style=${inputStyle} value=${form.company} onInput=${e => set('company', e.target.value)} placeholder="Nombre de la empresa" />
            </div>
            <div>
              <label style=${labelStyle}>Contacto</label>
              <input style=${inputStyle} value=${form.contact} onInput=${e => set('contact', e.target.value)} placeholder="Nombre y apellido" />
            </div>
          </div>
          <div style=${{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style=${labelStyle}>Valor estimado</label>
              <input style=${inputStyle} type="number" value=${form.value} onInput=${e => set('value', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style=${labelStyle}>Moneda</label>
              <select style=${{ ...inputStyle }} value=${form.currency} onChange=${e => set('currency', e.target.value)}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style=${labelStyle}>Etapa</label>
              <select style=${{ ...inputStyle }} value=${form.stage} onChange=${e => set('stage', e.target.value)}>
                ${STAGE_ORDER.filter(s => s !== 'won' && s !== 'lost').map(s => html`
                  <option key=${s} value=${s}>${CRM_STAGES[s]?.label}</option>
                `)}
              </select>
            </div>
            <div>
              <label style=${labelStyle}>Probabilidad: ${form.probability}%</label>
              <input type="range" min="0" max="100" value=${form.probability} onInput=${e => set('probability', +e.target.value)} style=${{ width: '100%', marginTop: 6 }} />
            </div>
          </div>
          <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style=${labelStyle}>Responsable</label>
              <select style=${{ ...inputStyle }} value=${form.owner} onChange=${e => set('owner', e.target.value)}>
                ${users.filter(u => ['Director','Account Manager'].includes(u.role)).map(u => html`
                  <option key=${u.id} value=${u.id}>${u.name}</option>
                `)}
              </select>
            </div>
            <div>
              <label style=${labelStyle}>Fecha de Cierre</label>
              <input type="date" style=${inputStyle} value=${form.close_date} onInput=${e => set('close_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label style=${labelStyle}>Notas</label>
            <textarea style=${{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value=${form.notes} onInput=${e => set('notes', e.target.value)} placeholder="Contexto del lead, próximos pasos…" />
          </div>
        </div>
        <div style=${{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick=${onClose} style=${{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>Cancelar</button>
          <button
            onClick=${() => { if (form.company) { onSubmit(form); onClose(); } }}
            style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >Agregar Lead</button>
        </div>
      </div>
    </div>
  `;
}

export default function CRMPipeline() {
  const { leads, users } = useAppState();
  const dispatch = useDispatch();
  const toast    = useToast();
  const [selected, setSelected]       = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [draggingId, setDraggingId]   = useState(null);
  const [dragOver, setDragOver]       = useState(null);
  const dragLeaveTimer                = useRef(null);

  function handleMove(id, stage) {
    dispatch({ type: 'MOVE_LEAD', id, stage });
    const label = CRM_STAGES[stage]?.label || stage;
    toast('Lead movido a: ' + label);
  }

  function handleDragStart(id) { setDraggingId(id); }
  function handleDragEnd()     { setDraggingId(null); setDragOver(null); }
  function handleDragOver(stageKey) {
    clearTimeout(dragLeaveTimer.current);
    setDragOver(stageKey);
  }
  function handleDragLeave() {
    dragLeaveTimer.current = setTimeout(() => setDragOver(null), 80);
  }
  function handleDrop(stageKey) {
    if (draggingId) {
      const lead = leads.find(l => l.id === draggingId);
      if (lead && lead.stage !== stageKey) handleMove(draggingId, stageKey);
    }
    setDraggingId(null);
    setDragOver(null);
  }

  function handleAdd(form) {
    dispatch({ type: 'ADD_LEAD', lead: { id: 'l' + Date.now(), ...form, value: Number(form.value) || 0 } });
    toast('Lead agregado al pipeline');
  }

  const selectedLead = selected ? leads.find(l => l.id === selected.id) || selected : null;

  // Pipeline KPIs
  const activeLeads  = leads.filter(l => !['won','lost'].includes(l.stage));
  const wonLeads     = leads.filter(l => l.stage === 'won');
  const totalPipelineARS = activeLeads.filter(l => l.currency === 'ARS').reduce((s,l) => s + l.value, 0);
  const totalPipelineUSD = activeLeads.filter(l => l.currency === 'USD').reduce((s,l) => s + l.value, 0);
  const pipelineStr = [totalPipelineARS > 0 && formatARS(totalPipelineARS), totalPipelineUSD > 0 && formatUSD(totalPipelineUSD)].filter(Boolean).join(' + ');
  const avgProb = activeLeads.length ? Math.round(activeLeads.reduce((s,l) => s + l.probability, 0) / activeLeads.length) : 0;

  return html`
    <div>
      <${PageHeader}
        title="Pipeline CRM"
        subtitle="Oportunidades comerciales"
        actions=${html`
          <button
            onClick=${() => setShowModal(true)}
            style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >+ Nuevo Lead</button>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
          <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Leads Activos</div>
          <div style=${{ fontSize: 26, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${activeLeads.length}</div>
        </div>
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
          <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Pipeline</div>
          <div style=${{ fontSize: 18, fontWeight: 700, color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>${pipelineStr || '—'}</div>
        </div>
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
          <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Ganados</div>
          <div style=${{ fontSize: 26, fontWeight: 700, color: '#009966', fontFamily: 'Space Grotesk, sans-serif' }}>${wonLeads.length}</div>
          <div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>${wonLeads.filter(l => l.currency === 'ARS').length > 0 ? formatARS(wonLeads.filter(l=>l.currency==='ARS').reduce((s,l)=>s+l.value,0)) : ''}</div>
        </div>
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
          <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Prob. Promedio</div>
          <div style=${{ fontSize: 26, fontWeight: 700, color: avgProb >= 60 ? '#009966' : avgProb >= 40 ? '#FD9A00' : '#6B7280', fontFamily: 'Space Grotesk, sans-serif' }}>${avgProb}%</div>
        </div>
      </div>

      <!-- Kanban board (horizontal scroll) -->
      <div style=${{ overflowX: 'auto', paddingBottom: 16 }}>
        <div style=${{ display: 'flex', gap: 12, minWidth: 'fit-content', alignItems: 'flex-start' }}>
          ${STAGE_ORDER.map(stageKey => {
            const stage      = CRM_STAGES[stageKey] || {};
            const stageLeads = leads.filter(l => l.stage === stageKey);
            return html`
              <${KanbanColumn}
                key=${stageKey}
                stageKey=${stageKey}
                stage=${stage}
                leads=${stageLeads}
                users=${users}
                onSelect=${l => setSelected(l)}
                onMove=${handleMove}
                isDragOver=${dragOver === stageKey && draggingId && leads.find(l => l.id === draggingId)?.stage !== stageKey}
                onDragOver=${handleDragOver}
                onDragLeave=${handleDragLeave}
                onDrop=${handleDrop}
                onDragStart=${handleDragStart}
                onDragEnd=${handleDragEnd}
              />
            `;
          })}
        </div>
      </div>

      ${selectedLead && html`
        <${LeadDrawer}
          lead=${selectedLead}
          users=${users}
          onClose=${() => setSelected(null)}
          onMove=${handleMove}
        />
      `}

      ${showModal && html`
        <${NewLeadModal}
          users=${users}
          onClose=${() => setShowModal(false)}
          onSubmit=${handleAdd}
        />
      `}
    </div>
  `;
}
