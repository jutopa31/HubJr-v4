/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne:  ['Nunito', 'sans-serif'],
        dm:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:  ['Fira Code', 'monospace'],
      },
      colors: {
        bg0: 'var(--bg0)',
        bg1: 'var(--bg1)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        teal: 'var(--teal)',
        amber: 'var(--amber)',
        red: 'var(--red)',
        indigo: 'var(--indigo)',
        green: 'var(--green)',
        t1: 'var(--t1)',
        t2: 'var(--t2)',
        t3: 'var(--t3)',
      },
    },
  },
  plugins: [],
}
