/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg:        '#FDFCF7',
        surface:   '#FFFFFF',
        ink:       '#1C1C1E',
        'ink-muted':  'rgba(28,28,30,0.6)',
        'ink-subtle': 'rgba(28,28,30,0.4)',
        accent:    '#A92D1B',
        'accent-soft': 'rgba(169,45,27,0.08)',
        olive:     '#5A684D',
        'olive-soft': 'rgba(90,104,77,0.10)',
        stone:     '#EFECE6',
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '22px',
        xl: '28px',
      },
      fontFamily: {
        display: ['Fraunces_600SemiBold'],
        heading: ['Fraunces_500Medium'],
        sans:    ['Inter_400Regular'],
        'sans-med':  ['Inter_500Medium'],
        'sans-semi': ['Inter_600SemiBold'],
      },
    },
  },
  plugins: [],
};
