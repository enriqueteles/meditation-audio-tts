/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yoga-purple': {
          light: '#E8D5FF',
          DEFAULT: '#9B7EDE',
          dark: '#6B46C1',
        },
        'yoga-blue': {
          light: '#DBEAFE',
          DEFAULT: '#60A5FA',
        },
        'yoga-green': {
          light: '#D1FAE5',
          DEFAULT: '#34D399',
        },
        'yoga-orange': {
          light: '#FED7AA',
          DEFAULT: '#FB923C',
        },
        'yoga-gray': {
          light: '#F3F4F6',
          DEFAULT: '#9CA3AF',
          dark: '#4B5563',
        },
      },
    },
  },
  plugins: [],
}

