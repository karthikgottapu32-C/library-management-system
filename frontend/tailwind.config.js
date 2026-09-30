
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        secondaryBg: '#0A1024',
        electric: '#3B82F6',
        cyan: '#22D3EE',
        violet: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), rgba(5, 8, 22, 0) 60%)'
      }
    },
  },
  plugins: [],
}
