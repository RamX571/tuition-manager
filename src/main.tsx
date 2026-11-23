import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Register Service Worker with explicit scope
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/tuition-manager/sw.js', { scope: '/tuition-manager/' })
      .then((reg) => {
        reg.update();
      })
      .catch((err) => {
        console.warn('SW registration skipped:', err);
      });
  });
}

// Clean old caches
if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      if (name.startsWith('tuition-manager-') && name !== 'tuition-manager-v5') {
        caches.delete(name);
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
