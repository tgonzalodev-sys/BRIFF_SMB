import { useParams } from 'react-router-dom';
import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function EstimacionDetalle() {
  const { id } = useParams();
  return html`<div><${PageHeader} title="Editor de Estimación" subtitle=${"Estimación " + id} /><${EmptyState} icon="◧" title="En construcción" description="El editor de estimaciones estará disponible próximamente." /></div>`;
}
