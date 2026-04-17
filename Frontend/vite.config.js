import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://final-mse-2-fsd.onrender.com',
        changeOrigin: true,
      }
    }
  }
})