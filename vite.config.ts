/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['eps.abysscore.cloud'],
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/setupTests.ts',
        'src/vite-env.d.ts',
        'src/types/**',
        'src/pages/**',
        'src/components/ui/**',
        'src/routes/**',
        'src/lib/utils.ts',
        'src/services/*.service.ts',
        'src/App.tsx',
        'src/components/layout/AppLayout.tsx',
        'src/components/layout/Sidebar.tsx',
        'src/components/layout/Header.tsx',
        'src/components/shared/ConfirmDialog.tsx',
        'src/components/shared/VisuallyHidden.tsx',
      ],
    },
  },
})
