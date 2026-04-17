import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Timesheets() {
  return html`<div><${PageHeader} title="Timesheets" subtitle="Carga semanal de horas" /><${EmptyState} icon="◷" title="Módulo en construcción" description="La grilla semanal de timesheets estará disponible próximamente." /></div>`;
}
