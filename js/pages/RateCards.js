import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function RateCards() {
  return html`<div><${PageHeader} title="Rate Cards" subtitle="Tarifas por typología de recurso" /><${EmptyState} icon="◨" title="Módulo en construcción" description="Las rate cards estarán disponibles próximamente." /></div>`;
}
