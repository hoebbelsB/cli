/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/core',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: [
      '../../testing-utils/src/lib/setup/fs.mock.ts',
      '../../testing-utils/src/lib/setup/console.mock.ts',
      '../../testing-utils/src/lib/setup/reset.mocks.ts',
      '../../testing-utils/src/lib/setup/portal-client.mock.ts',
    ],
  },
});
