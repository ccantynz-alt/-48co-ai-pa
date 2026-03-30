/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          50:  '#f0f3f8',
          100: '#dce3ef',
          200: '#b8c7df',
          300: '#8aa3c8',
          400: '#5d7faf',
          500: '#3d5f8f',
          600: '#2d4a73',
          700: '#1e3554',
          800: '#132640',
          900: '#0B1A2E',
          950: '#060F1C',
        },
        gold: {
          50:  '#fdf9ef',
          100: '#f9f0d5',
          200: '#f2dda6',
          300: '#e8c56d',
          400: '#daa73b',
          500: '#c48f24',
          600: '#a6711c',
          700: '#87551a',
          800: '#70441d',
          900: '#5e391c',
        },
        hud: {
          bg: 'rgba(10, 10, 14, 0.88)',
          border: 'rgba(255,255,255,0.08)',
        },
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
