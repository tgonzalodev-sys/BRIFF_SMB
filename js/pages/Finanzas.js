import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Finanzas() {
  return html`<div><${PageHeader} title="Finanzas & Reportes" subtitle="P&L, rentabilidad y utilización del equipo" /><${EmptyState} icon="◰" title="Módulo en construcción" description="Los reportes financieros estarán disponibles próximamente." /></div>`;
}
