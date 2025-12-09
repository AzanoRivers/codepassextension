import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let builtOnce = false;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    {
      name: 'log-on-rebuild',
      buildStart() {
        if (builtOnce) console.log('··· 💾 Save Detected ···');
        builtOnce = true;
      }
    }],
  base: './',
  resolve: {
    alias: {
      '@hooks': path.resolve(__dirname, 'src/assets/hooks'),
      '@contexts': path.resolve(__dirname, 'src/assets/contexts'),
      '@components': path.resolve(__dirname, 'src/assets/components'),
      '@icons': path.resolve(__dirname, 'src/assets/components/icons'),
      '@pages': path.resolve(__dirname, 'src/assets/pages'),
      '@utils': path.resolve(__dirname, 'src/assets/utils'),
      '@assets': path.resolve(__dirname, 'src/assets/assets'),
    },
  },
})
