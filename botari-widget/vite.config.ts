import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BotariWidget',
      fileName: (format) => {
        if (format === 'umd') {
          return 'botari-widget.js';
        }
        return `botari-widget.${format}.js`;
      },
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      external: [],
      output: {
        exports: 'named',
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'botari-widget.css';
          }
          return assetInfo.name || 'assets/[name][extname]';
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist to preserve .d.ts files
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});
