import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gus-api': {
        target: 'https://bdl.stat.gov.pl/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gus-api/, ''),
        secure: true,
      },
    },
  },
})

