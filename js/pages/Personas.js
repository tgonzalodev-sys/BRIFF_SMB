import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Personas() {
  return html`<div><${PageHeader} title="Personas" subtitle="Equipo del estudio" /><${EmptyState} icon="◉" title="Módulo en construcción" description="La gestión de personas estará disponible próximamente." /></div>`;
}
