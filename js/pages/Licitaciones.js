import { useNavigate } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import { useAppState } from '../context.js';
import { formatDate } from '../lib/utils.js';

const TENDER_STATUS = {
  draft:       { label: 'Borrador',    color: '#6B7280', bg: '#F3F4F6' },
  open:        { label: 'Abierta',     color: '#0046F3', bg: '#EEF4FF' },
  adjudicated: { label: 'Adjudicada',  color: '#009966', bg: '#F0FDF4' },
  cancelled:   { label: 'Cancelada',   color: '#FF6467', bg: '#FFF0F0' },
};

export default function Licitaciones() {
  const navigate = useNavigate();
  const { tenders, projects, suppliers, estimates } = useAppState();

  return html`
    <div>
      <${PageHeader}
        title="Licitaciones"
        subtitle="Pedidos de cotización a proveedores"
        actions=${html`
          <div style=${{ display: 'flex', gap: 8 }}>
            <button
              onClick=${() => navigate('/proveedores')}
              style=${{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >← Proveedores</button>
            <button style=${{ background: '#0046F3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              + Nueva Licitación
            </button>
          </div>
        `}
      />

      <!-- KPI strip -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        ${[
          { label: 'Total',        value: tenders.length.toString(),                                          color: '#111827' },
          { label: 'Abiertas',     value: tenders.filter(t => t.status === 'open').length.toString(),         color: '#0046F3' },
          { label: 'Adjudicadas',  value: tenders.filter(t => t.status === 'adjudicated').length.toString(),  color: '#009966' },
          { label: 'Proveedores',  value: suppliers.length.toString(),                                        color: '#111827' },
        ].map(k => html`
          <div key=${k.label} style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${k.label}</div>
            <div style=${{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'Space Grotesk, sans-serif' }}>${k.value}</div>
          </div>
        `)}
      </div>

      <!-- Tenders list -->
      ${tenders.length === 0 ? html`
        <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          Sin licitaciones registradas.
        </div>
      ` : html`
        <div style=${{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          ${tenders.map(tender => {
            const project  = projects.find(p => p.id === tender.project);
            const invited  = tender.suppliers_invited.map(sid => suppliers.find(s => s.id === sid)).filter(Boolean);
            const info     = TENDER_STATUS[tender.status] || TENDER_STATUS.draft;
            const quoteCount = tender.quotes?.length || 0;

            return html`
              <div
                key=${tender.id}
                onClick=${() => navigate('/proveedores/licitaciones/' + tender.id)}
                style=${{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 22, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(16,24,40,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style=${{ flex: 1 }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <h3 style=${{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${tender.title}</h3>
                      <span style=${{ fontSize: 12, fontWeight: 600, color: info.color, background: info.bg, padding: '2px 10px', borderRadius: 99 }}>${info.label}</span>
                    </div>
                    <div style=${{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                      Proyecto: <span style=${{ color: '#374151', fontWeight: 500 }}>${project?.title || '—'}</span>
                      · Cierre: <span style=${{ color: '#374151' }}>${formatDate(tender.deadline)}</span>
                      · ${quoteCount} cotización${quoteCount !== 1 ? 'es' : ''} recibida${quoteCount !== 1 ? 's' : ''}
                    </div>
                    <!-- Invited suppliers -->
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style=${{ fontSize: 11, color: '#9CA3AF' }}>Invitados:</span>
                      ${invited.map(s => html`
                        <span key=${s.id} style=${{ fontSize: 11, fontWeight: 600, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>${s.name}</span>
                      `)}
                    </div>
                  </div>
                  <!-- Items count -->
                  <div style=${{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div style=${{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>${tender.items?.length || 0}</div>
                    <div style=${{ fontSize: 11, color: '#9CA3AF' }}>ítem${(tender.items?.length || 0) !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      `}
    </div>
  `;
}
