import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            return 'vendor-core';
          }
        },
      },
    },
  },
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
