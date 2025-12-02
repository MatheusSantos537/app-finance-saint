import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Resolve o caminho absoluto para a pasta www
  root: path.resolve(__dirname, 'www'), 
  build: {
    // Define a saída para a pasta dist (um nível acima de www)
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'www/js'),
    },
  },
});