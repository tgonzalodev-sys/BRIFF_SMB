import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Proveedores() {
  return html`<div><${PageHeader} title="Proveedores" subtitle="Directorio de proveedores y terceros" /><${EmptyState} icon="⬡" title="Módulo en construcción" description="El directorio de proveedores estará disponible próximamente." /></div>`;
}
