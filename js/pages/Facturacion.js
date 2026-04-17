import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Facturacion() {
  return html`<div><${PageHeader} title="Facturación" subtitle="Autorizaciones y órdenes de factura" /><${EmptyState} icon="◱" title="Módulo en construcción" description="La gestión de facturación estará disponible próximamente." /></div>`;
}
