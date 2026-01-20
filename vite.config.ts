import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Removed lucide-react exclusion to allow proper tree shaking
  },
  resolve: {
    preserveSymlinks: false,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    sourcemap: true
  }
});
//
