// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans CJK JP', 'Arial', 'sans-serif']
      },
      colors: {
        'custom-bg': '#ececec',
        // primaryカラーを追加
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          foreground: '#ffffff',
        },
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-500',
    'bg-blue-600',
    'bg-green-100',
    'bg-blue-100',
    'text-blue-600',
    'text-green-600',
  ]
}

export default config