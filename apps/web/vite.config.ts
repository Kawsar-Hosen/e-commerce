import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * SHOBDOX website build configuration.
 *
 * The shared `@shobdox/*` workspace packages are consumed as TypeScript source
 * (their package.json `exports` point at `src/index.ts`), so Vite compiles them
 * together with the app — no watch-build step is needed during development.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Exposed so the site can be opened from a phone on the same network —
    // useful when checking the 320–430px breakpoints on real hardware.
    host: true,
    strictPort: false,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1_100,
    rollupOptions: {
      output: {
        // Split the heaviest, least frequently changing libraries so the
        // customer-facing entry stays small.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return 'react';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    // Workspace packages are source, not pre-built dependencies.
    exclude: [
      '@shobdox/shared-types',
      '@shobdox/shared-utils',
      '@shobdox/shared-validation',
      '@shobdox/shared-business-logic',
      '@shobdox/shared-mock-data',
      '@shobdox/design-tokens',
    ],
  },
});
