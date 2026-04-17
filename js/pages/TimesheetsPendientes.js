import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function TimesheetsPendientes() {
  return html`<div><${PageHeader} title="Timesheets Pendientes" subtitle="Timesheets sin enviar del equipo" /><${EmptyState} icon="◷" title="Módulo en construcción" description="La vista de timesheets pendientes estará disponible próximamente." /></div>`;
}
