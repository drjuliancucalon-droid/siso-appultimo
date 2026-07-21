export { WorkerPortal } from './components/WorkerPortal';
export { PatientList } from './components/PatientList';
export { UnsafeConditionReport } from './components/UnsafeConditionReport';
// FIX 2026-07-21: PortalPublicoTrabajador (arquitectura Supabase pre-D1, sin
// import activo en ningún lado) se eliminó — este re-export ya apuntaba a una
// ruta ('./ui/PortalPublicoTrabajador') que ni siquiera existía en el árbol
// actual. El portal público real es WorkerPortalPage → WorkerPortal.jsx.
