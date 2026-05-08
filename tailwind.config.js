/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark mode backgrounds
        background: '#000000',
        surface: '#0A0A0A',
        elevated: '#111111',
        border: '#1A1A1A',
        muted: '#222222',

        // Glow accents
        accent: '#00FF87',        // glow-green (primary CTA)
        'accent-dim': '#00C96A',
        'accent-blue': '#00BFFF',
        'accent-purple': '#B44FFF',
        'accent-red': '#FF3D5A',

        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#555555',
      },
      fontFamily: {
        display: ['BebasNeue'],
        jakarta: ['PlusJakartaSans_400Regular'],
        'jakarta-medium': ['PlusJakartaSans_500Medium'],
        'jakarta-semibold': ['PlusJakartaSans_600SemiBold'],
        'jakarta-bold': ['PlusJakartaSans_700Bold'],
        mono: ['JetBrainsMono_400Regular'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        screen: '20px',
      },
    },
  },
  plugins: [],
}
