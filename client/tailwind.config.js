/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#243B53',
          light: '#334E68',
          dark: '#102A43',
          50: '#F0F4F8',
          100: '#D9E2EC',
          500: '#243B53',
          800: '#102A43',
          900: '#0B1D2E'
        },
        cream: {
          DEFAULT: '#FFF8ED',
          50: '#FFFCF7',
          100: '#FFF8ED',
          200: '#FDECCB'
        },
        accent: {
          DEFAULT: '#F4A261',
          hover: '#E76F51',
          light: '#F8C29D'
        },
        charcoal: {
          DEFAULT: '#263238',
          light: '#37474F',
          muted: '#627D98'
        },
        background: '#F8FAFC'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Merriweather', 'serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 42, 67, 0.08)',
        'soft-lg': '0 10px 25px -3px rgba(16, 42, 67, 0.12)',
        'card-hover': '0 20px 30px -10px rgba(16, 42, 67, 0.16)'
      }
    },
  },
  plugins: [],
}
