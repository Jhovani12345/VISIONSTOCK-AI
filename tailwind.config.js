/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#155E75', tech: '#0284C7', ia: '#10B981' },
        ink: '#0F172A',
        surface: '#F8FAFC',
        warn: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
