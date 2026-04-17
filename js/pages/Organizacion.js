import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Organizacion() {
  return html`<div><${PageHeader} title="Organización" subtitle="Configuración del estudio" /><${EmptyState} icon="◈" title="Módulo en construcción" description="La configuración de organización estará disponible próximamente." /></div>`;
}
