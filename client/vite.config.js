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
          utils: ['axios']
          // Removed 'moment' because it might not be installed or needed. 
          // If you use moment, run 'npm install moment' in client folder.
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
