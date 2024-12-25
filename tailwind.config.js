/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ortholia: {
          blue: '#4361EE',
          purple: '#7B2CBF',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};