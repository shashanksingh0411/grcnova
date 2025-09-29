import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  define: {
    // Provide a minimal process.env polyfill
    'process.env': {},
    // Or if you need specific environment variables:
    // 'process.env': {
    //   SOME_VAR: JSON.stringify(import.meta.env.SOME_VAR)
    // }
  },
  resolve: {
    alias: {
      // Optional: If you need process polyfill
      process: "process/browser"
    }
  }
});