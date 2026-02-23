import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  build: {
    // Mejoras de performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion', 'react-parallax-tilt'],
          'icons-vendor': ['react-icons'],
          'swiper-vendor': ['swiper'],
        },
      },
    },
    // Optimizaciones adicionales
    chunkSizeWarningLimit: 1000, // Aumentar límite para chunks grandes
    minify: 'esbuild', // Usar esbuild (incluido en Vite)
    target: 'es2015', // Compatibilidad con navegadores modernos
  },

  // Optimización de servidor de desarrollo
  server: {
    port: 5173,
    open: true,
  },
})
