/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(250, 204, 21, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(250, 204, 21, 0.6)' }
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        }
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
