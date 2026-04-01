import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  preview: {
    allowedHosts: ['eps.abysscore.cloud']
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js'],
    },
  },
})
