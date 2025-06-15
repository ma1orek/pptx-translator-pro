import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react({
      // React Fast Refresh configuration
      fastRefresh: true,
    }),
    tailwindcss()
  ],
  
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for smaller builds
    minify: 'terser',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
            'lucide-react', 
            'clsx', 
            'class-variance-authority', 
            'tailwind-merge',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-progress',
            '@radix-ui/react-dialog'
          ],
          'processing-vendor': ['jszip', 'xml2js', 'pptxgenjs'],
          'google-vendor': ['googleapis']
        },
        // Asset naming for better caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Terser options for minification
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log for debugging
        drop_debugger: true,
        pure_funcs: ['console.debug']
      },
      mangle: {
        safari10: true
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow external connections
    open: true,
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  
  // Preview server configuration (for testing builds)
  preview: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'lucide-react',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-progress'
    ],
    exclude: [
      // These will be loaded dynamically to reduce initial bundle size
      'googleapis',
      'jszip',
      'xml2js', 
      'pptxgenjs'
    ]
  },
  
  // Global definitions
  define: {
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
      '~': '/',
      'buffer': 'buffer',
      'process': 'process/browser',
      'stream': 'stream-browserify',
      'util': 'util'
    }
  },
  
  // Environment variables
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    devSourcemap: false,
    postcss: {
      plugins: []
    }
  },
  
  // Worker configuration (for potential background processing)
  worker: {
    format: 'es'
  },
  
  // Public directory
  publicDir: 'public',
  
  // Base path (useful for GitHub Pages)
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  
  // Experimental features
  experimental: {
    renderBuiltUrl(filename: string) {
      // Custom asset URL generation if needed
      return filename
    }
  },
  
  // JSON loading
  json: {
    namedExports: true,
    stringify: false
  }
});

// Log build information
console.log('🔧 Vite configuration loaded');
console.log('📍 Mode:', process.env.NODE_ENV);
console.log('🌐 Base URL:', process.env.NODE_ENV === 'production' ? '/' : '/');