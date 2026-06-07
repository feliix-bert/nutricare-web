/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a7ea4',
          light: '#E0F3FA',
          dark: '#0A2A35',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#052E16',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#1C1400',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
      },
    },
  },
  plugins: [],
}
