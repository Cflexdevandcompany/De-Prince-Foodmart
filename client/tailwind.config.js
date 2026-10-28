/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#044B18',
          primary: '#007424',
          orange: '#FF6B00',
          grey: '#5E5E5E',
          offwhite: '#F6FAF6',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(4, 75, 24, 0.08)',
      },
    },
  },
  plugins: [],
};
