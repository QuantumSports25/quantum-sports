import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { register as registerServiceWorker } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register the service worker for PWA capabilities (offline, installability)
registerServiceWorker();

// Suppress the browser's install prompt by default.
// Enable again by either:
//  - setting `localStorage.setItem('pwaInstallPromptEnabled', 'true')` and reloading, or
//  - building with env `REACT_APP_ENABLE_INSTALL_PROMPT=true`.
declare global {
  interface Window {
    deferredPWAInstallPrompt?: any;
  }
}

const isInstallPromptEnabled = () => {
  try {
    const ls = localStorage.getItem('pwaInstallPromptEnabled');
    if (ls !== null) return ls === 'true';
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  return process.env.REACT_APP_ENABLE_INSTALL_PROMPT === 'true';
};

window.addEventListener('beforeinstallprompt', (e: Event) => {
  if (!isInstallPromptEnabled()) {
    // Prevent the mini-infobar or default prompt from appearing
    e.preventDefault?.();
    // Stash the event so it can be triggered later if needed
    window.deferredPWAInstallPrompt = e as any;
  }
});
