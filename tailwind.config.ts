/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // keep your existing palette if you still use it anywhere
        ocean: {
          light: '#7dd3fc',
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
        },

        // Bridge tokens used by the new HTML screens
        primary: 'oklch(var(--primary-solid) / <alpha-value>)',
        'background-light': 'oklch(var(--background-light) / <alpha-value>)',
        'background-dark': 'oklch(var(--background-dark) / <alpha-value>)',
        'surface-dark': 'oklch(var(--surface-dark) / <alpha-value>)',
      },

      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Noto Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // optional but useful if screens use `font-display`
        display: [
          'Plus Jakarta Sans',
          'Noto Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },

      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 6px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
