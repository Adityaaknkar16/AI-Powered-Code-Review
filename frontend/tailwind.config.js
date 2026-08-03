/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#E5E5E5',
        'text-primary': '#18181B',
        'text-secondary': '#71717A',
        accent: '#2563EB',
        'severity-low': '#71717A',
        'severity-medium': '#D97706',
        'severity-high': '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'lg': '8px',
      }
    },
  },
  plugins: [],
}
