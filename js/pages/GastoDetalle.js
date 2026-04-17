import { useParams } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function GastoDetalle() {
  const { id } = useParams();
  return html`<div><${PageHeader} title="Hoja de Gastos" subtitle=${"Detalle " + id} /><${EmptyState} icon="💳" title="En construcción" description="El detalle de hoja de gastos estará disponible próximamente." /></div>`;
}
