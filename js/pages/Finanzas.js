import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import ViewToggle from '../components/ui/ViewToggle.js';
import { useAppState } from '../context.js';
import { formatARS, formatPct, initials } from '../lib/utils.js';

// Compute P&L derived values
function enrichPnl(row) {
  const costo_total  = row.costo_recursos + row.costos_terceros + row.gastos;
  const margen_bruto = row.ingresos - costo_total;
  const margen_pct   = row.ingresos > 0 ? (margen_bruto / row.ingresos) * 100 : 0;
  return { ...row, costo_total, margen_bruto, margen_pct };
}

function fmtM(n) { return '$' + (n / 1_000_000).toFixed(1) + 'M'; }

function KpiCard({ label, value, sub, color }) {
  return html`
    <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
      <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>${label}</div>
      <div style=${{ fontSize: 22, fontWeight: 700, color: color || '#111827', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>${value}</div>
      ${sub && html`<div style=${{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>${sub}</div>`}
    </div>
  `;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return html`
    <div style=${{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}>
      <div style=${{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>${label}</div>
      ${payload.map(p => html`
        <div key=${p.dataKey} style=${{ display: 'flex', justifyContent: 'space-between', gap: 16, color: p.color, fontWeight: 500 }}>
          <span>${p.name}</span>
          <span>${formatARS(p.value)}</span>
        </div>
      `)}
    </div>
  `;
}

function OverviewTab({ pnlData, pnlRows }) {
  const totalIngresos = pnlRows.reduce((s, r) => s + r.ingresos, 0);
  const totalMargen   = pnlRows.reduce((s, r) => s + r.margen_bruto, 0);
  const avgMargenPct  = totalIngresos > 0 ? (totalMargen / totalIngresos) * 100 : 0;
  const bestMonth     = [...pnlRows].sort((a, b) => b.margen_pct - a.margen_pct)[0];

  // Chart data: stack costs
  const chartData = pnlRows.map(r => ({
    month: r.month,
    Ingresos: r.ingresos,
    'Costo RRHH': r.costo_recursos,
    'Costos Terceros': r.costos_terceros,
    'Gastos': r.gastos,
    margen_pct: Math.round(r.margen_pct),
  }));

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <!-- KPIs -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <${KpiCard} label="Ingresos YTD" value=${fmtM(totalIngresos)} color="#0046F3" />
        <${KpiCard} label="Margen Bruto YTD" value=${fmtM(totalMargen)} color="#009966" sub=${formatARS(totalMargen)} />
        <${KpiCard} label="Margen % Promedio" value=${formatPct(avgMargenPct)} color=${avgMargenPct >= 40 ? '#009966' : '#FD9A00'} />
        <${KpiCard} label="Mejor Mes" value=${bestMonth?.month} sub=${formatPct(bestMonth?.margen_pct)} color="#0046F3" />
      </div>

      <!-- Stacked bar chart -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '20px 20px 12px' }}>
        <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Ingresos vs Costos por Mes</div>
        <${ResponsiveContainer} width="100%" height=${260}>
          <${BarChart} data=${chartData} barGap=${4}>
            <${CartesianGrid} strokeDasharray="3 3" stroke="#F3F4F6" vertical=${false} />
            <${XAxis} dataKey="month" tick=${{ fontSize: 12, fill: '#6B7280' }} axisLine=${false} tickLine=${false} />
            <${YAxis} tickFormatter=${v => '$' + (v/1e6).toFixed(1) + 'M'} tick=${{ fontSize: 11, fill: '#9CA3AF' }} axisLine=${false} tickLine=${false} width=${60} />
            <${Tooltip} content=${CustomTooltip} />
            <${Legend} wrapperStyle=${{ fontSize: 12, paddingTop: 8 }} />
            <${Bar} dataKey="Ingresos" fill="#0046F3" radius=${[4,4,0,0]} />
            <${Bar} dataKey="Costo RRHH" fill="#FF6467" radius=${[4,4,0,0]} stackId="costs" />
            <${Bar} dataKey="Costos Terceros" fill="#FD9A00" radius=${[0,0,0,0]} stackId="costs" />
            <${Bar} dataKey="Gastos" fill="#E5E7EB" radius=${[0,0,4,4]} stackId="costs" />
          </${BarChart}>
        </${ResponsiveContainer}>
      </div>

      <!-- P&L Table -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Estado de Resultados (P&L)</h3>
        </div>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style=${{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concepto</th>
              ${pnlRows.map(r => html`
                <th key=${r.month} style=${{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${r.month}</th>
              `)}
              <th style=${{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${[
              { key: 'ingresos',       label: 'Ingresos',          color: '#0046F3', bold: true },
              { key: 'costo_recursos', label: '(-) Costo RRHH',    color: '#FF6467' },
              { key: 'costos_terceros',label: '(-) Costos Terceros',color: '#FD9A00' },
              { key: 'gastos',         label: '(-) Gastos Operat.', color: '#9CA3AF' },
              { key: 'costo_total',    label: 'Total Costos',       color: '#374151', border: true },
              { key: 'margen_bruto',   label: 'Margen Bruto',       color: '#009966', bold: true, border: true },
              { key: 'margen_pct',     label: 'Margen %',           color: '#009966', isPct: true, bold: true },
            ].map(row => html`
              <tr key=${row.key} style=${{ borderBottom: '1px solid #F3F4F6', borderTop: row.border ? '2px solid #E5E7EB' : 'none' }}>
                <td style=${{ padding: '10px 20px', fontSize: 13, fontWeight: row.bold ? 600 : 400, color: row.color || '#374151' }}>${row.label}</td>
                ${pnlRows.map(r => html`
                  <td key=${r.month} style=${{ padding: '10px 16px', textAlign: 'right', fontWeight: row.bold ? 600 : 400, color: row.color || '#374151', fontFamily: 'Space Grotesk, sans-serif' }}>
                    ${row.isPct ? formatPct(r[row.key]) : formatARS(r[row.key])}
                  </td>
                `)}
                <td style=${{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: row.color || '#374151', fontFamily: 'Space Grotesk, sans-serif', background: '#FAFAFA' }}>
                  ${row.isPct
                    ? formatPct(pnlRows.reduce((s,r) => s + r.ingresos, 0) > 0 ? (pnlRows.reduce((s,r) => s + r.margen_bruto, 0) / pnlRows.reduce((s,r) => s + r.ingresos, 0)) * 100 : 0)
                    : formatARS(pnlRows.reduce((s,r) => s + r[row.key], 0))
                  }
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function ProjectRow({ p, projects, clients, last }) {
  const project = projects.find(pr => pr.id === p.project);
  const client  = clients.find(c => c.id === project?.client);
  const desvioColor = p.desvio > 0 ? '#FF6467' : '#009966';
  const marginColor = p.margen_pct >= 40 ? '#009966' : p.margen_pct >= 30 ? '#FD9A00' : '#FF6467';
  return html`
    <tr key=${p.project} style=${{ borderBottom: !last ? '1px solid #F3F4F6' : 'none' }}>
      <td style=${{ padding: '12px 16px', fontWeight: 600, color: '#111827', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${project?.title || p.project}</td>
      <td style=${{ padding: '12px 16px', color: '#6B7280', fontSize: 12 }}>${client?.name || '—'}</td>
      <td style=${{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(p.ingresos)}</td>
      <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>${formatARS(p.costo_real)}</td>
      <td style=${{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#009966', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(p.margen)}</td>
      <td style=${{ padding: '12px 16px', textAlign: 'right' }}>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <div style=${{ width: 48, height: 5, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style=${{ height: '100%', width: Math.min(p.margen_pct, 100) + '%', background: marginColor, borderRadius: 99 }} />
          </div>
          <span style=${{ fontWeight: 700, color: marginColor, minWidth: 36 }}>${formatPct(p.margen_pct)}</span>
        </div>
      </td>
      <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${p.planned_hours}h</td>
      <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${p.actual_hours}h</td>
      <td style=${{ padding: '12px 16px', textAlign: 'right' }}>
        <span style=${{ fontWeight: 600, color: desvioColor, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          ${p.desvio > 0 ? '+' : ''}${p.desvio}h
        </span>
      </td>
    </tr>
  `;
}

function RentabilidadTab({ profitability, projects, clients }) {
  const [rentView, setRentView] = useState('proyecto');
  const [expandedClient, setExpandedClient] = useState(null);

  // Build per-client aggregation for "Por Cliente" view
  const clientGroups = clients.map(client => {
    const clientProjects = profitability.filter(p => {
      const proj = projects.find(pr => pr.id === p.project);
      return proj?.client === client.id;
    });
    if (!clientProjects.length) return null;
    const totalIngresos  = clientProjects.reduce((s, p) => s + p.ingresos, 0);
    const totalCosto     = clientProjects.reduce((s, p) => s + p.costo_real, 0);
    const totalMargen    = clientProjects.reduce((s, p) => s + p.margen, 0);
    const avgMargenPct   = totalIngresos > 0 ? (totalMargen / totalIngresos) * 100 : 0;
    const totalPlanned   = clientProjects.reduce((s, p) => s + p.planned_hours, 0);
    const totalActual    = clientProjects.reduce((s, p) => s + p.actual_hours, 0);
    const totalDesvio    = totalActual - totalPlanned;
    return { client, projects: clientProjects, totalIngresos, totalCosto, totalMargen, avgMargenPct, totalPlanned, totalActual, totalDesvio };
  }).filter(Boolean);

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <!-- Summary KPIs -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <${KpiCard} label="Proyectos Activos" value=${profitability.length} />
        <${KpiCard} label="Ingresos Total" value=${fmtM(profitability.reduce((s,p) => s+p.ingresos, 0))} color="#0046F3" />
        <${KpiCard} label="Margen Promedio" value=${formatPct(profitability.reduce((s,p) => s+p.margen_pct, 0) / profitability.length)} color="#009966" />
        <${KpiCard}
          label="Proyectos en Riesgo"
          value=${profitability.filter(p => p.desvio > 0).length}
          sub="horas sobregiradas"
          color="#FF6467"
        />
      </div>

      <!-- View toggle + table -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Rentabilidad</h3>
          <${ViewToggle}
            tabs=${[{ key: 'proyecto', label: 'Por Proyecto' }, { key: 'cliente', label: 'Por Cliente' }]}
            active=${rentView}
            onChange=${setRentView}
          />
        </div>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Proyecto','Cliente','Ingresos','Costo Real','Margen','Margen %','Hs Plan.','Hs Real','Desvío'].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: h === 'Proyecto' || h === 'Cliente' ? 'left' : 'right', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${rentView === 'proyecto'
              ? profitability.map((p, i) => html`<${ProjectRow} key=${p.project} p=${p} projects=${projects} clients=${clients} last=${i === profitability.length - 1} />`)
              : clientGroups.flatMap(cg => {
                  const isExpanded = expandedClient === cg.client.id;
                  const desvioColor = cg.totalDesvio > 0 ? '#FF6467' : '#009966';
                  const marginColor = cg.avgMargenPct >= 40 ? '#009966' : cg.avgMargenPct >= 30 ? '#FD9A00' : '#FF6467';
                  const headerRow = html`
                    <tr key=${'cg-' + cg.client.id}
                      onClick=${() => setExpandedClient(isExpanded ? null : cg.client.id)}
                      style=${{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer' }}
                      onMouseEnter=${e => e.currentTarget.style.background = '#F3F4F6'}
                      onMouseLeave=${e => e.currentTarget.style.background = '#F9FAFB'}
                    >
                      <td style=${{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>
                        <span style=${{ marginRight: 8, fontSize: 11, color: '#9CA3AF' }}>${isExpanded ? '▾' : '▸'}</span>
                        ${cg.client.name}
                        <span style=${{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginLeft: 6 }}>${cg.projects.length} proyecto${cg.projects.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td style=${{ padding: '12px 16px', color: '#9CA3AF', fontSize: 12 }}>—</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(cg.totalIngresos)}</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>${formatARS(cg.totalCosto)}</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#009966', fontFamily: 'Space Grotesk, sans-serif' }}>${formatARS(cg.totalMargen)}</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style=${{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <div style=${{ width: 48, height: 5, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                            <div style=${{ height: '100%', width: Math.min(cg.avgMargenPct, 100) + '%', background: marginColor, borderRadius: 99 }} />
                          </div>
                          <span style=${{ fontWeight: 700, color: marginColor, minWidth: 36 }}>${formatPct(cg.avgMargenPct)}</span>
                        </div>
                      </td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${cg.totalPlanned}h</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${cg.totalActual}h</td>
                      <td style=${{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style=${{ fontWeight: 600, color: desvioColor, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                          ${cg.totalDesvio > 0 ? '+' : ''}${cg.totalDesvio}h
                        </span>
                      </td>
                    </tr>
                  `;
                  const subRows = isExpanded ? cg.projects.map(p => html`
                    <tr key=${'sub-' + p.project} style=${{ borderBottom: '1px solid #F3F4F6', background: '#FAFBFF' }}>
                      <td style=${{ padding: '10px 16px 10px 40px', color: '#374151', fontSize: 12 }}>
                        ${projects.find(pr => pr.id === p.project)?.title || p.project}
                      </td>
                      <td style=${{ padding: '10px 16px', color: '#9CA3AF', fontSize: 12 }}></td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right', color: '#0046F3', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12 }}>${formatARS(p.ingresos)}</td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right', color: '#6B7280', fontSize: 12 }}>${formatARS(p.costo_real)}</td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right', color: '#009966', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12 }}>${formatARS(p.margen)}</td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right' }}>
                        <span style=${{ fontSize: 12, fontWeight: 600, color: p.margen_pct >= 40 ? '#009966' : p.margen_pct >= 30 ? '#FD9A00' : '#FF6467' }}>${formatPct(p.margen_pct)}</span>
                      </td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${p.planned_hours}h</td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${p.actual_hours}h</td>
                      <td style=${{ padding: '10px 16px', textAlign: 'right' }}>
                        <span style=${{ fontWeight: 600, color: p.desvio > 0 ? '#FF6467' : '#009966', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                          ${p.desvio > 0 ? '+' : ''}${p.desvio}h
                        </span>
                      </td>
                    </tr>
                  `) : [];
                  return [headerRow, ...subRows];
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function UtilizacionTab({ utilization, users }) {
  const TARGET = 70;
  const avgUtil = Math.round(utilization.reduce((s,u) => s + u.utilization_pct, 0) / utilization.length);

  const chartData = utilization.map(u => {
    const user = users.find(usr => usr.id === u.user);
    return { name: user?.name.split(' ')[0] || u.user, billable: u.billable, non_billable: u.non_billable, pct: u.utilization_pct };
  });

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <${KpiCard} label="Utilización Promedio" value=${formatPct(avgUtil)} color=${avgUtil >= TARGET ? '#009966' : '#FD9A00'} sub=${'Target: ' + TARGET + '%'} />
        <${KpiCard} label="Por encima del target" value=${utilization.filter(u => u.utilization_pct >= TARGET).length} sub="personas" color="#009966" />
        <${KpiCard} label="Por debajo del target" value=${utilization.filter(u => u.utilization_pct < TARGET).length} sub="personas" color="#FF6467" />
        <${KpiCard} label="Total Horas Facturables" value=${utilization.reduce((s,u) => s+u.billable, 0) + 'h'} color="#0046F3" />
      </div>

      <!-- Utilization chart -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: '20px 20px 12px' }}>
        <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Horas por Persona (mes)</div>
        <${ResponsiveContainer} width="100%" height=${220}>
          <${BarChart} data=${chartData} barGap=${4}>
            <${CartesianGrid} strokeDasharray="3 3" stroke="#F3F4F6" vertical=${false} />
            <${XAxis} dataKey="name" tick=${{ fontSize: 12, fill: '#6B7280' }} axisLine=${false} tickLine=${false} />
            <${YAxis} tick=${{ fontSize: 11, fill: '#9CA3AF' }} axisLine=${false} tickLine=${false} />
            <${Tooltip} />
            <${Legend} wrapperStyle=${{ fontSize: 12, paddingTop: 8 }} />
            <${Bar} dataKey="billable" name="Facturable" fill="#0046F3" radius=${[4,4,0,0]} stackId="hours" />
            <${Bar} dataKey="non_billable" name="No facturable" fill="#E5E7EB" radius=${[0,0,4,4]} stackId="hours" />
          </${BarChart}>
        </${ResponsiveContainer}>
      </div>

      <!-- Utilization table -->
      <div style=${{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style=${{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style=${{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>Detalle de Utilización — Abril 2026</h3>
        </div>
        <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style=${{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              ${['Persona','Disponibles','Facturables','No Facturables','Utilización'].map(h => html`
                <th key=${h} style=${{ padding: '10px 16px', textAlign: h === 'Persona' ? 'left' : 'right', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${utilization.map((u, i) => {
              const user = users.find(usr => usr.id === u.user);
              const color = u.utilization_pct >= TARGET ? '#009966' : u.utilization_pct >= 50 ? '#FD9A00' : '#FF6467';
              return html`
                <tr key=${u.user} style=${{ borderBottom: i < utilization.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style=${{ padding: '12px 16px' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style=${{ width: 28, height: 28, borderRadius: '50%', background: user?.avatar_color || '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                        ${user ? initials(user.name) : '?'}
                      </div>
                      <div>
                        <div style=${{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${user?.name || u.user}</div>
                        <div style=${{ fontSize: 11, color: '#9CA3AF' }}>${user?.typology || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${u.available_hours}h</td>
                  <td style=${{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#0046F3', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${u.billable}h</td>
                  <td style=${{ padding: '12px 16px', textAlign: 'right', color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${u.non_billable}h</td>
                  <td style=${{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <div style=${{ width: 80, height: 6, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden', position: 'relative' }}>
                        <div style=${{ height: '100%', width: u.utilization_pct + '%', background: color, borderRadius: 99 }} />
                        <div style=${{ position: 'absolute', top: 0, bottom: 0, left: TARGET + '%', width: 1.5, background: '#374151' }} />
                      </div>
                      <span style=${{ fontWeight: 700, color, minWidth: 36 }}>${formatPct(u.utilization_pct)}</span>
                    </div>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
        <div style=${{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style=${{ display: 'inline-block', width: 16, height: 2, background: '#374151', verticalAlign: 'middle' }} />
          Línea de target: ${TARGET}%
        </div>
      </div>
    </div>
  `;
}

export default function Finanzas() {
  const { pnlData, projectProfitability, teamUtilization, projects, clients, users } = useAppState();
  const [tab, setTab] = useState('overview');

  const pnlRows = (pnlData || []).map(enrichPnl);

  const tabs = [
    { key: 'overview',      label: 'Overview P&L' },
    { key: 'rentabilidad',  label: 'Rentabilidad' },
    { key: 'utilizacion',   label: 'Utilización' },
  ];

  const tabBtn = (key, label) => html`
    <button
      key=${key}
      onClick=${() => setTab(key)}
      style=${{
        padding: '7px 18px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        background: tab === key ? '#fff' : 'transparent',
        color: tab === key ? '#111827' : '#6B7280',
        boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >${label}</button>
  `;

  return html`
    <div>
      <${PageHeader}
        title="Finanzas & Reportes"
        subtitle="P&L, rentabilidad y utilización del equipo"
        actions=${html`
          <div style=${{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
            ${tabs.map(t => tabBtn(t.key, t.label))}
          </div>
        `}
      />

      ${tab === 'overview'     && html`<${OverviewTab}      pnlData=${pnlData} pnlRows=${pnlRows} />`}
      ${tab === 'rentabilidad' && html`<${RentabilidadTab}  profitability=${projectProfitability || []} projects=${projects} clients=${clients} />`}
      ${tab === 'utilizacion'  && html`<${UtilizacionTab}   utilization=${teamUtilization || []} users=${users} />`}
    </div>
  `;
}
