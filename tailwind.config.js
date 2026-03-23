/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        hud: {
          bg: 'rgba(10, 10, 14, 0.88)',
          border: 'rgba(255,255,255,0.08)',
        },
        cyan: { 400: '#00f0ff', 500: '#00f0ff' },
        red:  { 400: '#ff3b5c', 500: '#ff3b5c' },
        green:{ 400: '#00ff88', 500: '#00ff88' },
        amber:{ 400: '#ffb800', 500: '#ffb800' },
      },
      keyframes: {
        pulse_ring: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%':      { opacity: 0.5, transform: 'scale(1.15)' },
        },
        bar: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)' },
        },
      },
      animation: {
        pulse_ring: 'pulse_ring 1.2s ease-in-out infinite',
        bar:        'bar 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
