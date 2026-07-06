/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12181B',
        paper: '#FBFAF8',
        panel: '#F1F3F1',
        market: {
          50: '#EAF6F3',
          100: '#CDEAE3',
          400: '#1E9C86',
          500: '#0E7C6B',
          600: '#0B6355',
        },
        amber: {
          400: '#EAAE4C',
          500: '#E2A33D',
          600: '#C88A2A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
