/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          dark: '#030712',
          navy: '#0b132b',
          purple: '#1c1032',
          blue: '#1c2541',
          accent: '#48cae4',
          gold: '#ffb703',
          crimson: '#e63946',
        },
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%': { opacity: 0.3, transform: 'scale(0.8)' },
          '100%': { opacity: 1, transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
};
