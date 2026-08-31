/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea6c00', 700: '#c2570a',
          800: '#9a450a', 900: '#7c3a0e',
        },
        gold: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706',
        },
        cream: {
          50: '#fffdf7', 100: '#fff8e7', 200: '#fdf0d5',
        },
        maroon: {
          600: '#8b1a1a', 700: '#6d1414', 800: '#4d0f0f',
        },
        dark: {
          800: '#1a1209', 900: '#120c06', 950: '#0c0804',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
