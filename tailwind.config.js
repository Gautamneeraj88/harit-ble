/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#00E5FF',
        'bg-dark': '#090A0F',
        surface: '#12151F',
        'text-main': '#F1F5F9',
        muted: '#64748B',
        'border-color': '#1E293B',
        good: '#00FF66',
        warn: '#FFB300',
        critical: '#FF2A2A',
        'cyan-glow': '#00F0FF',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
