import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react({
      jsxRuntime: 'classic' // Utiliser le runtime classique de React
    })],
    server: {
      port: 6174
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        'use-sync-external-store/shim': 'use-sync-external-store/shim/index.js'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || 
                  id.includes('react-dom') || 
                  id.includes('react-router') || 
                  id.includes('@hello-pangea/dnd') ||
                  id.includes('@headlessui/react') ||
                  id.includes('@radix-ui/react') ||
                  id.includes('use-sync-external-store')) {
                return 'vendor-react';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('lucide-react') || id.includes('@heroicons/react')) {
                return 'vendor-ui';
              }
              return 'vendor';
            }
          }
        }
      },
      target: 'es2015',
      sourcemap: true
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@hello-pangea/dnd',
        '@headlessui/react',
        '@radix-ui/react-dropdown-menu',
        'use-sync-external-store',
        'use-sync-external-store/shim',
        'regenerator-runtime/runtime'
      ],
      esbuildOptions: {
        target: 'es2015'
      }
    },
    define: {
      'process.env': env
    }
  };
});