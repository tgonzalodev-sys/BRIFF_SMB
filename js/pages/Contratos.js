import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Contratos() {
  return html`<div><${PageHeader} title="Contratos" subtitle="Contratos y acuerdos comerciales" /><${EmptyState} icon="◨" title="Módulo en construcción" description="La gestión de contratos estará disponible próximamente." /></div>`;
}
