import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'dive-log:theme';

const getStoredTheme = () => localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;

function DarkModeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button onClick={toggleTheme} aria-label="Toggle Dark Mode">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}

export default DarkModeToggle;
