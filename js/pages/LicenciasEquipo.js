import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function LicenciasEquipo() {
  return html`<div><${PageHeader} title="Licencias del Equipo" subtitle="Vista semanal de ausencias" /><${EmptyState} icon="⛱" title="Módulo en construcción" description="La vista de equipo estará disponible próximamente." /></div>`;
}
