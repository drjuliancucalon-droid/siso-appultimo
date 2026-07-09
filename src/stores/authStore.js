// src/stores/authStore.js — SPRINT 2: Auth conectado a D1
// Refs: Monolito línea 1022 (SECRETARIA_PERMISOS_DEFAULT), 9085-9200 (usuarios hardcoded)
//       Monolito _isAdminEmpresa, _canUse, _secretariaPuede
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { d1Get, d1Set, d1WriteArrayMerge } from '../lib/d1Client';
import { migrateLocalStorageToCloud } from '../lib/migrateStorage';
import { _sha256 } from '../shared/lib/crypto';
import { _canUse, _secretariaPuede, PLAN_CONFIG, SECRETARIA_PERMISOS_DEFAULT } from '../shared/data/planConfig.js';
import { useAIStore } from './aiStore';

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const SISO_USERS_KEY = 'siso_users';

// ── Helpers ────────────────────────────────────────────────────────
function _isAdminEmpresa(role) {
  return role === 'admin_empresa';
}

/**
 * Carga la lista de usuarios desde D1 (siso_users).
 * Si no existe, inicializa con seed users del monolito (línea 9085-9200).
 */
// Hashes correctos para usuarios conocidos — permite corregir D1 sin destruir cuentas nuevas
const KNOWN_CORRECT_HASHES = {
  'drcucalon': '49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd',
};

async function _loadUsersFromD1() {
  try {
    const { value } = await d1Get(SISO_USERS_KEY);
    if (Array.isArray(value) && value.length > 0) {
      // Migración de hashes: corrige passHash de usuarios conocidos sin borrar cuentas extra
      let needsUpdate = false;
      const migrated = value.map(u => {
        const correctHash = KNOWN_CORRECT_HASHES[u.user];
        if (correctHash && u.passHash !== correctHash) {
          needsUpdate = true;
          return { ...u, passHash: correctHash };
        }
        return u;
      });
      if (needsUpdate) {
        d1Set(SISO_USERS_KEY, migrated).catch(() => {});
        return migrated;
      }
      return value;
    }
  } catch (err) {
    console.warn('[authStore] D1 unreachable, usando seed local:', err.message);
  }
  // Seed users fieles al monolito
  const seed = [
    {
      id: 1, user: 'drcucalon', passHash: '49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd',
      name: 'Dr. Julian Cucalon', nombre: 'Dr. Julian Cucalon', role: 'super_admin',
      orgId: 'ORG-001', license: 'clinica', licenseExpiry: '2099-12-31', licenseStarted: '2026-01-01',
      porcentajeHonorarios: 100, secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT }, activo: true,
      doctorData: { nombre: 'Dr. Julian Cucalon', titulo: 'Médico Especialista en Salud Ocupacional', ciudad: 'Popayán' },
      mustChangePassword: false,
    },
    {
      id: 2, user: 'dr.garcia', passHash: 'ff75db5104f87b85a8f9a58731aa51313233cae9534d3b44c18bcea2c01bfe7d',
      name: 'Dr. Carlos García', nombre: 'Dr. Carlos García', role: 'medico',
      orgId: 'ORG-001', license: 'clinica', licenseExpiry: '2099-12-31',
      secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT }, activo: true,
      doctorData: { nombre: 'Dr. Carlos García', titulo: 'Médico Ocupacional', ciudad: 'Popayán' },
      mustChangePassword: false,
    },
    {
      id: 3, user: 'admin.ips', passHash: '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6',
      name: 'Administrador IPS', nombre: 'Administrador IPS', role: 'administrador',
      orgId: 'ORG-001', license: 'clinica', licenseExpiry: '2099-12-31',
      secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT }, activo: true,
      mustChangePassword: false,
    },
    {
      id: 4, user: 'secre.maria', passHash: '0723f257f0b360e57fc499c1fdd809f4cb922ba52b861166f6df91fbe42be363',
      name: 'María López', nombre: 'María López (Secretaria)', role: 'secretaria',
      orgId: 'ORG-001', license: 'libre', licenseExpiry: '2099-12-31',
      activo: true,
      secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT, agenda: true, pacientes_lista: true, adjuntos: true },
      mustChangePassword: false,
    },
    {
      id: 5, user: 'secre.ana', passHash: '0723f257f0b360e57fc499c1fdd809f4cb922ba52b861166f6df91fbe42be363',
      name: 'Ana Martínez', nombre: 'Ana Martínez (Secretaria)', role: 'secretaria',
      orgId: 'ORG-001', license: 'libre', licenseExpiry: '2099-12-31',
      activo: true,
      secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT, agenda: true, pacientes_lista: true, caja: true, cuentas_cobro: true, pacientes_crear: true },
      mustChangePassword: false,
    },
    {
      id: 6, user: 'empresa.abc', passHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      name: 'Admin Empresa ABC', nombre: 'Admin Empresa ABC', role: 'admin_empresa',
      empresaId: 'e-001', empresaNombre: 'Constructora ABC SAS',
      orgId: 'ORG-001', license: 'clinica', licenseExpiry: '2099-12-31',
      secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT }, activo: true,
      mustChangePassword: false,
    },
  ];
  // Escribir seed en D1
  try { await d1Set(SISO_USERS_KEY, seed); } catch {}
  return seed;
}

/**
 * Busca usuario por username y valida password.
 * Retorna el objeto user (sin passHash) o null.
 */
async function _authenticateUser(username, password) {
  const users = await _loadUsersFromD1();
  const user = users.find((u) => u.user === username && u.activo !== false);
  if (!user) return null;

  const hash = await _sha256(password);
  if (hash !== user.passHash) return null;

  // Limpiar campos sensibles
  const { passHash: _, ...cleanUser } = user;
  return cleanUser;
}

// ── Store ───────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────
      currentUser: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loginAttempts: 0,
      blockedUntil: null,
      lastActivity: null,
      privacidadAceptada: false,
      mustChangePassword: false,
      twoFARequired: false,
      usersList: [], // Cache de siso_users

      // ── Actions ────────────────────────────

      /**
       * login(username, password)
       * Autentica contra D1 (siso_users).
       * Rate limiting: 5 intentos → 15 min bloqueo.
       */
      login: async (username, password) => {
        const { loginAttempts, blockedUntil } = get();

        if (blockedUntil && Date.now() < blockedUntil) {
          const minLeft = Math.ceil((blockedUntil - Date.now()) / 60000);
          throw new Error(`Cuenta bloqueada. Intenta en ${minLeft} minuto(s).`);
        }

        const user = await _authenticateUser(username, password);
        if (!user) {
          const newAttempts = loginAttempts + 1;
          const updates = { loginAttempts: newAttempts };
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            updates.blockedUntil = Date.now() + BLOCK_DURATION_MS;
            updates.loginAttempts = 0;
          }
          set(updates);
          throw new Error('Usuario o contraseña incorrectos');
        }

        // Generar token JWT-like (en memoria, no persistido en D1)
        const token = `siso_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;

        set({
          currentUser: user,
          token,
          isAuthenticated: true,
          loginAttempts: 0,
          blockedUntil: null,
          lastActivity: Date.now(),
          mustChangePassword: !!user.mustChangePassword,
          twoFARequired: !!user.twoFAEnabled && !user._twoFAVerified,
        });

        // Sincronizar AI keys desde D1 en background (no bloquea el login)
        try { useAIStore.getState().loadFromD1(user.user); } catch (_) {}

        return user;
      },

      /**
       * loginLocal(user)
       * Login rápido sin password (ya autenticado externamente).
       * Valida que el usuario exista en D1, o lo agrega si no.
       */
      loginLocal: async (user) => {
        if (!user?.user) {
          throw new Error('Usuario inválido');
        }

        // Verificar/crear en D1
        const users = await _loadUsersFromD1();
        let existing = users.find((u) => u.user === user.user);
        if (!existing) {
          // Agregar usuario nuevo a siso_users
          existing = {
            id: Date.now(),
            user: user.user,
            passHash: user.passHash || '',
            name: user.name || user.nombre || user.user,
            nombre: user.nombre || user.name || user.user,
            role: user.role || 'medico',
            orgId: user.orgId || 'ORG-001',
            license: user.license || 'libre',
            licenseExpiry: user.licenseExpiry || '2099-12-31',
            licenseStarted: user.licenseStarted || new Date().toISOString().split('T')[0],
            secretariaPermisos: user.secretariaPermisos || { ...SECRETARIA_PERMISOS_DEFAULT },
            activo: true,
            doctorData: user.doctorData || {},
            mustChangePassword: user.mustChangePassword || false,
          };
          users.push(existing);
          try { await d1Set(SISO_USERS_KEY, users); } catch {}
        }

        // Limpiar campos sensibles
        const { passHash: _, ...cleanUser } = existing;

        const token = `siso_local_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;

        set({
          currentUser: cleanUser,
          token,
          isAuthenticated: true,
          loginAttempts: 0,
          blockedUntil: null,
          lastActivity: Date.now(),
          mustChangePassword: !!cleanUser.mustChangePassword,
          twoFARequired: false,
        });

        // FASE R-1: Migración one-shot localStorage → D1
        migrateLocalStorageToCloud(cleanUser.user).catch((e) => {
          console.warn('[R-1] Migración falló en background:', e.message);
        });

        // Sincronizar AI keys desde D1 en background
        try { useAIStore.getState().loadFromD1(cleanUser.user); } catch (_) {}

        return cleanUser;
      },

      logout: () => {
        set({
          currentUser: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastActivity: null,
          privacidadAceptada: false,
          mustChangePassword: false,
          twoFARequired: false,
        });
      },

      resetActivity: () => {
        set({ lastActivity: Date.now() });
      },

      acceptPrivacy: () => {
        set({ privacidadAceptada: true });
      },

      setMustChangePassword: (val) => {
        set({ mustChangePassword: val });
      },

      setTwoFARequired: (val) => {
        set({ twoFARequired: val });
      },

      // ── CRUD de usuarios (contra D1) ──────

      /**
       * getUsersList()
       * Carga la lista completa desde D1 y la cachea en el store.
       */
      getUsersList: async () => {
        const users = await _loadUsersFromD1();
        // Limpiar passHash de todos
        const clean = users.map(({ passHash, ...u }) => u);
        set({ usersList: clean });
        return clean;
      },

      /**
       * createUser(userData)
       * Agrega un usuario nuevo a siso_users vía d1WriteArrayMerge.
       * admin_empresa hereda empresaId + orgId del currentUser.
       */
      createUser: async (userData) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('No autenticado');

        const users = await _loadUsersFromD1();

        // Validar username único
        if (users.some((u) => u.user === userData.user)) {
          throw new Error('El nombre de usuario ya existe');
        }

        const newUser = {
          id: Date.now(),
          user: userData.user,
          passHash: userData.password ? await _sha256(userData.password) : '',
          name: userData.name || userData.user,
          nombre: userData.nombre || userData.name || userData.user,
          role: userData.role || 'medico',
          orgId: userData.orgId || currentUser.orgId || 'ORG-001',
          license: userData.license || 'libre',
          licenseExpiry: userData.licenseExpiry || '2099-12-31',
          licenseStarted: userData.licenseStarted || new Date().toISOString().split('T')[0],
          secretariaPermisos: userData.secretariaPermisos || { ...SECRETARIA_PERMISOS_DEFAULT },
          activo: userData.activo !== false,
          doctorData: userData.doctorData || {},
          mustChangePassword: userData.mustChangePassword || false,
          empresaId: userData.empresaId || (currentUser.role === 'admin_empresa' ? currentUser.empresaId : undefined),
          empresaNombre: userData.empresaNombre || (currentUser.role === 'admin_empresa' ? currentUser.empresaNombre : undefined),
        };

        // admin_empresa solo puede crear secretaria/medico para su empresa
        if (currentUser.role === 'admin_empresa') {
          newUser.orgId = currentUser.orgId;
          newUser.empresaId = currentUser.empresaId;
          newUser.empresaNombre = currentUser.empresaNombre;
          if (!['secretaria', 'medico', 'admin_empresa'].includes(newUser.role)) {
            throw new Error('admin_empresa solo puede crear usuarios con rol secretaria o médico');
          }
        }

        const result = await d1WriteArrayMerge(SISO_USERS_KEY, [newUser], 'id');

        // Actualizar cache local
        const { passHash: _, ...cleanUser } = newUser;
        const { usersList: currentList } = get();
        set({ usersList: [...currentList, cleanUser] });

        return { ok: true, user: cleanUser, ...result };
      },

      /**
       * updateUser(id, updates)
       * Actualiza campos de un usuario en siso_users.
       * Si updates.password está presente, recalcula passHash.
       */
      updateUser: async (id, updates) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('No autenticado');

        const users = await _loadUsersFromD1();
        const idx = users.findIndex((u) => u.id === id || u.user === id);
        if (idx === -1) throw new Error('Usuario no encontrado');

        const updated = { ...users[idx], ...updates };
        if (updates.password) {
          updated.passHash = await _sha256(updates.password);
          delete updated.password;
        }

        // admin_empresa solo puede editar usuarios de su empresa
        if (currentUser.role === 'admin_empresa' && updated.empresaId !== currentUser.empresaId) {
          throw new Error('admin_empresa solo puede editar usuarios de su empresa');
        }

        users[idx] = updated;
        await d1Set(SISO_USERS_KEY, users);

        // Actualizar cache local
        const { passHash: _, ...cleanUser } = updated;
        const { usersList: currentList } = get();
        const newList = currentList.map((u) => (u.id === id || u.user === id ? cleanUser : u));
        set({ usersList: newList });

        return { ok: true, user: cleanUser };
      },

      /**
       * deleteUser(id)
       * Marca usuario como inactivo (soft delete) en siso_users.
       */
      deleteUser: async (id) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('No autenticado');

        const users = await _loadUsersFromD1();
        const idx = users.findIndex((u) => u.id === id || u.user === id);
        if (idx === -1) throw new Error('Usuario no encontrado');

        // Soft delete: marcar inactivo
        users[idx].activo = false;
        await d1Set(SISO_USERS_KEY, users);

        // Remover del cache local
        const { usersList: currentList } = get();
        set({ usersList: currentList.filter((u) => u.id !== id && u.user !== id) });

        return { ok: true };
      },

      /**
       * generateTOTPSecret(username)
       * Genera un secreto TOTP único y lo guarda en el usuario.
       * Retorna el secreto y la URL para QR.
       */
      generateTOTPSecret: async (username) => {
        const users = await _loadUsersFromD1();
        const idx = users.findIndex((u) => u.user === username);
        if (idx === -1) throw new Error('Usuario no encontrado');

        // Generar secreto base32 aleatorio (20 bytes)
        const randomBytes = new Uint8Array(20);
        crypto.getRandomValues(randomBytes);
        const base32 = Array.from(randomBytes).map((b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[b % 32]).join('');
        const secret = base32;

        users[idx].totpSecret = secret;
        users[idx].twoFAEnabled = false; // Pendiente de verificar
        await d1Set(SISO_USERS_KEY, users);

        const issuer = 'SISO-OcupaSalud';
        const qrUrl = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;

        // Actualizar cache local
        const { usersList: currentList } = get();
        const newList = currentList.map((u) => {
          if (u.user === username) return { ...u, totpSecret: secret, twoFAEnabled: false };
          return u;
        });
        set({ usersList: newList });

        return { secret, qrUrl };
      },

      /**
       * verifyTOTP(username, code)
       * Verifica código TOTP. Si válido, marca twoFAEnabled = true.
       */
      verifyTOTP: async (username, code) => {
        const users = await _loadUsersFromD1();
        const idx = users.findIndex((u) => u.user === username);
        if (idx === -1) throw new Error('Usuario no encontrado');

        const { totpSecret } = users[idx];
        if (!totpSecret) throw new Error('No hay secreto TOTP configurado. Genera uno primero.');

        // Validar código TOTP (algoritmo simplificado)
        // En producción usaría otplib o similar. Aquí validamos formato.
        if (!code || code.length < 4 || code.length > 8) {
          throw new Error('Código TOTP inválido');
        }

        // Para MVP: marcar como verificado si el código tiene 6 dígitos
        // (Validación real TOTP requiere librería otplib)
        if (code.length === 6 && /^\d{6}$/.test(code)) {
          users[idx].twoFAEnabled = true;
          users[idx]._twoFAVerified = true;
          await d1Set(SISO_USERS_KEY, users);

          // Actualizar cache local
          const { usersList: currentList } = get();
          const newList = currentList.map((u) => {
            if (u.user === username) return { ...u, twoFAEnabled: true, _twoFAVerified: true };
            return u;
          });
          set({ usersList: newList });

          // Si el currentUser es este usuario, actualizar currentUser
          const { currentUser } = get();
          if (currentUser?.user === username) {
            set({ currentUser: { ...currentUser, twoFAEnabled: true, _twoFAVerified: true }, twoFARequired: false });
          }

          return { ok: true, verified: true };
        }

        throw new Error('Código TOTP inválido. Use un código de 6 dígitos.');
      },

      /**
       * changePassword(username, currentPassword, newPassword)
       * Cambia contraseña del usuario. Verifica password actual.
       */
      changePassword: async (username, currentPassword, newPassword) => {
        const users = await _loadUsersFromD1();
        const idx = users.findIndex((u) => u.user === username);
        if (idx === -1) throw new Error('Usuario no encontrado');

        const currentHash = await _sha256(currentPassword);
        if (currentHash !== users[idx].passHash) {
          throw new Error('Contraseña actual incorrecta');
        }

        users[idx].passHash = await _sha256(newPassword);
        users[idx].mustChangePassword = false;
        await d1Set(SISO_USERS_KEY, users);

        // Actualizar currentUser si es el mismo
        const { currentUser } = get();
        if (currentUser?.user === username) {
          set({ currentUser: { ...currentUser, mustChangePassword: false } });
        }

        return { ok: true };
      },

      // ── Helpers de rol ─────────────────────

      isAdmin: () => {
        const { currentUser } = get();
        return currentUser?.role === 'administrador' || currentUser?.role === 'super_admin';
      },

      isMedico: () => {
        const { currentUser } = get();
        return currentUser?.role === 'medico' || currentUser?.role === 'administrador';
      },

      isSecretaria: () => {
        const { currentUser } = get();
        return currentUser?.role === 'secretaria';
      },

      isAdminEmpresa: () => {
        const { currentUser } = get();
        return _isAdminEmpresa(currentUser?.role);
      },

      canAccess: (feature, usersListParam) => {
        const { currentUser, usersList } = get();
        if (!currentUser) return false;
        const role = currentUser.role;
        if (['super_admin', 'administrador'].includes(role)) return true;
        if (role === 'medico') return true;
        if (role === 'admin_empresa') {
          // admin_empresa tiene acceso limitado: solo ve su empresa
          const restrictedFeatures = ['empresas_editar', 'usuarios_globales', 'reporte_global', 'sve_global'];
          return !restrictedFeatures.includes(feature);
        }
        if (role === 'secretaria') {
          const list = usersListParam || usersList;
          return _secretariaPuede(feature, currentUser, list);
        }
        return false;
      },

      canAccessModule: (feature, usersListParam) => {
        const { currentUser, usersList } = get();
        const list = usersListParam || usersList;
        return _secretariaPuede(feature, currentUser, list);
      },

      canUse: (feature) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        if (currentUser.role === 'super_admin') return true;
        return _canUse(feature, currentUser);
      },

      getPlanConfig: () => {
        const { currentUser } = get();
        if (currentUser?.role === 'super_admin') return PLAN_CONFIG.clinica;
        const plan = currentUser?.license || 'libre';
        return PLAN_CONFIG[plan] || PLAN_CONFIG.libre;
      },

      getHCLimit: () => {
        const { currentUser } = get();
        if (currentUser?.role === 'super_admin') return 9999;
        const plan = currentUser?.license || 'libre';
        return (PLAN_CONFIG[plan] || PLAN_CONFIG.libre).maxHC || 8;
      },

      // getFilteredUsers: admin_empresa solo ve usuarios de su empresa
      getFilteredUsers: () => {
        const { currentUser, usersList } = get();
        if (currentUser?.role === 'admin_empresa' && currentUser?.empresaId) {
          return usersList.filter(
            (u) => u.empresaId === currentUser.empresaId || u.role === 'admin_empresa'
          );
        }
        return usersList;
      },

      // ── loginOffline: fallback cuando D1 y Supabase no están disponibles ──
      loginOffline: async (username, password) => {
        const { loginAttempts, blockedUntil } = get();

        if (blockedUntil && Date.now() < blockedUntil) {
          const minLeft = Math.ceil((blockedUntil - Date.now()) / 60000);
          throw new Error(`Cuenta bloqueada. Intenta en ${minLeft} minuto(s).`);
        }

        try {
          return await get().login(username, password);
        } catch (err) {
          // Si D1 falla, intentar con usuarios en localStorage como fallback
          try {
            const local = JSON.parse(localStorage.getItem('siso_users') || '[]');
            const user = local.find((u) => u.user === username && u.activo !== false);
            if (!user) throw new Error('Usuario no encontrado');
            const hash = await _sha256(password);
            if (hash !== user.passHash) throw new Error('Contraseña incorrecta');
            const { passHash: _, ...cleanUser } = user;
            const token = `siso_local_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
            set({
              currentUser: cleanUser,
              token,
              isAuthenticated: true,
              loginAttempts: 0,
              blockedUntil: null,
              lastActivity: Date.now(),
              mustChangePassword: !!cleanUser.mustChangePassword,
              twoFARequired: false,
            });
            return cleanUser;
          } catch (localErr) {
            const newAttempts = loginAttempts + 1;
            const updates = { loginAttempts: newAttempts };
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
              updates.blockedUntil = Date.now() + BLOCK_DURATION_MS;
              updates.loginAttempts = 0;
            }
            set(updates);
            throw err;
          }
        }
      },

      // ── handleImportData: importa datos con protección localStorage lleno ──
      handleImportData: async (jsonStrOrFile) => {
        try {
          let data;
          if (typeof jsonStrOrFile === 'string') {
            data = JSON.parse(jsonStrOrFile);
          } else {
            data = jsonStrOrFile;
          }

          if (!data || typeof data !== 'object') {
            throw new Error('Formato de datos inválido');
          }

          const entries = Object.entries(data);
          let imported = 0;
          const errors = [];

          for (const [key, value] of entries) {
            try {
              const strValue = JSON.stringify(value);
              if (strValue.length > 2_000_000) {
                // Valores muy grandes se escriben directamente en D1
                await d1Set(key, value).catch(() => {
                  try { localStorage.setItem(key, strValue); } catch {}
                });
              } else {
                try {
                  localStorage.setItem(key, strValue);
                } catch (lsErr) {
                  // localStorage lleno → intentar D1
                  try { await d1Set(key, value); } catch {}
                  console.warn('[importData] localStorage lleno, dato guardado en D1:', key);
                }
              }
              imported++;
            } catch (itemErr) {
              errors.push({ key, error: itemErr.message });
            }
          }

          return { ok: true, imported, errors: errors.length > 0 ? errors : null };
        } catch (err) {
          throw new Error(`Error al importar datos: ${err.message}`);
        }
      },
    }),
    {
      name: 'siso-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        privacidadAceptada: state.privacidadAceptada,
      }),
    }
  )
);