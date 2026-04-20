import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app';
import '@/assets/styles/global.css';

const queryClient = new QueryClient();

function loadReactGrabForDev(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  const scriptId = 'react-grab-runtime';
  if (document.getElementById(scriptId)) {
    return;
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = '//unpkg.com/react-grab/dist/index.global.js';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

loadReactGrabForDev();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
