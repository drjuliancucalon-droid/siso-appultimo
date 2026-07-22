import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    setupFiles: './src/test/setup.js',
    // FIX 2026-07-21: .claude/worktrees/ contiene copias completas del repo
    // (una por cada agente en isolation:"worktree"), cada una con su propio
    // src/test/*.test.js — sin esta exclusión, Vitest las descubre y
    // triplica/cuadriplica cualquier fallo real, ocultando los genuinos entre
    // el ruido.
    exclude: ['**/node_modules/**', '**/.claude/**', '**/dist/**'],
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
