import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Estimaciones() {
  return html`<div><${PageHeader} title="Estimaciones" subtitle="Presupuestos y propuestas comerciales" /><${EmptyState} icon="◧" title="Módulo en construcción" description="La lista de estimaciones estará disponible próximamente." /></div>`;
}
