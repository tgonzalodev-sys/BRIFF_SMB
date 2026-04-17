import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function CRMPipeline() {
  return html`<div><${PageHeader} title="Pipeline" subtitle="Oportunidades comerciales" /><${EmptyState} icon="◎" title="Módulo en construcción" description="El pipeline de CRM estará disponible próximamente." /></div>`;
}
