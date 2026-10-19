import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

/**
 * Web entry point.
 *
 * The demo runs entirely in the browser: no API calls, no service worker, and
 * all state is persisted to `localStorage` by the Zustand stores.
 */

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
