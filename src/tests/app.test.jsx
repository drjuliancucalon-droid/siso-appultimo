import { describe, it, expect } from 'vitest';

// Test mínimo: verificar que el módulo App se puede importar sin crash
describe('App', () => {
  it('should export a default component', async () => {
    const mod = await import('../App.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});
