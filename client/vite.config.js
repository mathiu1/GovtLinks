import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          icons: ['react-icons'],
          utils: ['axios', 'moment'] // assuming these might be used or added
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
