import React from 'react';
import { _canUse } from '../../data/initialState.js';
import { PLAN_CONFIG } from '../../data/planConfig.js';

export const PlanGate = ({
  feature,
  requiredPlan,
  currentUser,
  children,
  fallback,
  inline,
}) => {
  if (_canUse(feature, currentUser)) return children;
  const req = PLAN_CONFIG[requiredPlan] || PLAN_CONFIG.starter;
  if (fallback) return fallback;
  if (inline)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-black text-amber-700 cursor-default"
        title={`Disponible en plan ${req.label}`}
      >
        🔒 {req.label}
      </span>
    );
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-5 text-center space-y-2">
      <div className="text-3xl">🔒</div>
      <p className="font-black text-gray-800 text-sm">
        Disponible en plan {req.label}
      </p>
      <p className="text-gray-500 text-xs">
        {req.priceLabel} · Desbloquea funciones avanzadas
      </p>
      <button
        onClick={() => {
          // Intentar navegar a planes - el handler se pasa via window para evitar prop drilling
          if (window._sisoGoTo) window._sisoGoTo("planes");
        }}
        className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
      >
        ⬆️ Ver planes
      </button>
    </div>
  );
};

