import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Gastos() {
  return html`<div><${PageHeader} title="Gastos" subtitle="Hojas de gastos y reembolsos" /><${EmptyState} icon="💳" title="Módulo en construcción" description="La gestión de gastos estará disponible próximamente." /></div>`;
}
