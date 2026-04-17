// ── Number formatting ─────────────────────────────────────────────────────────
export function formatARS(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}
export function formatUSD(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
export function formatCurrency(n, currency = 'ARS') {
  return currency === 'USD' ? formatUSD(n) : formatARS(n);
}
export function formatNumber(n) {
  return new Intl.NumberFormat('es-AR').format(n);
}
export function formatPct(n) {
  return `${Math.round(n)}%`;
}

// ── Date utilities ────────────────────────────────────────────────────────────
export function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { monday, friday };
}

export function getWeekDays(date = new Date()) {
  const { monday } = getWeekRange(date);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getMonthGrid(year, month) {
  // Returns array of weeks, each week is array of 7 days (null for padding)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Mon=0
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function toISO(date) {
  return date.toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

export function formatWeekLabel(date) {
  const { monday, friday } = getWeekRange(date);
  const opts = { day: 'numeric', month: 'short' };
  return `${monday.toLocaleDateString('es-AR', opts)} – ${friday.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })}`;
}

export function formatTimeAgo(isoStr) {
  const now = new Date('2026-04-17T12:00:00');
  const then = new Date(isoStr);
  const mins = Math.round((now - then) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  return `hace ${days} d`;
}

// ── Avatar color from name ────────────────────────────────────────────────────
const AVATAR_COLORS = ['#2A2AFF','#7C3AED','#059669','#D97706','#DC2626','#0891B2','#BE185D','#065F46'];
export function avatarColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Status labels ─────────────────────────────────────────────────────────────
export const PROJECT_STATUS = {
  active:      { label: 'Activo',       color: '#2A2AFF', bg: '#EEF0FF' },
  in_review:   { label: 'En Revisión',  color: '#FF6B2B', bg: '#FFF0EB' },
  completed:   { label: 'Completado',   color: '#6B6B80', bg: '#F0F0F5' },
  draft:       { label: 'Borrador',     color: '#6B6B80', bg: '#F0F0F5' },
  cancelled:   { label: 'Cancelado',    color: '#FF3B3B', bg: '#FFECEC' },
};

export const ESTIMATE_STATUS = {
  draft:              { label: 'Borrador',              color: '#6B6B80', bg: '#F0F0F5' },
  internal_review:    { label: 'En Revisión',           color: '#FF6B2B', bg: '#FFF0EB' },
  approved_internal:  { label: 'Aprobada Internamente', color: '#059669', bg: '#F0FDF4' },
  sent_client:        { label: 'Enviada al Cliente',    color: '#2A2AFF', bg: '#EEF0FF' },
  approved_client:    { label: 'Aprobada',              color: '#0A0A0A', bg: '#CCFF44' },
  rejected:           { label: 'Rechazada',             color: '#FF3B3B', bg: '#FFECEC' },
};

export const INVOICE_STATUS = {
  pending: { label: 'Pendiente', color: '#FF6B2B', bg: '#FFF0EB' },
  issued:  { label: 'Emitida',   color: '#2A2AFF', bg: '#EEF0FF' },
  paid:    { label: 'Pagada',    color: '#0A0A0A', bg: '#CCFF44' },
  void:    { label: 'Anulada',   color: '#FF3B3B', bg: '#FFECEC' },
};

export const TIMESHEET_STATUS = {
  draft:    { label: 'Borrador',  color: '#6B6B80', bg: '#F0F0F5' },
  pending:  { label: 'Pendiente', color: '#FF6B2B', bg: '#FFF0EB' },
  approved: { label: 'Aprobado',  color: '#0A0A0A', bg: '#CCFF44' },
  rejected: { label: 'Rechazado', color: '#FF3B3B', bg: '#FFECEC' },
};

export const LEAVE_TYPE = {
  vacation:     'Vacaciones',
  sick:         'Enfermedad',
  personal:     'Personal',
  compensatory: 'Compensatorio',
};

export const LEAVE_STATUS = {
  approved: { label: 'Aprobada',  color: '#2A2AFF', bg: '#EEF0FF' },
  pending:  { label: 'Pendiente', color: '#FF6B2B', bg: '#FFF0EB' },
  rejected: { label: 'Rechazada', color: '#FF3B3B', bg: '#FFECEC' },
};

export const TASK_STATUS = {
  done:        { label: 'Completada',   color: '#059669', bg: '#F0FDF4' },
  in_progress: { label: 'En Progreso',  color: '#2A2AFF', bg: '#EEF0FF' },
  pending:     { label: 'Pendiente',    color: '#6B6B80', bg: '#F0F0F5' },
};

export const CRM_STAGES = {
  prospect:    { label: 'Prospecto',    color: '#6B6B80' },
  qualified:   { label: 'Calificado',   color: '#0891B2' },
  proposal:    { label: 'Propuesta',    color: '#7C3AED' },
  negotiation: { label: 'Negociación',  color: '#FF6B2B' },
  won:         { label: 'Ganado',       color: '#0A0A0A', bg: '#CCFF44' },
  lost:        { label: 'Perdido',      color: '#FF3B3B', bg: '#FFECEC' },
};

// ── Permissions ───────────────────────────────────────────────────────────────
export function hasPermission(role, action) {
  const perms = {
    Director:        ['view_all', 'approve_timesheets', 'approve_estimates', 'view_finance', 'view_pending_timesheets'],
    'Account Manager':['view_all', 'approve_estimates', 'view_finance'],
    Finance:         ['view_all', 'view_finance', 'approve_invoices'],
    Creative:        ['view_own'],
  };
  return (perms[role] || []).includes(action);
}
