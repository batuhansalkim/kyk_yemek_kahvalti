import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['firebase/app', 'firebase/database']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
