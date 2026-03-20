import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/ndl': {
        target: 'https://ndlsearch.ndl.go.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ndl/, '/api'),
      },
      '/api/ndl-thumb': {
        target: 'https://ndlsearch.ndl.go.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ndl-thumb/, '/thumbnail'),
      },
    },
  },
})
