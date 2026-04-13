// src/pages/Planes.jsx
// Planes y precios del sistema
import React from 'react';
import {
  CreditCard, Check, X, Star, Zap, Building2, Crown, ChevronRight
} from 'lucide-react';

const PLANS = [
  {
    id: 'libre',
    name: 'Libre',
    emoji: '🆓',
    price: 0,
    priceLabel: 'Gratis',
    color: 'gray',
    features: [
      'HC Ocupacional y General',
      'Firma digital y cierre HC',
      'Hasta 8 HC totales',
      'Hasta 5 empresas',
      'Portal de verificación',
      'Backup / Restore',
      'Sincronización Supabase',
    ],
    limits: [
      'Sin agenda',
      'Sin facturación',
      'Sin reportes avanzados',
      'Sin IA',
      'Sin telemedicina',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    emoji: '🌱',
    price: 45000,
    priceLabel: '$45.000/mes',
    color: 'teal',
    popular: false,
    features: [
      'Todo de Libre +',
      'Hasta 200 HC',
      'Hasta 30 empresas',
      'Agenda de citas',
      'Facturación básica',
      'RIPS validación',
      'SVE (2 programas)',
      'Telemedicina (10 sesiones)',
      'Reportes básicos',
    ],
    limits: [
      'Sin IA',
      'Sin DIAN XML',
      'Sin auditoría',
      'Sin 2FA',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '⭐',
    price: 79000,
    priceLabel: '$79.000/mes',
    color: 'blue',
    popular: true,
    features: [
      'Todo de Starter +',
      'HC ilimitadas',
      'Empresas ilimitadas',
      'IA: análisis, resúmenes, reportes',
      'FHIR Export',
      'RIPS Export',
      'DIAN XML',
      'Auditoría completa',
      '2FA / Multi-usuario',
      'Telemedicina ilimitada',
      'SVE Pro (7 programas)',
      'Analytics avanzado',
    ],
    limits: [],
  },
  {
    id: 'clinica',
    name: 'Clínica',
    emoji: '🏢',
    price: 159000,
    priceLabel: '$159.000/mes',
    color: 'purple',
    features: [
      'Todo de Pro +',
      '3 médicos incluidos',
      '+$45.000/médico adicional',
      'Almacenamiento 10 GB',
      'Soporte prioritario',
      'Todas las funcionalidades',
      'Trial 30 días',
    ],
    limits: [],
  },
];

export default function Planes({ currentUser, onSelectPlan }) {
  const currentPlan = currentUser?.license || 'libre';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2">
          <CreditCard className="w-7 h-7 text-purple-500" />
          Planes y Precios
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          Elija el plan que mejor se adapte a las necesidades de su práctica médica.
          Todos los precios en pesos colombianos.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-lg ${
                isCurrent ? `border-${plan.color}-500 ring-2 ring-${plan.color}-100` :
                plan.popular ? `border-${plan.color}-300` : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  ⭐ Más Popular
                </div>
              )}
              {isCurrent && (
                <div className={`absolute -top-3 right-4 px-3 py-0.5 bg-${plan.color}-600 text-white text-xs font-bold rounded-full`}>
                  Plan Actual
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-3xl">{plan.emoji}</span>
                <h3 className="text-xl font-black text-gray-800 mt-2">{plan.name}</h3>
                <p className={`text-2xl font-black mt-1 text-${plan.color}-600`}>
                  {plan.priceLabel}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 text-${plan.color}-500 flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-700">{f}</span>
                  </div>
                ))}
                {plan.limits.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">{l}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !isCurrent && onSelectPlan?.(plan.id)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `bg-${plan.color}-600 text-white hover:bg-${plan.color}-700`
                }`}
              >
                {isCurrent ? '✓ Plan Actual' : plan.price === 0 ? 'Seleccionar' : 'Activar Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
        <p className="text-sm text-blue-700">
          <strong>💡 ¿Necesita ayuda?</strong> Todos los planes incluyen sincronización en la nube con Supabase.
          Los planes de pago incluyen período de prueba gratuito.
        </p>
      </div>
    </div>
  );
}
