import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'lucide-react',
      'clsx',
      'class-variance-authority',
      'tailwind-merge'
    ],
    exclude: [
      'googleapis',
      'jszip',
      'xml2js', 
      'pptxgenjs'
    ]
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          'processing-vendor': ['jszip', 'xml2js', 'pptxgenjs']
        }
      }
    },
    target: 'es2020',
    chunkSizeWarningLimit: 1000
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
      'buffer': 'buffer',
      'process': 'process/browser'
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  }
});