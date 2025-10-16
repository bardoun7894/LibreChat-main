import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA plugin completely removed to fix build issues
  ],
  build: {
    rollupOptions: {
      external: ['dompurify'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3012,
    host: true,
  },
  preview: {
    port: 3012,
    host: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@headlessui/react', 'dompurify'],
  },
});