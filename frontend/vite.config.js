import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // make sure this part is a number, not a string, wasted 4 hours bc of that
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 'daycare-ai-activity-suggestions.vercel.app/'}, // http://localhost:3000
//     proxy:{
//       '/api':{
//         target: 'https://daycare-ai-activity-suggestions-backend.onrender.com/', // Adjust the target to your backend server URL
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
// })
