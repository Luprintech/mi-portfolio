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
          'editor-vendor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/core',
            '@tiptap/extension-character-count',
            '@tiptap/extension-code-block-lowlight',
            '@tiptap/extension-color',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
            '@tiptap/extension-table',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
            '@tiptap/extension-table-row',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
            '@tiptap/extension-youtube',
            'lowlight',
            'highlight.js',
          ],
          'cms-diagrams-vendor': ['mermaid'],
          'cms-pdf-vendor': ['pdfjs-dist'],
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
    // Proxy solo en desarrollo: redirige /api/ al backend local
    // En producción esto no existe; nginx.docker.conf hace el proxy
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
