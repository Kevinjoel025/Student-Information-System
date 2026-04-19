/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          start: '#4F46E5',
          end: '#06B6D4',
        },
        admin: {
          accent: '#6366F1'
        },
        student: {
          accent: '#22C55E'
        },
        background: '#0B0F19',
        card: '#1F2937',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #4F46E5, #06B6D4)',
      }
    },
  },
  plugins: [],
}
