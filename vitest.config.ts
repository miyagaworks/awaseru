import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    css: false,
    deps: {
      inline: [
        '@testing-library/user-event',
        '@testing-library/react',
        'next/navigation',
        'lucide-react',
        'tailwind-merge'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'next/navigation': path.resolve(__dirname, '__mocks__/next/navigation.ts'),
      'lucide-react': path.resolve(__dirname, '__mocks__/lucide-react.ts'),
      'tailwind-merge': path.resolve(__dirname, '__mocks__/tailwind-merge.ts')
    }
  },
  define: {
    'process.env': {}
  }
})