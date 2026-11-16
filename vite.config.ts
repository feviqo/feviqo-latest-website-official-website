import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      copyPublicDir: !process.env.CONTROL_PLANE_PORT,
      cssCodeSplit: true,
      sourcemap: false,
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'vendor-firebase';
            }
            if (
              id.includes('/hls.js/') ||
              id.includes('/@mux/') ||
              id.includes('/@videojs/')
            ) {
              return 'vendor-player';
            }
            if (id.includes('/motion/') || id.includes('/framer-motion/') || id.includes('/lucide-react/')) {
              return 'vendor-ui';
            }
            return undefined;
          },
        },
      },
    },
  };
});
