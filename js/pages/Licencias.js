import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Licencias() {
  return html`<div><${PageHeader} title="Licencias" subtitle="Gestión de ausencias y vacaciones" /><${EmptyState} icon="⛱" title="Módulo en construcción" description="El calendario de licencias estará disponible próximamente." /></div>`;
}
