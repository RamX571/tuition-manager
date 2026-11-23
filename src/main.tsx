import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Purge any stale cache and update Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update();
    }).catch(err => {
      console.log('SW registration skipped:', err);
    });
  });
}

// Clean old caches
if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      if (name === 'tuition-manager-v1') {
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
