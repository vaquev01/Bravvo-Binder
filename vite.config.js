import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/BravvoOS/' : '/',
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
