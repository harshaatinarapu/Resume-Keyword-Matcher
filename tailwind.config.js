/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#13213B',        // primary text, deep navy
        paper: '#F5F7FB',      // app background, cool blueprint-paper
        panel: '#FFFFFF',      // card/panel surface
        line: '#2C4C86',       // blueprint rule blue (borders, brackets)
        'line-soft': '#D6DEEE',// faint rule blue
        brass: '#B8752A',      // brand accent (CTAs, brand mark)
        'brass-dark': '#96601E',
        success: '#1F8A5F',
        'success-soft': '#E4F3EC',
        warn: '#C6821B',
        'warn-soft': '#FBEEDA',
        danger: '#C23B33',
        'danger-soft': '#FBE7E5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        md: '5px',
      },
    },
  },
  plugins: [],
}
