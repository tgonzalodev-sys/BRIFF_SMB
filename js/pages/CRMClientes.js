import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function CRMClientes() {
  return html`<div><${PageHeader} title="Clientes" subtitle="Directorio de clientes" /><${EmptyState} icon="◎" title="Módulo en construcción" description="El directorio de clientes estará disponible próximamente." /></div>`;
}
