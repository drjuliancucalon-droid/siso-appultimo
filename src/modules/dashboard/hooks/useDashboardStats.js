
import { useMemo } from 'react';
import { PLAN_CONFIG } from '../../../shared/data/planConfig.js';

export const useDashboardStats = (currentUser, patientsList, companies) => {
  // Plan banner data
  const plan = PLAN_CONFIG[currentUser?.license || 'libre'];
  const hcUsadas = useMemo(() => {
    return patientsList.filter(p => p.fechaExamen && !p._archivado).length;
  }, [patientsList]);
  const pct = plan.maxHC < 9999 ? Math.round((hcUsadas / plan.maxHC) * 100) : -1;
  const colorMap = { libre: 'gray', starter: 'teal', pro: 'blue', clinica: 'purple' };
  const col = colorMap[currentUser?.license || 'libre'];

  // Stat cards
  const statCards = useMemo(() => {
    const cards = [
      { label: 'Historias Registradas', value: patientsList.filter(p => p.fechaExamen).length, color: 'emerald', icon: 'FileText' },
      { label: 'Empresas', value: companies.length, color: 'purple', icon: 'Building2' },
      { label: 'HC Cerradas', value: patientsList.filter(p => p.estadoHistoria === 'Cerrada').length, color: 'red', icon: 'Lock' },
      { label: 'HC Abiertas', value: patientsList.filter(p => p.estadoHistoria !== 'Cerrada' && p.fechaExamen).length, color: 'blue', icon: 'Unlock' },
    ];
    return cards;
  }, [patientsList, companies]);

  // Recent records
  const recentRecords = useMemo(() => {
    return patientsList
      .filter(p => p.fechaExamen && !p._archivado)
      .slice(-20)
      .reverse();
  }, [patientsList]);

  // Alerts
  const alertas = useMemo(() => {
    const hoy = new Date();
    const en30 = new Date(hoy);
    en30.setDate(en30.getDate() + 30);

    const alerts = [];
    // Convenios próximos a vencer
    const conveniosAlerta = companies.filter(c =>
      c.convenioVencimiento &&
      new Date(c.convenioVencimiento) <= en30 &&
      new Date(c.convenioVencimiento) >= hoy
    );
    conveniosAlerta.forEach(c => {
      alerts.push({ tipo: 'amber', msg: `⚠️ Convenio próximo a vencer: ${c.nombre} (${c.convenioVencimiento})`, accion: null });
    });

    // HC abiertas
    const hcAbiertas = patientsList.filter(p => p.estadoHistoria !== 'Cerrada' && p.fechaExamen && !p._archivado);
    if (hcAbiertas.length > 3) {
      alerts.push({ tipo: 'blue', msg: `📋 ${hcAbiertas.length} HCs sin cerrar`, accion: null });
    }

    return alerts;
  }, [companies, patientsList]);

  return {
    plan,
    hcUsadas,
    pct,
    col,
    statCards,
    recentRecords,
    alertas,
  };
};

