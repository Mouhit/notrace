/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          'bg': '#0F172A',
          'card': '#1A1A1A',
          'text': '#F5F5F5',
        },
        'primary': {
          '50': '#EFF6FF',
          '500': '#1E40AF',
          '600': '#1E3A8A',
          '700': '#1E3A8A',
          '900': '#0F172A',
        },
        'accent': {
          'gold': '#FBBF24',
          'purple': '#A78BFA',
          'red': '#FF4444',
          'green': '#44AA44',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'tilt': 'tilt 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.8)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'tilt': {
          '0%, 100%': { transform: 'rotateX(5deg) rotateY(-5deg)' },
          '50%': { transform: 'rotateX(-5deg) rotateY(5deg)' },
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(251, 191, 36, 0.3)',
        '3d': '0 20px 40px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
