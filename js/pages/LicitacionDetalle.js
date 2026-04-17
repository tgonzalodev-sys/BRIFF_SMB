import { useParams } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function LicitacionDetalle() {
  const { id } = useParams();
  return html`<div><${PageHeader} title="Detalle de Licitación" subtitle=${"Licitación " + id} /><${EmptyState} icon="⬡" title="En construcción" description="El detalle de licitación estará disponible próximamente." /></div>`;
}
