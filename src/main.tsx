import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';

const THEME_KEY = 'dive-log:theme';

// Make dark mode the default (if no preference stored)
if (!localStorage.getItem(THEME_KEY)) {
  document.documentElement.classList.add('dark');
  localStorage.setItem(THEME_KEY, 'dark');
} else if (localStorage.getItem(THEME_KEY) === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
