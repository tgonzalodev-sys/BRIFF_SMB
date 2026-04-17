import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function OrdenesCompra() {
  return html`<div><${PageHeader} title="Órdenes de Compra" subtitle="OCs generadas a proveedores" /><${EmptyState} icon="◱" title="Módulo en construcción" description="Las órdenes de compra estarán disponibles próximamente." /></div>`;
}
