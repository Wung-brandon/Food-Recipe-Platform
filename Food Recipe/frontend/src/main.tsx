import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@fontsource/roboto/300.css';
import { I18nextProvider } from 'react-i18next';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import i18n from './i18n.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
 <I18nextProvider i18n={i18n}>
 <App />
 </I18nextProvider>
  </StrictMode>,
)
