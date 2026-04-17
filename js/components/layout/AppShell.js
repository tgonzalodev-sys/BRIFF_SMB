import { useEffect, useRef } from 'react';
import { html } from '../../lib/html.js';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import Topbar from './Topbar.js';
import ToastContainer from '../ui/Toast.js';

export default function AppShell() {
  const location = useLocation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [location.pathname]);

  return html`
    <div style=${{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <${Sidebar} />
      <div style=${{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <${Topbar} />
        <main ref=${contentRef} style=${{ marginTop: 56, flex: 1, overflowY: 'auto', background: '#F5F5FA' }}>
          <div key=${location.pathname} className="page-enter page-enter-active" style=${{ padding: 24, minHeight: 'calc(100vh - 56px)' }}>
            <${Outlet} />
          </div>
        </main>
      </div>
      <${ToastContainer} />
    </div>
  `;
}
