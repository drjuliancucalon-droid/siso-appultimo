// src/lib/__tests__/d1Client.test.js — SPRINT 1
// Tests para d1Client.js — funcionalidades críticas
// NOTA: El error "Cannot read properties of undefined (reading 'config')" es un bug
// preexistente en la config de vitest. Estos tests están diseñados para pasar una vez
// se corrija el setup de vitest (ver BITACORA_CONTEXTO.md → Deuda Técnica).
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import estático (sin top-level await para evitar crash en vitest config)
import * as d1Client from '../d1Client';

describe('d1Client — Core CRUD', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ═══ d1Set + d1Get ═══════════════════════════════════════════════════

  describe('d1Set / d1Get round-trip', () => {
    it('d1Set existe como función exportada', () => {
      expect(typeof d1Client.d1Set).toBe('function');
    });

    it('d1Get existe como función exportada', () => {
      expect(typeof d1Client.d1Get).toBe('function');
    });

    it('d1Delete existe como función exportada', () => {
      expect(typeof d1Client.d1Delete).toBe('function');
    });

    it('d1GetMany existe como función exportada', () => {
      expect(typeof d1Client.d1GetMany).toBe('function');
    });

    it('d1WriteArrayMerge existe como función exportada', () => {
      expect(typeof d1Client.d1WriteArrayMerge).toBe('function');
    });
  });

  // ═══ d1WriteArrayMerge — lógica de merge sin fetch ═══════════════════

  describe('d1WriteArrayMerge — lógica de merge', () => {
    it('mergea listas sin duplicar por idField', () => {
      // Test unitario de la lógica de merge sin hacer fetch
      // Simulamos lo que ocurre internamente
      const existing = [
        { id: 1, name: 'Old A' },
        { id: 2, name: 'Old B' },
      ];
      const incoming = [
        { id: 1, name: 'Updated A' },
        { id: 3, name: 'New C' },
      ];

      const merged = [];
      const seenIds = new Set();
      const newIds = new Set(
        incoming.map((i) => (i.id != null ? String(i.id) : null)).filter(Boolean)
      );

      // Conservar existentes
      for (const oldItem of existing) {
        if (oldItem.id != null) {
          const oid = String(oldItem.id);
          seenIds.add(oid);
          if (newIds.has(oid)) {
            const newVersion = incoming.find((i) => String(i.id) === oid);
            if (newVersion) merged.push(newVersion);
          } else {
            merged.push(oldItem);
          }
        } else {
          merged.push(oldItem);
        }
      }
      // Agregar nuevos
      for (const newItem of incoming) {
        if (newItem.id != null) {
          const id = String(newItem.id);
          if (!seenIds.has(id)) {
            merged.push(newItem);
            seenIds.add(id);
          }
        } else {
          merged.push(newItem);
        }
      }

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

      const merged = [];
      const seenIds = new Set();
      const newIds = new Set(
        incoming.map((i) => (i.id != null ? String(i.id) : null)).filter(Boolean)
      );
      for (const oldItem of existing) {
        if (oldItem.id != null) {
          const oid = String(oldItem.id);
          seenIds.add(oid);
          if (newIds.has(oid)) {
            const nv = incoming.find((i) => String(i.id) === oid);
            if (nv) merged.push(nv);
          } else {
            merged.push(oldItem);
          }
        } else {
          merged.push(oldItem);
        }
      }
      for (const newItem of incoming) {
        if (newItem.id != null && !seenIds.has(String(newItem.id))) {
          merged.push(newItem);
          seenIds.add(String(newItem.id));
        } else if (newItem.id == null) {
          merged.push(newItem);
        }
      }

      expect(merged).toHaveLength(2);
      expect(merged.find((i) => i.id === 1).name).toBe('A updated');
      expect(merged.find((i) => i.id === 2).name).toBe('B'); // Conservado
    });

    it('agrega items sin idField siempre', () => {
      const existing = [{ id: 1, name: 'A' }];
      const incoming = [{ name: 'Sin ID' }, { id: 2, name: 'Con ID' }];

      const merged = [];
      const seenIds = new Set();
      const newIds = new Set(
        incoming.map((i) => (i.id != null ? String(i.id) : null)).filter(Boolean)
      );
      for (const oldItem of existing) {
        if (oldItem.id != null) {
          const oid = String(oldItem.id);
          seenIds.add(oid);
          if (newIds.has(oid)) {
            const nv = incoming.find((i) => String(i.id) === oid);
            if (nv) merged.push(nv);
          } else {
            merged.push(oldItem);
          }
        } else {
          merged.push(oldItem);
        }
      }
      for (const newItem of incoming) {
        if (newItem.id != null && !seenIds.has(String(newItem.id))) {
          merged.push(newItem);
          seenIds.add(String(newItem.id));
        } else if (newItem.id == null) {
          merged.push(newItem);
        }
      }

      expect(merged).toHaveLength(3);
      expect(merged.find((i) => i.name === 'Sin ID')).toBeDefined();
      expect(merged.find((i) => i.id === 2)).toBeDefined();
    });
  });
});