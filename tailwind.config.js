/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f5f5',
        primary: '#2a9d8f',
        border: '#d9d9d9',
        card: '#ffffff',
      },
      keyframes: {
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      animation: {
        slideInRight: 'slideInRight 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}