/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'dchico-bg': '#fff8f4',
        'dchico-panel': '#ffeae0',
        'dchico-surface': '#ffffff',
        'dchico-text': '#3d1f1a',
        'dchico-muted': '#a07462',
        'dchico-border': '#f3d8c9',
        'dchico-accent': '#8b1b23',
        'dchico-accent-secondary': '#c47a53',
      },
      boxShadow: {
        glow: '0 25px 70px rgba(139, 27, 35, 0.18)',
      },
    },
  },
  plugins: [],
}

