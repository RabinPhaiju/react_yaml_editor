import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
    export default defineConfig({
    hmr: 'localhost',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600, },
  base: '/react_yaml_editor',
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
