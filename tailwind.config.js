/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        paper: '#F1EDE4',
        card: '#F8F5EE',
        ink: '#141412',
        muted: '#77736A',
        line: '#D8D1C2',
        acid: '#C8FF2E',
        flare: '#FF5B1F',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
