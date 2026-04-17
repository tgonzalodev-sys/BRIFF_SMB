import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Proyectos() {
  return html`<div><${PageHeader} title="Proyectos" subtitle="Gestión de proyectos del estudio" /><${EmptyState} icon="◻" title="Módulo en construcción" description="La vista de proyectos estará disponible próximamente." /></div>`;
}
