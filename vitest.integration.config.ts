import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { env } from 'node:process'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'integration',
    environment: 'node',
    env: {
      DATABASE_URL: env.DATABASE_URL,
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['src/tests/unit/**', 'src/tests/e2e/**'],
    setupFiles: ['./src/tests/integration/setup.ts'],
    // Ejecutar tests de integración en serie para evitar conflictos de DB
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Timeout más largo para tests de integración
    testTimeout: 10000,
  },
})
