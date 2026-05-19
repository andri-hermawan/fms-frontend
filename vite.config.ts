// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
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
      'fms/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3346',
        changeOrigin: true,
      },
    },
  },
})