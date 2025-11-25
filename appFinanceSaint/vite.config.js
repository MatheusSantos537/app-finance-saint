import { defineConfig } from 'vite';

export default defineConfig({
  root: './www', // Indica que seus arquivos estão na pasta www
  build: {
    outDir: '../dist', // Onde ele vai gerar o site final
    emptyOutDir: true,
  },
});