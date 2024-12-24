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
            if (id.includes('node_modules')) {
              // Regrouper toutes les dépendances React dans un seul chunk
              if (id.includes('react') || 
                  id.includes('react-dom') || 
                  id.includes('react-router') || 
                  id.includes('@hello-pangea/dnd') ||
                  id.includes('@headlessui/react') ||
                  id.includes('@radix-ui/react')) {
                return 'vendor-react';
              }
              // Firebase dans son propre chunk
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              // UI components dans leur propre chunk
              if (id.includes('lucide-react') || id.includes('@heroicons/react')) {
                return 'vendor-ui';
              }
              // Autres dépendances
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: true // Activer les sourcemaps pour le débogage
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@hello-pangea/dnd',
        '@headlessui/react',
        '@radix-ui/react-dropdown-menu',
        'regenerator-runtime/runtime'
      ]
    },
    define: {
      'process.env': env
    }
  };
});