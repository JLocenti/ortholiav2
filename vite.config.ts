import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 6174
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-ui';
              }
              return 'vendor'; // Other dependencies
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['regenerator-runtime/runtime']
    },
    define: {
      'process.env': env
    }
  };
});