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
// Single source of truth for "today" in the demo — bump here to advance the demo date
export const TODAY = '2026-04-17';

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
  const now = new Date(TODAY + 'T12:00:00');
  const then = new Date(isoStr);
  const mins = Math.round((now - then) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  return `hace ${days} d`;
}

// ── Avatar color from name ────────────────────────────────────────────────────
// Uses Tailwind-v4 500 palette colors that are all in the design system
const AVATAR_COLORS = ['#8E51FF', '#00BC7D', '#FE9A00', '#FF2056', '#00B8DB', '#E12AFB', '#0046F3', '#FF8041'];
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
  active:      { label: 'Activo',       color: '#0046F3', bg: '#E0E6F6' },
  in_review:   { label: 'En Revisión',  color: '#FF8041', bg: '#FEF3C6' },
  completed:   { label: 'Completado',   color: '#6B7280', bg: '#F3F4F6' },
  paused:      { label: 'En pausa',     color: '#6B7280', bg: '#F3F4F6' },
  draft:       { label: 'Borrador',     color: '#6B7280', bg: '#F3F4F6' },
  cancelled:   { label: 'Cancelado',    color: '#FF6467', bg: '#FFE2E2' },
};

export const ESTIMATE_STATUS = {
  draft:              { label: 'Borrador',              color: '#6B7280', bg: '#F3F4F6' },
  internal_review:    { label: 'En Revisión',           color: '#FF8041', bg: '#FEF3C6' },
  approved_internal:  { label: 'Aprobada Internamente', color: '#009966', bg: '#D0FAE5' },
  sent_client:        { label: 'Enviada al Cliente',    color: '#0046F3', bg: '#E0E6F6' },
  approved_client:    { label: 'Aprobada',              color: '#007A55', bg: '#D0FAE5' },
  rejected:           { label: 'Rechazada',             color: '#FF6467', bg: '#FFE2E2' },
};

export const INVOICE_STATUS = {
  pending: { label: 'Pendiente', color: '#FF8041', bg: '#FEF3C6' },
  issued:  { label: 'Emitida',   color: '#0046F3', bg: '#E0E6F6' },
  paid:    { label: 'Pagada',    color: '#007A55', bg: '#D0FAE5' },
  void:    { label: 'Anulada',   color: '#FF6467', bg: '#FFE2E2' },
};

export const TIMESHEET_STATUS = {
  draft:    { label: 'Borrador',  color: '#6B7280', bg: '#F3F4F6' },
  pending:  { label: 'Pendiente', color: '#FF8041', bg: '#FEF3C6' },
  approved: { label: 'Aprobado',  color: '#007A55', bg: '#D0FAE5' },
  rejected: { label: 'Rechazado', color: '#FF6467', bg: '#FFE2E2' },
};

export const LEAVE_TYPE = {
  vacation:     'Vacaciones',
  sick:         'Enfermedad',
  personal:     'Personal',
  compensatory: 'Compensatorio',
};

export const LEAVE_STATUS = {
  approved: { label: 'Aprobada',  color: '#009966', bg: '#D0FAE5' },
  pending:  { label: 'Pendiente', color: '#FF8041', bg: '#FEF3C6' },
  rejected: { label: 'Rechazada', color: '#FF6467', bg: '#FFE2E2' },
};

export const TASK_STATUS = {
  done:        { label: 'Completada',   color: '#009966', bg: '#D0FAE5' },
  in_progress: { label: 'En Progreso',  color: '#0046F3', bg: '#E0E6F6' },
  pending:     { label: 'Pendiente',    color: '#6B7280', bg: '#F3F4F6' },
};

export const CRM_STAGES = {
  prospect:    { label: 'Prospecto',    color: '#6B7280' },
  qualified:   { label: 'Calificado',   color: '#00B8DB' },
  proposal:    { label: 'Propuesta',    color: '#8E51FF' },
  negotiation: { label: 'Negociación',  color: '#FF8041' },
  won:         { label: 'Ganado',       color: '#007A55', bg: '#C6EE6A' },
  lost:        { label: 'Perdido',      color: '#FF6467', bg: '#FFE2E2' },
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
