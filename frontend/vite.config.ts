import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'lucide-react',
      'gsap',
      'lenis',
      'recharts',
    ],
  },
  server: {
    proxy: {
      // The backend runs on port 4000. Requests to /api are passed along, so cookies stay same-site.
      '/api': 'http://localhost:4000',
    },
  },
});
