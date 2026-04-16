import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Disable automatic chunk splitting for shared modules
    // This ensures TabFormulaDerivacion, DoctorSignature, etc. stay in the page chunk
    // that imports them, not in a separate shared chunk
    rollupOptions: {
      output: {
        manualChunks(id) {
          // SGSST goes to its own chunk (it's a big independent module)
          if (id.includes('modules/sgsst')) return 'sgsst';
          // lucide-react as shared vendor
          if (id.includes('lucide-react')) return 'vendor-lucide';
          // TabFormulaDerivacion MUST stay with HistoriaPage
          if (id.includes('TabFormulaDerivacion')) return 'hc-clinical';
          // All clinical components in one chunk
          if (id.includes('modules/clinical')) return 'hc-clinical';
          // UI components used by HC
          if (id.includes('components/ui/DoctorSignature') ||
              id.includes('components/ui/BrandLogo') ||
              id.includes('components/panels/')) return 'hc-clinical';
        }
      }
    }
  }
});
