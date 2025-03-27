/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans CJK JP', 'Arial', 'sans-serif']
      },
      colors: {
        'custom-bg': '#ececec',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
      }
    },
  },
  plugins: [],
}
