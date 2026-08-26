// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8881,
    proxy: {
      '/fms/api': {
        target: env.VITE_BACKEND_URL || 'http://localhost:3346',
        changeOrigin: true,
      },
      '/socket.io': {
        target: env.VITE_BACKEND_URL || 'http://localhost:3346',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  }
})