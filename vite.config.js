import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // base: 必須跟 repo 名稱相同
  base: '/ReactTask/',
  plugins: [react()],
});
