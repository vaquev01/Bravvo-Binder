import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  base: '/BravvoOS/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react')) return 'react-vendor';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
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
