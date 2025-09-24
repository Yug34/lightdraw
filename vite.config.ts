import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true, // wsl needs this to work
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['engine'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    minify: false,
  },
});
