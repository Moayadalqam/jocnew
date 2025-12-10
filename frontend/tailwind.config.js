/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'joc-gold': '#D4AF37',
        'joc-dark': '#1a1a2e',
        'joc-darker': '#16213e',
        'joc-accent': '#0f3460',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.8)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        'glass': '20px',
      }
    },
  },
  plugins: [],
}
