import React from 'react';
import { AnalyticsDashboard } from '../modules/reports/components/AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
