import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    setupFiles: './src/test/setup.js',
    // Mock import.meta.env para que d1Client.js no explote en tests
    env: {
      VITE_WORKER_URL: 'https://siso-api.dr-juliancucalon.workers.dev',
      VITE_WORKER_TOKEN: 'test-token-123-for-vitest',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/shared/**', 'src/modules/**'],
    },
  },
});
