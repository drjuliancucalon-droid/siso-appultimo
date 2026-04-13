import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const sgsstModules = [
  'src/modules/sgsst/components/SSTDashboard',
  'src/modules/sgsst/components/PolicyGenerator',
  'src/modules/sgsst/components/RiskMatrix',
  'src/modules/sgsst/components/AnnualPlan',
  'src/modules/sgsst/components/TrainingModule',
  'src/modules/sgsst/components/AccidentInvestigation',
  'src/modules/sgsst/components/InspectionChecklist',
  'src/modules/sgsst/components/DocumentRepository',
];

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (sgsstModules.some(m => id.includes(m.replace(/\//g, '\\')) || id.includes(m))) {
            return 'sgsst';
          }
        }
      }
    }
  }
});
