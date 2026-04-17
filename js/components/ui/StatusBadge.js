import { html } from '../../lib/html.js';
import { PROJECT_STATUS, ESTIMATE_STATUS, INVOICE_STATUS, TIMESHEET_STATUS, LEAVE_STATUS, TASK_STATUS } from '../../lib/utils.js';

const STATUS_MAPS = { project: PROJECT_STATUS, estimate: ESTIMATE_STATUS, invoice: INVOICE_STATUS, timesheet: TIMESHEET_STATUS, leave: LEAVE_STATUS, task: TASK_STATUS };

export default function StatusBadge({ status, variant = 'project', size = 'sm' }) {
  const map  = STATUS_MAPS[variant] || {};
  const info = map[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  const pad  = size === 'sm' ? '2px 8px' : '3px 12px';
  const fs   = size === 'sm' ? 11 : 12;
  return html`
    <span style=${{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: pad, borderRadius: 99, background: info.bg || '#F3F4F6', color: info.color, fontSize: fs, fontWeight: 500, lineHeight: '18px', whiteSpace: 'nowrap' }}>
      <span style=${{ width: 5, height: 5, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
      ${info.label}
    </span>
  `;
}
