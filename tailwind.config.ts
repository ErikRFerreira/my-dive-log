/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // tells Tailwind where to scan for class names
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          light: '#7dd3fc', // sky-300
          DEFAULT: '#0ea5e9', // sky-500
          dark: '#0369a1', // sky-700
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
