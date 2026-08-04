/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Readex Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#facc15',
          low: '#22c55e',
          verified: '#3b82f6',
          closed: '#6b7280',
        }
      },
      animation: {
        'scan-line': 'scan 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
