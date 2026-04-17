import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Typologias() {
  return html`<div><${PageHeader} title="Typologías" subtitle="Roles y tarifas base del equipo" /><${EmptyState} icon="◉" title="Módulo en construcción" description="Las typologías estarán disponibles próximamente." /></div>`;
}
