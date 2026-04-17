import { html } from '../../lib/html.js';
import { PROJECT_STATUS, ESTIMATE_STATUS, INVOICE_STATUS, TIMESHEET_STATUS, LEAVE_STATUS, TASK_STATUS } from '../../lib/utils.js';

const STATUS_MAPS = { project: PROJECT_STATUS, estimate: ESTIMATE_STATUS, invoice: INVOICE_STATUS, timesheet: TIMESHEET_STATUS, leave: LEAVE_STATUS, task: TASK_STATUS };

export default function StatusBadge({ status, variant = 'project', size = 'sm' }) {
  const map = STATUS_MAPS[variant] || {};
  const info = map[status] || { label: status, color: '#6B6B80', bg: '#F0F0F5' };
  const pad = size === 'sm' ? '2px 10px' : '4px 14px';
  const fontSize = size === 'sm' ? '12px' : '13px';
  return html`
    <span style=${{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: pad, borderRadius: '20px', background: info.bg || '#F0F0F5', color: info.color, fontSize, fontWeight: 500, lineHeight: '20px', whiteSpace: 'nowrap' }}>
      <span style=${{ width: 6, height: 6, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
      ${info.label}
    </span>
  `;
}
