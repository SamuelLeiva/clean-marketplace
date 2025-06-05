import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  //infiere los paths usando alias @ que definimos en ts.config
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'app/api'],
    setupFiles: ['./src/tests/setup.ts'],
    sequence: {
      concurrent: false
    }
  },
})
