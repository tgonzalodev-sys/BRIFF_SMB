import { html } from '../lib/html.js';
import PageHeader from '../components/ui/PageHeader.js';
import EmptyState from '../components/ui/EmptyState.js';
export default function Dashboard() {
  return html`<div><${PageHeader} title="Dashboard" subtitle="Resumen ejecutivo del estudio" /><${EmptyState} icon="📊" title="Dashboard en construcción" description="El dashboard completo estará disponible en la siguiente iteración." /></div>`;
}
