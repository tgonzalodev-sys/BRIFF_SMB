import { createElement as h, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from './context.js';
import AppShell from './components/layout/AppShell.js';

import Dashboard            from './pages/Dashboard.js';
import Proyectos            from './pages/Proyectos.js';
import ProyectoDetalle      from './pages/ProyectoDetalle.js';
import Timesheets           from './pages/Timesheets.js';
import TimesheetsPendientes from './pages/TimesheetsPendientes.js';
import Licencias            from './pages/Licencias.js';
import LicenciasEquipo      from './pages/LicenciasEquipo.js';
import Gastos               from './pages/Gastos.js';
import GastoDetalle         from './pages/GastoDetalle.js';
import CRMClientes          from './pages/CRMClientes.js';
import CRMClienteDetalle    from './pages/CRMClienteDetalle.js';
import CRMPipeline          from './pages/CRMPipeline.js';
import Estimaciones         from './pages/Estimaciones.js';
import EstimacionDetalle    from './pages/EstimacionDetalle.js';
import Contratos            from './pages/Contratos.js';
import RateCards            from './pages/RateCards.js';
import Proveedores          from './pages/Proveedores.js';
import Licitaciones         from './pages/Licitaciones.js';
import LicitacionDetalle    from './pages/LicitacionDetalle.js';
import Facturacion          from './pages/Facturacion.js';
import OrdenesCompra        from './pages/OrdenesCompra.js';
import Finanzas             from './pages/Finanzas.js';
import Personas             from './pages/Personas.js';
import Typologias           from './pages/Typologias.js';
import Organizacion         from './pages/Organizacion.js';

function App() {
  return h(StrictMode, null,
    h(AppProvider, null,
      h(HashRouter, null,
        h(Routes, null,
          h(Route, { path: '/', element: h(Navigate, { to: '/dashboard', replace: true }) }),
          h(Route, { element: h(AppShell) },
            h(Route, { path: '/dashboard',                    element: h(Dashboard) }),
            h(Route, { path: '/proyectos',                    element: h(Proyectos) }),
            h(Route, { path: '/proyectos/:id',                element: h(ProyectoDetalle) }),
            h(Route, { path: '/timesheets',                   element: h(Timesheets) }),
            h(Route, { path: '/timesheets/pendientes',        element: h(TimesheetsPendientes) }),
            h(Route, { path: '/licencias',                    element: h(Licencias) }),
            h(Route, { path: '/licencias/equipo',             element: h(LicenciasEquipo) }),
            h(Route, { path: '/gastos',                       element: h(Gastos) }),
            h(Route, { path: '/gastos/:id',                   element: h(GastoDetalle) }),
            h(Route, { path: '/crm/clientes',                 element: h(CRMClientes) }),
            h(Route, { path: '/crm/clientes/:id',             element: h(CRMClienteDetalle) }),
            h(Route, { path: '/crm/pipeline',                 element: h(CRMPipeline) }),
            h(Route, { path: '/estimaciones',                 element: h(Estimaciones) }),
            h(Route, { path: '/estimaciones/:id',             element: h(EstimacionDetalle) }),
            h(Route, { path: '/contratos',                    element: h(Contratos) }),
            h(Route, { path: '/contratos/rate-cards',         element: h(RateCards) }),
            h(Route, { path: '/proveedores',                  element: h(Proveedores) }),
            h(Route, { path: '/proveedores/licitaciones',     element: h(Licitaciones) }),
            h(Route, { path: '/proveedores/licitaciones/:id', element: h(LicitacionDetalle) }),
            h(Route, { path: '/facturacion',                  element: h(Facturacion) }),
            h(Route, { path: '/facturacion/oc',               element: h(OrdenesCompra) }),
            h(Route, { path: '/finanzas',                     element: h(Finanzas) }),
            h(Route, { path: '/personas',                     element: h(Personas) }),
            h(Route, { path: '/personas/typologias',          element: h(Typologias) }),
            h(Route, { path: '/organizacion',                 element: h(Organizacion) }),
            h(Route, { path: '*',                             element: h(Navigate, { to: '/dashboard', replace: true }) }),
          )
        )
      )
    )
  );
}

createRoot(document.getElementById('root')).render(h(App));
