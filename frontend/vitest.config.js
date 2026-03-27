import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  test: {
    // Entorno de navegador simulado
    environment: 'jsdom',
    // Ejecutar el setup global antes de cada archivo de test
    setupFiles: ['./src/test/setup.js'],
    // Globals como describe/it/expect disponibles sin imports
    globals: true,
    // Excluir tests E2E de Playwright — los corre `npm run test:e2e`, no Vitest
    exclude: ['**/node_modules/**', '**/e2e/**'],
    // Cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/test/**',
        'src/main.jsx',
        'src/i18n.js',
        'src/assets/**',
        'src/locales/**',
      ],
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 20,
        statements: 20,
      },
    },
  },
});
