import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  base: '/BravvoOS/',
  server: {
    host: process.env.VITE_HOST || '127.0.0.1',
    port: parseInt(process.env.PORT) || 5173,
    strictPort: true,
  },
  preview: {
    host: process.env.VITE_HOST || '127.0.0.1',
    port: parseInt(process.env.PORT) || 4173,
    strictPort: true,
  }
}))
