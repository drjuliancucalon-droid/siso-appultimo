export { LoginForm } from './components/LoginForm';
export { ChangePasswordForm } from './components/ChangePasswordForm';
export { TwoFactorAuth } from './components/TwoFactorAuth';
export { PrivacyModal } from './components/PrivacyModal';
// FIX 2026-07-21: useAuth.js era un hook huérfano (in-memory, sin persistencia
// real) eliminado en la consolidación de autenticación — este re-export apuntaba
// a un archivo que ya no existe. El camino real de sesión es useAuthStore.
