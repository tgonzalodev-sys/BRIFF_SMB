// ── USERS ────────────────────────────────────────────────────────────────────
// avatar_color uses Tailwind-v4 500 palette; u1 (currentUser) gets brand blue
export const USERS = [
  { id: 'u1', name: 'Valentina Ros',      role: 'Director',         dept: 'Dirección',   typology: 'Directora General',   hourly_cost: 85, email: 'v.ros@estudiocondor.com',       avatar_color: '#0046F3' },
  { id: 'u2', name: 'Matías Ferreyra',    role: 'Account Manager',  dept: 'Cuentas',     typology: 'Account Senior',      hourly_cost: 55, email: 'm.ferreyra@estudiocondor.com',   avatar_color: '#8E51FF' },
  { id: 'u3', name: 'Lucía Paredes',      role: 'Creative',         dept: 'Creatividad', typology: 'Directora de Arte',   hourly_cost: 60, email: 'l.paredes@estudiocondor.com',    avatar_color: '#00BC7D' },
  { id: 'u4', name: 'Tomás Blanco',       role: 'Creative',         dept: 'Creatividad', typology: 'Redactor',            hourly_cost: 45, email: 't.blanco@estudiocondor.com',     avatar_color: '#FE9A00' },
  { id: 'u5', name: 'Ana Gómez',          role: 'Finance',          dept: 'Finanzas',    typology: 'Administrativa',      hourly_cost: 40, email: 'a.gomez@estudiocondor.com',      avatar_color: '#FF2056' },
  { id: 'u6', name: 'Diego Núñez',        role: 'Creative',         dept: 'Producción',  typology: 'Motion Designer',     hourly_cost: 50, email: 'd.nunez@estudiocondor.com',      avatar_color: '#00B8DB' },
];

// ── CLIENTS ───────────────────────────────────────────────────────────────────
export const CLIENTS = [
  { id: 'c1', name: 'Banco Meridional', code: 'BM', manager: 'u2', currency: 'ARS', status: 'active',   industry: 'Finanzas',    payment_terms: 30, address: 'Av. Corrientes 1250, CABA' },
  { id: 'c2', name: 'Natura Foods',     code: 'NF', manager: 'u2', currency: 'ARS', status: 'active',   industry: 'Alimentos',   payment_terms: 45, address: 'Av. del Libertador 6500, Vicente López' },
  { id: 'c3', name: 'TechStart AR',     code: 'TS', manager: 'u2', currency: 'USD', status: 'prospect', industry: 'Tecnología',  payment_terms: 15, address: 'Palermo Tech Hub, CABA' },
];

// ── PROJECTS ──────────────────────────────────────────────────────────────────
export const PROJECTS = [
  { id: 'p1', client: 'c1', title: 'Campaña Verano 2026',         status: 'active',    type: 'campaña',  start: '2026-01-15', end: '2026-03-31', planned_hours: 320, actual_hours: 198, team: ['u1','u2','u3','u4','u6'], budget_ars: 4200000 },
  { id: 'p2', client: 'c1', title: 'Rediseño App Homebanking',    status: 'in_review', type: 'digital',  start: '2026-02-01', end: '2026-04-30', planned_hours: 480, actual_hours: 312, team: ['u2','u3','u6'],           budget_ars: 6800000 },
  { id: 'p3', client: 'c2', title: 'Lanzamiento Línea Orgánica',  status: 'active',    type: 'branding', start: '2026-03-01', end: '2026-05-15', planned_hours: 260, actual_hours: 95,  team: ['u2','u3','u4'],           budget_ars: 3100000 },
  { id: 'p4', client: 'c2', title: 'Retainer Social Media Q2',    status: 'active',    type: 'retainer', start: '2026-04-01', end: '2026-06-30', planned_hours: 180, actual_hours: 22,  team: ['u2','u4','u6'],           budget_ars: 1800000 },
];

// ── JOBS ──────────────────────────────────────────────────────────────────────
export const JOBS = [
  // p1 — Campaña Verano
  { id: 'j1',  project: 'p1', title: 'Estrategia y Conceptualización', status: 'done',        owner: 'u1', planned_hours: 80  },
  { id: 'j2',  project: 'p1', title: 'Producción Gráfica',             status: 'done',        owner: 'u3', planned_hours: 140 },
  { id: 'j3',  project: 'p1', title: 'Motion & Adaptaciones Digitales', status: 'in_progress', owner: 'u6', planned_hours: 100 },
  // p2 — App Homebanking
  { id: 'j4',  project: 'p2', title: 'UX Research & Wireframes',        status: 'done',        owner: 'u3', planned_hours: 120 },
  { id: 'j5',  project: 'p2', title: 'UI Design System',                status: 'in_progress', owner: 'u3', planned_hours: 200 },
  { id: 'j6',  project: 'p2', title: 'Prototipo Interactivo',           status: 'pending',     owner: 'u6', planned_hours: 160 },
  // p3 — Línea Orgánica
  { id: 'j7',  project: 'p3', title: 'Brand Identity & Naming',         status: 'done',        owner: 'u1', planned_hours: 60  },
  { id: 'j8',  project: 'p3', title: 'Packaging Design',                status: 'in_progress', owner: 'u3', planned_hours: 120 },
  { id: 'j9',  project: 'p3', title: 'Lanzamiento Comunicacional',      status: 'pending',     owner: 'u4', planned_hours: 80  },
  // p4 — Retainer Social
  { id: 'j10', project: 'p4', title: 'Calendario Editorial Abril',      status: 'done',        owner: 'u4', planned_hours: 40  },
  { id: 'j11', project: 'p4', title: 'Producción Contenido Mayo',       status: 'in_progress', owner: 'u4', planned_hours: 70  },
  { id: 'j12', project: 'p4', title: 'Producción Contenido Junio',      status: 'pending',     owner: 'u6', planned_hours: 70  },
];

// ── TASKS ─────────────────────────────────────────────────────────────────────
export const TASKS = [
  { id: 't1',  job: 'j1',  title: 'Brief de campaña con cliente',       status: 'done',        assigned: 'u2', due: '2026-01-20', est_hours: 8  },
  { id: 't2',  job: 'j1',  title: 'Desarrollo de concepto creativo',    status: 'done',        assigned: 'u1', due: '2026-01-28', est_hours: 16 },
  { id: 't3',  job: 'j2',  title: 'Diseño de piezas principales',       status: 'done',        assigned: 'u3', due: '2026-02-15', est_hours: 40 },
  { id: 't4',  job: 'j2',  title: 'Adaptaciones por formato',           status: 'done',        assigned: 'u3', due: '2026-02-28', est_hours: 32 },
  { id: 't5',  job: 'j3',  title: 'Animación spot principal',           status: 'in_progress', assigned: 'u6', due: '2026-03-20', est_hours: 60 },
  { id: 't6',  job: 'j3',  title: 'Versiones Stories y Reels',          status: 'pending',     assigned: 'u6', due: '2026-03-28', est_hours: 20 },
  { id: 't7',  job: 'j4',  title: 'Entrevistas usuarios actuales',      status: 'done',        assigned: 'u3', due: '2026-02-15', est_hours: 24 },
  { id: 't8',  job: 'j4',  title: 'Wireframes flujos principales',      status: 'done',        assigned: 'u3', due: '2026-02-28', est_hours: 48 },
  { id: 't9',  job: 'j5',  title: 'Tokens de diseño y componentes',     status: 'in_progress', assigned: 'u3', due: '2026-04-10', est_hours: 80 },
  { id: 't10', job: 'j5',  title: 'Pantallas principales (30 vistas)',  status: 'pending',     assigned: 'u3', due: '2026-04-25', est_hours: 120},
  { id: 't11', job: 'j6',  title: 'Prototipo Figma high-fidelity',      status: 'pending',     assigned: 'u6', due: '2026-05-10', est_hours: 80 },
  { id: 't12', job: 'j6',  title: 'Video walkthrough de flujos',        status: 'pending',     assigned: 'u6', due: '2026-05-20', est_hours: 24 },
  { id: 't13', job: 'j7',  title: 'Propuestas de naming (3 opciones)',  status: 'done',        assigned: 'u1', due: '2026-03-10', est_hours: 16 },
  { id: 't14', job: 'j7',  title: 'Desarrollo de identidad visual',     status: 'done',        assigned: 'u3', due: '2026-03-20', est_hours: 32 },
  { id: 't15', job: 'j8',  title: 'Diseño estructural del packaging',   status: 'in_progress', assigned: 'u3', due: '2026-04-15', est_hours: 60 },
  { id: 't16', job: 'j8',  title: 'Arte final para imprenta',           status: 'pending',     assigned: 'u3', due: '2026-04-30', est_hours: 40 },
  { id: 't17', job: 'j9',  title: 'Redacción de copys de lanzamiento',  status: 'pending',     assigned: 'u4', due: '2026-05-01', est_hours: 24 },
  { id: 't18', job: 'j9',  title: 'Kit de prensa y media kit',          status: 'pending',     assigned: 'u4', due: '2026-05-10', est_hours: 20 },
  { id: 't19', job: 'j10', title: 'Calendario editorial Abril',         status: 'done',        assigned: 'u4', due: '2026-03-28', est_hours: 8  },
  { id: 't20', job: 'j10', title: 'Producción de piezas Abril (20 u)', status: 'done',        assigned: 'u4', due: '2026-04-05', est_hours: 32 },
  { id: 't21', job: 'j11', title: 'Calendario editorial Mayo',          status: 'in_progress', assigned: 'u4', due: '2026-04-25', est_hours: 8  },
  { id: 't22', job: 'j11', title: 'Producción de piezas Mayo (20 u)',  status: 'pending',     assigned: 'u6', due: '2026-05-05', est_hours: 32 },
  { id: 't23', job: 'j12', title: 'Calendario editorial Junio',         status: 'pending',     assigned: 'u4', due: '2026-05-25', est_hours: 8  },
  { id: 't24', job: 'j12', title: 'Producción de piezas Junio (20 u)', status: 'pending',     assigned: 'u6', due: '2026-06-05', est_hours: 32 },
];

// ── TIMESHEET ENTRIES ─────────────────────────────────────────────────────────
// Week of Apr 14–18, 2026
export const TIMESHEET_ENTRIES = [
  { id: 'te1',  user: 'u1', project: 'p3', job: 'j7', date: '2026-04-14', hours: 4 },
  { id: 'te2',  user: 'u1', project: 'p2', job: 'j5', date: '2026-04-15', hours: 6 },
  { id: 'te3',  user: 'u1', project: 'p3', job: 'j8', date: '2026-04-16', hours: 3 },
  { id: 'te4',  user: 'u2', project: 'p1', job: 'j1', date: '2026-04-14', hours: 5 },
  { id: 'te5',  user: 'u2', project: 'p3', job: 'j9', date: '2026-04-14', hours: 3 },
  { id: 'te6',  user: 'u2', project: 'p4', job: 'j10',date: '2026-04-15', hours: 6 },
  { id: 'te7',  user: 'u3', project: 'p2', job: 'j5', date: '2026-04-14', hours: 8 },
  { id: 'te8',  user: 'u3', project: 'p2', job: 'j5', date: '2026-04-15', hours: 7 },
  { id: 'te9',  user: 'u3', project: 'p3', job: 'j8', date: '2026-04-16', hours: 8 },
  { id: 'te10', user: 'u3', project: 'p3', job: 'j8', date: '2026-04-17', hours: 6 },
  { id: 'te11', user: 'u4', project: 'p4', job: 'j11',date: '2026-04-14', hours: 4 },
  { id: 'te12', user: 'u4', project: 'p1', job: 'j2', date: '2026-04-15', hours: 5 },
  { id: 'te13', user: 'u6', project: 'p1', job: 'j3', date: '2026-04-14', hours: 8 },
  { id: 'te14', user: 'u6', project: 'p1', job: 'j3', date: '2026-04-15', hours: 8 },
  { id: 'te15', user: 'u6', project: 'p2', job: 'j6', date: '2026-04-16', hours: 4 },
];

export const TIMESHEET_WEEKS = [
  { user: 'u1', week: '2026-W16', status: 'draft' },
  { user: 'u2', week: '2026-W16', status: 'pending' },
  { user: 'u3', week: '2026-W16', status: 'approved' },
  { user: 'u4', week: '2026-W16', status: 'draft' },
  { user: 'u5', week: '2026-W16', status: 'draft' },
  { user: 'u6', week: '2026-W16', status: 'approved' },
];

// ── LEADS (CRM Pipeline) ──────────────────────────────────────────────────────
export const LEADS = [
  { id: 'l1', company: 'Aerolíneas del Sur',  contact: 'Martín Suárez',    value: 8500000,  currency: 'ARS', probability: 70, stage: 'negotiation', owner: 'u2', close_date: '2026-05-15', notes: 'Campaña de verano 2027, presupuesto confirmado' },
  { id: 'l2', company: 'GreenEnergy SA',      contact: 'Carolina Vega',    value: 12000,    currency: 'USD', probability: 40, stage: 'proposal',     owner: 'u1', close_date: '2026-06-01', notes: 'Rebranding completo + sitio web' },
  { id: 'l3', company: 'Grupo Pampa Foods',   contact: 'Roberto Díaz',     value: 5200000,  currency: 'ARS', probability: 60, stage: 'qualified',    owner: 'u2', close_date: '2026-05-30', notes: 'Relanzamiento de marca, 3 productos' },
  { id: 'l4', company: 'Clínica San Martín',  contact: 'Dra. Paula Ríos',  value: 3800000,  currency: 'ARS', probability: 80, stage: 'won',          owner: 'u2', close_date: '2026-04-20', notes: 'Campaña institucional + redes' },
  { id: 'l5', company: 'AutoMax Argentina',   contact: 'Facundo Torres',   value: 6000,     currency: 'USD', probability: 25, stage: 'prospect',     owner: 'u1', close_date: '2026-07-01', notes: 'Digital primero, puede escalar' },
  { id: 'l6', company: 'Cervecería Andina',   contact: 'Sebastián Mora',   value: 9800000,  currency: 'ARS', probability: 55, stage: 'proposal',     owner: 'u2', close_date: '2026-05-20', notes: 'Campaña lanzamiento nueva variedad' },
  { id: 'l7', company: 'MediTech Solutions',  contact: 'Ing. Ana Solís',   value: 18000,    currency: 'USD', probability: 30, stage: 'prospect',     owner: 'u1', close_date: '2026-08-01', notes: 'App móvil + branding' },
  { id: 'l8', company: 'Banco del Interior',  contact: 'Lic. Jorge Peña',  value: 15000000, currency: 'ARS', probability: 20, stage: 'lost',         owner: 'u2', close_date: '2026-04-10', notes: 'Perdido por precio — mantener relación' },
];

// ── ESTIMATES ─────────────────────────────────────────────────────────────────
export const ESTIMATES = [
  { id: 'e1', code: 'EST-2026-001', project: 'p1', client: 'c1', version: '1.3', status: 'approved_client', created_by: 'u2', created_at: '2026-01-10', total_cost: 2180000, total_sell: 4200000, margin_pct: 48 },
  { id: 'e2', code: 'EST-2026-002', project: 'p2', client: 'c1', version: '2.1', status: 'sent_client',     created_by: 'u2', created_at: '2026-01-28', total_cost: 3720000, total_sell: 6800000, margin_pct: 45 },
  { id: 'e3', code: 'EST-2026-003', project: 'p3', client: 'c2', version: '1.0', status: 'internal_review', created_by: 'u2', created_at: '2026-03-01', total_cost: 1680000, total_sell: 3100000, margin_pct: 46 },
  { id: 'e4', code: 'EST-2026-004', project: 'p4', client: 'c2', version: '1.0', status: 'draft',           created_by: 'u2', created_at: '2026-03-25', total_cost: 900000,  total_sell: 1800000, margin_pct: 50 },
];

export const ESTIMATE_DELIVERABLES = [
  // EST-2026-001
  { id: 'ed1', estimate: 'e1', title: 'Concepto Creativo & Estrategia', order: 1 },
  { id: 'ed2', estimate: 'e1', title: 'Producción Gráfica (OOH + Digital)', order: 2 },
  { id: 'ed3', estimate: 'e1', title: 'Motion & Video',  order: 3 },
  // EST-2026-002
  { id: 'ed4', estimate: 'e2', title: 'UX Research & Architecture', order: 1 },
  { id: 'ed5', estimate: 'e2', title: 'UI Design System',           order: 2 },
];

export const ESTIMATE_RESOURCES = [
  { id: 'er1',  deliverable: 'ed1', typology: 'Directora General',  user: 'u1', rate: 85000, hours: 16, cost: 1360000, margin_pct: 60, sell: 2176000 },
  { id: 'er2',  deliverable: 'ed1', typology: 'Account Senior',     user: 'u2', rate: 55000, hours: 12, cost: 660000,  margin_pct: 55, sell: 1100000 },
  { id: 'er3',  deliverable: 'ed2', typology: 'Directora de Arte',  user: 'u3', rate: 60000, hours: 80, cost: 4800000, margin_pct: 50, sell: 7200000 },
  { id: 'er4',  deliverable: 'ed2', typology: 'Redactor',           user: 'u4', rate: 45000, hours: 40, cost: 1800000, margin_pct: 50, sell: 2700000 },
  { id: 'er5',  deliverable: 'ed3', typology: 'Motion Designer',    user: 'u6', rate: 50000, hours: 60, cost: 3000000, margin_pct: 55, sell: 4500000 },
];

export const ESTIMATE_THIRD_PARTY = [
  { id: 'etp1', deliverable: 'ed2', supplier: 's1', description: 'Retoque fotográfico profesional', cost: 380000, fee_pct: 20, sell: 456000 },
  { id: 'etp2', deliverable: 'ed3', supplier: 's2', description: 'Musicalización y audio post',     cost: 250000, fee_pct: 20, sell: 300000 },
];

export const ESTIMATE_VERSIONS = [
  { id: 'ev1', estimate: 'e1', version: '1.0', date: '2026-01-10', user: 'u2', notes: 'Versión inicial' },
  { id: 'ev2', estimate: 'e1', version: '1.1', date: '2026-01-15', user: 'u2', notes: 'Ajuste de horas en producción gráfica' },
  { id: 'ev3', estimate: 'e1', version: '1.2', date: '2026-01-18', user: 'u1', notes: 'Revisión de márgenes por Dirección' },
  { id: 'ev4', estimate: 'e1', version: '1.3', date: '2026-01-22', user: 'u2', notes: 'Aprobada por cliente' },
];

// ── SUPPLIERS ─────────────────────────────────────────────────────────────────
export const SUPPLIERS = [
  { id: 's1', name: 'Pixel & Co Retoques',   category: 'Fotografía',      contact: 'Laura Méndez',   email: 'l.mendez@pixelco.ar',     phone: '+54 11 4523-1890', active_projects: 2 },
  { id: 's2', name: 'SoundLab Studios',      category: 'Audio & Música',  contact: 'Rodrigo Sosa',   email: 'r.sosa@soundlab.com.ar',   phone: '+54 11 4788-2200', active_projects: 1 },
  { id: 's3', name: 'PrintHouse Gráfica',    category: 'Impresión',       contact: 'Marcela Ortiz',  email: 'm.ortiz@printhouse.ar',    phone: '+54 11 4321-5566', active_projects: 0 },
  { id: 's4', name: 'CineFrame Producción',  category: 'Video & Cine',    contact: 'Pablo Herrera',  email: 'p.herrera@cineframe.com',  phone: '+54 11 4900-3344', active_projects: 1 },
];

// ── TENDERS ───────────────────────────────────────────────────────────────────
export const TENDERS = [
  {
    id: 'tn1', project: 'p1', estimate: 'e1', title: 'Producción audiovisual — Spot Verano', deadline: '2026-02-10', status: 'adjudicated',
    suppliers_invited: ['s2', 's4'],
    items: [
      { id: 'tni1', description: 'Musicalización original', unit: 'proyecto' },
      { id: 'tni2', description: 'Producción de video 30s', unit: 'proyecto' },
    ],
    quotes: [
      { supplier: 's2', item: 'tni1', amount: 250000, notes: 'Incluye 3 revisiones' },
      { supplier: 's4', item: 'tni2', amount: 890000, notes: 'Entrega en 15 días hábiles' },
      { supplier: 's2', item: 'tni2', amount: 750000, notes: 'Entrega en 20 días hábiles' },
    ],
    adjudicated_to: { 'tni1': 's2', 'tni2': 's2' },
  }
];

// ── EXPENSE SHEETS ─────────────────────────────────────────────────────────────
export const EXPENSE_SHEETS = [
  { id: 'ex1', title: 'Gastos Operativos — Marzo 2026', dept: 'Dirección',   period: '2026-03', status: 'approved',  created_by: 'u1', total: 45800 },
  { id: 'ex2', title: 'Viáticos Reunión BM — Abril',    dept: 'Cuentas',     period: '2026-04', status: 'pending',   created_by: 'u2', total: 12400 },
  { id: 'ex3', title: 'Materiales Producción — Abril',  dept: 'Creatividad', period: '2026-04', status: 'draft',     created_by: 'u3', total: 28600 },
];

export const EXPENSE_ITEMS = [
  { id: 'exi1', sheet: 'ex1', category: 'Transporte',  date: '2026-03-05', description: 'Remis al cliente BM',           amount: 3200,  currency: 'ARS', receipt: true  },
  { id: 'exi2', sheet: 'ex1', category: 'Comidas',     date: '2026-03-12', description: 'Almuerzo de trabajo con equipo', amount: 18600, currency: 'ARS', receipt: true  },
  { id: 'exi3', sheet: 'ex1', category: 'Materiales',  date: '2026-03-18', description: 'Insumos presentación impresa',   amount: 24000, currency: 'ARS', receipt: false },
  { id: 'exi4', sheet: 'ex2', category: 'Transporte',  date: '2026-04-08', description: 'Taxi aeropuerto — reunión BM',   amount: 4800,  currency: 'ARS', receipt: true  },
  { id: 'exi5', sheet: 'ex2', category: 'Comidas',     date: '2026-04-08', description: 'Almuerzo con cliente BM',        amount: 7600,  currency: 'ARS', receipt: true  },
  { id: 'exi6', sheet: 'ex3', category: 'Materiales',  date: '2026-04-10', description: 'Papeles Canson y markers',       amount: 8400,  currency: 'ARS', receipt: true  },
  { id: 'exi7', sheet: 'ex3', category: 'Software',    date: '2026-04-12', description: 'Licencia Adobe Stock mensual',   amount: 20200, currency: 'ARS', receipt: true  },
];

// ── LEAVE REQUESTS ────────────────────────────────────────────────────────────
export const LEAVE_REQUESTS = [
  { id: 'lr1', user: 'u3', type: 'vacation',    start: '2026-04-21', end: '2026-04-25', half_day: false, status: 'approved', notes: 'Semana de turismo' },
  { id: 'lr2', user: 'u4', type: 'personal',    start: '2026-04-17', end: '2026-04-17', half_day: true,  status: 'pending',  notes: 'Trámite personal AM' },
  { id: 'lr3', user: 'u6', type: 'sick',        start: '2026-04-14', end: '2026-04-14', half_day: false, status: 'approved', notes: '' },
  { id: 'lr4', user: 'u1', type: 'compensatory',start: '2026-05-02', end: '2026-05-02', half_day: false, status: 'approved', notes: 'Compensación feriado trabajado' },
  { id: 'lr5', user: 'u2', type: 'vacation',    start: '2026-05-19', end: '2026-05-23', half_day: false, status: 'pending',  notes: '' },
];

export const LEAVE_BALANCES = {
  u1: { vacation: { used: 2,  total: 20 }, sick: { used: 0, total: 5 }, personal: { used: 0, total: 3 }, compensatory: { used: 1, total: 2 } },
  u2: { vacation: { used: 0,  total: 20 }, sick: { used: 1, total: 5 }, personal: { used: 0, total: 3 }, compensatory: { used: 0, total: 1 } },
  u3: { vacation: { used: 5,  total: 20 }, sick: { used: 0, total: 5 }, personal: { used: 1, total: 3 }, compensatory: { used: 0, total: 0 } },
  u4: { vacation: { used: 0,  total: 20 }, sick: { used: 2, total: 5 }, personal: { used: 1, total: 3 }, compensatory: { used: 0, total: 0 } },
  u5: { vacation: { used: 3,  total: 20 }, sick: { used: 0, total: 5 }, personal: { used: 0, total: 3 }, compensatory: { used: 0, total: 0 } },
  u6: { vacation: { used: 0,  total: 20 }, sick: { used: 1, total: 5 }, personal: { used: 0, total: 3 }, compensatory: { used: 0, total: 0 } },
};

// ── INVOICE AUTHORIZATIONS ────────────────────────────────────────────────────
export const INVOICE_AUTHORIZATIONS = [
  { id: 'ia1', code: 'FC-2026-0031', client: 'c1', project: 'p1', amount: 1680000, currency: 'ARS', status: 'paid',     date: '2026-02-01', due_date: '2026-03-01', po_ref: 'OC-BM-2026-018', iva: 352800 },
  { id: 'ia2', code: 'FC-2026-0044', client: 'c1', project: 'p2', amount: 2400000, currency: 'ARS', status: 'issued',   date: '2026-03-15', due_date: '2026-04-14', po_ref: 'OC-BM-2026-027', iva: 504000 },
  { id: 'ia3', code: 'FC-2026-0058', client: 'c2', project: 'p3', amount: 1240000, currency: 'ARS', status: 'pending',  date: '2026-04-01', due_date: '2026-05-16', po_ref: '',               iva: 260400 },
  { id: 'ia4', code: 'FC-2026-0062', client: 'c1', project: 'p2', amount: 2720000, currency: 'ARS', status: 'pending',  date: '2026-04-15', due_date: '2026-05-30', po_ref: 'OC-BM-2026-041', iva: 571200 },
];

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────────
export const PURCHASE_ORDERS = [
  { id: 'po1', code: 'OC-2026-001', supplier: 's2', project: 'p1', amount: 250000, currency: 'ARS', status: 'paid',    date: '2026-02-05', description: 'Musicalización spot Verano' },
  { id: 'po2', code: 'OC-2026-002', supplier: 's1', project: 'p1', amount: 380000, currency: 'ARS', status: 'issued',  date: '2026-02-10', description: 'Retoques fotográficos campaña' },
  { id: 'po3', code: 'OC-2026-003', supplier: 's4', project: 'p2', amount: 620000, currency: 'ARS', status: 'pending', date: '2026-04-05', description: 'Video demo app homebanking' },
];

// ── RATE CARDS ────────────────────────────────────────────────────────────────
export const RATE_CARDS = [
  {
    id: 'rc1', name: 'Rate Card General 2026', valid_from: '2026-01-01', valid_to: '2026-12-31', client: null, currency: 'ARS',
    rates: [
      { typology: 'Directora General',  cost_hour: 85000, sell_hour: 140000, margin_pct: 39 },
      { typology: 'Account Senior',     cost_hour: 55000, sell_hour: 90000,  margin_pct: 39 },
      { typology: 'Directora de Arte',  cost_hour: 60000, sell_hour: 95000,  margin_pct: 37 },
      { typology: 'Redactor',           cost_hour: 45000, sell_hour: 75000,  margin_pct: 40 },
      { typology: 'Administrativa',     cost_hour: 40000, sell_hour: 60000,  margin_pct: 33 },
      { typology: 'Motion Designer',    cost_hour: 50000, sell_hour: 85000,  margin_pct: 41 },
    ]
  },
  {
    id: 'rc2', name: 'Rate Card TechStart (USD)', valid_from: '2026-01-01', valid_to: '2026-12-31', client: 'c3', currency: 'USD',
    rates: [
      { typology: 'Directora General',  cost_hour: 85,  sell_hour: 150, margin_pct: 43 },
      { typology: 'Directora de Arte',  cost_hour: 60,  sell_hour: 110, margin_pct: 45 },
      { typology: 'Motion Designer',    cost_hour: 50,  sell_hour: 95,  margin_pct: 47 },
    ]
  }
];

// ── CONTRACTS ─────────────────────────────────────────────────────────────────
export const CONTRACTS = [
  { id: 'ct1', client: 'c1', type: 'Proyecto',  rate_card: 'rc1', period_start: '2026-01-01', period_end: '2026-12-31', value: 18000000, consumed: 6840000, status: 'active' },
  { id: 'ct2', client: 'c2', type: 'Retainer',  rate_card: 'rc1', period_start: '2026-01-01', period_end: '2026-12-31', value:  7200000, consumed: 1320000, status: 'active' },
];

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: 'n1', type: 'estimate_approved', text: 'Estimación EST-2026-001 aprobada por Banco Meridional', time: '2026-04-17T09:15:00', read: false, link: '/estimaciones/e1' },
  { id: 'n2', type: 'timesheet_pending', text: 'Timesheet de Matías Ferreyra pendiente de aprobación',  time: '2026-04-17T08:30:00', read: false, link: '/timesheets/pendientes' },
  { id: 'n3', type: 'task_done',         text: 'Tarea "Tokens de diseño" marcada como completada',       time: '2026-04-16T17:45:00', read: true,  link: '/proyectos/p2' },
  { id: 'n4', type: 'leave_request',     text: 'Tomás Blanco solicitó medio día personal',               time: '2026-04-16T11:20:00', read: true,  link: '/licencias/equipo' },
  { id: 'n5', type: 'invoice_overdue',   text: 'Factura FC-2026-0044 vence en 7 días',                   time: '2026-04-15T09:00:00', read: true,  link: '/facturacion' },
];

// ── ACTIVITY FEED ──────────────────────────────────────────────────────────────
export const ACTIVITY_FEED = [
  { id: 'af1', user: 'u2', action: 'aprobó',       subject: 'Estimación EST-2026-001',            time: '2026-04-17T09:15:00', type: 'estimate'  },
  { id: 'af2', user: 'u3', action: 'completó',     subject: 'Tokens de diseño y componentes',     time: '2026-04-16T17:45:00', type: 'task'      },
  { id: 'af3', user: 'u4', action: 'envió',        subject: 'Timesheet semana 15',                time: '2026-04-16T09:00:00', type: 'timesheet' },
  { id: 'af4', user: 'u1', action: 'creó',         subject: 'Proyecto Retainer Social Media Q2',  time: '2026-04-14T11:30:00', type: 'project'   },
  { id: 'af5', user: 'u2', action: 'agregó lead',  subject: 'Aerolíneas del Sur al pipeline',     time: '2026-04-13T16:20:00', type: 'crm'       },
];

// ── TYPOLOGIES ────────────────────────────────────────────────────────────────
export const TYPOLOGIES = [
  { id: 'ty1', name: 'Directora General',  dept: 'Dirección',   cost_hour_default: 85000, sell_hour_default: 140000 },
  { id: 'ty2', name: 'Account Senior',     dept: 'Cuentas',     cost_hour_default: 55000, sell_hour_default: 90000  },
  { id: 'ty3', name: 'Directora de Arte',  dept: 'Creatividad', cost_hour_default: 60000, sell_hour_default: 95000  },
  { id: 'ty4', name: 'Redactor',           dept: 'Creatividad', cost_hour_default: 45000, sell_hour_default: 75000  },
  { id: 'ty5', name: 'Administrativa',     dept: 'Finanzas',    cost_hour_default: 40000, sell_hour_default: 60000  },
  { id: 'ty6', name: 'Motion Designer',    dept: 'Producción',  cost_hour_default: 50000, sell_hour_default: 85000  },
];

// ── ORGANIZATION ──────────────────────────────────────────────────────────────
export const ORGANIZATION = {
  name: 'Estudio Cóndor',
  legal_name: 'Estudio Cóndor S.R.L.',
  cuit: '30-71234567-9',
  currency: 'ARS',
  timezone: 'America/Argentina/Buenos_Aires',
  fiscal_address: 'Av. Santa Fe 3254, 3° B, CABA',
  weekly_hours: 40,
  billable_target_pct: 70,
};

// ── FINANCIAL MOCK DATA ───────────────────────────────────────────────────────
export const PNL_DATA = [
  { month: 'Ene', ingresos: 2100000, costo_recursos: 820000, costos_terceros: 280000, gastos: 65000 },
  { month: 'Feb', ingresos: 2800000, costo_recursos: 980000, costos_terceros: 340000, gastos: 78000 },
  { month: 'Mar', ingresos: 3200000, costo_recursos: 1100000, costos_terceros: 410000, gastos: 92000 },
  { month: 'Abr', ingresos: 2400000, costo_recursos: 860000, costos_terceros: 295000, gastos: 71000 },
];

export const PROJECT_PROFITABILITY = [
  { project: 'p1', ingresos: 4200000, costo_real: 2420000, margen: 1780000, margen_pct: 42, planned_hours: 320, actual_hours: 198, desvio: -122 },
  { project: 'p2', ingresos: 6800000, costo_real: 3900000, margen: 2900000, margen_pct: 43, planned_hours: 480, actual_hours: 312, desvio: -168 },
  { project: 'p3', ingresos: 3100000, costo_real: 1950000, margen: 1150000, margen_pct: 37, planned_hours: 260, actual_hours: 95,  desvio:  165 },
  { project: 'p4', ingresos: 1800000, costo_real: 1120000, margen:  680000, margen_pct: 38, planned_hours: 180, actual_hours: 22,  desvio:  158 },
];

export const TEAM_UTILIZATION = [
  { user: 'u1', available_hours: 160, billable: 112, non_billable: 18, utilization_pct: 70 },
  { user: 'u2', available_hours: 160, billable: 128, non_billable: 22, utilization_pct: 80 },
  { user: 'u3', available_hours: 160, billable: 142, non_billable: 12, utilization_pct: 89 },
  { user: 'u4', available_hours: 160, billable: 98,  non_billable: 28, utilization_pct: 61 },
  { user: 'u5', available_hours: 160, billable: 32,  non_billable: 80, utilization_pct: 20 },
  { user: 'u6', available_hours: 160, billable: 136, non_billable: 8,  utilization_pct: 85 },
];
