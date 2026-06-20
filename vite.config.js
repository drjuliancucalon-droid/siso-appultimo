import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

// Genera version.json con commit hash + timestamp en cada build.
// El cliente compara este archivo cada 60s para detectar versión nueva.
function buildVersion() {
  let commitHash = 'dev';
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {}
  return {
    version: commitHash + '-' + Date.now(),
    commit: commitHash,
    buildTime: new Date().toISOString(),
    buildTimestamp: Date.now(),
  };
}

const VERSION = buildVersion();

function versionJsonPlugin() {
  return {
    name: 'version-json',
    closeBundle() {
      mkdirSync('dist', { recursive: true });
      writeFileSync('dist/version.json', JSON.stringify(VERSION, null, 2));
      console.log('[version-json] dist/version.json:', VERSION.version);
    },
  };
}

// Config based on ocupasalud + fix for lucide-react chunk-splitting bug
// References: vitejs/vite#20202, vitejs/vite#5142
export default defineConfig({
  plugins: [react(), versionJsonPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(VERSION.version),
    __APP_COMMIT__: JSON.stringify(VERSION.commit),
    __APP_BUILD_TIME__: JSON.stringify(VERSION.buildTime),
  },
  // Force pre-bundle lucide-react as single module (fixes dev/build difference)
  optimizeDeps: {
    include: ['lucide-react'],
  },
  // Resolve alias to force single entry point
  resolve: {
    alias: {
      'lucide-react': 'lucide-react/dist/esm/lucide-react.js',
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Same as ocupasalud: react and lucide as dedicated vendor chunks
        manualChunks: {
          react: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
});