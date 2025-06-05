import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,    proxy: {
      '/api': {
        target: 'https://daycare-ai-activity-suggestions-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add CORS headers to the proxy request
            proxyReq.setHeader('Origin', 'https://daycare-ai-activity-suggestio-git-ce06d5-senthilarun8s-projects.vercel.app');
            proxyReq.setHeader('Access-Control-Request-Method', req.method);
            proxyReq.setHeader('Access-Control-Request-Headers', 'Content-Type, Authorization');
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
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
