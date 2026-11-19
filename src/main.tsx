import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Recover automatically when a newly deployed build invalidates a lazy-loaded Vite chunk
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    try {
      const key = 'feviqo_vite_preload_recover_v1';
      const lastReload = Number(sessionStorage.getItem(key) || '0');
      if (Date.now() - lastReload > 15000) {
        sessionStorage.setItem(key, String(Date.now()));
        const url = new URL(window.location.href);
        url.searchParams.set('_v', String(Date.now()));
        window.location.replace(url.toString());
      }
    } catch {
      window.location.reload();
    }
  });
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (err) {
    console.error('[FEVIQO] Error mounting React application:', err);
    container.innerHTML = `
      <div style="min-height:100vh;background:#0B0F17;color:#FFFFFF;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
        <div style="max-width:400px;width:100%;background:#0F172A;border:1px solid #1E293B;border-radius:16px;padding:32px;">
          <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Unable to initialize FEVIQO</h1>
          <p style="font-size:14px;color:#94A3B8;margin:0 0 20px;">Please reload to load the latest application version.</p>
          <button onclick="window.location.href = window.location.pathname + '?_v=' + Date.now()" style="width:100%;padding:10px 16px;border-radius:8px;background:#22C55E;color:#052E16;font-weight:700;border:none;cursor:pointer;">Reload FEVIQO</button>
        </div>
      </div>
    `;
  }
} else {
  console.error('[FEVIQO] FATAL: #root container missing from DOM');
}
