import { useParams } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function CRMClienteDetalle() {
  const { id } = useParams();
  return html`<div><${PageHeader} title="Detalle de Cliente" subtitle=${"Cliente " + id} /><${EmptyState} icon="◎" title="En construcción" description="El detalle de cliente estará disponible próximamente." /></div>`;
}
