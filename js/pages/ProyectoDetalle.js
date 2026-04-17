import { useParams } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function ProyectoDetalle() {
  const { id } = useParams();
  return html`<div><${PageHeader} title=${"Proyecto " + id} subtitle="Detalle del proyecto" /><${EmptyState} icon="◻" title="Detalle en construcción" description="El detalle completo del proyecto estará disponible próximamente." /></div>`;
}
