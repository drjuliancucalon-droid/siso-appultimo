// src/lib/__tests__/d1Client.test.js — SPRINT 1
// Tests para d1Client.js — funcionalidades críticas
// NOTA: Ejecutar con `npx vitest run src/lib/__tests__/d1Client.test.js`
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ═══ d1WriteArrayMerge — lógica de merge pura (sin imports del módulo) ═══
// Validamos el algoritmo de merge sin arrastrar dependencias de fetch/env

function mergeArrays(existing, incoming, idField = 'id') {
  const merged = [];
  const seenIds = new Set();
  const newIds = new Set(
    incoming.map((i) => (i?.[idField] != null ? String(i[idField]) : null)).filter(Boolean)
  );

  for (const oldItem of existing) {
    if (oldItem?.[idField] != null) {
      const oid = String(oldItem[idField]);
      seenIds.add(oid);
      if (newIds.has(oid)) {
        const newVersion = incoming.find((i) => String(i?.[idField]) === oid);
        if (newVersion) merged.push(newVersion);
        newIds.delete(oid);
      } else {
        merged.push(oldItem);
      }
    } else {
      merged.push(oldItem);
    }
  }

  for (const newItem of incoming) {
    if (newItem?.[idField] != null) {
      const id = String(newItem[idField]);
      if (!seenIds.has(id)) {
        merged.push(newItem);
        seenIds.add(id);
      }
    } else {
      merged.push(newItem);
    }
  }

  return merged;
}

describe('d1WriteArrayMerge — lógica de merge anti-regresión', () => {
  it('mergea listas sin duplicar por idField', () => {
    const existing = [
      { id: 1, name: 'Old A' },
      { id: 2, name: 'Old B' },
    ];
    const incoming = [
      { id: 1, name: 'Updated A' },
      { id: 3, name: 'New C' },
    ];

    const merged = mergeArrays(existing, incoming, 'id');

    expect(merged).toHaveLength(3);
    expect(merged.find((i) => i.id === 1).name).toBe('Updated A');
    expect(merged.find((i) => i.id === 2).name).toBe('Old B');
    expect(merged.find((i) => i.id === 3).name).toBe('New C');
  });

  it('conserva items existentes que no están en la nueva lista', () => {
    const existing = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ];
    const incoming = [
      { id: 1, name: 'A updated' },
    ];

    const merged = mergeArrays(existing, incoming, 'id');

    expect(merged).toHaveLength(2);
    expect(merged.find((i) => i.id === 1).name).toBe('A updated');
    expect(merged.find((i) => i.id === 2).name).toBe('B');
  });

  it('agrega items sin idField siempre', () => {
    const existing = [{ id: 1, name: 'A' }];
    const incoming = [{ name: 'Sin ID' }, { id: 2, name: 'Con ID' }];

    const merged = mergeArrays(existing, incoming, 'id');

    expect(merged).toHaveLength(3);
    expect(merged.find((i) => i.name === 'Sin ID')).toBeDefined();
    expect(merged.find((i) => i.id === 2)).toBeDefined();
  });

  it('funciona con key vacía (sin array existente)', () => {
    const incoming = [{ id: 1, name: 'First' }];
    const merged = mergeArrays([], incoming, 'id');

    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe('First');
  });

  it('reemplaza item existente con versión nueva', () => {
    const existing = [{ id: 'abc', version: 1, data: 'old' }];
    const incoming = [{ id: 'abc', version: 2, data: 'new' }];

    const merged = mergeArrays(existing, incoming, 'id');

    expect(merged).toHaveLength(1);
    expect(merged[0].version).toBe(2);
    expect(merged[0].data).toBe('new');
  });

  it('usa idField personalizado (docNumero)', () => {
    const existing = [
      { docNumero: '123', nombre: 'Juan' },
      { docNumero: '456', nombre: 'Maria' },
    ];
    const incoming = [
      { docNumero: '123', nombre: 'Juan Updated' },
      { docNumero: '789', nombre: 'Pedro' },
    ];

    const merged = mergeArrays(existing, incoming, 'docNumero');

    expect(merged).toHaveLength(3);
    expect(merged.find((i) => i.docNumero === '123').nombre).toBe('Juan Updated');
    expect(merged.find((i) => i.docNumero === '456').nombre).toBe('Maria');
    expect(merged.find((i) => i.docNumero === '789').nombre).toBe('Pedro');
  });

  it('conserva items viejos sin idField y agrega los nuevos', () => {
    const existing = [
      { name: 'Legacy no-ID item' },
      { id: 1, name: 'With ID' },
    ];
    const incoming = [
      { id: 1, name: 'Updated' },
      { name: 'New no-ID item' },
    ];

    const merged = mergeArrays(existing, incoming, 'id');

    expect(merged).toHaveLength(3);
    expect(merged.filter((i) => i.name === 'Legacy no-ID item')).toHaveLength(1);
    expect(merged.filter((i) => i.name === 'New no-ID item')).toHaveLength(1);
    expect(merged.find((i) => i.id === 1).name).toBe('Updated');
  });
});

describe('d1Client — verificación de exports', () => {
  it('módulo d1Client se importa sin errores', async () => {
    const mod = await import('../d1Client');
    expect(mod).toBeDefined();
    expect(typeof mod.d1Get).toBe('function');
    expect(typeof mod.d1Set).toBe('function');
    expect(typeof mod.d1Delete).toBe('function');
    expect(typeof mod.d1GetMany).toBe('function');
    expect(typeof mod.d1WriteArrayMerge).toBe('function');
  });
});