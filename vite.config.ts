import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // penting untuk root domain Netlify
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // mempermudah import
    },
  },
  build: {
    outDir: 'dist', // harus sama dengan netlify.toml
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
