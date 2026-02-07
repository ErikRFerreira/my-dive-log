import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { STORAGE_KEYS } from '@/shared/constants';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';

// Make dark mode the default (if no preference stored)
if (!localStorage.getItem(STORAGE_KEYS.theme)) {
  document.documentElement.classList.add('dark');
  localStorage.setItem(STORAGE_KEYS.theme, 'dark');
} else if (localStorage.getItem(STORAGE_KEYS.theme) === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
