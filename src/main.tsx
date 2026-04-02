import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminPanel from './AdminPanel.tsx';
import './index.css';

// Extremely lightweight routing without any external dependencies
const isAdminRoute = window.location.pathname === '/admin-panel';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminPanel /> : <App />}
  </StrictMode>,
);
