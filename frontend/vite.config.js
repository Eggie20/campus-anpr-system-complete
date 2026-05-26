import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use './' base for Electron production builds (file:// protocol),
  // and '/' for web builds (http:// protocol)
  base: process.env.ELECTRON ? './' : '/',
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@contexts': '/src/contexts',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@routes': '/src/routes',
    },
  },
  server: {
    port: 3000,
    strictPort: true, // Crucial for Electron to guarantee it finds the app on the hardcoded port
    open: !process.env.ELECTRON, // Prevent extra browser tabs when launching desktop app
  },
});
