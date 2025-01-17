/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '../node_modules/.vite/testing-utils',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    cache: {
      dir: '../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: [
      'src/lib/setup/console.mock.ts',
      'src/lib/setup/reset.mocks.ts',
    ],
  },
});
