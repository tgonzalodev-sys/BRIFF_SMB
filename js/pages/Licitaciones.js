import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Licitaciones() {
  return html`<div><${PageHeader} title="Licitaciones" subtitle="Pedidos de cotización a proveedores" /><${EmptyState} icon="⬡" title="Módulo en construcción" description="Las licitaciones estarán disponibles próximamente." /></div>`;
}
