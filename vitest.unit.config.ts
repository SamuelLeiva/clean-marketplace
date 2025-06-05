import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'unit',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['src/tests/e2e/**', 'src/tests/integration/**'],
    sequence: {
      concurrent: false,
    },
  },
})
