import { createContext, useContext, useReducer, useEffect } from 'react';
import { html } from './lib/html.js';
import {
  USERS, CLIENTS, PROJECTS, JOBS, TASKS, TIMESHEET_ENTRIES, TIMESHEET_WEEKS,
  LEADS, ESTIMATES, ESTIMATE_DELIVERABLES, ESTIMATE_RESOURCES, ESTIMATE_THIRD_PARTY, ESTIMATE_VERSIONS,
  SUPPLIERS, TENDERS, EXPENSE_SHEETS, EXPENSE_ITEMS,
  LEAVE_REQUESTS, LEAVE_BALANCES, INVOICE_AUTHORIZATIONS, PURCHASE_ORDERS,
  RATE_CARDS, CONTRACTS, NOTIFICATIONS, ACTIVITY_FEED, TYPOLOGIES,
  PNL_DATA, PROJECT_PROFITABILITY, TEAM_UTILIZATION,
  ORGANIZATION
} from './mock-data.js';

const STORAGE_KEY = 'briff_state_v6';

const initialState = {
  currentUser: USERS[0],
  viewAs: 'Director',
  viewAsTier: 'admin',
  notifications: NOTIFICATIONS,
  users: USERS,
  clients: CLIENTS,
  projects: PROJECTS,
  jobs: JOBS,
  tasks: TASKS,
  timesheetEntries: TIMESHEET_ENTRIES,
  timesheetWeeks: TIMESHEET_WEEKS,
  leads: LEADS,
  estimates: ESTIMATES,
  estimateDeliverables: ESTIMATE_DELIVERABLES,
  estimateResources: ESTIMATE_RESOURCES,
  estimateThirdParty: ESTIMATE_THIRD_PARTY,
  estimateVersions: ESTIMATE_VERSIONS,
  suppliers: SUPPLIERS,
  tenders: TENDERS,
  expenseSheets: EXPENSE_SHEETS,
  expenseItems: EXPENSE_ITEMS,
  leaveRequests: LEAVE_REQUESTS,
  leaveBalances: LEAVE_BALANCES,
  invoiceAuthorizations: INVOICE_AUTHORIZATIONS,
  purchaseOrders: PURCHASE_ORDERS,
  rateCards: RATE_CARDS,
  contracts: CONTRACTS,
  activityFeed: ACTIVITY_FEED,
  typologies: TYPOLOGIES,
  pnlData: PNL_DATA,
  projectProfitability: PROJECT_PROFITABILITY,
  teamUtilization: TEAM_UTILIZATION,
  organization: ORGANIZATION,
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER': {
      const user = state.users.find(u => u.id === action.userId);
      return { ...state, currentUser: user, viewAs: user.role, viewAsTier: user.tier };
    }
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };
    case 'UPDATE_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.id ? { ...p, ...action.data } : p) };
    case 'TOGGLE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, status: t.status === 'done' ? 'in_progress' : 'done' } : t) };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'UPSERT_TIMESHEET_ENTRY': {
      const { entry } = action;
      const exists = state.timesheetEntries.find(e => e.user === entry.user && e.project === entry.project && e.job === entry.job && e.date === entry.date);
      if (exists) {
        return { ...state, timesheetEntries: state.timesheetEntries.map(e => e.id === exists.id ? { ...e, hours: entry.hours } : e) };
      }
      return { ...state, timesheetEntries: [...state.timesheetEntries, { id: `te${Date.now()}`, ...entry }] };
    }
    case 'SUBMIT_TIMESHEET_WEEK':
      return { ...state, timesheetWeeks: state.timesheetWeeks.map(w => w.user === action.userId && w.week === action.week ? { ...w, status: 'pending' } : w) };
    case 'APPROVE_TIMESHEET_WEEK':
      return { ...state, timesheetWeeks: state.timesheetWeeks.map(w => w.user === action.userId && w.week === action.week ? { ...w, status: 'approved' } : w) };
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.lead] };
    case 'MOVE_LEAD':
      return { ...state, leads: state.leads.map(l => l.id === action.id ? { ...l, stage: action.stage } : l) };
    case 'UPDATE_LEAD':
      return { ...state, leads: state.leads.map(l => l.id === action.id ? { ...l, ...action.data } : l) };
    case 'ADD_ESTIMATE':
      return { ...state, estimates: [...state.estimates, action.estimate] };
    case 'UPDATE_ESTIMATE_STATUS': {
      const updated = state.estimates.map(e => e.id === action.id ? { ...e, status: action.status } : e);
      const newVersion = { id: `ev${Date.now()}`, estimate: action.id, version: action.newVersion, date: new Date().toISOString().split('T')[0], user: state.currentUser.id, notes: action.notes || '' };
      return { ...state, estimates: updated, estimateVersions: [...state.estimateVersions, newVersion] };
    }
    case 'ADD_ESTIMATE_DELIVERABLE':
      return { ...state, estimateDeliverables: [...state.estimateDeliverables, action.deliverable] };
    case 'ADD_ESTIMATE_RESOURCE':
      return { ...state, estimateResources: [...state.estimateResources, action.resource] };
    case 'ADD_LEAVE_REQUEST':
      return { ...state, leaveRequests: [...state.leaveRequests, action.request] };
    case 'UPDATE_LEAVE_STATUS':
      return { ...state, leaveRequests: state.leaveRequests.map(r => r.id === action.id ? { ...r, status: action.status } : r) };
    case 'ADD_EXPENSE_SHEET':
      return { ...state, expenseSheets: [...state.expenseSheets, action.sheet] };
    case 'UPDATE_EXPENSE_SHEET_STATUS':
      return { ...state, expenseSheets: state.expenseSheets.map(s => s.id === action.id ? { ...s, status: action.status } : s) };
    case 'ADD_EXPENSE_ITEM':
      return { ...state, expenseItems: [...state.expenseItems, action.item] };
    case 'UPDATE_INVOICE_STATUS':
      return { ...state, invoiceAuthorizations: state.invoiceAuthorizations.map(i => i.id === action.id ? { ...i, status: action.status } : i) };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.user] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.toast }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    default:
      return state;
  }
}

export const AppStateContext = createContext(null);
export const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : init;
    } catch { return init; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  return html`
    <${AppStateContext.Provider} value=${state}>
      <${AppDispatchContext.Provider} value=${dispatch}>
        ${children}
      </${AppDispatchContext.Provider}>
    </${AppStateContext.Provider}>
  `;
}

export function useAppState() { return useContext(AppStateContext); }
export function useDispatch()  { return useContext(AppDispatchContext); }

// Returns true if the current viewAsTier can access the given section.
// sections: 'comercial' | 'finanzas' | 'equipo' | 'config'
export function canSee(viewAsTier, section) {
  if (viewAsTier === 'admin') return true;
  if (section === 'config') return false;
  if (viewAsTier === 'power_user') return true;
  return false; // team_member only sees operaciones
}

export function useCanSee() {
  const { viewAsTier } = useAppState();
  return (section) => canSee(viewAsTier, section);
}

export function useToast() {
  const dispatch = useDispatch();
  return function toast(message, type = 'success') {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', toast: { message, kind: type } });
    // Errors require manual dismiss; all other toasts auto-dismiss after 3.5s
    if (type !== 'error') {
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3500);
    }
  };
}
