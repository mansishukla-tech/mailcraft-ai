/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -8px rgba(14,165,233,0.12)',
        glow: '0 8px 24px -4px rgba(20,184,166,0.35)',
        lift: '0 20px 45px -12px rgba(14,165,233,0.25)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(45,212,191,0.2), transparent 40%)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -15px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 10px) scale(0.97)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        blob: 'blob 10s infinite ease-in-out',
        fadeUp: 'fadeUp 0.35s ease-out',
        shimmer: 'shimmer 2.2s infinite linear',
      },
    },
  },
  plugins: [],
} 