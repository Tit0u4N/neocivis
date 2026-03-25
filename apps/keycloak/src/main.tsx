import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KcPage } from '@/login/KcPage';
import '@/assets/global.css';

const kcContext = window.kcContext;

if (kcContext !== undefined) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <KcPage kcContext={kcContext} />
    </StrictMode>,
  );
}

declare global {
  interface Window {
    kcContext?: import('@/login/KcContext').KcContext;
  }
}
