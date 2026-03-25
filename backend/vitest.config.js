import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Entorno Node.js (default para backend)
    environment: 'node',
    // Globals disponibles sin imports explícitos
    globals: true,
    // Solo incluir tests bajo tests/vitest/ (excluir los legacy con runner custom)
    include: ['tests/vitest/**/*.test.{js,ts}'],
    // Cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['middleware/**/*.js', 'utils/**/*.js', 'lib/**/*.js', 'routes/**/*.js'],
      exclude: [
        'tests/**',
        'scripts/**',
        'db/**',
        'node_modules/**',
        'server.js',
      ],
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 20,
        statements: 20,
      },
    },
    // Timeout generoso para tests de integración
    testTimeout: 10000,
    // Variables de entorno para tests (evitar crash por missing vars)
    env: {
      JWT_SECRET: 'test-jwt-secret-for-vitest',
      CMS_USERNAME: 'test-admin',
      CMS_PASSWORD: 'test-password',
      NODE_ENV: 'test',
    },
  },
});
