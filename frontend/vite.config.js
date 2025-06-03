import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 'https://daycare-ai-activity-suggestions-qczyx1qmd.vercel.app/'},
    proxy:{
      '/api':{
        target: 'https://backend-1qn7j1ns5-senthilarun8s-projects.vercel.app/', // Adjust the target to your backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
})
